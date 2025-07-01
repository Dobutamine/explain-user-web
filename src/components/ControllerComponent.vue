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
            ]" />
          </div>
          <div v-if="redraw > 0.0" class="q-ma-sm q-mb-md">
            <div v-for="(field, index) in itemList" :key="index">
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

                 <div v-if="field.type == 'factor'">
                    <div class="row justify-center">
                        <q-badge class="q-pa-sm" color="grey-10">
                        <div class="text-secondary" style="font-size: small;">
                            {{ field.caption }} = {{ field.display_value }} x N
                        </div>
                        </q-badge>
                    </div>
                    <div class="row  justify-center">
                        <q-btn @click="decreaseValue(field)" class="q-ma-sm col" color="grey-10" dense size="xs"
                        icon="fa-solid fa-chevron-left"></q-btn>

                        <q-slider class="q-ma-sm q-mr-sm col-8" v-model="field.slider_value" :step="field.step"
                        :min="field.ll" :max="field.ul" snap :markers="10" dense thumb-color="teal"
                        color="transparent" @change="changeValue(field)" />
                        
                        <q-btn @click="increaseValue(field)" class="q-ma-sm col" dense size="xs" color="grey-10"
                        icon="fa-solid fa-chevron-right"></q-btn>
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
        </div>
      </q-card>
    </div>

  </q-card>
</template>

<script>

import { explain } from "../boot/explain";
import { useStateStore } from "src/stores/state";

