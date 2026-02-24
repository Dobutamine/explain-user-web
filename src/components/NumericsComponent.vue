<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-xs" bordered dark flat>
    <div class="q-mt-es row gutter text-overline justify-center" @click="toggle">
      {{ title }}
    </div>
    <div v-if="parameters.length > 0 && isEnabled">
      <div class="q-ma-sm q-gutter-xs row items-center">
        <div v-for="(field, index) in mutableParameters" :key="index">
          <div class="col q-mr-xs text-left text-secondary" :style="{ 'font-size': '12px' }">
            {{ field.label }} {{ field.unit }}
          </div>
          <q-input v-model="field.value" color="blue" hide-hint filled readonly dense stack-label
            style="max-width: 90px; font-size: 16px" squared />
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
import { explain } from "../boot/explain";

export default {
  props: {
    title: String,
    collapsed: Boolean,
    parameters: Array,
  },
  data() {
    return {
      isEnabled: true,
      currentData: {},
      mutableParameters: [],
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
      let _watchList = []
      this.mutableParameters.forEach(param => {
        param.props.forEach(p => _watchList.push(p))
      })
      explain.watchModelPropsSlow(_watchList)
    },
    dataUpdate() {
      if (!this.isEnabled) return;

      this.currentData = explain.modelDataSlow[explain.modelDataSlow.length - 1];

      this.mutableParameters.forEach((param) => {
        param.value = "";
        let weight_factor = 1.0
        if (param.weight_based) {
          weight_factor = 1.0 / explain.modelState.weight
        }
        if (param.props.length > 1) {
          for (let i = 0; i < param.props.length; i++) {
            try {
              if (this.currentData[param.props[i]] !== undefined) {
                param.value +=
                  (this.currentData[param.props[i]] * param.factor * weight_factor).toFixed(param.rounding) + "/";
              } else {
                param.value = "--";
              }
            } catch { }
          }
          param.value = param.value.slice(0, -1);
        } else {
          try {
            if (this.currentData[param.props[0]] !== undefined) {
              param.value = (
                this.currentData[param.props[0]] * param.factor * weight_factor).toFixed(param.rounding);
            } else {
              param.value = "-";
            }
          } catch { }
        }
      });
    },
    handleModelReady() {
      this.updateWatchList()
    },
    handleReset() {
      this.updateWatchList()
    },
    handleRts() {
      this.dataUpdate()
    },
    handleData() {
      this.dataUpdate()
    },
    handleState() {
      this.dataUpdate()
    },
  },
  beforeUnmount() {
    this.$bus.off("model_ready", this.handleModelReady)
    this.$bus.off("reset", this.handleReset)
    this.$bus.off("rts", this.handleRts);
    this.$bus.off("data", this.handleData);
    this.$bus.off("state", this.handleState);
  },
  mounted() {
    this.isEnabled = !this.collapsed;
    this.mutableParameters = [...this.parameters];
    this.$bus.on("model_ready", this.handleModelReady)
    this.$bus.on("reset", this.handleReset)
    this.$bus.on("rts", this.handleRts);
    this.$bus.on("data", this.handleData);
    this.$bus.on("state", this.handleState);
    if (this.isEnabled) {
      this.updateWatchList()
    }
  },
};
</script>

<style></style>
