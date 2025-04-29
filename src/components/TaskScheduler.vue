<template>
    <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
      <div class="q-mt-es row gutter text-overline justify-center" @click="toggle">
        {{ title }}
      </div>
      <div v-if="isEnabled">
        <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
            <q-list bordered separator dense>
            <div v-for="(task, index) in task_list" :key="index">
              <q-item clickable dark dense @click="selectTask">
                <q-item-section>
                  <div class="q-ma-xs row">
                    <div class="col">
                      <q-select class="q-pa-xs col" v-model="task.model" square label="model" hide-hint
                      :options="modelNames" dense dark stack-label style="font-size: 12px" @update:model-value="modelChanged(index)" />
                    </div>
                    <div class="col">
                      <q-select class="q-pa-xs col" v-model="task.prop" square label="property" hide-hint
                      :options="Object.keys(task._model_interface)" dense dark stack-label style="font-size: 12px" @update:model-value="propChanged(index)" />
                    </div>
                    <div class="col">
                      <q-input v-if="task.type == 'number' || task.type == 'factor'" class="q-pa-xs col" v-model="task.value" label="current value"  dark hide-hint filled dense stack-label
                        style="font-size: 12px" readonly squared>
                      </q-input>
                      <q-checkbox v-if="task.type == 'boolean'" v-model="task.value" color="primary" size="sm" hide-hint filled dense
                        style="font-size: 12px" left-label label="current state" class="q-ml-sm q-mt-md">
                      </q-checkbox>
                    </div>
                    <div class="col">
                      <q-input v-if="task.type == 'number' || task.type == 'factor'" class="q-pa-xs col" v-model="task.target" label="target" :min="task.ll" :max="task.ul" :step="task.delta" dark hide-hint filled dense stack-label type="number"
                        style="font-size: 12px" squared>
                      </q-input>
                      <q-checkbox v-if="task.type == 'boolean'" v-model="task.target" color="primary" size="sm" hide-hint filled dense
                        style="font-size: 12px" left-label label="new state" class="q-mt-md">
                      </q-checkbox>
                    </div>
                    <div class="col">
                      <q-select v-if="task.type == 'number' || task.type == 'factor'"  class="q-pa-xs col" v-model="task.in" square label="in time(s)" hide-hint
                      :options="times" dense dark stack-label style="font-size: 12px" @update:model-value="inTimeChanged" />
                    </div>
                    <!-- <div class="col-1">
                      <q-btn color="black" size="xs" dense
                      icon="fa-solid fa-chevron-up" style="font-size: 8px" @click="moveUp(index)"><q-tooltip>move up</q-tooltip></q-btn>
                      <q-btn class="q-ml-sm" color="black" size="xs" dense
                      icon="fa-solid fa-chevron-down" style="font-size: 8px" @click="moveDown(index)"><q-tooltip>move down</q-tooltip></q-btn>
                    </div> -->
                    <div class="col-1">
                      <!-- <q-btn color="primary" size="xs" dense @click="runPartTask(index)"
                      icon="fa-solid fa-play" style="font-size: 8px"><q-tooltip>run</q-tooltip></q-btn> -->
                      <q-btn class="q-ml-md q-mt-md" color="negative" size="sm" dense @click="removePartTask(index)"
                      icon="fa-solid fa-trash" style="font-size: 8px"><q-tooltip>delete</q-tooltip></q-btn>
                    </div>
                  </div>
                </q-item-section>
              </q-item>
            </div>
          </q-list>
        </q-card>
        <div class="row q-ma-sm q-ml-xl q-mr-xl">
            <q-btn class="col q-ma-sm" color="primary" size="sm" dense icon="fa-solid fa-add" @click="addTask"
              style="font-size: 10px"><q-tooltip>add task</q-tooltip></q-btn>
            <q-btn class="col q-ma-sm" color="primary" size="sm" dense icon="fa-solid fa-play" @click=""
              style="font-size: 10px"><q-tooltip>run task</q-tooltip></q-btn>
            <q-btn class="col q-ma-sm" color="secondary" size="sm" dense icon="fa-solid fa-cancel" @click=""
            style="font-size: 10px"><q-tooltip>cancel task</q-tooltip></q-btn>
            <q-btn class="col q-ma-sm" color="grey-8" size="sm" dense icon="fa-solid fa-upload" @click=""
            style="font-size: 10px"><q-tooltip>save task to server</q-tooltip></q-btn>
            <q-btn class="col q-ma-sm" color="negative" size="sm" dense icon="fa-solid fa-trash" @click=""
            style="font-size: 10px"><q-tooltip>delete task from server</q-tooltip></q-btn>
          </div>
      </div>
    </q-card>
  </template>
  
  <script>
  import { explain } from "../boot/explain";
  export default {
    data() {
      return {
        isEnabled: true,
        title: "EVENT SCHEDULER",
        modelNames: [],
        selectedModelName: "",
        modelProps: ["pres"],
        selectedModelProp: "",
        times: [0, 1, 3, 5, 7, 10],
        selectedAtTime: 0,
        selectedInTime: 0,
        task_list: []
      };
    },
    methods: {
      addTask() {
        let task = {
          model: "", 
          prop: "", 
          type: "",
          caption: "",
          value: 0.0, 
          target: 0.0, 
          in: 5.0, 
          at: 0.0,
          ll: -100000,
          ul: 1000000,
          delta: 1,
          _model_interface: {}
        }
        this.task_list.push(task)

      },
      modelChanged(index) {
        // find the property list this.task_list[index]._model_interface
        this.task_list[index]._model_interface = {}
        this.task_list[index].type = ""
        this.task_list[index].prop = ""
        
        let model_interface= {...Object.values(explain.modelState.models[this.task_list[index].model].model_interface)}
        // rebuild the model interface object
        Object.values(model_interface).forEach( _mi => {
          this.task_list[index]._model_interface[_mi.target] = _mi
        })
      },
      propChanged(index) {
        const prop_interface = this.task_list[index]._model_interface[this.task_list[index].prop]
        const value = explain.modelState.models[this.task_list[index].model][this.task_list[index].prop]
        this.task_list[index].value = value
        Object.keys(prop_interface).forEach(prop_key => {
          this.task_list[index][prop_key] = prop_interface[prop_key]
        })
        this.task_list[index].target = value
      },
      inTimeChanged() {},
      atTimeChanged() {},
      toggle() {
        this.isEnabled = !this.isEnabled
      },
      moveUp(index) {
        // Check if the item can be moved up (not already at the top)
        if (index <= 0) {
          console.log("Cannot move item up: invalid index");
          return this.task_list; // Return the original array unchanged
        }
        
        // Create a copy of the array to avoid mutating the original
        const newArray = [...this.task_list];
        
        // Swap the item with the one above it
        [newArray[index], newArray[index - 1]] = [newArray[index - 1], newArray[index]];
        
        this.task_list = [...newArray]
      },
      moveDown(index) {
        // Check if the item can be moved up (not already at the top)
        if (index >= this.task_list.length - 1) {
          console.log("Cannot move item up: invalid index");
          return
        }
        
        // Create a copy of the array to avoid mutating the original
        const newArray = [...this.task_list];
        
        // Swap the item with the one above it
        [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
        
        this.task_list = [...newArray]
      },
      removePartTask(index) {
        this.task_list.splice(index, 1);
      },
      runPartTask(index) {

      },
      selectTask(e) {
      },
      processAvailableModels() {
        this.modelNames = []
        try {
          if (Object.keys(explain.modelState.models)) {
            this.modelNames = [...Object.keys(explain.modelState.models)].sort();
          }
        } catch { }
      }
    },
    beforeUnmount() {
      this.$bus.off("state", this.processAvailableModels)
    },
    mounted() {
      this.isEnabled = !this.collapsed;
      this.$bus.on("state", this.processAvailableModels)
    }
  };
  </script>
  
  <style></style>
  