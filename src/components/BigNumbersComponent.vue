<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div class="q-mt-es row gutter text-overline justify-center" @click="toggle">
      {{ title }}
    </div>
    <div v-if="isEnabled">
      <div class="q-ma-sm q-gutter-xs row items-center">
        <div class="q-mr-md">
          <div class="q-mr-sm text-left text-green" :style="{ 'font-size': '10px' }">
            Heart rate (/min)
          </div>
          <div class="text-green" :style="{ 'font-size': '36px' }">
            {{ hr }}
          </div>
        </div>
        <div class="q-mr-sm">
          <div class="q-mr-sm text-left text-purple-12" :style="{ 'font-size': '10px' }">
            SpO2 pre (%)
          </div>
          <div class="text-purple-12" :style="{ 'font-size': '36px' }">
            {{ spo2_pre }}
          </div>
        </div>
        <div class="q-mr-sm">
          <div class="q-mr-sm text-left text-purple-11" :style="{ 'font-size': '10px' }">
            SpO2 post (%)
          </div>
          <div class="text-purple-11" :style="{ 'font-size': '36px' }">
            {{ spo2_post }}
          </div>
        </div>
        <div class="q-mr-sm">
          <div class="q-mr-sm text-left text-white" :style="{ 'font-size': '10px' }">
            Resp rate (/min)
          </div>
          <div class="text-white" :style="{ 'font-size': '36px' }">
            {{ rr }}
          </div>
        </div>
        <div class="q-mr-sm">
          <div class="q-mr-sm text-left text-red-12" :style="{ 'font-size': '10px' }">
            ABP (mmHg)
          </div>
          <div class="text-red-12 row" :style="{ 'font-size': '36px' }">
            {{ abp }}
            <div class="q-ma-sm q-mt-md text-red-12" :style="{ 'font-size': '18px' }">
              {{ abp_mean }}
            </div>
          </div>
        </div>
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
      title: "VITALS",
      currentData: {},
      mutableParameters: [],
      hr: "-",
      spo2_pre: "-",
      spo2_post: "-",
      abp: "-/-",
      abp_mean: "(-)",
      rr: "-",
      etco2: "-",
      temp: "-",
    };
  },
  methods: {
    toggle() {
      this.isEnabled = !this.isEnabled
      if (this.isEnabled) {
        this.updateWatchList()
      }
    },
    updateWatchList() {
      if (this.isEnabled) {
      // watch the appropriate properties
        explain.watchModelPropsSlow([
          "Monitor.heart_rate", 
          "Monitor.resp_rate", 
          "Monitor.spo2_pre",
          "Monitor.spo2",
          "Monitor.abp_syst",
          "Monitor.abp_diast",
          "Monitor.abp_mean"
        ])
      }

    },
    dataUpdate() {
      if (!this.isEnabled) return;

      this.currentData = explain.modelDataSlow[explain.modelDataSlow.length - 1];

      if (this.currentData) {
        try {
          this.hr = this.currentData["Monitor.heart_rate"].toFixed(0)
          this.rr = this.currentData["Monitor.resp_rate"].toFixed(0)
          this.spo2_pre = this.currentData["Monitor.spo2_pre"].toFixed(0)
          this.spo2_post = this.currentData["Monitor.spo2"].toFixed(0)
          this.abp = this.currentData["Monitor.abp_syst"].toFixed(0) + "/" + this.currentData["Monitor.abp_diast"].toFixed(0)
          this.abp_mean = "(" + this.currentData["Monitor.abp_mean"].toFixed(0) + ")"
        } catch { }

      }
    },
  },
  beforeUnmount() {
    this.$bus.off("rts", () => this.dataUpdate());
    this.$bus.off("data", () => this.dataUpdate());
    this.$bus.off("model_ready", this.updateWatchList)
    this.$bus.off("reset", this.updateWatchList)
  },
  mounted() {
    this.isEnabled = !this.collapsed;

    // get the realtime slow data
    this.$bus.on("rts", () => this.dataUpdate());
    this.$bus.on("data", () => this.dataUpdate());
    this.$bus.on("model_ready", this.updateWatchList)
    this.$bus.on("reset", this.updateWatchList)

    // watch the big bumber data
    this.updateWatchList();

  },
};
</script>

<style></style>
