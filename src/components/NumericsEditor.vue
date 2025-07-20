<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-xs" bordered dark flat>
    <div class="row text-overline justify-center" @click="collapsed = !collapsed">
      {{ title }}
    </div>
    <div v-if="!collapsed">
      <!-- edit model part -->
      <q-card class="q-pb-xs q-pt-xs q-ma-xs" dark flat>
        <div class="q-mt-es row gutter text-overline justify-center" @click="isEnabled = !isEnabled">
        </div>
        <div>
            <div class="q-pa-sm q-mt-xs q-mb-xs q-ml-md q-mr-md text-overline justify-center row">
                <q-select class="q-pa-xs col" v-model="selectedMonitorName" square label="select monitor type" hide-hint
                    :options="availableMonitorNames" dense dark stack-label @update:model-value="monitorSelected" />
                <q-btn v-if="!selectedMonitorName" class="col-1 q-ma-xs q-mt-md" color="primary" size="xs" dense
                    icon="fa-solid fa-plus" @click="buildMonitor" style="font-size: 8px"><q-tooltip>add new monitor</q-tooltip></q-btn>
                <q-btn v-if="selectedMonitorName" class="col-1 q-ma-xs q-mt-md" color="grey-9" size="xs" dense
                    icon="fa-solid fa-xmark" @click="cancelMonitor" style="font-size: 8px"><q-tooltip>clear new monitor</q-tooltip></q-btn>
            </div>

            <div v-if="selectedMonitor">
                <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                    <div class="text-white" :style="{ 'font-size': '10px' }">
                        <q-input 
                            v-model="selectedMonitor.title" 
                            label="title" 
                            color="blue" 
                            hide-hint 
                            filled 
                            dense 
                            stack-label 
                            style="font-size: 12px" 
                            class="q-mb-sm" 
                            squared>
                        </q-input>
                    </div>
                </div>
                
                <div class="q-ml-lg q-mr-md q-mt-md text-left text-secondary row" :style="{ 'font-size': '12px' }">
                    <div class="col"> enabled </div>
                    <div class="col-2 text-white" :style="{ 'font-size': '10px' }">
                      <q-toggle 
                        v-model="selectedMonitor.enabled" 
                        color="primary" 
                        size="sm" 
                        hide-hint 
                        filled 
                        dense 
                        style="font-size: 12px" 
                        class="q-mb-sm">
                      </q-toggle>
                    </div>
                </div>

                <div class="q-ml-lg q-mr-md q-mt-md text-left text-secondary row" :style="{ 'font-size': '12px' }">
                    <div class="col"> collapsed </div>
                    <div class="col-2 text-white" :style="{ 'font-size': '10px' }">
                      <q-toggle 
                        v-model="selectedMonitor.collapsed" 
                        color="primary" 
                        size="sm" 
                        hide-hint 
                        filled 
                        dense 
                        style="font-size: 12px" 
                        class="q-mb-sm">
                      </q-toggle>
                    </div>
                </div>

                <div class="q-ma-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                <div v-for="(parameter, index) in selectedMonitor.parameters" :key="index">
                    <div class="q-ma-sm text-center text-white">PARAMETER {{ index + 1 }}</div>
                        <q-separator></q-separator>
                        <div v-if="parameter.props_processed.length > 0" class="q-ma-sm">SETTINGS</div>
                        <div class="text-white" :style="{ 'font-size': '10px' }">
                            <q-input 
                                v-model="parameter.label" 
                                label="label" 
                                color="blue" 
                                hide-hint 
                                filled 
                                dense 
                                stack-label 
                                style="font-size: 12px" 
                                class="q-mb-sm" 
                                squared>
                            </q-input>
                        </div>
                        <div class="text-white" :style="{ 'font-size': '10px' }">
                            <q-input 
                                v-model="parameter.unit" 
                                label="unit" 
                                color="blue" 
                                hide-hint 
                                filled 
                                dense 
                                stack-label 
                                style="font-size: 12px" 
                                class="q-mb-sm" 
                                squared>
                            </q-input>
                        </div>
                        <div class="text-white" :style="{ 'font-size': '10px' }">
                            <q-input 
                                v-model.number="parameter.factor" 
                                label="factor" 
                                color="blue" 
                                hide-hint 
                                filled 
                                dense 
                                stack-label 
                                style="font-size: 12px" 
                                class="q-mb-sm" 
                                squared>
                            </q-input>
                        </div>
                         <div class="text-white" :style="{ 'font-size': '10px' }">
                            <q-input 
                                v-model.number="parameter.rounding" 
                                label="rounding" 
                                color="blue" 
                                hide-hint 
                                filled 
                                dense 
                                stack-label 
                                style="font-size: 12px" 
                                class="q-mb-sm" 
                                squared>
                            </q-input>
                        </div>
                        <div class="q-ma-sm text-left text-white row" :style="{ 'font-size': '12px' }">
                            <div class="col"> weight based </div>
                            <div class="col-2 text-white" :style="{ 'font-size': '10px' }">
                                <q-toggle 
                                        v-model="parameter.weight_based" 
                                        color="primary" 
                                        size="sm" 
                                        hide-hint 
                                        filled 
                                        dense 
                                        style="font-size: 12px" 
                                        class="q-mb-sm">
                                </q-toggle>
                            </div>
                        </div> 
                        <div v-if="parameter.props_processed.length > 0" class="q-ma-sm">PROPERTIES</div>
                        <div v-for="(prop, index_prop) in parameter.props_processed" :key="index_prop">
                            <div class="q-mt-sm text-white" :style="{ 'font-size': '10px' }">
                                <q-select 
                                    v-model="prop.model" 
                                    label="model" 
                                    :options="availableModels" 
                                    color="blue"
                                    hide-hint 
                                    filled 
                                    dense  
                                    stack-label
                                    style="font-size: 12px" 
                                    class="q-mb-sm"
                                    @update:model-value="selectPropModel(prop, prop.model)"
                                    squared>
                                </q-select>

                            </div>
                            <div class="text-white" :style="{ 'font-size': '10px' }">
                                <q-select 
                                    v-model="prop.prop" 
                                    label="model" 
                                    :options="prop.availableProperties" 
                                    color="blue"
                                    hide-hint 
                                    filled 
                                    dense  
                                    stack-label
                                    style="font-size: 12px" 
                                    class="q-mb-sm"
                                    squared>
                                </q-select>
                            </div>
                            <div class="row q-ma-md">
                            <q-btn class="col q-ml-xl q-mr-xl" color="negative" size="sm" dense @click="removeProperty(parameter, index_prop)"
                                style="font-size: 10px"><q-icon class="fa-solid fa-trash-can"></q-icon><q-tooltip>remove model property</q-tooltip></q-btn>
                            </div>
                        </div>
                        <div class="row q-ma-md">
                            <q-btn class="col q-ml-xl q-mr-xl" color="primary" size="sm" dense @click="addProperty(parameter)"
                            style="font-size: 10px">ADD PROPERTY<q-tooltip>add a model property</q-tooltip></q-btn>
                        </div>

                </div>

                <q-separator bg-separator></q-separator>
                </div>
            </div>

        </div>
      </q-card>
    </div>
  </q-card>
