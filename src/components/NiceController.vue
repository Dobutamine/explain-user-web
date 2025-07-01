<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div class="q-mt-es row gutter text-overline justify-center" @click="toggle">
      {{ title }}
    </div>
    <div v-if="parameters.length > 0 && isEnabled" class="q-mb-sm">
      <div v-for="(param, index) in mutableParameters" :key="index">
        <div v-if="param.type == 'factor' || param.type == 'number'">
            <div v-if="!(param.linked && param.linked_to == '')">
              <div class="row justify-center">
                <q-badge class="q-pa-sm" color="grey-10">
                  <div class="text-secondary" style="font-size: small;">
                    <div v-if="param.type == 'factor'">
                      {{ param.caption }} = {{ param.display_value }} x N
                    </div>
                    <div v-else>
                      {{ param.caption }} = {{ param.display_value }} {{ param.unit }}
                    </div>
                  </div>
                </q-badge>
              </div>
              <div class="row  justify-center">
                <q-btn @click="decreaseValue(param)" class="q-ma-sm col" color="grey-10" dense size="xs"
                  icon="fa-solid fa-chevron-left"></q-btn>

                <q-slider class="q-ma-sm q-mr-sm col-8" v-model="param.slider_value" :step="param.step"
                  :min="param.min" :max="param.max" snap :markers="10" dense thumb-color="teal"
                  color="transparent" @change="changeValue(param)" />
                
                  <q-btn @click="increaseValue(param)" class="q-ma-sm col" dense size="xs" color="grey-10"
                  icon="fa-solid fa-chevron-right"></q-btn>
              </div>
            </div>
        </div>
        <div v-if="param.type == 'boolean'">
            <div v-if="param.enabled">
              <div class="row justify-center">
                <q-badge class="q-pa-sm" color="grey-10">
                  <div class="text-secondary" style="font-size: small;">
                    {{ param.caption }}
                    <q-toggle class="q-ml-sm" v-model="param.model_value" dense size="sm"
                      @update:model-value="changeValue(param)"></q-toggle>
                  </div>
                </q-badge>
              </div>
            </div>
        </div>
        <div v-if="param.type == 'string'">
            <div v-if="param.enabled">
              <div class="q-mr-lg q-ml-lg q-mt-sm justify-center">
                <q-input class="q-ml-sm" :label="param.caption" v-model="param.model_value" dense
                  debounce="1000" @update:model-value="changeValue(param)"></q-input>
              </div>
            </div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
import { explain } from "../boot/explain";

/*
    "title": <string> title of the controller
    "enabled": <boolean>
    "parameters": [
      {
            "caption": "syst vasc resistance",
            "enabled": true,
            "type": "factor/number/boolean/string",
            "caller": "direct/function",
            "target": "Circulation.svr_factor",
            "function": "Pda.set_diameter",
            "unit": "x",
            "min": 0.001,
            "max": 10,
            "step": 0.001,
            "rounding": 3
          },
    ]
*/
export default {
  props: {
    title: String,
    collapsed: Boolean,
    parameters: Array,
  },
  data() {
    return {
      advanced: false,
      isEnabled: true,
      enabled: true,
      advancedColor: "transparent",
      mutableParameters: []
    };
  },
  methods: {
    toggle() {
      this.isEnabled = !this.isEnabled
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
    changeValue(parameter) {
      switch (parameter.type) {
        case "factor":
          parameter.model_value = this.translateSliderToValue(parameter.slider_value)
          parameter.display_value = parameter.model_value.toFixed(parameter.rounding)
          if (parameter.caller == 'direct') {
            explain.setPropValue(parameter.target, parameter.model_value, 0.0)
          }
          if (parameter.caller == 'function') {
            explain.callModelFunction(parameter.function, [parameter.model_value])
          }
          break;
        case "number":
          parameter.model_value = parameter.slider_value
          parameter.display_value = parameter.model_value.toFixed(parameter.rounding)
          if (parameter.caller == 'direct') {
            explain.setPropValue(parameter.target, parameter.model_value, 0.0)
          }
          if (parameter.caller == 'function') {
            explain.callModelFunction(parameter.function, [parameter.model_value])
          }
          break;
        case "boolean":
          if (parameter.caller == 'direct') {
            explain.setPropValue(parameter.target, parameter.model_value, 0.0)
          }
          if (parameter.caller == 'function') {
            explain.callModelFunction(parameter.function, [parameter.model_value])
          }
          break;
        case "string":
          if (parameter.caller == 'direct') {
            explain.setPropValue(parameter.target, parameter.model_value, 0.0)
          }
          if (parameter.caller == 'function') {
            explain.callModelFunction(parameter.function, [parameter.model_value])
          }
          break;
      }
    },
    increaseValue(parameter) {
      parameter.slider_value += parameter.step
      if (parameter.slider_value > parameter.max) {
        parameter.slider_value = parameter.max
      }
      this.changeValue(parameter)
    },
    decreaseValue(parameter) {
      parameter.slider_value -= parameter.step
      if (parameter.slider_value < parameter.min) {
        parameter.slider_value = parameter.min
      }
      this.changeValue(parameter)
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
    processModelState() {
      if (explain.modelState.models) {
        if (this.mutableParameters) {
          this.mutableParameters.forEach(parameter => {
            switch (parameter.type) {
              case 'factor':
                parameter.model_value = this.getModelValue(parameter.target)
                parameter.slider_value = this.translateValueToSlider(parameter.model_value)
                if (!isNaN(parameter.model_value)) {
                  parameter.display_value = parameter.model_value.toFixed(parameter.rounding)
                }
                break;
              case 'number':
                parameter.model_value = this.getModelValue(parameter.target)
                parameter.slider_value = parameter.model_value;
                if (!isNaN(parameter.model_value)) {
                  parameter.display_value = parameter.model_value.toFixed(parameter.rounding)
                }
                break;
              case 'boolean':
                parameter.model_value = this.getModelValue(parameter.target)
                break;
              case 'string':
                parameter.model_value = this.getModelValue(parameter.target)
                break;
              case 'function':
                parameter.model_value = this.getModelValue(parameter.target)
                parameter.slider_value = parameter.model_value;
                if (!isNaN(parameter.model_value)) {
                  parameter.display_value = parameter.model_value.toFixed(parameter.rounding)
                }
                break;
            }
          })
        }
      }
    },
  },
  beforeUnmount() {
    this.$bus.off("state", this.processModelState)
  },
  mounted() {
    // set enabled state
    this.isEnabled = !this.collapsed;

    // make a mutable list from the parameters
    this.mutableParameters = [...this.parameters];
    
    // get model state
    this.$bus.on("state", this.processModelState)

  },
};
</script>

<style></style>
