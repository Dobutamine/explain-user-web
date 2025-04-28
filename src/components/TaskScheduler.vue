<template>
    <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
      <div class="q-mt-es row gutter text-overline justify-center" @click="toggle">
        {{ title }}
      </div>
      <div v-if="isEnabled">
        <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
            <div class="q-ma-sm row">
              <div class="col">property</div>
              <div class="col">current value</div>
              <div class="col">target value</div>
              <div class="col">change in (s)</div>
              <div class="col-1"></div>
              <div class="col-1"></div>
            </div>
            <q-list bordered separator dense>
            <div v-for="(task, index) in task_list" :key="index">
              <q-item clickable v-ripple dark dense @click="selectTask">
                <q-item-section>
                  <div class="q-ma-xs row">
                    <div class="col">{{ task.prop }}</div>
                    <div class="col">{{ task.from }}</div>
                    <div class="col">{{ task.target }}</div>
                    <div class="col">{{ task.in }}</div>
                    <div class="col-1">
                      <q-btn color="black" size="xs" dense
                      icon="fa-solid fa-chevron-up" style="font-size: 8px" @click="moveUp"><q-tooltip>run</q-tooltip></q-btn>
                      <q-btn class="q-ml-sm" color="black" size="xs" dense
                      icon="fa-solid fa-chevron-down" style="font-size: 8px" @click="moveDown"><q-tooltip>delete</q-tooltip></q-btn>
                    </div>
                    <div class="col-1">
                      <q-btn color="primary" size="xs" dense
                      icon="fa-solid fa-play" style="font-size: 8px"><q-tooltip>run</q-tooltip></q-btn>
                      <q-btn class="q-ml-sm" color="negative" size="xs" dense
                      icon="fa-solid fa-trash" style="font-size: 8px"><q-tooltip>delete</q-tooltip></q-btn>
                    </div>

                  </div>
                </q-item-section>
              </q-item>
            </div>
          </q-list>
        </q-card>
      </div>
    </q-card>
  </template>
  
  <script>
  import { explain } from "../boot/explain";
  export default {
    data() {
      return {
        isEnabled: true,
        title: "TASK SCHEDULER",
        task_list: [
          { prop: "AA.el_base", from: 50, target: 100, in: 5, at: 0},
          { prop: "LV.el_min", from: 30, target: 200, in: 5, at: 0},
        ]
      };
    },
    methods: {
      toggle() {
        this.isEnabled = !this.isEnabled
      },
      moveUp() {
        console.log('move up')
      },
      moveDown() {
        console.log('move up')
      },
      selectTask(e) {
        console.log(e)
      }
    },
    beforeUnmount() {
    },
    mounted() {
      this.isEnabled = !this.collapsed;
    }
  };
  </script>
  
  <style></style>
  