<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-xs" bordered dark flat>
    <div class="row text-overline justify-center" @click="collapsed = !collapsed">
      {{ title }}
    </div>
    <div v-if="!collapsed">
      <!-- edit model part -->
      <!-- <q-card class="q-mr-sm q-ml-sm"> -->
        <div>
          <div class="q-pa-sm q-mt-xs q-mb-sm q-ml-md q-mr-md text-overline justify-center row">
            <div class="q-gutter-xs row items-center">
              <div v-for="(field, index) in state.configuration.controllers" :key="index">
                <q-btn-toggle v-model="selectedModelName" color="grey-9" size="sm" spread text-color="white" toggle-color="secondary" :options="field" @update:model-value="modelChanged"/>
              </div>
              </div>
              <div v-if="!newControllerMode" class="q-gutter-xs q-mt-md row text-overline">
                  <q-btn v-if="!selectedModelName" color="primary" dense size="sm" style="width: 50px" icon="fa-solid fa-plus"
                  @click="newControllerMode = !newControllerMode"><q-tooltip>add intervention class</q-tooltip></q-btn>
                  <q-btn v-if="selectedModelName" color="grey-9" dense size="sm" style="width: 50px" icon="fa-solid fa-eraser"
                  @click="cancel"><q-tooltip>clear current selection</q-tooltip></q-btn>
                  <q-btn v-if="selectedModelName" color="negative" dense size="sm" style="width: 50px" icon="fa-solid fa-trash-can"
                  @click="deleteIntervention"><q-tooltip>delete current intervention from list</q-tooltip></q-btn>
              </div>
          </div>
          <div v-if="newControllerMode" class="q-pa-sm q-mt-xs q-ml-md q-mr-md text-overline justify-center row">
            <q-select class="q-pa-xs col" v-model="newControllerModelName" square label="select model" hide-hint
                  :options="availableModelNames" dense dark stack-label/>
            <q-btn class="col-1 q-ma-xs q-mt-md" color="primary" size="xs" dense @click="addNewController"
              icon="fa-solid fa-plus" style="font-size: 8px"><q-tooltip>add new controller
                editor</q-tooltip></q-btn>
            <q-btn class="col-1 q-ma-xs q-mt-md" color="grey-9" size="xs" dense @click="cancel"
              icon="fa-solid fa-eraser" style="font-size: 8px"><q-tooltip>cancel</q-tooltip></q-btn>
          </div>
          <div v-if="newControllerMode" class="q-pa-sm q-mb-xs q-ml-md q-mr-md text-overline justify-center row">
            <q-input class="q-pa-xs col" v-model="newControllerCaption" square label="controller name (optional)" hide-hint
                dense dark stack-label/>
          </div>
          <q-separator></q-separator>
          <!-- <div v-if="selectedModelInterface.length > 0" class="row text-overline justify-center" @click="collapsed = !collapsed">
            properties
          </div> -->

          <div v-if="selectedModelInterface.length > 0" class="q-pa-sm q-mt-sm q-mb-xs q-ml-md q-mr-md text-overline justify-center row">
            <q-btn-toggle v-model="edit_mode" color="grey-9" size="sm" text-color="white" toggle-color="primary" :options="[
              { label: 'BASIC', value: 'basic' },
              { label: 'EXTRA', value: 'extra' },
              { label: 'FACTORS', value: 'factors' },
              { label: 'ALL', value: 'all' },
            ]"/>
          </div>
          <div v-if="redraw > 0.0" class="q-ma-sm q-mb-md">
            <div v-for="(mi, index_main) in modelInterfaces" :key="index_main">
              <q-card class="bg-grey-10 q-pt-xs q-mt-sm" dark bordered flat>
                <div v-for="(field, index) in mi" :key="index">
                  <div v-if="field.edit_mode == edit_mode || edit_mode == 'all' || field.edit_mode == 'caption'">
                    <div v-if="field.type == 'number'">

                      <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                        <div class="text-white" :style="{ 'font-size': '10px' }">
                          <div v-if="!field.slider" class="row">
                            <q-input v-if="!field.slider" class="q-mb-sm col-10" v-model="field.value" :label="field.caption" :max="field.ul" :min="field.ll" :readonly="field.readonly"
                              :step="field.delta" color="blue" hide-hint filled dense
                              @update:model-value="changePropState(field, arg)" stack-label type="number"
                              style="font-size: 12px" squared>
                            </q-input>
                            <div class="col q-ml-sm">
                                <q-btn  dense size="xs" @click="toggleSlider(field)">slider</q-btn>
                            </div>

                          </div>

                          <div v-if="field.slider">
                            <div class="row justify-left">
                                <q-badge class="q-pa-sm" color="grey-10">
                                  <div class="text-secondary" style="font-size: small;">
                                      {{ field.caption }} = {{ field.value }}
                                  </div>
                                </q-badge>
                            </div>
                            <div class="row">
                              <q-slider class="q-ma-sm q-mr-sm col-10" v-model="field.value" :step="field.delta"
                                :min="field.ll" :max="field.ul" snap :markers="1" dense thumb-color="teal"
                                color="transparent" @change="sliderChange(field)"/>

                              <div class="col q-ml-sm">
                                <q-btn  dense size="xs" @click="toggleSlider(field)">num</q-btn>
                            </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>

                    <div v-if="field.type == 'factor' && factorsEnabled">
                      <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                        <div class="text-white" :style="{ 'font-size': '10px' }">
                          <!-- <q-input v-model="field.value" :label="field.caption" :max="10000000000" :min="0" :readonly="field.readonly"
                            :step="0.05" color="blue" hide-hint filled dense
                            @update:model-value="changePropState(field, arg)" stack-label type="number"
                            style="font-size: 12px" class="q-mb-sm" squared>
                          </q-input> -->

                          <div class="row justify-center">
                            <q-badge class="q-mt-xs" color="grey-10">
                              <div class="text-white" style="font-size: small;">
                                  {{ field.caption }} = {{ field.display_value }} x N
                              </div>
                            </q-badge>
                          </div>
                          <div class="row  justify-center">
                            <q-btn @click="decreaseSliderValue(field)" class="q-ma-xs col" color="grey-10" dense size="xs"
                              icon="fa-solid fa-chevron-left"></q-btn>

                            <q-slider class="q-ma-xs col-8" v-model="field.slider_value" :step="field.delta"
                              :min="field.ll" :max="field.ul" snap :markers="1" dense thumb-color="teal"
                              color="transparent" @change="changeSliderValue(field)" />

                              <q-btn @click="increaseSliderValue(field)" class="q-ma-xs col" dense size="xs" color="grey-10"
                              icon="fa-solid fa-chevron-right"></q-btn>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-if="field.type == 'boolean'">
                      <div class="q-ml-lg q-mr-md q-mt-md text-left text-secondary row" :style="{ 'font-size': '12px' }">
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
               </q-card>
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
      <!-- </q-card> -->
    </div>

  </q-card>