export default {
  setup() {
    let itemList = []
    const state = useStateStore();

    return {
      itemList, state
    }
  },
  props: {
    title: String,
    collapsed: Boolean,
    properties: Array
  },
  data() {
    return {
      isEnabled: true,
      factorsEnabled: true,
      redraw: 1,
      timeOptions: [1, 5, 10, 30, 60, 120, 240, 360],
      changeInTime: 1,
      state_changed: false,
      edit_mode: "basic",
      propertyList: []
    };
  },
  methods: {
    processPropertyList() {
        this.itemList = []
        this.propertyList.forEach(prop => {
            // process the prop
            let t  = prop.split('.')
            let m = t[0]
            let p = t[1]
            // find the the correct modelInterface item for this prop
            let model_interface = explain.getModelInterface(m)
            // find the correct item in the model interface
            let param = model_interface.find(item => item.target === p);
            // add the model name to the parameter
            param['model'] = m;
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
            this.itemList.push(param)
        })
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
      this.updateValue();
      this.redraw += 1
    },
    updateValue() {
      this.itemList.forEach(prop => {
        if (prop.state_changed) {
          if (prop.type == 'function') {
            let function_name = prop.model + "." + prop.target;
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
            let p = prop.model + "." + prop.target
            explain.setPropValue(p, parseFloat(prop.value / prop.factor), parseFloat(this.changeInTime), 0)
          }
          if (prop.type == 'factor') {
            let p = prop.model + "." + prop.target
            explain.setPropValue(p, parseFloat(prop.value / prop.factor), parseFloat(this.changeInTime), 0)
          }
          if (prop.type == 'boolean') {
            let p = prop.model + "." + prop.target
            explain.setPropValue(p, prop.value, 0, 0)
          }
          if (prop.type == 'string') {
            let new_value = prop.value
            let p = prop.model+ "." + prop.target
            explain.setPropValue(p, new_value, 0, 0)
          }
          if (prop.type == 'list') {
            let new_value = prop.value
            let p = prop.model + "." + prop.target
            explain.setPropValue(p, new_value, 0, 0)
          }
          if (prop.type == 'multiple-list') {
            let new_value = prop.value
            let p = prop.model + "." + prop.target
            explain.setPropValue(p, new_value, 0, 0)
          }
          if (prop.type == 'prop-list') {
            let new_value_model = prop.value_model
            let p_model = prop.model + "." + prop.target_model
            explain.setPropValue(p_model, new_value_model, 0, 0)

            let new_value_prop = prop.value_prop
            let p_prop = prop.model + "." + prop.target_prop
            explain.setPropValue(p_prop, new_value_prop, 0, 0)
          }
        }
        prop.state_changed = false
      })

      this.state_changed = false

    },
    processNumberType(param) {
      let f_number = param.target.split('.')
      switch (f_number.length) {
        case 1:
          param['value'] = explain.modelState.models[param.model][f_number[0]]
          break;
        case 2:
          param['value'] = explain.modelState.models[param.model][f_number[0]][f_number[1]]
          break;
        case 3:
          param['value'] = explain.modelState.models[param.model][f_number[0]][f_number[1]][f_number[2]]
          break;
      }
      param['value'] = (param['value'] * param.factor).toFixed(param.rounding)
    },
    processStringType(param) {
      let f_string = param.target.split('.')
      switch (f_string.length) {
        case 1:
          param['value'] = explain.modelState.models[param.model][f_string[0]]
          break;
        case 2:
          param['value'] = explain.modelState.models[param.model][f_string[0]][f_string[1]]
          break;
        case 3:
          param['value'] = explain.modelState.models[param.model][f_string[0]][f_string[1]][f_string[2]]
          break;
      }
    },
    processBooleanType(param) {
      let f_bool = param.target.split('.')
      switch (f_bool.length) {
        case 1:
          param['value'] = explain.modelState.models[param.model][f_bool[0]]
          break;
        case 2:
          param['value'] = explain.modelState.models[param.model][f_bool[0]][f_bool[1]]
          break;
        case 3:
          param['value'] = explain.modelState.models[param.model][f_bool[0]][f_bool[1]][f_bool[2]]
          break;
      }
    },
    processListType(param) {
      let f_list = param.target.split('.')
      switch (f_list.length) {
        case 1:
          param['value'] = explain.modelState.models[param.model][f_list[0]]
          break;
        case 2:
          param['value'] = explain.modelState.models[param.model][f_list[0]][f_list[1]]
          break;
        case 3:
          param['value'] = explain.modelState.models[param.model][f_list[0]][f_list[1]][f_list[2]]
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
          param['value'] = explain.modelState.models[param.model][f_mlist[0]]
          break;
        case 2:
          param['value'] = explain.modelState.models[param.model][f_mlist[0]][f_mlist[1]]
          break;
        case 3:
          param['value'] = explain.modelState.models[param.model][f_mlist[0]][f_mlist[1]][f_mlist[2]]
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
      param['edit_mode'] = 'factors'
      switch (f_factor.length) {
        case 1:
          param['value'] = explain.modelState.models[param.model][f_factor[0]]
          break;
        case 2:
          param['value'] = explain.modelState.models[param.model][f_factor[0]][f_factor[1]]
          break;
        case 3:
          param['value'] = explain.modelState.models[param.model][f_factor[0]][f_factor[1]][f_factor[2]]
          break;
      }
      param['slider_value'] = this.translateValueToSlider(param.value)
      param['value'] = (param['value']).toFixed(2)
      if (!isNaN(param.model_value)) {
        param['display_value'] = param.model_value.toFixed(param.rounding)
      }
    },
    processPropListType(param) {
      let f_model = param.target_model.split('.')
      param['value_model'] = explain.modelState.models[param.model][f_model[0]]
      let f_prop = param.target_prop.split('.')
      param['value_prop'] = explain.modelState.models[param.model][f_prop[0]]
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
        arg['value'] = explain.modelState.models[param.model][f[0]]
      }
      if (f.length == 2) {
        arg['value'] = explain.modelState.models[param.model][f[0]][f[1]]
      }
      if (f.length == 3) {
        arg['value'] = explain.modelState.models[param.model][f[0]][f[1]][f[2]]
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
            arg['value'] = explain.modelState.models[param.model][arg.target]
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
            arg['value'] = explain.modelState.models[param.model][arg.target]
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
    getModelValue(prop_name) {
      let model_value = NaN;
      let f_number = prop_name.split('.')
      switch (f_number.length) {
        case 1:
          model_value = explain.modelState.models[f_number[0]]
          break;
        case 2:
          model_value = explain.modelState.models[f_number[0]][f_number[1]]
          break;
        case 3:
          model_value = explain.modelState.models[f_number[0]][f_number[1]][f_number[2]]
          break;
      }
      return model_value;
    },
    increaseValue(parameter) {
      parameter.slider_value += parameter.step
      if (parameter.slider_value > parameter.max) {
        parameter.slider_value = parameter.max
      }
      //this.changeValue(parameter)
    },
    decreaseValue(parameter) {
      parameter.slider_value -= parameter.step
      if (parameter.slider_value < parameter.min) {
        parameter.slider_value = parameter.min
      }
      //this.changeValue(parameter)
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
  },
  beforeUnmount() {
  },
  mounted() {
    // set enabled state
    this.isEnabled = !this.collapsed;

    // make a mutable list from the properties thic controller controls
    this.propertyList = [...this.properties];

    // process the controlled properties
    this.processPropertyList();
  },
};
</script>

<style></style>
