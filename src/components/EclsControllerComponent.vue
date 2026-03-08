<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-xs" bordered dark flat>
    <div class="q-mt-es row gutter text-overline justify-center" @click="isEnabled = !isEnabled">
      {{ title }}
    </div>

    <div v-if="isEnabled" class="q-pa-sm">

      <RealtimeChart
        v-if="eclsRunning && showPressureChart"
        :alive="alive"
        :chart-height-factor="0.5"
        :default-autoscale="true"
        :model-properties="pressureSeries"
      />
      <RealtimeChart
        v-if="eclsRunning && showFlowChart"
        :alive="alive"
        :chart-height-factor="0.5"
        :default-autoscale="false"
        :default-y-min="-0.1"
        :default-y-max="1.0"
        :model-properties="flowSeries"
      />

      <div v-if="eclsRunning" class="row justify-center q-mb-sm">
        <q-btn-toggle
          v-model="chartMode"
          dense
          size="sm"
          no-caps
          unelevated
          toggle-color="primary"
          color="grey-9"
          text-color="white"
          :options="[
            { label: 'pressures', value: 'pressures' },
            { label: 'flow', value: 'flow' },
            { label: 'both', value: 'both' }
          ]"
        />
      </div>

      <div v-if="eclsRunning" class="row justify-center q-gutter-sm">
        <q-input
          v-model="flowDisplay"
          label="Flow (L/min)"
          readonly
          dense
          filled
          style="max-width: 125px"
        />
        <q-input
          v-model="pVenDisplay"
          label="P ven avg"
          readonly
          dense
          filled
          style="max-width: 95px"
        />
        <q-input
          v-model="pIntDisplay"
          label="P int avg"
          readonly
          dense
          filled
          style="max-width: 95px"
        />
        <q-input
          v-model="pArtDisplay"
          label="P art avg"
          readonly
          dense
          filled
          style="max-width: 95px"
        />
      </div>

      <div class="q-mt-sm row justify-center items-center q-gutter-md">
        <q-toggle v-model="eclsRunning" dense label="running" @update:model-value="setRunning" />
        <q-toggle v-model="eclsClamped" dense label="clamped" @update:model-value="setClamped" />
      </div>

      <div class="q-mt-sm row justify-center items-center q-gutter-md">
        <q-select
          v-model="drainageSite"
          :options="cannulationSites"
          label="drainage"
          dense
          filled
          style="min-width: 110px"
          @update:model-value="setDrainageSite"
        />
        <q-select
          v-model="returnSite"
          :options="cannulationSites"
          label="return"
          dense
          filled
          style="min-width: 110px"
          @update:model-value="setReturnSite"
        />
      </div>

      <div v-if="eclsRunning" class="q-mt-sm row justify-center items-start q-gutter-md">
        <div class="text-center ecls-knob-control">
          <div class="text-caption ecls-knob-label">pump rpm</div>
          <q-knob
            v-model="pumpRpm"
            show-value
            font-size="12px"
            size="64px"
            :min="0"
            :max="6000"
            :step="10"
            :thickness="0.22"
            color="teal"
            track-color="grey-3"
            @update:model-value="setPumpRpm"
          >
            {{ Math.round(pumpRpm) }}
          </q-knob>
          <div class="ecls-knob-unit">rpm</div>
        </div>

        <div class="text-center ecls-knob-control">
          <div class="text-caption ecls-knob-label">gas flow</div>
          <q-knob
            v-model="gasFlow"
            show-value
            font-size="12px"
            size="64px"
            :min="0"
            :max="5"
            :step="0.1"
            :thickness="0.22"
            color="teal"
            track-color="grey-3"
            @update:model-value="setGasFlow"
          >
            {{ gasFlow.toFixed(1) }}
          </q-knob>
          <div class="ecls-knob-unit">L/min</div>
        </div>
        <div class="text-center ecls-knob-control">
          <div class="text-caption ecls-knob-label">FiO2</div>
          <q-knob
            v-model="gasFio2Percent"
            show-value
            font-size="12px"
            size="64px"
            :min="21"
            :max="100"
            :step="1"
            :thickness="0.22"
            color="teal"
            track-color="grey-3"
            @update:model-value="setGasFio2"
          >
            {{ Math.round(gasFio2Percent) }}
          </q-knob>
          <div class="ecls-knob-unit">%</div>
        </div>
        <q-input
          v-model.number="gasFico2Percent"
          type="number"
          label="FiCO2 (%)"
          dense
          filled
          min="0"
          max="10"
          step="0.01"
          style="max-width: 95px"
          @update:model-value="setGasFico2"
        />
      </div>
    </div>
  </q-card>
