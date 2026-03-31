<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-xs" bordered dark flat>
    <!-- <div class="q-mt-es row gutter text-overline justify-center" @click="toggle">
      {{ title }}
    </div> -->
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
            SaO2 pre (%)
          </div>
          <div class="text-purple-12" :style="{ 'font-size': '36px' }">
            {{ sao2_pre }}
          </div>
        </div>
        <div class="q-mr-sm">
          <div class="q-mr-sm text-left text-purple-11" :style="{ 'font-size': '10px' }">
            SaO2 post (%)
          </div>
          <div class="text-purple-11" :style="{ 'font-size': '36px' }">
            {{ sao2_post }}
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
import { useModelStore } from "src/stores/model";


export default {
  setup() {
    const modelStore = useModelStore();
    return { modelStore }
  },
  data() {
    return {
      isEnabled: true,
      title: "VITALS",
      currentData: {},
      mutableParameters: [],
      hr: "-",
      sao2_pre: "-",
      sao2_post: "-",
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
          "Monitor.sao2_pre",
          "Monitor.sao2_post",
          "Monitor.abp_post_syst",
          "Monitor.abp_post_diast",
          "Monitor.abp_post_mean"
        ])
      }

    },
    dataUpdate() {
      if (!this.isEnabled) return;

      this.currentData = explain.modelDataSlow[explain.modelDataSlow.length - 1];

      if (this.currentData) {
        try {
          this.hr = this.currentData["Monitor.heart_rate"].toFixed(0)
          
          if (this.currentData["Monitor.resp_rate"] > 150) {
            this.rr = "-"
          } else {      
            this.rr = this.currentData["Monitor.resp_rate"].toFixed(0)
          }

          this.sao2_pre = this.currentData["Monitor.sao2_pre"].toFixed(0)
          this.sao2_post = this.currentData["Monitor.sao2_post"].toFixed(0)
          this.abp = this.currentData["Monitor.abp_post_syst"].toFixed(0) + "/" + this.currentData["Monitor.abp_post_diast"].toFixed(0)
          this.abp_mean = "(" + this.currentData["Monitor.abp_post_mean"].toFixed(0) + ")"
        } catch { }

      }
    },
    handleRts() {
      this.dataUpdate()
    },
    handleData() {
      this.dataUpdate()
    },
  },
  beforeUnmount() {
    explain.off("rts", this.handleRts);
    explain.off("data", this.handleData);
    if (this._unwatchReady) this._unwatchReady()
    this.$bus.off("reset", this.updateWatchList)
  },
  mounted() {
    this.isEnabled = !this.collapsed;

    // get the realtime slow data
    explain.on("rts", this.handleRts);
    explain.on("data", this.handleData);
    this._unwatchReady = this.$watch(
      () => this.modelStore.isReady,
      (val) => { if (val) this.updateWatchList() }
    )
    this.$bus.on("reset", this.updateWatchList)

    // watch the big bumber data
    this.updateWatchList();

  },
};
</script>

<style></style>
