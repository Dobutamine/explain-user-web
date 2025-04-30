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
                    
                    <!-- number value -->
                    <div v-if="task.type == 'number' || task.type == 'factor'" class="col">
                      <q-input class="q-pa-xs col" v-model="task.value" label="current value"  dark hide-hint filled dense stack-label
                        style="font-size: 12px" readonly squared>
                      </q-input>
                    </div>

                    <!-- boolean value -->
                    <div v-if="task.type == 'boolean'" class="col">
                      <q-checkbox v-model="task.value" color="primary" size="sm" hide-hint filled dense
                        style="font-size: 12px" left-label label="current state" class="q-ml-sm q-mt-md">
                      </q-checkbox>
                    </div>

                    <!-- number target -->
                    <div v-if="task.type == 'number' || task.type == 'factor'" class="col">
                      <q-input class="q-pa-xs col" v-model="task.target" label="target" :min="task.ll" :max="task.ul" :step="task.delta" dark hide-hint filled dense stack-label type="number"
                        style="font-size: 12px" squared>
                      </q-input>
                    </div>
                    
                    <!-- boolean target -->
                    <div v-if="task.type == 'boolean'" class="col">
                      <q-checkbox v-model="task.target" color="primary" size="sm" hide-hint filled dense
                        style="font-size: 12px" left-label label="new state" class="q-mt-md">
                      </q-checkbox>
                    </div>

                    <!-- list target -->
                    <div v-if="task.type == 'list'" class="col">
                      <q-select v-model="task.target" :label="task.caption" :options="modelNames"
                        color="blue" hide-hint filled dense stack-label
                        style="font-size: 12px" class="q-mb-sm" squared>
                      </q-select>
                    </div>

                    <!-- multiple list target -->
                    <div v-if="task.type == 'multiple-list'" class="col">
                      <q-select v-model="task.target" :label="task.caption" :options="modelNames"
                        color="blue" hide-hint filled dense multiple stack-label
                        style="font-size: 12px" class="q-mb-sm" squared>
                      </q-select>
                    </div>

                    <!-- function -->
                    <div v-if="task.type == 'function'">
                        <div v-for="(arg, index_arg) in task.args" :key="index_arg">
                          <!-- function args number target -->
                          <div v-if="arg.type == 'number' || arg.type == 'factor'" class="col">
                            <q-input class="q-pa-xs col" v-model="arg.target" :label="arg.caption" :min="arg.ll" :max="arg.ul" :step="arg.delta" dark hide-hint filled dense stack-label type="number"
                              style="font-size: 12px" squared>
                            </q-input>
                          </div>
                          <!-- function args boolean target -->
                          <div v-if="arg.type == 'boolean'" class="col">
                            <q-checkbox v-model="arg.target" color="primary" size="sm" hide-hint filled dense
                              style="font-size: 12px" left-label :label="arg.caption" class="q-mt-md">
                            </q-checkbox>
                          </div>
                          <!-- function arg list target -->
                          <div v-if="arg.type == 'list'" class="col">
                            <q-select v-model="arg.target" :label="arg.caption" :options="modelNames"
                              color="blue" hide-hint filled dense stack-label
                              style="font-size: 12px" class="q-mb-sm" squared>
                            </q-select>
                          </div>
                          <!-- function arg multiple list target -->
                          <div v-if="arg.type == 'multiple-list'" class="col">
                            <q-select v-model="arg.target" :label="arg.caption" :options="modelNames"
                              color="blue" hide-hint filled dense multiple stack-label
                              style="font-size: 12px" class="q-mb-sm" squared>
                            </q-select>
                          </div>
                        </div>
                    </div>
                    
                    <!-- in time -->
                    <div v-if="task.type == 'number' || task.type == 'factor'" class="col">
                      <q-select class="q-pa-xs col" v-model="task.in" square label="in time(s)" hide-hint
                      :options="times" dense dark stack-label style="font-size: 12px" @update:model-value="inTimeChanged" />
                    </div>

                    <!-- at time -->
                    <div v-if="task.type == 'boolean'" class="col">
                      <q-select class="q-pa-xs col" v-model="task.at" square label="at time(s)" hide-hint
                      :options="times" dense dark stack-label style="font-size: 12px" @update:model-value="atTimeChanged" />
                    </div>

                    <div v-if="task_list.length > 0" class="col-1 q-mt-md">
                      <q-btn v-if="task.prop" class="q-ml-sm" color="primary" size="xs" dense @click="runPartTask(index)"
                      icon="fa-solid fa-play" style="font-size: 8px"><q-tooltip>run</q-tooltip></q-btn>
                      <q-btn class="q-ml-sm" color="negative" size="xs" dense @click="removePartTask(index)"
                      icon="fa-solid fa-trash" style="font-size: 8px"><q-tooltip>delete</q-tooltip></q-btn>
                    </div>
                  </div>
                </q-item-section>
              </q-item>
            </div>
          </q-list>
        </q-card>
        <div class="q-ma-sm text-overline" style="text-align: center;">
          {{statusMessage}}
        </div>
        <div class="row q-ma-sm q-ml-xl q-mr-xl">
            <q-btn class="col q-ma-sm" color="primary" size="sm" dense icon="fa-solid fa-add" @click="addTask"
              style="font-size: 10px"><q-tooltip>add task</q-tooltip></q-btn>
            <q-btn class="col q-ma-sm" color="primary" size="sm" dense icon="fa-solid fa-play" @click="runAllTasks"
              style="font-size: 10px"><q-tooltip>run task</q-tooltip></q-btn>
            <q-btn class="col q-ma-sm" color="secondary" size="sm" dense icon="fa-solid fa-cancel" @click="cancelTasks"
            style="font-size: 10px"><q-tooltip>cancel task</q-tooltip></q-btn>
            <q-btn class="col q-ma-sm" color="grey-8" size="sm" dense icon="fa-solid fa-save" @click="saveEventList"
            style="font-size: 10px"><q-tooltip>save task to server</q-tooltip></q-btn>
            <q-btn class="col q-ma-sm" color="negative" size="sm" dense icon="fa-solid fa-trash" @click=""
            style="font-size: 10px"><q-tooltip>delete task from server</q-tooltip></q-btn>
          </div>
      </div>
    </q-card>
  </template>
  
  <script>
  import { explain } from "../boot/explain";
  import { useStateStore } from 'src/stores/state';
  import { useUserStore } from 'src/stores/user';

  export default {
    setup() {
      const state = useStateStore();
      const user = useUserStore();

      return {
        state,
        user
      }
    },
    data() {
      return {
        isEnabled: true,
        statusMessage: "no tasks scheduled",
        statusMessageTimer: null,
        title: "EVENT SCHEDULER",
        eventName: "event_1",
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
          _model_interface: {}
        }
        this.task_list.push(task)
        this.statusMessage = ""
      },
      cancelTasks() {
        this.task_list = []
        this.statusMessage = "no tasks scheduled"
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
      runPartTask(index, remove = true) {
        let t = this.buildTask(this.task_list[index])
        switch (t.type) {
          case "direct":
            explain.setPropValue(t.property, t.target, t.in_time, t.at_time)
            if (remove) {
              this.removePartTask(index)
            }
            break;
          case "function":
            explain.callModelFunction(t.function_name, t.args)
            if (remove) {
              this.removePartTask(index)
            }
            break;
        }
      },
      buildTask(task) {
        // explain.setPropValue(p, parseFloat(prop.value / prop.factor), parseFloat(this.changeInTime), 0)
        // explain.callModelFunction(function_name, function_args)
        let scheduled_task = {}
        switch (task.type) {
          case "function":
            scheduled_task['type'] = 'function'
            scheduled_task['function_name'] = task['model'] + '.' + task['prop']
            let args = []
            task.args.forEach(arg => {
              if (arg.type == 'number') {
                args.push(parseFloat(arg.target))
              } else {
                args.push(arg.target)
              }
            })
            scheduled_task['args'] = args
            break;
          default:
            scheduled_task['type'] = 'direct'
            scheduled_task['property'] = task['model'] + '.' + task['prop']
            scheduled_task['target'] = task['target']
            scheduled_task['in_time'] = task['in']
            scheduled_task['at_time'] = task['at']
            break;
        }
        return scheduled_task
      },
      selectTask(e) {
      },
      saveEventList() {
        // rebuild the task list 
        let new_task_list = []
        this.task_list.forEach(task => {
          new_task_list.push(task)
        })
        if (!this.state.tasks) {
          this.state.tasks = {}
        }
        this.state.tasks[this.eventName] = new_task_list
        console.log(this.state.tasks)
      },
      runAllTasks() {
        for (let i = 0; i < this.task_list.length; i++) {
          this.runPartTask(i, false)
        }
        // clear the list
        this.task_list = []
        this.statusMessage = "no tasks scheduled"
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
  