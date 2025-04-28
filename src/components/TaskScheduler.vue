<template>
    <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
      <div class="q-mt-es row gutter text-overline justify-center" @click="toggle">
        {{ title }}
      </div>
      <div v-if="isEnabled">
      </div>
    </q-card>
  </template>
  
  <script>
  import { explain } from "../boot/explain";
  export default {
    data() {
      return {
        isEnabled: true,
        title: "TASK SCHEDULER"
      };
    },
    methods: {
      toggle() {
        this.isEnabled = !this.isEnabled
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
  