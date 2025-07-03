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
            <q-select class="q-pa-xs col" v-model="selectedModelType" square label="select new model type" hide-hint
              :options="availableModelTypes" dense dark stack-label @update:model-value="modelTypeSelected" />
            <q-btn v-if="selectedModelType" class="col-1 q-ma-xs q-mt-md" color="grey-9" size="xs" dense
              icon="fa-solid fa-xmark" @click="cancelAddModel" style="font-size: 8px"><q-tooltip>clear new model</q-tooltip></q-btn>
            <q-btn v-if="selectedModelType" class="col-1 q-ma-xs q-mt-md" color="primary" size="xs" dense
              icon="fa-solid fa-plus" @click="addModelToEngine" style="font-size: 8px"><q-tooltip>add model to engine</q-tooltip></q-btn>
          </div>

          <div v-if="redraw > 0.0" class="q-ma-sm q-mb-md">
            <div v-for="(field, index) in selectedModelProps" :key="index">
              <div v-if="field.build_prop">

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
                      <q-toggle v-model="field.value" color="primary" size="sm" hide-hint filled dense :readonly="field.readonly"
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
                      <q-select v-model="field.value" :label="field.caption" :options="field.choices" color="blue" :readonly="field.readonly"
                        hide-hint filled dense @update:model-value="changePropState(field, arg)" stack-label
                        style="font-size: 12px" class="q-mb-sm" squared>
                      </q-select>
                    </div>
                  </div>
                </div>

                <div v-if="field.type == 'multiple-list'">
                  <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                    <div class="text-white" :style="{ 'font-size': '10px' }">
                      <q-select v-model="field.value" :label="field.caption" :options="field.choices" multiple :readonly="field.readonly"
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

                <div v-if="field.type == 'component-list'">
                  <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                     <div class="text-secondary" :style="{ 'font-size': '12px' }">
                      model components (submodels)
                     </div>
                      <q-card class="q-pb-xs q-pt-xs q-ma-xs" dark flat>
                        <div class="text-white" :style="{ 'font-size': '10px' }">
                            <div v-for="(comp, index) in selectedModelComponentList" :key="index">
                              <div v-for="(comp_field, index) in comp" :key="index">
                                <div v-if="comp_field.build_prop">

                                  <div v-if="comp_field.type == 'number'">
                                      <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                                        <div class="text-white" :style="{ 'font-size': '10px' }">
                                          <q-input v-model="comp_field.value" :label="comp_field.caption" :max="comp_field.ul" :min="comp_field.ll" :readonly="comp_field.readonly"
                                            :step="comp_field.delta" color="blue" hide-hint filled dense
                                            @update:model-value="changePropState(comp_field, arg)" stack-label type="number"
                                            style="font-size: 12px" class="q-mb-sm" squared>
                                          </q-input>
                                        </div>
                                      </div>
                                  </div>

                                  <div v-if="comp_field.type == 'string'">
                                    <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                                      <div class="text-white" :style="{ 'font-size': '10px' }">
                                        <q-input v-model="comp_field.value" :label="comp_field.caption" color="blue" hide-hint filled dense :readonly="comp_field.readonly"
                                          @update:model-value="changePropState(comp_field, arg)" stack-label style="font-size: 12px"
                                          class="q-mb-sm" squared>
                                        </q-input>
                                      </div>
                                    </div>
                                  </div>

                                  <div v-if="comp_field.type == 'boolean'">
                                    <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary row" :style="{ 'font-size': '12px' }">
                                      <div class="col">
                                        {{ comp_field.caption }}
                                      </div>
                                      <div class="col-2 text-white" :style="{ 'font-size': '10px' }">
                                        <q-toggle v-model="comp_field.value" color="primary" size="sm" hide-hint filled dense :readonly="comp_field.readonly"
                                          @update:model-value="changePropState(comp_field, arg)" style="font-size: 12px" class="q-mb-sm">
                                        </q-toggle>
                                      </div>
                                    </div>
                                  </div>

                                  <div v-if="comp_field.type == 'list'">
                                    <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                                      <div class="text-white" :style="{ 'font-size': '10px' }">
                                        <q-select v-model="comp_field.value" :label="comp_field.caption" :options="comp_field.choices" color="blue" :readonly="comp_field.readonly"
                                          hide-hint filled dense @update:model-value="changePropState(comp_field, arg)" stack-label
                                          style="font-size: 12px" class="q-mb-sm" squared>
                                        </q-select>
                                      </div>
                                    </div>
                                  </div>

                                  <div v-if="comp_field.type == 'multiple-list'">
                                    <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                                      <div class="text-white" :style="{ 'font-size': '10px' }">
                                        <q-select v-model="comp_field.value" :label="comp_field.caption" :options="comp_field.choices" multiple :readonly="comp_field.readonly"
                                          color="blue" hide-hint filled dense @update:model-value="changePropState(comp_field, arg)" stack-label
                                          style="font-size: 12px" class="q-mb-sm" squared>
                                        </q-select>
                                      </div>
                                    </div>
                                  </div>

                                  <div v-if="comp_field.type == 'prop-list'">
                                    <div class="q-ml-md q-mr-md q-mt-md text-left text-secondary" :style="{ 'font-size': '12px' }">
                                      <div class="text-white" :style="{ 'font-size': '10px' }">
                                        <q-select v-model="comp_field.value_model" :label="comp_field.caption_model" :options="comp_field.choices_model" :readonly="comp_field.readonly" color="blue" 
                                          hide-hint filled dense @update:model-value="changePropState(comp_field, 'model_changed')" stack-label
                                          style="font-size: 12px" class="q-mb-sm" squared>
                                        </q-select>
                                        <q-select v-model="comp_field.value_prop" :label="comp_field.caption_prop" :options="comp_field.choices_props" :readonly="comp_field.readonly" color="blue" 
                                          hide-hint filled dense @update:model-value="changePropState(comp_field, arg)" stack-label
                                          style="font-size: 12px" class="q-mb-sm" squared>
                                        </q-select>
                                      </div>
                                    </div>
                                  </div>

                                </div>
                              </div>
                              <q-separator class="q-mt-md"></q-separator>
                            </div>
                        </div>
                      </q-card>
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
      selectedModelProps: [],
      selectedModelComponentList: []

    };
  },
  methods: {
    modelTypeSelected() {
        let model_interface = [...explain.getModelTypeInterface(this.selectedModelType)]
        // clear input field
        this.resetModel()
        // process the model properties and store in this.selectedModelPropas
        this.selectedModelProps = this.processModelInterface(model_interface)
        // redraw the interface
        this.redraw += 1
    },
    processModelInterface(model_props, model_name="", model_name_readonly = false) {
      // we have to convert the model properties to a format which the editor can understand, this is an array of objects and store in selectedNewModelProps

      // process the model interface
      model_props.forEach(prop => {
        // override the readonly property
        prop.readonly = false

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

        if (prop.type == 'prop-list') {

          // add all models to the choices list
          prop["choices_model"] = []
          prop["value_model"] = ""
          prop["value_target"] = ""
          Object.values(explain.modelState.models).forEach(model => {
              prop["choices_model"].push(model.name)
          })
        }

        if (prop.type == 'component-list') {
          // process the component list
          this.processComponentList(prop.components)
        }
      })

      // add a name field to the model props
      let name = {
        target: "name",  
        type: "string",
        build_prop: true,
        edit_mode: "basic",
        readonly: model_name_readonly,
        caption: "name",
        value: model_name
      }
      model_props.unshift(name)

      return model_props;
    },
    cancelAddModel() {
      this.selectedModelType = ""
      this.resetModel()
    },
    addModelToEngine() {
        // set the error flag to false
        this.newModelErrorFlag = false
        // check whether the new model name is already in use or empty -> error
        this.selectedModelProps.forEach(prop => {
            if (prop.build_prop) {
                if (prop.value == undefined && prop.target !== 'inputs' && prop.type !== 'prop-list') {
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
                if (prop.type === 'prop-list') {
                  if (prop.value_model == undefined || prop.value_prop == undefined) {
                      this.newModelErrorFlag = true
                      this.newModelErrorClass = this.newModelError
                      this.newModelErrorMessage = "target model or target property has no or invalid value"
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
      this.selectedModelProps.forEach(prop => {
        if (prop.build_prop) {
          if (prop.type == 'prop-list') {
            new_model[prop.target_model] = prop.value_model
            new_model[prop.target_prop] = prop.value_prop
          } else {
            new_model[prop.target] = prop.value
          }
        }
      })
      // send to the model for processing
      explain.addNewModel(new_model)

      this.resetModel()
      this.selectedModelType = ""
    },
    resetModel() {
      this.selectedModelProps = []
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
    processComponentList(component_list) {
      // reset the current component list
      this.selectedModelComponentList = []

      component_list.forEach(component_list_item => {
        // iterate over the mandatory component list for this model and get the necessary modelinterfaces
        let component_props = [...explain.getModelTypeInterface(component_list_item.model_type)]
 
        // now we have to process these component_props for displaying in the user interface
        let component_props_converted = [...this.processModelInterface(component_props, component_list_item.name, true)]
        // we now have a converted props list with added name property

        this.selectedModelComponentList.push(component_props_converted)

      })

   

      //   // we now have a list of properties which we need to process
      // let converted_list_0 = this.processModelInterface(model_props_0, component_list[0].name, true)
      // console.log(converted_list_0)

      // let model_props_1 = explain.getModelTypeInterface(component_list[1].model_type)
      //   // we now have a list of properties which we need to process
      // let converted_list_1 = this.processModelInterface(model_props_1, component_list[1].name, true)
      // console.log(converted_list_1)

      // component_list.forEach(component => {
      //   // get the model interface of each component type
      //   let model_props = explain.getModelTypeInterface(component.model_type)
      //   // we now have a list of properties which we need to process
      //   let converted_list = this.processModelInterface(model_props, component.name, true)
      //   console.log(converted_list)
      //   // process the model interface
      //   // let comp_prop_list = this.processModelInterface(comp_model_interface, component.name, true)
      //   // console.log(component)
      // })
      //this.selectedModelComponentList.push(converted_list_0)
      //this.selectedModelComponentList.push(converted_list_1)
    }
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
