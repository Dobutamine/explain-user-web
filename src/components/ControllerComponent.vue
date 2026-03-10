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
          <div class="q-ma-sm q-mb-md">
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
                                color="transparent" @change="sliderChange(field, true)"/>

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
                              color="transparent" @change="changeSliderValue(field, true)" />

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
    const state = useStateStore();

    return {
      state
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
      factorsEnabled: true,
      selectedModelName: "",
      timeOptions: [1, 5, 10, 30, 60, 120, 240, 360],
      changeInTime: 1,
      state_changed: false,
      edit_mode: "basic",
      availableModelNames: [],
      selectedModelInterface: [],
      modelInterfaces: [],
      handleStateDebounceId: null,
      sliderApplyTimerId: null,
      sliderApplyLastTs: 0,
      sliderApplyMinIntervalMs: 90,
    };
  },
  methods: {
    getAllModels() {
      return Object.values(explain.modelState?.models || {})
    },
    matchesAllowedModelTypes(allowedTypes, modelType) {
      if (!Array.isArray(allowedTypes) || allowedTypes.length === 0) {
        return true
      }
      return allowedTypes.includes(modelType)
    },
    getDefaultChoices(entry) {
      if (Array.isArray(entry?.options_default)) {
        return [...entry.options_default]
      }
      if (Array.isArray(entry?.option_default)) {
        return [...entry.option_default]
      }
      return []
    },
    buildModelChoices(entry) {
      const choices = this.getDefaultChoices(entry)
      this.getAllModels().forEach(model => {
        if (this.matchesAllowedModelTypes(entry?.options, model.model_type)) {
          choices.push(model.name)
        }
      })
      return choices
    },
    buildNumericPropChoices(modelName) {
      const selectedModel = explain.modelState?.models?.[modelName]
      if (!selectedModel) {
        return []
      }

      const choices = []
      Object.keys(selectedModel).forEach(prop => {
        if (typeof selectedModel[prop] === "number" && prop[0] !== "_") {
          choices.push(prop)
        }
      })
      return choices
    },
    processParamByType(param) {
      switch (param.type) {
        case "number":
          this.processNumberType(param)
          break
        case "factor":
          this.processFactorType(param)
          break
        case "string":
          this.processStringType(param)
          break
        case "boolean":
          this.processBooleanType(param)
          break
        case "list":
          this.processListType(param)
          break
        case "multiple-list":
          this.processMultipleListType(param)
          break
        case "prop-list":
          this.processPropListType(param)
          break
        case "function":
          this.processFunctionType(param)
          break
        case "object":
          break
        case "object-list":
          this.processObjectListType(param)
          break
        case "reference":
          this.processReferenceType(param)
          break
        default:
          console.error("Unknown type: ", param.type)
      }
    },
    processInterfaceForModel(modelInterface, modelName) {
      if (!Array.isArray(modelInterface)) {
        return []
      }

      const previousModelName = this.selectedModelName
      this.selectedModelName = modelName

      modelInterface.forEach(param => {
        param.model_name = modelName
        param.state_changed = false
        if (param.readonly === undefined) {
          param.readonly = false
        }
        if (!param.edit_mode) {
          param.edit_mode = "all"
        }
        this.processParamByType(param)
      })

      this.selectedModelName = previousModelName
      return modelInterface
    },
    queueHandleState() {
      if (this.handleStateDebounceId) {
        return
      }
      this.handleStateDebounceId = setTimeout(() => {
        this.handleStateDebounceId = null
        this.handleState()
      }, 40)
    },
    getModelValue(modelName, path) {
      const model = explain.modelState?.models?.[modelName]
      if (!model || !path) {
        return undefined
      }

      const parts = String(path).split('.')
      let value = model
      for (const part of parts) {
        if (value == null || typeof value !== 'object' || !(part in value)) {
          return undefined
        }
        value = value[part]
      }
      return value
    },
    addNewController() {
      if (!this.newControllerModelName) {
        return
      }

      if (this.newControllerCaption == "") {
        this.newControllerCaption = this.newControllerModelName
      }

      const exists = this.state.configuration.controllers.some(controller =>
        controller.some(item => item.value === this.newControllerModelName)
      )
      if (exists) {
        this.cancel();
        return
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
          const found_index = this.state.configuration.controllers.findIndex(controller =>
            controller.some(item => item.value === this.selectedModelName)
          )
          if (found_index > -1) {
            this.state.configuration.controllers.splice(found_index, 1)
          }
          this.cancel();
        })
        .onCancel(() => {})
        .onDismiss(() => {})


    },
    scheduleSliderApply(force = false) {
      const applyNow = () => {
        this.sliderApplyLastTs = Date.now()
        this.sliderApplyTimerId = null
        this.updateValue()
      }

      if (force) {
        if (this.sliderApplyTimerId) {
          clearTimeout(this.sliderApplyTimerId)
          this.sliderApplyTimerId = null
        }
        applyNow()
        return
      }

      const now = Date.now()
      const elapsed = now - this.sliderApplyLastTs
      if (elapsed >= this.sliderApplyMinIntervalMs) {
        applyNow()
        return
      }

      if (this.sliderApplyTimerId) {
        return
      }

      this.sliderApplyTimerId = setTimeout(() => {
        applyNow()
      }, this.sliderApplyMinIntervalMs - elapsed)
    },
    sliderChange(param, force = false) {
      this.state_changed = true;
      param.state_changed = true;
      this.scheduleSliderApply(force);
    },
    toggleSlider(param) {
      param.slider = !param.slider
      param.value = parseFloat(param.value)
    },
    changeSliderValue(parameter, force = false) {
      parameter.state_changed = true;
      this.state_changed = true;
      parameter.display_value = this.translateSliderToValue(parameter.slider_value).toFixed(parameter.rounding)
      parameter.value = this.translateSliderToValue(parameter.slider_value)
      this.scheduleSliderApply(force);
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
    changePropState(param, arg) {
      if (param.type === "prop-list" && arg === "model_changed") {
        // reset the prop list choices
        param.choices_props = this.buildNumericPropChoices(param.value_model)
        param.value_prop = ""
      }
      this.state_changed = true
      param.state_changed = true
    },
    applyChangedProperty(prop) {
      const path = `${prop.model_name}.${prop.target}`
      switch (prop.type) {
        case "function": {
          const functionArgs = prop.args.map(arg => (arg.type === "number" ? arg.value / arg.factor : arg.value))
          explain.callModelFunction(path, functionArgs)
          return
        }
        case "number":
          explain.setPropValue(path, parseFloat(prop.value / prop.factor), parseFloat(this.changeInTime), 0)
          return
        case "factor":
          explain.setPropValue(path, parseFloat(prop.value), parseFloat(this.changeInTime), 0)
          return
        case "boolean":
        case "string":
        case "list":
        case "multiple-list":
          explain.setPropValue(path, prop.value, 0, 0)
          return
        case "prop-list": {
          const modelPath = `${prop.model_name}.${prop.target_model}`
          const propPath = `${prop.model_name}.${prop.target_prop}`
          explain.setPropValue(modelPath, prop.value_model, 0, 0)
          explain.setPropValue(propPath, prop.value_prop, 0, 0)
          return
        }
        default:
          return
      }
    },
    updateValue() {
      this.modelInterfaces.forEach(mi => {
        mi.forEach(prop => {
          if (prop.state_changed) {
            this.applyChangedProperty(prop)
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
      this.selectedModelInterface = []
      this.state_changed = false
      this.modelInterfaces = []
      explain.getModelState()
    },
    modelChanged() {
      this.state_changed = false
      this.modelInterfaces = []
      // this.selectModel()
      explain.getModelState()
    },
    selectModel() {
      if (!this.selectedModelName) {
        return
      }

      // get the model interface of the model type of the seleced model
      const selectedInterface = explain.getModelInterface(this.selectedModelName)
      if (!Array.isArray(selectedInterface)) {
        this.selectedModelInterface = []
        return
      }
      this.selectedModelInterface = this.processInterfaceForModel(selectedInterface, this.selectedModelName)
      this.modelInterfaces.push(this.selectedModelInterface)
    },
    processNumberType(param) {
      const currentValue = this.getModelValue(this.selectedModelName, param.target)
      const numericValue = Number(currentValue)
      if (Number.isFinite(numericValue)) {
        param['value'] = (numericValue * param.factor).toFixed(param.rounding)
      } else {
        param['value'] = Number(0).toFixed(param.rounding)
      }
    },
    processStringType(param) {
      const currentValue = this.getModelValue(this.selectedModelName, param.target)
      param['value'] = currentValue ?? ""
    },
    processBooleanType(param) {
      const currentValue = this.getModelValue(this.selectedModelName, param.target)
      param['value'] = Boolean(currentValue)
    },
    processListType(param) {
      param['value'] = this.getModelValue(this.selectedModelName, param.target)
      // if there's a default number then use it
      if (param['default']) {
        param['value'] = param['default']
      }
      // file the options list
      if (!param['choices']) {
        param['choices'] = this.buildModelChoices(param)
      }

    },
    processMultipleListType(param) {
      param['value'] = this.getModelValue(this.selectedModelName, param.target)
      if (param['default']) {
        param['value'] = param['default']
      }
      // file the options list
      param['choices'] = this.buildModelChoices(param)
      param['slider'] = false
    },
    processFactorType(param) {
      const currentValue = this.getModelValue(this.selectedModelName, param.target)
      const numericValue = Number(currentValue)
      param['edit_mode'] = 'factors'
      param['value'] = Number.isFinite(numericValue) ? numericValue : 1
      param['display_value'] = (param.value).toFixed(param.rounding)
      param['slider_value'] = this.translateValueToSlider(param.value);
      param['value'] = (param['value']).toFixed(2)
    },
    processPropListType(param) {
      param['value_model'] = this.getModelValue(this.selectedModelName, param.target_model)
      param['value_prop'] = this.getModelValue(this.selectedModelName, param.target_prop)
      // file the options list
      param['choices_model'] = this.buildModelChoices(param)
      param["choices_props"] = this.buildNumericPropChoices(param.value_model)

    },
    processFunctionType(param) {
      param.args.forEach(arg => {
      if (!arg['hidden']) {
        arg['hidden'] = false
      }
      // get the current value
      arg['value'] = this.getModelValue(this.selectedModelName, arg.target)

      if (arg.target) {
        if (arg.type == 'number') {
          arg['value'] = (arg['value'] * arg.factor).toFixed(arg.rounding)
        }
        if (isNaN(arg['value'])) {
          arg['value'] = arg.default
        }
        if (arg.options) {
          if (arg.type == 'list') {
            arg['choices'] = this.buildModelChoices(arg)
            arg['value'] = this.getModelValue(this.selectedModelName, arg.target)
            if (arg['default']) {
              arg['value'] = arg['default']
            }
          }
          if (arg.type == 'multiple-list') {
            arg['choices'] = this.buildModelChoices(arg)
            arg['value'] = this.getModelValue(this.selectedModelName, arg.target)
            if (arg['default']) {
              arg['value'] = arg['default']
            }
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
    },
    processReferenceType(param) {

      if (!param?.target) {
        return
      }

      // get the model interface of the model type of the seleced model
      const model_interface_reference = explain.getModelInterface(param.target)
      if (!Array.isArray(model_interface_reference)) {
        return
      }

      this.modelInterfaces.push(this.processInterfaceForModel(model_interface_reference, param.target))
    },
    processAvailableModels() {
      this.availableModelNames = []
      try {
          const models = explain.modelState?.models
          if (models && Object.keys(models)) {
            this.availableModelNames = [...Object.keys(models)].sort();
          }
      } catch { }
    },
    handleState() {
      this.processAvailableModels()
      if (!this.selectedModelName) {
        return
      }
      this.modelInterfaces = []
      this.selectModel()
    }
  },
  beforeUnmount() {
    this.state_changed = false
    if (this.handleStateDebounceId) {
      clearTimeout(this.handleStateDebounceId)
      this.handleStateDebounceId = null
    }
    if (this.sliderApplyTimerId) {
      clearTimeout(this.sliderApplyTimerId)
      this.sliderApplyTimerId = null
    }
    this.$bus.off("state", this.queueHandleState)
  },
  mounted() {
    // update if state changes
    this.$bus.on("state", this.queueHandleState)
  },
};
</script>

<style></style>
