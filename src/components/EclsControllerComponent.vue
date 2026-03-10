<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-xs" bordered dark flat>
    <div class="q-mt-es row gutter text-overline justify-center" @click="isEnabled = !isEnabled">
      {{ title }}
    </div>

    <div class="q-mt-xs row justify-center items-center q-gutter-md">
        <q-toggle v-model="eclsRunning" size="xs" dense label="ecls running" @update:model-value="setRunning" />
        <q-toggle v-model="eclsClamped" size="xs" dense label="ecls clamped" @update:model-value="setClamped" />
    </div>


    <div v-if="isEnabled" class="q-pa-sm">

      <RealtimeChart
        v-if="eclsRunning && showPressureChart"
        :alive="alive"
        :chart-height-factor="0.5"
        :compact-axis-inputs="true"
        :default-autoscale="true"
        :show-controls="false"
        :model-properties="pressureSeries"
      />
      <RealtimeChart
        v-if="eclsRunning && showFlowChart"
        :alive="alive"
        :chart-height-factor="0.5"
        :compact-axis-inputs="true"
        :default-autoscale="true"
        :show-controls="false"
        :model-properties="flowSeries"
      />

      <div v-if="eclsRunning" class="row justify-center q-ma-sm">
        <q-btn-toggle
          v-model="chartMode"
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
      <q-separator v-if="eclsRunning" class="q-mt-md" />
      <div v-if="eclsRunning" class="q-mt-sm row justify-center q-gutter-sm">
        <q-input
          v-model="flowDisplay"
          label="Flow"
          readonly
          dense
          filled
          style="max-width: 60px"
        />
        <q-input
          v-model="pVenDisplay"
          label="P ven"
          readonly
          dense
          filled
          style="max-width: 60px"
        />
        <q-input
          v-model="pIntDisplay"
          label="P int"
          readonly
          dense
          filled
          style="max-width: 60px"
        />
        <q-input
          v-model="pArtDisplay"
          label="P art"
          readonly
          dense
          filled
          style="max-width: 60px"
        />
      </div>

      <div v-if="eclsRunning" class="q-mt-xs row justify-center q-gutter-sm">
        <q-input
          v-model="satVenDisplay"
          label="SvO2"
          readonly
          dense
          filled
          style="max-width: 60px"
        />
        <q-input
          v-model="satPostoxyDisplay"
          label="SpO2"
          readonly
          dense
          filled
          style="max-width: 60px"
        />
        <q-input
          v-model="pco2PostoxyDisplay"
          label="PCO2"
          readonly
          dense
          filled
          style="max-width: 60px"
        />
      </div>

      <q-separator v-if="eclsRunning" class="q-mt-md" />
      <div v-if="eclsRunning" class="q-mt-xs row justify-center items-start q-gutter-md">
        <div class="text-center ecls-knob-control">
          <div class="q-mb-sm text-caption ecls-knob-label">pump rpm</div>
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
          <div class="q-mb-sm text-caption ecls-knob-label">gas flow</div>
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
          <div class="q-mb-sm text-caption ecls-knob-label">FiO2</div>
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
        <!-- <q-input
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
        /> -->
      </div>

      <q-separator v-if="eclsRunning" class="q-mt-md" />

      <div v-if="eclsRunning" class="q-mt-md q-ml-md q-mr-md row justify-left items-left">
        <q-select
          v-model="drainageSite"
          :options="cannulationSites"
          label="drainage site"
          dense
          filled
          style="min-width: 100%"
          @update:model-value="setDrainageSite"
        />
      </div>
      <div v-if="eclsRunning" class="q-mt-sm q-ml-md q-mr-md row justify-left items-left">
        <q-select
          v-model="drainageCannulaType"
          :options="drainageCannulaOptions"
          label="drainage cannula"
          dense
          filled
          style="min-width: 100%"
          @update:model-value="setDrainageCannulaType"
        />
      </div>

      <div v-if="eclsRunning" class="q-mt-sm q-ml-md q-mr-md row justify-left items-left">
        <q-select
          v-model="returnSite"
          :options="cannulationSites"
          label="return"
          dense
          filled
          style="min-width: 100%"
          @update:model-value="setReturnSite"
        />
      </div>

      <div v-if="eclsRunning" class="q-mt-sm q-ml-md q-mr-md row justify-left items-left">
        <q-select
          v-model="returnCannulaType"
          :options="returnCannulaOptions"
          label="return cannula"
          dense
          filled
          style="min-width: 100%"
          @update:model-value="setReturnCannulaType"
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
      drainageCannulaType: "",
      returnCannulaType: "",
      pumpRpm: 0,
      gasFlow: 0.5,
      gasFio2Percent: 20.5,
      gasFico2Percent: 0.04,
      flowDisplay: "0.00",
      pVenDisplay: "0.0",
      pIntDisplay: "0.0",
      pArtDisplay: "0.0",
      satVenDisplay: "0",
      satPostoxyDisplay: "0",
      pco2PostoxyDisplay: "0.0",
      pVenPath: "Ecls.p_ven",
      pIntPath: "Ecls.p_int",
      pArtPath: "Ecls.p_art",
      cannulationSites: [],
      drainageCannulaOptions: [],
      returnCannulaOptions: [],
      drainageCannulas: {},
      returnCannulas: {},
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
      if (this.eclsRunning) {
        this.$bus.emit("ecls_display_on");
      } else {
        this.$bus.emit("ecls_display_off");
      }
      this.setProp("Ecls.ecls_running", this.eclsRunning);
    },
    setClamped() {
      this.setProp("Ecls.ecls_clamped", this.eclsClamped);
    },
    setDrainageSite() {
      this.setProp("Ecls.drainage_site", this.drainageSite);
      this.$bus.emit("update_drainage_site", this.drainageSite);
    },
    setReturnSite() {
      this.setProp("Ecls.return_site", this.returnSite);
      this.$bus.emit("update_return_site", this.returnSite);
    },
    setDrainageCannulaType() {
      const cannula = this.drainageCannulas[this.drainageCannulaType];
      if (!cannula) {
        return;
      }

      this.setProp("Ecls.drainage_cannula_type", this.drainageCannulaType);
      this.setProp("Ecls.drainage_res", cannula.resistance);
      this.setProp("Ecls.drainage_cannula_diameter", cannula.inner_diameter);
      this.setProp("Ecls.drainage_cannula_length", cannula.length);
    },
    setReturnCannulaType() {
      const cannula = this.returnCannulas[this.returnCannulaType];
      if (!cannula) {
        return;
      }

      this.setProp("Ecls.return_cannula_type", this.returnCannulaType);
      this.setProp("Ecls.return_res", cannula.resistance);
      this.setProp("Ecls.return_cannula_diameter", cannula.inner_diameter);
      this.setProp("Ecls.return_cannula_length", cannula.length);
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
      const paths = [
        "Ecls.flow_avg",
        this.pVenPath,
        this.pIntPath,
        this.pArtPath,
        "Ecls.sat_ven_o2",
        "Ecls.sat_postoxy_o2",
        "Ecls.pco2_postoxy",
      ];
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

      this.drainageCannulas = ecls.drainage_cannulas || {};
      this.returnCannulas = ecls.return_cannulas || {};
      this.drainageCannulaOptions = Object.keys(this.drainageCannulas).sort();
      this.returnCannulaOptions = Object.keys(this.returnCannulas).sort();

      this.drainageCannulaType = this.resolveCannulaSelection(
        this.drainageCannulaOptions,
        this.drainageCannulas,
        ecls.drainage_cannula_type,
        Number(ecls.drainage_res),
      );

      this.returnCannulaType = this.resolveCannulaSelection(
        this.returnCannulaOptions,
        this.returnCannulas,
        ecls.return_cannula_type,
        Number(ecls.return_res),
      );

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
      this.satVenDisplay = this.toFixedSafe(latest["Ecls.sat_ven_o2"], 0);
      this.satPostoxyDisplay = this.toFixedSafe(latest["Ecls.sat_postoxy_o2"], 0);
      this.pco2PostoxyDisplay = this.toFixedSafe(latest["Ecls.pco2_postoxy"], 1);
    },
    toFixedSafe(value, digits) {
      const num = Number(value);
      if (!Number.isFinite(num)) {
        return "0";
      }
      return num.toFixed(digits);
    },
    resolveCannulaSelection(options, cannulas, selectedType, referenceResistance) {
      if (!Array.isArray(options) || options.length === 0) {
        return "";
      }

      if (typeof selectedType === "string" && options.includes(selectedType)) {
        return selectedType;
      }

      if (Number.isFinite(referenceResistance)) {
        const byResistance = options.find((name) => {
          const cannula = cannulas[name];
          return Number(cannula?.resistance) === referenceResistance;
        });
        if (byResistance) {
          return byResistance;
        }
      }

      return options[0];
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
