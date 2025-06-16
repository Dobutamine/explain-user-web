<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div class="row text-overline justify-center" @click="collapsed = !collapsed">
      {{ title }}
    </div>
    <div v-if="!collapsed">
      <!-- edit model part -->
      <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
        <div class="q-mt-es row gutter text-overline justify-center" @click="isEnabled = !isEnabled">
        </div>

        <div>
          <div class="q-pa-sm q-mt-xs q-mb-xs q-ml-md q-mr-md text-overline justify-center row">
            <q-btn-toggle v-model="edit_mode" color="grey-9" size="xs" text-color="white" toggle-color="black" :options="[
              { label: 'BASIC', value: 'basic' },
              { label: 'ADVANCED', value: 'advanced' },
              { label: 'FACTORS', value: 'factors' },
              { label: 'ALL', value: 'all' },
            ]" @update:model-value="selectMode" />
          </div>
          <div class="q-pa-sm q-mt-xs q-mb-xs q-ml-md q-mr-md text-overline justify-center row">
            <q-select class="q-pa-xs col" v-model="selectedModelName" square label="select model" hide-hint
              :options="modelNames" dense dark stack-label @update:model-value="modelChanged" />
            <q-btn v-if="selectedModelName" class="col-1 q-ma-xs q-mt-md" color="grey-9" size="xs" dense
              icon="fa-solid fa-xmark" @click="cancel" style="font-size: 8px"><q-tooltip>clear model
                editor</q-tooltip></q-btn>
            <q-btn v-if="selectedModelName" class="col-1 q-ma-xs q-mt-md" color="primary" size="xs" dense
              icon="fa-solid fa-play" @click="cancel" style="font-size: 8px"><q-tooltip>apply changes</q-tooltip></q-btn>
            <!-- <q-btn v-if="selectedModelName" class="col-1 q-ma-xs q-mt-md" color="red-10" size="xs" dense
              icon="fa-solid fa-trash" @click="deleteModel" style="font-size: 8px"><q-tooltip>delete model
                (dangerous!!)</q-tooltip></q-btn> -->
          </div>

          <div v-if="redraw > 0.0" class="q-ma-sm q-mb-md">
            <div v-for="(field, index) in selectedModelInterface" :key="index">
              <div v-if="field.edit_mode == edit_mode || edit_mode == 'all'">
                <div v-if="field.type == 'number'">
                  <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                    <div class="text-white" :style="{ 'font-size': '10px' }">
                      <q-input v-model="field.value" :label="field.caption" :max="field.ul" :min="field.ll" :readonly="field.readonly"
                        :step="field.delta" color="blue" hide-hint filled dense
                        @update:model-value="changePropState(field, arg)" stack-label type="number"
                        style="font-size: 12px" class="q-mb-sm" squared>
                      </q-input>
                    </div>
                  </div>
                </div>

                <div v-if="field.type == 'factor' && factorsEnabled">
                  <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                    <div class="text-white" :style="{ 'font-size': '10px' }">
                      <q-input v-model="field.value" :label="field.caption" :max="10000000000" :min="0" :readonly="field.readonly"
                        :step="0.05" color="blue" hide-hint filled dense
                        @update:model-value="changePropState(field, arg)" stack-label type="number"
                        style="font-size: 12px" class="q-mb-sm" squared>
                      </q-input>
                    </div>
                  </div>
                </div>

                <div v-if="field.type == 'boolean'">
                  <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary row" :style="{ 'font-size': '12px' }">
                    <div class="col">
                      {{ field.caption }}
                    </div>
                    <div class="col-2 text-white" :style="{ 'font-size': '10px' }">
                      <q-toggle v-model="field.value" color="primary" size="sm" hide-hint filled dense :disable="field.readonly"
                        @update:model-value="changePropState(field, arg)" style="font-size: 12px" class="q-mb-sm">
                      </q-toggle>
                    </div>
                  </div>
                </div>

                <div v-if="field.type == 'string'">
                  <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                    <div class="text-white" :style="{ 'font-size': '10px' }">
                      <q-input v-model="field.value" :label="field.caption" color="blue" hide-hint filled dense :readonly="field.readonly"
                        @update:model-value="changePropState(field, arg)" stack-label style="font-size: 12px"
                        class="q-mb-sm" squared>
                      </q-input>
                    </div>
                  </div>
                </div>

                <div v-if="field.type == 'list'">
                  <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                    <div class="text-white" :style="{ 'font-size': '10px' }">
                      <q-select v-model="field.value" :label="field.caption" :options="field.choices" :readonly="field.readonly" color="blue" 
                        hide-hint filled dense @update:model-value="changePropState(field, arg)" stack-label
                        style="font-size: 12px" class="q-mb-sm" squared>
                      </q-select>
                    </div>
                  </div>
                </div>

                <div v-if="field.type == 'multiple-list'">
                  <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                    <div class="text-white" :style="{ 'font-size': '10px' }">
                      <q-select v-model="field.value" :label="field.caption" :options="field.choices" :readonly="field.readonly" multiple
                        color="blue" hide-hint filled dense @update:model-value="changePropState(field, arg)" stack-label
                        style="font-size: 12px" class="q-mb-sm" squared>
                      </q-select>
                    </div>
                  </div>
                </div>

                <div v-if="field.type == 'prop-list'">
                  <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                    <div class="text-white" :style="{ 'font-size': '10px' }">
                      <q-select v-model="field.value_model" :label="field.caption_model" :options="field.choices_model" :readonly="field.readonly" color="blue" 
                        hide-hint filled dense @update:model-value="changePropState(field, 'model_changed')" stack-label
                        style="font-size: 12px" class="q-mb-sm" squared>
                      </q-select>
                      <q-select v-model="field.value_prop" :label="field.caption_prop" :options="field.choices_props" :readonly="field.readonly" color="blue" 
                        hide-hint filled dense @update:model-value="changePropState(field, arg)" stack-label
                        style="font-size: 12px" class="q-mb-sm" squared>
                      </q-select>
                    </div>
                  </div>
                </div>

                <div v-if="field.type == 'function'">
                  <div class="q-ml-md q-mr-md q-mb-sm text-left text-secondary" :style="{ 'font-size': '12px' }">
                          {{ field.caption }}
                  </div>
                  <div v-for="(arg, index_arg) in field.args" :key="index_arg">
                    <div v-if="arg.type == 'number' && !arg.hidden">
                      <q-input v-model.number="arg.value" :label="arg.caption" type="number" :max="arg.ul" :min="arg.ll" :readonly="field.readonly"
                        :step="arg.delta" color="blue" hide-hint filled dense
                        @update:model-value="changePropState(field, arg)" stack-label style="font-size: 12px"
                        class="q-ml-md q-mr-md q-mb-sm" squared>
                      </q-input>
                    </div>
                    <div v-if="arg.type == 'factor' && !arg.hidden">
                      <q-input v-model.number="arg.value" :label="arg.caption" type="number" :max="10000000000" :min="0" :readonly="field.readonly"
                        :step="0.1" color="blue" hide-hint filled dense
                        @update:model-value="changePropState(field, arg)" stack-label style="font-size: 12px"
                        class="q-ml-md q-mr-md q-mb-sm" squared>
                      </q-input>
                    </div>
                    <div v-if="arg.type == 'boolean' && !arg.hidden" class="q-ml-sm col-1">
                      <q-toggle v-model="arg.value" :label="arg.caption" color="primary" size="xs" hide-hint filled dense :disable="field.readonly"
                        @update:model-value="changePropState(field, arg)" style="font-size: 10px"
                        class="q-ml-md q-mt-xs q-mb-sm">
                      </q-toggle>
                    </div>
                    <div v-if="arg.type == 'string' && !arg.hidden">
                      <q-input v-model="arg.value" :label="arg.caption" color="blue" hide-hint filled dense :readonly="field.readonly"
                        @update:model-value="changePropState(field, arg)" stack-label style="font-size: 12px"
                        class="q-ml-md q-mr-md q-mb-sm" squared>
                      </q-input>
                    </div>
                    <div v-if="arg.type == 'list' && !arg.hidden">
                      <q-select v-model="arg.value" :label="arg.target" :options="arg.choices" color="blue" hide-hint :readonly="field.readonly"
                        filled dense @update:model-value="changePropState(field, arg)" stack-label style="font-size: 12px"
                        class="q-ml-md q-mr-md q-mb-sm" squared>
                      </q-select>
                    </div>
                    <div v-if="arg.type == 'multiple-list' && !arg.hidden">
                      <q-select v-model="arg.value" :options="arg.choices" :label="arg.target" multiple color="blue" :readonly="field.readonly"
                        hide-hint filled dense @update:model-value="changePropState(field, arg)" stack-label
                        style="font-size: 12px" class="q-ml-md q-mr-md q-mb-sm" squared>
                      </q-select>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>


          <div v-if="selectedModelName && state_changed" class="row q-ma-md">
            <q-select label-color="white" class="col q-ma-sm" v-model="changeInTime" :options="timeOptions"
              label="apply changes in (sec)" style="font-size: 12px" hide-hint dense dark stack-label />
          </div>
          <div v-if="selectedModelName && state_changed" class="row q-ma-md">
            <q-btn class="col q-ma-sm q-ml-xl q-mr-xl" color="primary" size="sm" dense @click="updateValue"
              style="font-size: 10px">APPLY CHANGES<q-tooltip>apply property changes</q-tooltip></q-btn>
          </div>
        </div>
      </q-card>
    </div>

  </q-card>