</template>

<script>

import { checkMaxIfStatementsInShader } from "pixi.js";
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
        collapsed: false,
        isEnabled: true,
        selectedMonitor: "",
        availableMonitors: [],
        selectedMonitorName: "",
        availableMonitorNames: [],
        availableModels: [],
        availableProperties: [],
    };
  },
  methods: {
    selectPropModel(prop_current, prop_model) {
        prop_current['availableProperties'] = []
        prop_current.prop = ""
        Object.keys(explain.modelState.models[prop_model]).forEach(prop => {
          if (typeof (explain.modelState.models[prop_model][prop]) === 'number') {
            if (prop[0] !== "_") {
              prop_current['availableProperties'].push(prop)
            }
          }
        })
        prop_current['availableProperties'].sort()
    },
    addProperty(parameter) {
        let new_prop = {
            model: "",
            prop: ""
        }
        parameter.props_processed.push(new_prop)
    },
    removeProperty(parameter, prop_index) {
        console.log(parameter)
        parameter.props_processed.splice(prop_index, 1);
    },
    buildMonitor() {
        this.selectedMonitor = {
            title: "",
            enabled: false,
            collapsed: false,
            parameters: [
                {
                    label: "new_param",
                    unit: "",
                    factor: 1.0,
                    rounding: 0,
                    weight_based: false,
                    props: []
                }
            ]
        }
    },
    cancelMonitor() {
        this.selectedMonitorName = ""
        this.selectedMonitor = ""
    },
    monitorSelected() {
        this.selectedMonitor = {...this.state.configuration.monitors[this.selectedMonitorName]}
        this.selectedMonitor.parameters.forEach(parameter => {
            parameter.props_processed = []
            parameter.props.forEach(prop => {
                let p = prop.split(".")
                let av_props = []
                Object.keys(explain.modelState.models[p[0]]).forEach(pos_p => {
                    if (typeof (explain.modelState.models[p[0]][pos_p]) === 'number') {
                        if (pos_p[0] !== "_") {
                            av_props.push(pos_p)
                    }
                    }
                })
                parameter.props_processed.push({ model: p[0], prop: p[1], availableProperties: [...av_props]})
            })
        })
    },
    processAvailableModels() {
        this.availableModels = []
        try {
            if (Object.keys(explain.modelState.models)) {
            this.availableModels = [...Object.keys(explain.modelState.models)].sort();
            }
        } catch { }
    },
    processModelInterface() {
        Object.values(explain.modelState.models[this.selectedModel]).forEach(model => {
            if (prop.options.includes(model.model_type)) {
                prop["choices"].push(model.name)
              }
        })
    }
  },
  beforeUnmount() {
    this.$bus.off("state", this.processAvailableModels)
    this.$bus.off("model_interface",  this.processModelInterface)
  },
  mounted() {
    // process the available monitors
    this.availableMonitorNames = []
    Object.keys(this.state.configuration.monitors).forEach(monitor_name => {
        this.availableMonitorNames.push(monitor_name)
    })
    this.$bus.on("state", this.processAvailableModels)
    this.$bus.on("model_interface",  this.processModelInterface)
  },
};
</script>

<style></style>
