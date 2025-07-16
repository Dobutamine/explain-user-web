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
    };
  },
  methods: {
    buildMonitor() {},
    cancelMonitor() {
        this.selectedMonitorName = ""
    },
    monitorSelected() {}
  },
  beforeUnmount() {
  },
  mounted() {
    // process the available monitors
    this.availableMonitorNames = []
    Object.keys(this.state.configuration.monitors).forEach(monitor_name => {
        this.availableMonitorNames.push(monitor_name)
    })
  },
};
</script>

<style></style>