</template>

<script>

import { explain } from "../boot/explain";


export default {
  setup() {
    let selectedModelInterface = []
    let selectedNewModelProps = []

    return {
      selectedModelInterface: selectedModelInterface, selectedNewModelProps
    }
  },
  props: {
    title: String
  },
  data() {
    return {
      collapsed: false,
      isEnabled: true,
      addEnabled: false,
      factorsEnabled: true,
      redraw: 1,
      availableModelTypes: [],
      selectedModelType: "",
      selectedNewModelPropsChoices: [],
      showNewModelInDiagram: false,
      newModelErrorFlag: false,
      noNewModelError: "q-ml-md q-mr-md q-mt-md text-secondary text-center",
      newModelError: "q-ml-md q-mr-md q-mt-md text-negative text-center",
      newModelErrorClass: "q-ml-md q-mr-md q-mt-md text-secondary text-center",
      newModelErrorMessage: "no error",
      modelTypes: ["BloodCapacitance", "BloodTimeVaryingElastance", "BloodResistor", "BloodValve", "BloodDiffusor", "BloodPump", "GasCapacitance"],
      selectedModelName: "",
      show_optionals: false,
      show_relatives: false,
      optionals_caption: "SHOW ADVANCED",
      optionals_color: "grey-9",
      optionals_text: "show advanced properties",
      relatives_caption: "SHOW RELATIVES",
      relatives_color: "grey-9",
      relatives_text: "show relative properties",
      modelNames: [],
      timeOptions: [1, 5, 10, 30, 60, 120, 240, 360],
      changeInTime: 5,
      state_changed: false,
      collaps_icon: "fa-solid fa-chevron-up",
      edit_mode: "basic"
    };
  },
  methods: {
    selectMode() {},
    cancelAddModel() {
      this.selectedModelType = ""
      this.resetNewModel()
    },
    addNewModelToEngine() {
      this.newModelErrorFlag = false
      this.selectedNewModelProps.forEach(prop => {
        if (prop.target == "name" && prop.value == "") {
          this.newModelErrorFlag = true
          this.newModelErrorClass = this.newModelError
          this.newModelErrorMessage = "name is missing"
        }
        if (prop.target == "name" && this.modelNames.includes(prop.value)) {
          this.newModelErrorFlag = true
          this.newModelErrorClass = this.newModelError
          this.newModelErrorMessage = "this is name is already in use"
        }
      })

      if (this.newModelErrorFlag) return

      // convert the properties to a dictionary which the model engine can understand
      let new_model = {
        model_type: this.selectedModelType
      }
      // add the properties
      this.selectedNewModelProps.forEach(prop => {
        if (prop.type !== 'function') {
          new_model[prop.target] = prop.value
          if (prop.type == 'number') {
            new_model[prop.target] = parseFloat(prop.value / prop.factor)
          }
        }
      })
      // send to the model for processing
      explain.addNewModel(new_model)

      this.resetNewModel()
      this.selectedModelType = ""
    },
    resetNewModel() {
      this.selectedNewModelProps = []
      this.newModelErrorClass = this.noNewModelError
      this.newModelErrorFlag = false
      this.redraw += 1
    },
    addNewModel() {
      // reset the new model properties
      this.resetNewModel()

      // get the model interface of the selected model
      explain.getModelTypeInterface(this.selectedModelType)
    },
    deleteModel() {
      console.log(this.selectedModelName)
      explain.deleteModel(this.selectedModelName)
    },
    processModelTypeInterface(modeltype_interface) {
      // we have to convert the model properties to a format which the editor can understand, this is an array of objects and store in selectedNewModelProps
      // clear the current selectedNewModelProps holding the new model properties
      this.selectedNewModelProps = []
      // add a new name and description field
      this.selectedNewModelProps.push({
        "caption": "name",
        "target": "name",
        "type": "string",
        "value": "",
      })
      this.selectedNewModelProps.push({
        "caption": "description",
        "target": "description",
        "type": "string",
        "value": "",
      })
      // process the model interface
      modeltype_interface.forEach(prop => {
        if (prop.type == 'number') {
          prop['value'] = prop['default'] * prop['factor']
        } else {
          prop['value'] = prop['default']
        }
        //if the property is a list then add the options to the choices
        if (prop.type == 'list') {
          prop['choices'] = []
          if (prop['option_default']) {
            prop['choices'] = prop['options_default']
          }
          if (prop.options) {
            Object.values(explain.modelState.models).forEach(model => {
              if (prop.options.includes(model.model_type)) {
                prop["choices"].push(model.name)
              }
            })

          }
        }
        if (prop.type == 'multiple-list') {
          prop['choices'] = []
          if (prop['option_default']) {
            prop['choices'] = prop['options_default']
          }
          if (prop.options) {
            Object.values(explain.modelState.models).forEach(model => {
              if (prop.options.includes(model.model_type)) {
                prop["choices"].push(model.name)
              }
            })
          }
        }
        this.selectedNewModelProps.push(prop)
      })
      this.redraw += 1
    },
    processModelInterface(model_type, model_props) {
      console.log("received model interface of ", model_type)
      console.log(model_props)
      // we have to convert the model properties to a format which the editor can understand, this is an array of objects and store in selectedNewModelProps
      // clear the current selectedNewModelProps holding the new model properties
      this.selectedNewModelProps = []
      // add a new name and description field
      this.selectedNewModelProps.push({
        "caption": "name",
        "target": "name",
        "type": "string",
        "value": "",
      })
      this.selectedNewModelProps.push({
        "caption": "description",
        "target": "description",
        "type": "string",
        "value": "",
      })
      // process the model interface
      model_props.forEach(prop => {
        if (prop.type == 'number') {
          prop['value'] = prop['default'] * prop['factor']
        } else {
          prop['value'] = prop['default']
        }
        // if the property is a list then add the options to the choices
        if (prop.type == 'list') {
          prop['choices'] = []
          if (prop['option_default']) {
            prop['choices'] = prop['options_default']
          }
          if (prop.options) {
            Object.values(explain.modelState.models).forEach(model => {
              if (prop.options.includes(model.model_type)) {
                prop["choices"].push(model.name)
              }
            })

          }
        }
        if (prop.type == 'multiple-list') {
          prop['choices'] = []
          if (prop['option_default']) {
            prop['choices'] = prop['options_default']
          }
          if (prop.options) {
            Object.values(explain.modelState.models).forEach(model => {
              if (prop.options.includes(model.model_type)) {
                prop["choices"].push(model.name)
              }
            })
          }
        }
        this.selectedNewModelProps.push(prop)
      })
      this.redraw += 1


    },
    collapsEditor() {

      if (this.isEnabled) {
        this.isEnabled = false
        this.collaps_icon = "fa-solid fa-chevron-up"
      } else {
        this.isEnabled = true
        this.collaps_icon = "fa-solid fa-chevron-down"
      }
    },
    changeNewPropState(param, arg) {
      this.state_changed = true
      param.state_changed = true
      this.redraw += 1
    },
    changePropState(param, arg) {
      if (param.type == "prop-list" && arg == 'model_changed') {
        // reset the prop list choices
        param['choices_props'] = []
        param['value_prop'] = ""
        Object.keys(explain.modelState.models[param.value_model]).forEach(prop => {
          if (typeof (explain.modelState.models[param.value_model][prop]) === 'number') {
            if (prop[0] !== "_") {
              param["choices_props"].push(prop)
            }
          }
        })
      }
      this.state_changed = true
      param.state_changed = true
      this.redraw += 1

    },
    updateValue() {
      this.selectedModelInterface.forEach(prop => {
        if (prop.state_changed) {
          if (prop.type == 'function') {
            let function_name = this.selectedModelName + "." + prop.target;
            let function_args = []
            prop.args.forEach(arg => {
              if (arg.type == 'number') {
                function_args.push(arg.value / arg.factor)
              } else {
                function_args.push(arg.value)
              }
            })
            explain.callModelFunction(function_name, function_args)
          }

          if (prop.type == 'number') {
            let p = this.selectedModelName + "." + prop.target
            explain.setPropValue(p, parseFloat(prop.value / prop.factor), parseFloat(this.changeInTime), 0)
          }
          if (prop.type == 'factor') {
            let p = this.selectedModelName + "." + prop.target
            explain.setPropValue(p, parseFloat(prop.value / prop.factor), parseFloat(this.changeInTime), 0)
          }
          if (prop.type == 'boolean') {
            let p = this.selectedModelName + "." + prop.target
            explain.setPropValue(p, prop.value, 0, 0)
          }
          if (prop.type == 'string') {
            let new_value = prop.value
            let p = this.selectedModelName + "." + prop.target
            explain.setPropValue(p, new_value, 0, 0)
          }
          if (prop.type == 'list') {
            let new_value = prop.value
            let p = this.selectedModelName + "." + prop.target
            explain.setPropValue(p, new_value, 0, 0)
          }
          if (prop.type == 'multiple-list') {
            let new_value = prop.value
            let p = this.selectedModelName + "." + prop.target
            explain.setPropValue(p, new_value, 0, 0)
          }
          if (prop.type == 'prop-list') {
            let new_value_model = prop.value_model
            let p_model = this.selectedModelName + "." + prop.target_model
            explain.setPropValue(p_model, new_value_model, 0, 0)

            let new_value_prop = prop.value_prop
            let p_prop = this.selectedModelName + "." + prop.target_prop
            explain.setPropValue(p_prop, new_value_prop, 0, 0)
          }
        }
        prop.state_changed = false
      })

      this.state_changed = false

    },
    cancel() {
      this.selectedModelName = ""
      this.selectedModelInterface = {}
      this.state_changed = false
      explain.getModelState()
    },
    modelChanged() {
      // enable the full control
      this.isEnabled = true
      this.collaps_icon = "fa-solid fa-chevron-down"
      this.state_changed = false
      this.selectModel()
      explain.getModelState()
    },
    selectModel() {
      // get the model interface of the model type of the seleced model
      this.selectedModelInterface = explain.getModelInterface(this.selectedModelName)

      // add a flag to the property which can be set when the property needs to be updated
      this.selectedModelInterface.forEach(param => {
        // we have to extend the param with some additional properties
        param['state_changed'] = false
        if (param.readonly === undefined) {
          param['readonly'] = false
        }

        if (!param['edit_mode']) {
          param['edit_mode'] = 'basic'
        }
        // process the different types of parameters
        switch (param.type) {
          case 'number':
            this.processNumberType(param)
            break;
          case 'factor':
            this.processFactorType(param)
            break;
          case 'string':
            this.processStringType(param)
            break;
          case 'boolean':
            this.processBooleanType(param)
            break;
          case 'list':
            this.processListType(param)
            break;
          case 'multiple-list':
            this.processMultipleListType(param)
            break;
          case 'prop-list':
            this.processPropListType(param)
            break;
          case 'function':
            this.processFunctionType(param)
            break;
          case 'object':
            // for objects we don't need to do anything here, they will be processed later
            break;
          case 'object-list':
            this.processObjectListType(param)
            break;
          default:
            console.error("Unknown type: ", param.type)
        }
      })
      this.redraw += 1
    },
    processNumberType(param) {
      let f_number = param.target.split('.')
      switch (f_number.length) {
        case 1:
          param['value'] = explain.modelState.models[this.selectedModelName][f_number[0]]
          break;
        case 2:
          param['value'] = explain.modelState.models[this.selectedModelName][f_number[0]][f_number[1]]
          break;
        case 3:
          param['value'] = explain.modelState.models[this.selectedModelName][f_number[0]][f_number[1]][f_number[2]]
          break;
      }
      param['value'] = (param['value'] * param.factor).toFixed(param.rounding)
    },
    processStringType(param) {
      let f_string = param.target.split('.')
      switch (f_string.length) {
        case 1:
          param['value'] = explain.modelState.models[this.selectedModelName][f_string[0]]
          break;
        case 2:
          param['value'] = explain.modelState.models[this.selectedModelName][f_string[0]][f_string[1]]
          break;
        case 3:
          param['value'] = explain.modelState.models[this.selectedModelName][f_string[0]][f_string[1]][f_string[2]]
          break;
      }
    },
    processBooleanType(param) {
      let f_bool = param.target.split('.')
      switch (f_bool.length) {
        case 1:
          param['value'] = explain.modelState.models[this.selectedModelName][f_bool[0]]
          break;
        case 2:
          param['value'] = explain.modelState.models[this.selectedModelName][f_bool[0]][f_bool[1]]
          break;
        case 3:
          param['value'] = explain.modelState.models[this.selectedModelName][f_bool[0]][f_bool[1]][f_bool[2]]
          break;
      }
    },
    processListType(param) {
      let f_list = param.target.split('.')
      switch (f_list.length) {
        case 1:
          param['value'] = explain.modelState.models[this.selectedModelName][f_list[0]]
          break;
        case 2:
          param['value'] = explain.modelState.models[this.selectedModelName][f_list[0]][f_list[1]]
          break;
        case 3:
          param['value'] = explain.modelState.models[this.selectedModelName][f_list[0]][f_list[1]][f_list[2]]
          break;
      }
      // if there's a default number then use it
      if (param['default']) {
        param['value'] = param['default']
      }
      // file the options list
      param['choices'] = []
      if (param['option_default']) {
        param['choices'] = param['options_default']
      }
      Object.values(explain.modelState.models).forEach(model => {
        if (param.options.includes(model.model_type) || param.options.length == 0) {
          param["choices"].push(model.name)
        }
      })
    },
    processMultipleListType(param) {
      let f_mlist = param.target.split('.')
      switch (f_mlist.length) {
        case 1:
          param['value'] = explain.modelState.models[this.selectedModelName][f_mlist[0]]
          break;
        case 2:
          param['value'] = explain.modelState.models[this.selectedModelName][f_mlist[0]][f_mlist[1]]
          break;
        case 3:
          param['value'] = explain.modelState.models[this.selectedModelName][f_mlist[0]][f_mlist[1]][f_mlist[2]]
          break;
      }
      if (param['default']) {
        param['value'] = param['default']
      }
      // file the options list
      param['choices'] = []
      if (param['option_default']) {
        param['choices'] = param['options_default']
      }
      Object.values(explain.modelState.models).forEach(model => {
        if (param.options.includes(model.model_type) || param.options.length == 0) {
          param["choices"].push(model.name)
        }
      })
    },
    processFactorType(param) {
      let f_factor = param.target.split('.')
      switch (f_factor.length) {
        case 1:
          param['value'] = explain.modelState.models[this.selectedModelName][f_factor[0]]
          break;
        case 2:
          param['value'] = explain.modelState.models[this.selectedModelName][f_factor[0]][f_factor[1]]
          break;
        case 3:
          param['value'] = explain.modelState.models[this.selectedModelName][f_factor[0]][f_factor[1]][f_factor[2]]
          break;
      }
      param['value'] = (param['value']).toFixed(2)
    },
    processPropListType(param) {
      let f_model = param.target_model.split('.')
      param['value_model'] = explain.modelState.models[this.selectedModelName][f_model[0]]
      let f_prop = param.target_prop.split('.')
      param['value_prop'] = explain.modelState.models[this.selectedModelName][f_prop[0]]
      // file the options list
      param['choices_model'] = []
      param["choices_props"] = []
      Object.values(explain.modelState.models).forEach(model => {
        if (param.options.includes(model.model_type) || param.options.length == 0) {
          param["choices_model"].push(model.name)
  
        }
      })
      Object.keys(explain.modelState.models[param.value_model]).forEach(prop => {
          if (typeof (explain.modelState.models[param.value_model][prop]) === 'number') {
            if (prop[0] !== "_") {
              param["choices_props"].push(prop)
            }
          }
      })

    },
    processFunctionType(param) {
      param.args.forEach(arg => {
      if (!arg['hidden']) {
        arg['hidden'] = false
      }
      // get the current value
      let f = arg.target.split('.')
      if (f.length == 1) {
        arg['value'] = explain.modelState.models[this.selectedModelName][f[0]]
      }
      if (f.length == 2) {
        arg['value'] = explain.modelState.models[this.selectedModelName][f[0]][f[1]]
      }
      if (f.length == 3) {
        arg['value'] = explain.modelState.models[this.selectedModelName][f[0]][f[1]][f[2]]
      }

      if (arg.target) {
        if (arg.type == 'number') {
          arg['value'] = (arg['value'] * arg.factor).toFixed(arg.rounding)
        }
        if (isNaN(arg['value'])) {
          arg['value'] = arg.default
        }
        if (arg.options) {
          if (arg.type == 'list') {
            arg['choices'] = []
            if (arg['options_default']) {
              arg['choices'] = arg['options_default']
            }
            arg['value'] = explain.modelState.models[this.selectedModelName][arg.target]
            if (arg['default']) {
              arg['value'] = arg['default']
            }
            Object.values(explain.modelState.models).forEach(model => {
              if (arg.options.includes(model.model_type) || arg.options.length == 0) {
                arg["choices"].push(model.name)
              }
            })
          }
          if (arg.type == 'multiple-list') {
            arg['choices'] = []
            if (arg['options_default']) {
              arg['choices'] = arg['options_default']
            }
            arg['value'] = explain.modelState.models[this.selectedModelName][arg.target]
            if (arg['default']) {
              arg['value'] = arg['default']
            }
            Object.values(explain.modelState.models).forEach(model => {
              if (arg.options.includes(model.model_type) || arg.options.length == 0) {
                arg["choices"].push(model.name)
              }
            })
          }
        }
      }
    })
    },
    processObjectType(param) {},
    processObjectListType(param) {
      param.objects.forEach((object)=> {
                // we have to extend the param with some additional properties
        object['state_changed'] = false
        if (object.readonly === undefined) {
          object['readonly'] = false
        }
                // process the different types of parameters
        switch (object.type) {
          case 'number':
            this.processNumberType(object)
            break;
          case 'factor':
            this.processFactorType(object)
            break;
          case 'string':
            this.processStringType(object)
            break;
          case 'boolean':
            this.processBooleanType(object)
            break;
          case 'list':
            this.processListType(object)
            break;
          case 'multiple-list':
            this.processMultipleListType(object)
            break;
          case 'prop-list':
            this.processPropListType(object)
            break;
          case 'function':
            this.processFunctionType(object)
            break;
          case 'object':
            // for objects we don't need to do anything here, they will be processed later
            break;
          default:
            console.error("Unknown type: ", param.type)
        }
      })
      console.log(param)
    },
    processAvailableModels() {
      this.modelNames = []
      try {
        if (Object.keys(explain.modelState.models)) {
          this.modelNames = [...Object.keys(explain.modelState.models)].sort();
          this.selectModel()
        }
      } catch { }
    },
    processAvailableModelTypes(data) {
      this.availableModelTypes = data
    },
  },
  beforeUnmount() {
    this.state_changed = false
    this.$bus.off("state", this.processAvailableModels)
    this.$bus.off("model_interface", this.processModelInterface)
    this.$bus.off("modeltype_interface",  this.processModelTypeInterface)
    this.$bus.off("model_types", (e) => this.processAvailableModelTypes(e))
  },
  mounted() {
    // update if state changes
    this.$bus.on("state", this.processAvailableModels)
    this.$bus.on("model_interface",  this.processModelInterface)
    this.$bus.on("modeltype_interface",  (e) => this.processModelTypeInterface(e))
    this.$bus.on("model_types", (e) => this.processAvailableModelTypes(e))
    explain.getModelTypes()

  },
};
</script>

<style></style>
