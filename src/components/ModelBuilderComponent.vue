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
            <q-select class="q-pa-xs col" v-model="selectedModelType" square label="select new model type" hide-hint
              :options="availableModelTypes" dense dark stack-label @update:model-value="modelTypeSelected" />
            <q-btn v-if="selectedModelType" class="col-1 q-ma-xs q-mt-md" color="grey-9" size="xs" dense
              icon="fa-solid fa-xmark" @click="cancelAddModel" style="font-size: 8px"><q-tooltip>clear new model</q-tooltip></q-btn>
            <q-btn v-if="selectedModelType" class="col-1 q-ma-xs q-mt-md" color="primary" size="xs" dense
              icon="fa-solid fa-play" @click="addModelToEngine" style="font-size: 8px"><q-tooltip>add model to engine</q-tooltip></q-btn>
          </div>

          <div v-if="redraw > 0.0" class="q-ma-sm q-mb-md">
            <div v-for="(field, index) in selectedNewModelProps" :key="index">
              <div v-if="field.build_prop">

                <div v-if="field.type == 'number'">
                  <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                    <div class="text-white" :style="{ 'font-size': '10px' }">
                      <q-input v-model="field.value" :label="field.caption" :max="field.ul" :min="field.ll"
                        :step="field.delta" color="blue" hide-hint filled dense
                        @update:model-value="changePropState(field, arg)" stack-label type="number"
                        style="font-size: 12px" class="q-mb-sm" squared>
                      </q-input>
                    </div>
                  </div>
                </div>

                <div v-if="field.type == 'factor'">
                  <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                    <div class="text-white" :style="{ 'font-size': '10px' }">
                      <q-input v-model="field.value" :label="field.caption" :max="10000000000" :min="0"
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
                      <q-toggle v-model="field.value" color="primary" size="sm" hide-hint filled dense
                        @update:model-value="changePropState(field, arg)" style="font-size: 12px" class="q-mb-sm">
                      </q-toggle>
                    </div>
                  </div>
                </div>

                <div v-if="field.type == 'string'">
                  <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                    <div class="text-white" :style="{ 'font-size': '10px' }">
                      <q-input v-model="field.value" :label="field.caption" color="blue" hide-hint filled dense
                        @update:model-value="changePropState(field, arg)" stack-label style="font-size: 12px"
                        class="q-mb-sm" squared>
                      </q-input>
                    </div>
                  </div>
                </div>

                <div v-if="field.type == 'list'">
                  <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                    <div class="text-white" :style="{ 'font-size': '10px' }">
                      <q-select v-model="field.value" :label="field.caption" :options="field.choices" color="blue" 
                        hide-hint filled dense @update:model-value="changePropState(field, arg)" stack-label
                        style="font-size: 12px" class="q-mb-sm" squared>
                      </q-select>
                    </div>
                  </div>
                </div>

                <div v-if="field.type == 'multiple-list'">
                  <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                    <div class="text-white" :style="{ 'font-size': '10px' }">
                      <q-select v-model="field.value" :label="field.caption" :options="field.choices" multiple
                        color="blue" hide-hint filled dense @update:model-value="changePropState(field, arg)" stack-label
                        style="font-size: 12px" class="q-mb-sm" squared>
                      </q-select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="state_changed" class="row q-ma-md">
            <q-btn class="col q-ma-sm q-ml-xl q-mr-xl row" color="primary" size="sm" dense @click="addModelToEngine"
              style="font-size: 10px">ADD NEW MODEL<q-tooltip>add model to model engine</q-tooltip></q-btn>
          </div>
          <div v-if="state_changed" class="q-ma-sm text-center">
            <div v-if="newModelErrorFlag" :class="newModelErrorClass"> error: {{  newModelErrorMessage }}</div>
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
      collaps_icon: "fa-solid fa-chevron-up",
      isEnabled: true,
      redraw: 1,
      availableModelTypes: [],
      selectedModelType: "",
      newModelErrorFlag: false,
      noNewModelError: "q-ml-md q-mr-md q-mt-md text-secondary text-center",
      newModelError: "q-ml-md q-mr-md q-mt-md text-negative text-center",
      newModelErrorClass: "q-ml-md q-mr-md q-mt-md text-secondary text-center",
      newModelErrorMessage: "no error",
      selectedModelName: "",
      modelNames: [],
      state_changed: false,

    };
  },
  methods: {
    modelTypeSelected() {
        let model_interface = explain.getModelTypeInterface(this.selectedModelType)
        this.resetModel()
        this.processModelInterface(this.selectedModelType, model_interface)
    },
    processModelInterface(model_type, model_props) {
      // we have to convert the model properties to a format which the editor can understand, this is an array of objects and store in selectedNewModelProps
      // clear the current selectedNewModelProps holding the new model properties
      this.selectedNewModelProps = []
      // process the model interface
      model_props.forEach(prop => {
        if (prop.type == 'number') {
          prop['value'] = prop['default']
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
    cancelAddModel() {
      this.selectedModelType = ""
      this.resetModel()
    },
    addModelToEngine() {
        // set the error flag to false
        this.newModelErrorFlag = false
        // check whether the new model name is already in use or empty -> error
        this.selectedNewModelProps.forEach(prop => {
            if (prop.build_prop) {
                if (prop.value == undefined && prop.target !== 'inputs') {
                    this.newModelErrorFlag = true
                    this.newModelErrorClass = this.newModelError
                    this.newModelErrorMessage = prop.target + " has no or invalid value"
                }
                if (prop.type === 'number') {
                    // parse the value to a number
                    prop.value = parseFloat(prop.value)
                    // check whether the parsing failed
                    if (isNaN(prop.value)) {
                        this.newModelErrorFlag = true
                        this.newModelErrorClass = this.newModelError
                        this.newModelErrorMessage = prop.target + " has an invalid value"
                    }
                }
            }   
        })

        // if there's an error plot this error on the console
      if (this.newModelErrorFlag) {
        console.log(this.newModelErrorMessage)
        return
      }

      // now convert the properties to a dictionary the model engine can understand
      let new_model = {
        model_type: this.selectedModelType
      }
      // add the properties
      this.selectedNewModelProps.forEach(prop => {
        if (prop.build_prop) {
            new_model[prop.target] = prop.value
        }
      })
      // send to the model for processing
      explain.addNewModel(new_model)

      this.resetModel()
      this.selectedModelType = ""
    },
    resetModel() {
      this.selectedNewModelProps = []
      this.newModelErrorClass = this.noNewModelError
      this.newModelErrorFlag = false
      this.redraw += 1
    },
    deleteModelFromEngine() {
      explain.deleteModel(this.selectedModelName)
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
    changePropState(param, arg) {
      this.state_changed = true
      param.state_changed = true
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
    processAvailableModels() {
      this.modelNames = []
      try {
        if (Object.keys(explain.modelState.models)) {
          this.modelNames = [...Object.keys(explain.modelState.models)].sort();
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