</template>

<script>
import { explain } from "../boot/explain";
import RealtimeChart from "./RealtimeChart.vue";

export default {
  name: "EclsControllerComponent",
  components: {
    RealtimeChart,
  },
  props: {
    alive: {
      type: Boolean,
      default: true,
    },
    chartAutoscale: {
      type: Boolean,
      default: true,
    },
    chartYMin: {
      type: Number,
      default: 0,
    },
    chartYMax: {
      type: Number,
      default: 100,
    },
  },
  computed: {
    showPressureChart() {
      return this.chartMode === "pressures" || this.chartMode === "both";
    },
    showFlowChart() {
      return this.chartMode === "flow" || this.chartMode === "both";
    },
  },
  data() {
    return {
      title: "ECLS CONTROLLER",
      chartMode: "pressures",
      isEnabled: true,
      eclsRunning: false,
      eclsClamped: true,
      drainageSite: "RA",
      returnSite: "AAR",
      pumpRpm: 0,
      gasFlow: 0.5,
      gasFio2Percent: 20.5,
      gasFico2Percent: 0.04,
      flowDisplay: "0.00",
      pVenDisplay: "0.0",
      pIntDisplay: "0.0",
      pArtDisplay: "0.0",
      pVenPath: "Ecls.p_ven",
      pIntPath: "Ecls.p_int",
      pArtPath: "Ecls.p_art",
      cannulationSites: [],
      allowedCannulationTypes: ["HeartChamber", "BloodTimeVaryingElastance", "BloodVessel", "MicroVascularUnit"],
      pressureSeries: ["Ecls.p_ven", "Ecls.p_int", "Ecls.p_art"],
      flowSeries: ["Ecls.flow_avg"],
      watchedPathsKey: "",
      textUpdateMinIntervalMs: 220,
      textUpdateLastTs: 0,
      _onState: null,
      _onRtf: null,
    };
  },
  methods: {
    setProp(prop, value) {
      explain.setPropValue(prop, value, 0, 0);
    },
    setRunning() {
      this.setProp("Ecls.ecls_running", this.eclsRunning);
    },
    setClamped() {
      this.setProp("Ecls.ecls_clamped", this.eclsClamped);
    },
    setDrainageSite() {
      this.setProp("Ecls.drainage_site", this.drainageSite);
    },
    setReturnSite() {
      this.setProp("Ecls.return_site", this.returnSite);
    },
    setPumpRpm() {
      const value = Number(this.pumpRpm);
      if (Number.isFinite(value)) {
        this.setProp("Ecls.pump_rpm", value);
      }
    },
    setGasFlow() {
      const value = Math.min(5, Math.max(0, Number(this.gasFlow)));
      if (Number.isFinite(value)) {
        this.gasFlow = value;
        this.setProp("Ecls.gas_flow", value);
      }
    },
    setGasFio2() {
      const percent = Math.min(100, Math.max(21, Number(this.gasFio2Percent)));
      if (Number.isFinite(percent)) {
        this.gasFio2Percent = percent;
        this.setProp("Ecls.gas_fio2", percent / 100.0);
      }
    },
    setGasFico2() {
      const value = Number(this.gasFico2Percent) / 100.0;
      if (Number.isFinite(value)) {
        this.setProp("Ecls.gas_fico2", value);
      }
    },
    refreshWatchProps() {
      const paths = ["Ecls.flow_avg", this.pVenPath, this.pIntPath, this.pArtPath];
      const key = paths.join("|");
      if (key === this.watchedPathsKey) {
        return;
      }
      this.watchedPathsKey = key;
      explain.watchModelProps(paths);
    },
    processModelState() {
      const ecls = explain.modelState?.models?.Ecls;
      if (!ecls) {
        return;
      }

      const hasDedicatedAvgPressures = (
        Object.prototype.hasOwnProperty.call(ecls, "p_ven_avg")
        && Object.prototype.hasOwnProperty.call(ecls, "p_int_avg")
        && Object.prototype.hasOwnProperty.call(ecls, "p_art_avg")
      );
      this.pVenPath = hasDedicatedAvgPressures ? "Ecls.p_ven_avg" : "Ecls.p_ven";
      this.pIntPath = hasDedicatedAvgPressures ? "Ecls.p_int_avg" : "Ecls.p_int";
      this.pArtPath = hasDedicatedAvgPressures ? "Ecls.p_art_avg" : "Ecls.p_art";
      this.pressureSeries = [this.pVenPath, this.pIntPath, this.pArtPath];
      this.refreshWatchProps();

      this.eclsRunning = Boolean(ecls.ecls_running);
      this.eclsClamped = Boolean(ecls.ecls_clamped);
      this.drainageSite = ecls.drainage_site || this.drainageSite;
      this.returnSite = ecls.return_site || this.returnSite;
      this.pumpRpm = Number(ecls.pump_rpm) || 0;
      this.gasFlow = Number(ecls.gas_flow) || 0;
      this.gasFio2Percent = (Number(ecls.gas_fio2) || 0) * 100.0;
      this.gasFico2Percent = (Number(ecls.gas_fico2) || 0) * 100.0;

      if (this.cannulationSites.length === 0) {
        const sites = [];
        const models = explain.modelState?.models || {};
        Object.values(models).forEach((model) => {
          if (this.allowedCannulationTypes.includes(model.model_type)) {
            sites.push(model.name);
          }
        });
        this.cannulationSites = sites.sort();
      }

      if (!this.cannulationSites.includes(this.drainageSite)) {
        this.cannulationSites = [...new Set([...this.cannulationSites, this.drainageSite])].sort();
      }
      if (!this.cannulationSites.includes(this.returnSite)) {
        this.cannulationSites = [...new Set([...this.cannulationSites, this.returnSite])].sort();
      }
    },
    dataUpdateRt() {
      if (!this.isEnabled) {
        return;
      }

      const now = performance.now();
      if (now - this.textUpdateLastTs < this.textUpdateMinIntervalMs) {
        return;
      }
      this.textUpdateLastTs = now;

      const data = explain.modelData;
      if (!Array.isArray(data) || data.length === 0) {
        return;
      }

      const latest = data[data.length - 1] || {};
      this.flowDisplay = this.toFixedSafe(latest["Ecls.flow_avg"], 2);
      this.pVenDisplay = this.toFixedSafe(latest[this.pVenPath], 1);
      this.pIntDisplay = this.toFixedSafe(latest[this.pIntPath], 1);
      this.pArtDisplay = this.toFixedSafe(latest[this.pArtPath], 1);
    },
    toFixedSafe(value, digits) {
      const num = Number(value);
      if (!Number.isFinite(num)) {
        return "0";
      }
      return num.toFixed(digits);
    },
  },
  mounted() {
    this.refreshWatchProps();

    this._onState = () => this.processModelState();
    this._onRtf = () => this.dataUpdateRt();

    this.$bus.on("state", this._onState);
    this.$bus.on("rtf", this._onRtf);

    this.processModelState();
  },
  beforeUnmount() {
    if (this._onState) {
      this.$bus.off("state", this._onState);
    }
    if (this._onRtf) {
      this.$bus.off("rtf", this._onRtf);
    }
  },
};
</script>

<style scoped>
.ecls-knob-control {
  min-width: 78px;
}

.ecls-knob-label {
  min-height: 18px;
  line-height: 18px;
}

.ecls-knob-unit {
  min-height: 14px;
  line-height: 14px;
  font-size: 10px;
}
</style>