</template>

<script>

import { explain } from "../boot/explain";
import { useStateStore } from "src/stores/state";


export default {
  setup() {
    let selectedModelInterface = []
    let selectedNewModelProps = []
    let modelInterfaces = []
    const state = useStateStore();

    return {
      selectedModelInterface: selectedModelInterface, selectedNewModelProps, state, modelInterfaces
    }
  },
  props: {
    title: String
  },
  data() {
    return {
      newControllerMode: false,
      newControllerCaption: "",
      newControllerModelName: "",
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
      changeInTime: 1,
      state_changed: false,
      collaps_icon: "fa-solid fa-chevron-up",
      edit_mode: "basic",
      availableModelNames: [],
    };
  },
  methods: {
    addNewController() {
      if (this.newControllerCaption == "") {
        this.newControllerCaption = this.newControllerModelName
      }
      let controller_object = [
        { label: this.newControllerCaption, value: this.newControllerModelName}
      ]
      this.state.configuration.controllers.push(controller_object)
      this.cancel();
    },
    deleteIntervention() {
      this.$q.dialog({
            title: 'Warning!',
            message: 'Are you sure you want to delete this controller?',
            cancel: true,
            persistent: true
        })
        .onOk(() => {
          let found_index = -1
          // find the correct controller list with list items with object in it
          let counter = 0
          this.state.configuration.controllers.forEach(controller => {
            controller.forEach(item => {
              if (item.value == this.selectedModelName) {
                found_index = counter
              }
            })
            counter += 1;
          })
          if (found_index > -1) {
            this.state.configuration.controllers.splice(found_index, 1)
          }
          this.cancel();
        })
        .onCancel(() => {})
        .onDismiss(() => {})


    },
    sliderChange(param) {
      this.state_changed = true;
      param.state_changed = true;
      this.updateValue();
      this.redraw += 1;
    },
    toggleSlider(param) {
      param.slider = !param.slider
      param.value = parseFloat(param.value)
      this.redraw +=1;
    },
    changeSliderValue(parameter) {
      parameter.state_changed = true;
      parameter.display_value = this.translateSliderToValue(parameter.slider_value).toFixed(parameter.rounding)
      parameter.value = this.translateSliderToValue(parameter.slider_value)
      this.updateValue();
      this.redraw += 1;
    },
    increaseSliderValue(parameter) {
      parameter.slider_value += parameter.delta;
      if (parameter.slider_value > parameter.ul) {
        parameter.slider_value = parameter.ul
      }
      this.changeSliderValue(parameter)
    },
    decreaseSliderValue(parameter) {
      parameter.slider_value -= parameter.delta;
      if (parameter.slider_value < parameter.ll) {
        parameter.slider_value = parameter.ll
      }
      this.changeSliderValue(parameter)
    },
    translateSliderToValue(v) {
      if (v == 0) {
        return 1;
      }

      if (v < 0) {
        return -(1 / (v - 1));
      }

      if (v < 1) {
        return 1 + v
      }

      return 1 + v
    },
    translateValueToSlider(v) {
      if (v < 1) {
        return (-(1 / v) + 1.0)
      }

      if (v > 1) {
        return (v - 1)
      }

      return 0;
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
      this.modelInterfaces.forEach(mi => {
        mi.forEach(prop => {
          if (prop.state_changed) {
            if (prop.type == 'function') {
              let function_name = prop.model_name + "." + prop.target;
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
              let p = prop.model_name + "." + prop.target
              explain.setPropValue(p, parseFloat(prop.value / prop.factor), parseFloat(this.changeInTime), 0)
            }
            if (prop.type == 'factor') {
              let p = prop.model_name + "." + prop.target
              explain.setPropValue(p, parseFloat(prop.value), parseFloat(this.changeInTime), 0)
            }
            if (prop.type == 'boolean') {
              let p = prop.model_name + "." + prop.target
              explain.setPropValue(p, prop.value, 0, 0)
            }
            if (prop.type == 'string') {
              let new_value = prop.value
              let p = prop.model_name + "." + prop.target
              explain.setPropValue(p, new_value, 0, 0)
            }
            if (prop.type == 'list') {
              let new_value = prop.value
              let p = prop.model_name + "." + prop.target
              explain.setPropValue(p, new_value, 0, 0)
            }
            if (prop.type == 'multiple-list') {
              let new_value = prop.value
              let p = prop.model_name + "." + prop.target
              explain.setPropValue(p, new_value, 0, 0)
            }
            if (prop.type == 'prop-list') {
              let new_value_model = prop.value_model
              let p_model = prop.model_name + "." + prop.target_model
              explain.setPropValue(p_model, new_value_model, 0, 0)

              let new_value_prop = prop.value_prop
              let p_prop = prop.model_name + "." + prop.target_prop
              explain.setPropValue(p_prop, new_value_prop, 0, 0)
            }
          }
          prop.state_changed = false
        })
      })

      this.state_changed = false

    },
    cancel() {
      this.newControllerMode = false;
      this.newControllerCaption = "";
      this.newControllerModelName = "";
      this.selectedModelName = ""
      this.selectedModelInterface = {}
      this.state_changed = false
      this.modelInterfaces = []
      explain.getModelState()
    },
    modelChanged() {
      // enable the full control
      this.isEnabled = true
      this.collaps_icon = "fa-solid fa-chevron-down"
      this.state_changed = false
      this.modelInterfaces = []
      this.selectModel()
      explain.getModelState()
    },
    selectModel() {
      // get the model interface of the model type of the seleced model
      this.selectedModelInterface = explain.getModelInterface(this.selectedModelName)

      // add a flag to the property which can be set when the property needs to be updated
      this.selectedModelInterface.forEach(param => {
        // we have to extend the param with some additional properties
        param['model_name'] = this.selectedModelName
        param['state_changed'] = false
        if (param.readonly === undefined) {
          param['readonly'] = false
        }

        if (!param['edit_mode']) {
          param['edit_mode'] = 'all'
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
          case 'reference':
            this.processReferenceType(param)
            break;
          default:
            console.error("Unknown type: ", param.type)
        }
      })
      this.modelInterfaces.push(this.selectedModelInterface)
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
      if (!param['choices']) {
        param['choices'] = []
        if (param['option_default']) {
          param['choices'] = param['options_default']
        }
        Object.values(explain.modelState.models).forEach(model => {
          if (param.options.includes(model.model_type) || param.options.length == 0) {
            param["choices"].push(model.name)
          }
        })
      }

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
      param['slider'] = false
    },
    processFactorType(param) {
      let f_factor = param.target.split('.')
      param['edit_mode'] = 'factors'
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
      param['display_value'] = (param.value).toFixed(param.rounding)
      param['slider_value'] = this.translateValueToSlider(param.value);
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
    processReferenceType(param) {

      let temp = this.selectedModelName

      this.selectedModelName = param.target
      // get the model interface of the model type of the seleced model
      let model_interface_reference = explain.getModelInterface(param.target)

      // add a flag to the property which can be set when the property needs to be updated
      model_interface_reference.forEach(param => {
        // we have to extend the param with some additional properties
        param['model_name'] = this.selectedModelName
        param['state_changed'] = false
        if (param.readonly === undefined) {
          param['readonly'] = false
        }

        if (!param['edit_mode']) {
          param['edit_mode'] = 'all'
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
          case 'reference':
            this.processReferenceType(param)
            break;
          default:
            console.error("Unknown type: ", param.type)
        }
      })

      // return the model interface
      this.modelInterfaces.push(model_interface_reference)
      this.selectedModelName = temp
    },
    processAvailableModels() {
      this.availableModelNames = []
      try {
          if (Object.keys(explain.modelState.models)) {
          this.availableModelNames = [...Object.keys(explain.modelState.models)].sort();
          }
      } catch { }
    }
  },
  beforeUnmount() {
    this.state_changed = false
    this.$bus.off("state", this.$bus.on("state", this.processAvailableModels))
  },
  mounted() {
    // update if state changes
    this.$bus.on("state", this.processAvailableModels)
  },
};
</script>

<style></style>
