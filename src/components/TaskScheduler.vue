<template>
    <q-card class="q-pb-xs q-pt-xs q-ma-xs" bordered dark flat>
      <div class="q-mt-es row gutter text-overline justify-center" @click="toggle">
        {{ title }}
      </div>
      <div class="q-pa-sm q-mt-xs q-mb-xs q-ml-md q-mr-md text-overline justify-center row">
            <q-select class="q-pa-xs col" v-model="selectedEvent" square label="select event from server" hide-hint
              :options="availableEvents" dense dark stack-label @update:model-value="selectEvent" />
            <q-btn class="col-1 q-ma-xs q-mt-md" color="grey-9" size="xs" dense
              icon="fa-solid fa-refresh" @click="getAllUserEventsFromServer" style="font-size: 8px"><q-tooltip>refresh event list</q-tooltip></q-btn>
            <q-btn class="col-1 q-ma-xs q-mt-md" color="grey-9" size="xs" dense
              icon="fa-solid fa-play" @click="runAllTasks" style="font-size: 8px"><q-tooltip>run event</q-tooltip></q-btn>
            <q-btn class="col-1 q-ma-xs q-mt-md" color="primary" size="xs" dense
              icon="fa-solid fa-plus" @click="addTask" style="font-size: 8px"><q-tooltip>add event</q-tooltip></q-btn>
            <q-btn v-if="user.name !== 'demo-user'" class="col-1 q-ma-xs q-mt-md" color="negative" size="xs" dense
              icon="fa-solid fa-trash" @click="deleteEventFromServer" style="font-size: 8px"><q-tooltip>delete event</q-tooltip></q-btn>
            </div>

      <div v-if="isEnabled">
        <div v-if="task_list.length > 0" class="col q-ma-sm">
          <q-input class="q-pa-xs col" v-model="eventName" label="current event name"  dark hide-hint filled dense stack-label
                style="font-size: 12px" squared>
          </q-input>
        </div>
        <div v-if="task_list.length > 0" class="col q-ma-sm">
          <q-input class="q-pa-xs col" v-model="eventDescription" label="event name description"  dark hide-hint filled dense stack-label
                style="font-size: 12px" squared>
          </q-input>
        </div>
        <div v-if="storedTaskList.length > 0" class="col q-ma-sm q-ml-md q-mr-md">
          <q-select class="q-pa-xs col" v-model="selectedTask" style="font-size: 12px" square
              label="available stored events" hide-hint :options="storedTaskList" dense dark stack-label
              @update:model-value="loadTask" />
        </div>
        <q-card v-if="task_list.length > 0" class="q-pb-xs q-pt-xs q-ma-xs" bordered dark flat>
            <q-list bordered separator dense>
            <div v-for="(task, index) in task_list" :key="index">
              <q-item clickable dark dense @click="selectTask">
                <q-item-section>
                  <q-card class="q-ma-xs">
                  <div class="q-ma-xs row">
                    <div class="col">
                      <q-select class="q-pa-xs col" v-model="task.model" square label="model" hide-hint
                      :options="modelNames" dense dark stack-label style="font-size: 12px" @update:model-value="modelChanged(index)" />
                    </div>

                    <div class="col">
                      <q-select class="q-pa-xs col" v-model="task.prop" square label="property" hide-hint
                      :options="Object.keys(task._model_interface)" dense dark stack-label style="font-size: 12px" @update:model-value="propChanged(index)" />
                    </div>
                    </div>
                    <div class="q-ma-xs row">
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
                    
                    </div>
                    <div class="q-ma-xs row">
                    <!-- in time -->
                    <div v-if="task.type == 'number' || task.type == 'factor'" class="col">
                      <q-select class="q-pa-xs col" v-model="task.in" square label="in time(s)" hide-hint
                      :options="times" dense dark stack-label style="font-size: 12px" />
                    </div>

                    <!-- at time -->
                    <div v-if="task.type == 'boolean'" class="col">
                      <q-select class="q-pa-xs col" v-model="task.at" square label="at time(s)" hide-hint
                      :options="times" dense dark stack-label style="font-size: 12px" />
                    </div>

                    <div v-if="task_list.length > 0" class="col-3 q-mt-md">
                      <q-btn v-if="task.prop" class="q-ml-sm" color="primary" size="xs" dense @click="runPartTask(index)"
                      icon="fa-solid fa-play" style="font-size: 8px"><q-tooltip>run</q-tooltip></q-btn>
                      <q-btn class="q-ml-sm" color="negative" size="xs" dense @click="removePartTask(index)"
                      icon="fa-solid fa-trash" style="font-size: 8px"><q-tooltip>delete</q-tooltip></q-btn>
                    </div>
                  </div>
                  </q-card>
                </q-item-section>
              </q-item>
            </div>
          </q-list>
        </q-card>
        <div class="q-ma-sm text-overline" style="text-align: center;">
          {{statusMessage}}
        </div>
        
        <div v-if="task_list.length > 0" class="row q-ma-sm q-ml-xl q-mr-xl">
          <q-btn class="col q-ma-sm" color="primary" size="sm" dense icon="fa-solid fa-add" @click="addTask"
            style="font-size: 10px"><q-tooltip>add task</q-tooltip></q-btn>
          <q-btn class="col q-ma-sm" color="primary" size="sm" dense icon="fa-solid fa-play" @click="runAllTasks"
            style="font-size: 10px"><q-tooltip>run event</q-tooltip></q-btn>
          <q-btn class="col q-ma-sm" color="secondary" size="sm" dense icon="fa-solid fa-circle-xmark" @click="cancelTasks"
            style="font-size: 10px"><q-tooltip>cancel event</q-tooltip></q-btn>
          <q-btn v-if="!savedTask & user.name !== 'demo-user'" class="col q-ma-sm" color="grey-8" size="sm" dense icon="fa-solid fa-save" @click="saveEventList"
            style="font-size: 10px"><q-tooltip>save event to server</q-tooltip></q-btn>
          <q-btn v-if="user.name !== 'demo-user'" class="col q-ma-sm" color="negative" size="sm" dense icon="fa-solid fa-trash" @click="deleteEventFromServer"
            style="font-size: 10px"><q-tooltip>delete event from server</q-tooltip></q-btn>
          </div>
      </div>
    </q-card>
  </template>
  
  <script>
  import { explain } from "../boot/explain";
  import { useStateStore } from 'src/stores/state';
  import { useUserStore } from 'src/stores/user';
  import { useGeneralStore } from "src/stores/general";

  export default {
    setup() {
      const state = useStateStore();
      const user = useUserStore();
      const general = useGeneralStore();

      return {
        state,
        user,
        general
      }
    },
    data() {
      return {
        isEnabled: true,
        statusMessage: "no tasks scheduled",
        statusMessageTimer: null,
        savedTask: true,
        selectedTask: "",
        storedTaskList: [],
        title: "EVENT SCHEDULER",
        eventName: "new_event",
        eventDescription: "no description",
        modelNames: [],
        selectedModelName: "",
        modelProps: ["pres"],
        selectedModelProp: "",
        times: [0, 1, 3, 5, 10, 20, 30, 60, 120, 240, 300, 600],
        selectedAtTime: 0,
        selectedInTime: 0,
        task_list: [],
        availableEvents: [],
        selectedEvent: "",
      };
    },
    methods: {
      selectEvent() {
        this.getEventFromServer(this.selectedEvent)
      },
      async deleteEventFromServer() {
        const url = `${this.general.apiUrl}/api/events/delete_event?token=${this.user.token}`;
        let response = await fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            explain_version: this.general.version,
            user: this.user.name.toLowerCase(),
            name: this.eventName,
          }),
        });
        if (response.status === 200) {
          this.statusMessage = "event deleted"
          this.cancelTasks()
          this.getAllUserEventsFromServer()
        } else {
          this.savedTask = false
          this.statusMessage = "error deleting event"
        } 
        setTimeout(() => {
          this.statusMessage = ""
        }, 3000);
      },
      async saveEventList() {
        // rebuild the task list 
        let new_task_list = []
        this.task_list.forEach(task => {
          new_task_list.push(task)
        })
        if (this.eventName.endsWith('*')) {
          this.eventName = this.eventName.slice(0, -1);
        }
        const url = `${this.general.apiUrl}/api/events/update_event?token=${this.user.token}`;
        let response = await fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            explain_version: this.general.version,
            user: this.user.name.toLowerCase(),
            name: this.eventName,
            description: this.eventDescription,
            protected: false,
            shared: false,
            event_definition: {
              tasks: new_task_list
            },
          }),
        });
        if (response.status === 200) {
          this.statusMessage = "event saved"
          this.savedTask = true
          explain.getModelState()
        } else {
          this.savedTask = false
          this.statusMessage = "error saving event"
        } 
        setTimeout(() => {
          this.statusMessage = ""
        }, 3000);
      },
      async getEventFromServer(event_name) {
        const url = `${this.general.apiUrl}/api/events/get_user_event?token=${this.user.token}`;
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: this.user.name.toLowerCase(),
          name: event_name,
        }),
      });

      if (response.status === 200) {
        let data = await response.json();
        this.loadTask(data)
      } else {
        this.statusMessage = "error loading event"
        setTimeout(() => {
          this.statusMessage = ""
        }, 3000);
      }
      },
      async getAllUserEventsFromServer() {
      this.selectedEvent = ""
      const url = `${this.general.apiUrl}/api/events/get_all_user_events?token=${this.user.token}`;
      let response = await fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: this.user.name.toLowerCase(),
          }),
        });

        if (response.status === 200) {
          let data = await response.json();
          this.availableEvents = data;
        } else {
          this.availableEvents = []
        }
      },
      loadTask(task_data) {
        // process the saved task
        this.eventName = task_data.name
        this.eventDescription = task_data.description
        this.task_list = task_data.event_definition.tasks
        // get the current values for each task
        this.task_list.forEach(task => {
          if (task.type == "number" || task.type == "factor" || task.type == "boolean") {
            task.value = explain.modelState.models[task.model][task.prop]
          } 
        })
        this.statusMessage = ""
      },
      addTask() {
        let task = {
          model: "", 
          prop: "", 
          type: "",
          in: 5,
          at: 0,
          _model_interface: {}
        }
        this.task_list.push(task)
        this.statusMessage = ""
      },
      deleteEventFromList() {
        delete this.state.events[this.eventName]
        this.task_list = []
        this.statusMessage = "no tasks scheduled"
        this.savedTask = false
        this.eventName = "new_event"
        this.selectedTask = ""
        this.storedTaskList = []
        if (this.state.events) {
          Object.keys(this.state.events).forEach(task_name => {
            this.storedTaskList.push(task_name)
          })
        }
  

      },
      cancelTasks() {
        this.task_list = []
        this.statusMessage = "no tasks scheduled"
        this.savedTask = false
        this.eventName = "new_event"
        this.selectedTask = ""
      },
      modelChanged(index) {
        // find the property list this.task_list[index]._model_interface
        this.task_list[index]._model_interface = {}
        this.task_list[index].type = ""
        this.task_list[index].prop = ""
        let model_interface = {...Object.values(explain.getModelInterface(this.task_list[index].model))}
        // let model_interface= {...Object.values(explain.modelState.models[this.task_list[index].model].model_interface)}
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
        this.statusMessage = ""
        
        if (!this.eventName.endsWith('*')) {
          this.eventName = this.eventName + "*"
        }
        this.savedTask = false

      },
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
        console.log("running task", t)
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
      runAllTasks() {
        for (let i = 0; i < this.task_list.length; i++) {
          this.runPartTask(i, false)
        }
        // clear the list
        this.task_list = []
        this.statusMessage = "no tasks scheduled"
        this.savedTask = true
        this.selectedTask = ""
        this.eventName = "new_event"
      },
      processAvailableModels() {
        this.modelNames = []
        try {
          if (Object.keys(explain.modelState.models)) {
            this.modelNames = [...Object.keys(explain.modelState.models)].sort();
          }
        } catch { }

        this.storedTaskList = []
        if (this.state.events) {
          Object.keys(this.state.events).forEach(task_name => {
            this.storedTaskList.push(task_name)
          })
        }
      }
    },
    beforeUnmount() {
      this.$bus.off("state", this.processAvailableModels)
    },
    mounted() {
      this.isEnabled = !this.collapsed;
      this.$bus.on("state", this.processAvailableModels)

      this.getAllUserEventsFromServer()
    }
  };
  </script>
  
  <style></style>
  