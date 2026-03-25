<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-xs" bordered dark flat>
    <div v-if="displayTitle" class="q-mt-es row gutter text-overline justify-center" @click="toggleEnabled">
      {{ displayTitle }}
    </div>

    <div v-if="isEnabled && !hasExternalModelProperties" class="q-ma-sm row justify-center items-center q-gutter-sm">
      <q-select
        class="aa-select"
        v-model="selectedPreset"
        label="preset"
        hide-hint
        dense
        dark
        filled
        style="min-width: 140px;"
        :options="presetNames"
        @update:model-value="selectPreset"
      />
      <q-select
        class="aa-select"
        v-model="selectedModel"
        label="model 1"
        hide-hint
        dense
        dark
        filled
        style="min-width: 110px;"
        :options="modelNames"
        @update:model-value="selectModel"
      />
      <q-select
        class="aa-select"
        v-if="selectedModel !== ''"
        v-model="selectedProp"
        label="property 1"
        hide-hint
        dense
        dark
        filled
        style="min-width: 110px;"
        :options="propNames"
        @update:model-value="selectProp"
      />
      <q-select
        class="aa-select"
        v-model="selectedModel2"
        label="model 2"
        hide-hint
        dense
        dark
        filled
        style="min-width: 110px;"
        :options="modelNames"
        @update:model-value="selectModel2"
      />
      <q-select
        class="aa-select"
        v-if="selectedModel2 !== ''"
        v-model="selectedProp2"
        label="property 2"
        hide-hint
        dense
        dark
        filled
        style="min-width: 110px;"
        :options="prop2Names"
        @update:model-value="selectProp2"
      />
      <q-select
        class="aa-select"
        v-model="selectedModel3"
        label="model 3"
        hide-hint
        dense
        dark
        filled
        style="min-width: 110px;"
        :options="modelNames"
        @update:model-value="selectModel3"
      />
      <q-select
        class="aa-select"
        v-if="selectedModel3 !== ''"
        v-model="selectedProp3"
        label="property 3"
        hide-hint
        dense
        dark
        filled
        style="min-width: 110px;"
        :options="prop3Names"
        @update:model-value="selectProp3"
      />
    </div>

    <div v-if="isEnabled" class="q-px-sm q-pb-sm aa-canvas-wrap">
      <div class="aa-series-labels text-caption">
        <span class="aa-series-label aa-series-label-red">{{ selectedPath || "-" }}</span>
        <span class="aa-series-label aa-series-label-green"> {{ selectedPath2 || "-" }}</span>
        <span class="aa-series-label aa-series-label-blue"> {{ selectedPath3 || "-" }}</span>
      </div>
      <canvas ref="aaCanvas" class="aa-pressure-canvas" :style="canvasStyle" />

      <div v-if="showControls" class="q-mt-sm row justify-center items-center q-gutter-sm">
        <q-checkbox v-model="autoscale" size="xs" dense label="autoscale"  @update:model-value="toggleAutoscaling"><q-tooltip>autoscale</q-tooltip></q-checkbox>
        <q-input
          class="aa-time-input"
          :class="{ 'aa-axis-input-compact': compactAxisInputs }"
          v-model.number="rtWindow"
          type="number"
          label="time (s)"
          filled
          dense
          min="1"
          max="30"
          hide-bottom-space
          @update:model-value="updateRtWindow"
        />
        <q-input
          class="aa-y-input"
          :class="{ 'aa-axis-input-compact': compactAxisInputs }"
          v-if="!autoscale"
          v-model.number="y_min"
          type="number"
          label="y min"
          filled
          dense
          hide-bottom-space
          @update:model-value="updateManualScale"
        />
        <q-input
          class="aa-y-input"
          :class="{ 'aa-axis-input-compact': compactAxisInputs }"
          v-if="!autoscale"
          v-model.number="y_max"
          type="number"
          label="y max"
          filled
          dense
          hide-bottom-space
          @update:model-value="updateManualScale"
        />
        <q-btn
          color="secondary"
          size="sm"
          icon="fa-solid fa-calculator"
          :outline="!showStats"
          @click="toggleStats"
        >
          <q-tooltip>statistics</q-tooltip>
        </q-btn>
        <q-btn
          color="primary"
          size="sm"
          icon="fa-solid fa-file-csv"
          :disable="x_axis.length === 0"
          @click="exportCsv"
        >
          <q-tooltip>export csv</q-tooltip>
        </q-btn>
        <q-btn color="negative" size="sm" icon="fa-solid fa-rotate-left" @click="clearSeries" />
      </div>

      <div v-if="showControls && showStats" class="q-mt-sm text-caption aa-stats-wrap">
        <div v-if="selectedPath" class="aa-stats-row aa-stats-row-red">
          {{ selectedPath }}: n={{ stats1.n }} min={{ stats1.min }} max={{ stats1.max }} mean={{ stats1.mean }} sd={{ stats1.sd }}
        </div>
        <div v-if="selectedPath2" class="aa-stats-row aa-stats-row-green">
          {{ selectedPath2 }}: n={{ stats2.n }} min={{ stats2.min }} max={{ stats2.max }} mean={{ stats2.mean }} sd={{ stats2.sd }}
        </div>
        <div v-if="selectedPath3" class="aa-stats-row aa-stats-row-blue">
          {{ selectedPath3 }}: n={{ stats3.n }} min={{ stats3.min }} max={{ stats3.max }} mean={{ stats3.mean }} sd={{ stats3.sd }}
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
import { explain } from "../boot/explain";

const MANUAL_PRESET = "Manual";
const CHART_PRESETS = {
  [MANUAL_PRESET]: [],
  "Pda velocity": ["Pda.velocity_pa"],
};

export default {
  name: "RealtimeChart",
  props: {
    alive: {
      type: Boolean,
      default: true,
    },
    modelProperties: {
      type: Array,
      default: () => [],
    },
    chartHeightFactor: {
      type: Number,
      default: 1,
    },
    chartTitle: {
      type: String,
      default: "",
    },
    defaultAutoscale: {
      type: Boolean,
      default: true,
    },
    defaultYMin: {
      type: Number,
      default: 0,
    },
    defaultYMax: {
      type: Number,
      default: 100,
    },
    compactAxisInputs: {
      type: Boolean,
      default: false,
    },
    showControls: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    presetNames() {
      return Object.keys(CHART_PRESETS);
    },
    externalModelProperties() {
      if (!Array.isArray(this.modelProperties)) {
        return [];
      }
      return this.modelProperties
        .filter((entry) => typeof entry === "string")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
    },
    hasExternalModelProperties() {
      return this.externalModelProperties.length > 0;
    },
    displayTitle() {
      if (typeof this.chartTitle !== "string") {
        return "";
      }
      return this.chartTitle.trim();
    },
    normalizedChartHeightFactor() {
      const factor = Number(this.chartHeightFactor);
      if (!Number.isFinite(factor)) {
        return 1;
      }
      return Math.min(4, Math.max(0.25, factor));
    },
    canvasStyle() {
      const baseHeight = 260;
      return {
        height: `${Math.round(baseHeight * this.normalizedChartHeightFactor)}px`,
      };
    },
  },
  watch: {
    modelProperties: {
      handler() {
        if (this.applyExternalModelProperties()) {
          this.clearSeries();
        }
      },
      deep: true,
    },
    chartHeightFactor() {
      this.$nextTick(() => {
        this.drawCanvas();
      });
    },
    defaultAutoscale() {
      this.applyDefaultAxisConfig();
    },
    defaultYMin() {
      this.applyDefaultAxisConfig();
    },
    defaultYMax() {
      this.applyDefaultAxisConfig();
    },
  },
  data() {
    return {
      isEnabled: true,
      rtWindow: 3,
      rtWindowValidated: 3,
      autoscale: true,
      y_min: 0,
      y_max: 100,
      seconds: 0,
      x_axis: [],
      y_axis: [],
      y2_axis: [],
      y3_axis: [],
      rtWindowStartIndex: 0,
      rtWindowSamplesPerSecond: 200,
      rtCompactionThreshold: 4000,
      redrawMinIntervalMs: 1000 / 50,
      redrawLastTs: 0,
      redrawPointsPerPixel: 1.5,
      redrawMinPoints: 250,
      redrawMaxPoints: 1000,
      modelNames: [""],
      propNames: [""],
      prop2Names: [""],
      prop3Names: [""],
      selectedPreset: MANUAL_PRESET,
      selectedModel: "",
      selectedProp: "",
      selectedPath: "",
      selectedModel2: "",
      selectedProp2: "",
      selectedPath2: "",
      selectedModel3: "",
      selectedProp3: "",
      selectedPath3: "",
      showStats: false,
      stats1: { n: 0, min: "-", max: "-", mean: "-", sd: "-" },
      stats2: { n: 0, min: "-", max: "-", mean: "-", sd: "-" },
      stats3: { n: 0, min: "-", max: "-", mean: "-", sd: "-" },
    };
  },
  methods: {
    ensureOptionInList(options, value) {
      const nextOptions = Array.isArray(options) ? [...options] : [""];
      if (!value || nextOptions.includes(value)) {
        return nextOptions;
      }

      const normalized = nextOptions.filter((entry) => entry !== "");
      normalized.push(value);
      normalized.sort();
      return ["", ...normalized];
    },
    applyPathSelections(paths) {
      const path1 = paths[0] || "";
      const path2 = paths[1] || "";
      const path3 = paths[2] || "";

      this.selectedPath = path1;
      this.selectedPath2 = path2 && path2 !== path1 ? path2 : "";
      this.selectedPath3 = path3 && path3 !== path1 && path3 !== path2 ? path3 : "";

      const parsed1 = this.parseModelPath(this.selectedPath);
      this.selectedModel = parsed1.model;
      this.selectedProp = parsed1.prop;
      this.propNames = this.selectedModel
        ? this.ensureOptionInList(this.getNumericPropsForModel(this.selectedModel), this.selectedProp)
        : [""];

      const parsed2 = this.parseModelPath(this.selectedPath2);
      this.selectedModel2 = parsed2.model;
      this.selectedProp2 = parsed2.prop;
      this.prop2Names = this.selectedModel2
        ? this.ensureOptionInList(this.getNumericPropsForModel(this.selectedModel2), this.selectedProp2)
        : [""];

      const parsed3 = this.parseModelPath(this.selectedPath3);
      this.selectedModel3 = parsed3.model;
      this.selectedProp3 = parsed3.prop;
      this.prop3Names = this.selectedModel3
        ? this.ensureOptionInList(this.getNumericPropsForModel(this.selectedModel3), this.selectedProp3)
        : [""];

      this.refreshWatchedPaths();
    },
    syncPresetSelection() {
      const selectedPaths = [this.selectedPath, this.selectedPath2, this.selectedPath3].filter((entry) => entry);
      const presetNames = Object.keys(CHART_PRESETS);
      for (let i = 0; i < presetNames.length; i++) {
        const presetName = presetNames[i];
        const presetPaths = CHART_PRESETS[presetName];
        if (presetPaths.length !== selectedPaths.length) {
          continue;
        }

        let matches = true;
        for (let j = 0; j < presetPaths.length; j++) {
          if (presetPaths[j] !== selectedPaths[j]) {
            matches = false;
            break;
          }
        }

        if (matches) {
          this.selectedPreset = presetName;
          return;
        }
      }

      this.selectedPreset = MANUAL_PRESET;
    },
    selectPreset() {
      if (this.selectedPreset === MANUAL_PRESET) {
        return;
      }

      this.applyPathSelections(CHART_PRESETS[this.selectedPreset] || []);
      explain.getModelState();
      this.clearSeries();
    },
    toggleStats() {
      this.showStats = !this.showStats;
      if (this.showStats) {
        this.updateStatistics();
      }
    },
    applyDefaultAxisConfig() {
      this.autoscale = this.defaultAutoscale;
      const yMin = Number(this.defaultYMin);
      const yMax = Number(this.defaultYMax);
      if (Number.isFinite(yMin)) {
        this.y_min = yMin;
      }
      if (Number.isFinite(yMax)) {
        this.y_max = yMax;
      }
      if (this.y_min >= this.y_max) {
        this.y_max = this.y_min + 1;
      }
      this.$nextTick(() => {
        this.drawCanvas();
      });
    },
    calculateSeriesStats(source) {
      const values = [];
      for (let i = this.rtWindowStartIndex; i < source.length; i++) {
        const value = source[i];
        if (Number.isFinite(value)) {
          values.push(value);
        }
      }

      if (values.length === 0) {
        return { n: 0, min: "-", max: "-", mean: "-", sd: "-" };
      }

      let min = Infinity;
      let max = -Infinity;
      let sum = 0;
      for (let i = 0; i < values.length; i++) {
        const v = values[i];
        if (v < min) {
          min = v;
        }
        if (v > max) {
          max = v;
        }
        sum += v;
      }
      const mean = sum / values.length;
      let varianceSum = 0;
      for (let i = 0; i < values.length; i++) {
        const diff = values[i] - mean;
        varianceSum += diff * diff;
      }
      const sd = Math.sqrt(varianceSum / values.length);

      return {
        n: values.length,
        min: min.toFixed(3),
        max: max.toFixed(3),
        mean: mean.toFixed(3),
        sd: sd.toFixed(3),
      };
    },
    updateStatistics() {
      this.stats1 = this.calculateSeriesStats(this.y_axis);
      this.stats2 = this.calculateSeriesStats(this.y2_axis);
      this.stats3 = this.calculateSeriesStats(this.y3_axis);
    },
    csvEscape(value) {
      if (value === null || value === undefined) {
        return "";
      }
      const asString = String(value);
      if (/[",\n\r]/.test(asString)) {
        return `"${asString.replace(/"/g, '""')}"`;
      }
      return asString;
    },
    makeCsvFileName() {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const base = (this.displayTitle || "realtime-chart").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "realtime-chart";
      return `${base}-${timestamp}.csv`;
    },
    exportCsv() {
      const startIndex = this.rtWindowStartIndex;
      if (startIndex >= this.x_axis.length) {
        return;
      }

      const series = [
        { path: this.selectedPath, values: this.y_axis },
        { path: this.selectedPath2, values: this.y2_axis },
        { path: this.selectedPath3, values: this.y3_axis },
      ].filter((entry) => typeof entry.path === "string" && entry.path.length > 0);

      const headers = ["time", ...series.map((entry) => entry.path)];
      const rows = [headers.map((value) => this.csvEscape(value)).join(",")];

      for (let i = startIndex; i < this.x_axis.length; i++) {
        const row = [this.x_axis[i]];
        for (let j = 0; j < series.length; j++) {
          const value = series[j].values[i];
          row.push(Number.isFinite(value) ? value : "");
        }
        rows.push(row.map((value) => this.csvEscape(value)).join(","));
      }

      const csvText = `${rows.join("\n")}\n`;
      const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", this.makeCsvFileName());
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    parseModelPath(path) {
      if (typeof path !== "string") {
        return { model: "", prop: "" };
      }
      const separatorIndex = path.indexOf(".");
      if (separatorIndex <= 0 || separatorIndex >= path.length - 1) {
        return { model: "", prop: "" };
      }
      return {
        model: path.slice(0, separatorIndex),
        prop: path.slice(separatorIndex + 1),
      };
    },
    applyExternalModelProperties() {
      if (!this.hasExternalModelProperties) {
        return false;
      }

      this.applyPathSelections(this.externalModelProperties);
      this.syncPresetSelection();
      return true;
    },
    toggleEnabled() {
      this.isEnabled = !this.isEnabled;
      if (this.isEnabled) {
        this.$nextTick(() => {
          this.drawCanvas();
        });
      }
    },
    shouldRedrawChart() {
      const now = performance.now();
      if (now - this.redrawLastTs < this.redrawMinIntervalMs) {
        return false;
      }
      this.redrawLastTs = now;
      return true;
    },
    updateRtWindow() {
      if (this.rtWindow < 1) {
        this.rtWindow = 1;
      }
      if (this.rtWindow > 30) {
        this.rtWindow = 30;
      }
      this.rtWindowValidated = this.rtWindow;
      this.applyRtWindowLimit();
    },
    toggleAutoscaling() {
      if (!this.autoscale) {
        const range = this.getCurrentDataRange();
        if (range) {
          this.y_min = range.min;
          this.y_max = range.max;
          if (this.y_min === this.y_max) {
            this.y_min -= 1;
            this.y_max += 1;
          }
        }
      }
      this.drawCanvas();
    },
    updateManualScale() {
      if (this.autoscale) {
        return;
      }
      if (!Number.isFinite(this.y_min)) {
        this.y_min = 0;
      }
      if (!Number.isFinite(this.y_max)) {
        this.y_max = this.y_min + 1;
      }
      if (this.y_min >= this.y_max) {
        this.y_max = this.y_min + 1;
      }
      this.drawCanvas();
    },
    clearSeries() {
      this.seconds = 0;
      this.rtWindowStartIndex = 0;
      this.x_axis = [];
      this.y_axis = [];
      this.y2_axis = [];
      this.y3_axis = [];
      if (this.showStats) {
        this.updateStatistics();
      }
      this.drawCanvas();
    },
    processAvailableModels() {
      this.modelNames = [""];
      const models = explain.modelState?.models;
      if (!models) {
        return;
      }

      this.modelNames = Object.keys(models).sort();
      this.modelNames.push("");

      if (this.hasExternalModelProperties) {
        return;
      }

      if (this.selectedModel && !this.modelNames.includes(this.selectedModel)) {
        this.selectedModel = "";
        this.selectedProp = "";
        this.selectedPath = "";
        this.propNames = [""];
      }

      if (this.selectedModel) {
        this.propNames = this.getNumericPropsForModel(this.selectedModel);
        if (this.selectedProp && !this.propNames.includes(this.selectedProp)) {
          this.selectedProp = "";
          this.selectedPath = "";
        }
      }

      if (this.selectedModel2) {
        this.prop2Names = this.getNumericPropsForModel(this.selectedModel2);
        if (this.selectedProp2 && !this.prop2Names.includes(this.selectedProp2)) {
          this.selectedProp2 = "";
          this.selectedPath2 = "";
        }
      }

      if (this.selectedModel3) {
        this.prop3Names = this.getNumericPropsForModel(this.selectedModel3);
        if (this.selectedProp3 && !this.prop3Names.includes(this.selectedProp3)) {
          this.selectedProp3 = "";
          this.selectedPath3 = "";
        }
      }
    },
    getNumericPropsForModel(modelName) {
      const model = explain.modelState?.models?.[modelName];
      if (!model) {
        return [""];
      }

      const props = [""];
      Object.keys(model).forEach((prop) => {
        if (typeof model[prop] === "number" && prop[0] !== "_") {
          props.push(prop);
        }
      });

      props.sort();
      return props;
    },
    selectModel() {
      this.selectedPreset = MANUAL_PRESET;
      this.selectedProp = "";
      this.selectedPath = "";
      this.propNames = this.getNumericPropsForModel(this.selectedModel);
      this.refreshWatchedPaths();
      this.clearSeries();
    },
    selectProp() {
      if (this.selectedModel && this.selectedProp) {
        this.selectedPath = `${this.selectedModel}.${this.selectedProp}`;
      } else {
        this.selectedPath = "";
      }
      this.syncPresetSelection();
      this.refreshWatchedPaths();
      this.clearSeries();
    },
    selectModel2() {
      this.selectedPreset = MANUAL_PRESET;
      this.selectedProp2 = "";
      this.selectedPath2 = "";
      this.prop2Names = this.getNumericPropsForModel(this.selectedModel2);
      this.refreshWatchedPaths();
      this.clearSeries();
    },
    selectProp2() {
      if (this.selectedModel2 && this.selectedProp2) {
        this.selectedPath2 = `${this.selectedModel2}.${this.selectedProp2}`;
      } else {
        this.selectedPath2 = "";
      }
      this.syncPresetSelection();
      this.refreshWatchedPaths();
      this.clearSeries();
    },
    selectModel3() {
      this.selectedPreset = MANUAL_PRESET;
      this.selectedProp3 = "";
      this.selectedPath3 = "";
      this.prop3Names = this.getNumericPropsForModel(this.selectedModel3);
      this.refreshWatchedPaths();
      this.clearSeries();
    },
    selectProp3() {
      if (this.selectedModel3 && this.selectedProp3) {
        this.selectedPath3 = `${this.selectedModel3}.${this.selectedProp3}`;
      } else {
        this.selectedPath3 = "";
      }
      this.syncPresetSelection();
      this.refreshWatchedPaths();
      this.clearSeries();
    },
    refreshWatchedPaths() {
      const watchedPaths = [];
      const candidates = [this.selectedPath, this.selectedPath2, this.selectedPath3];
      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        if (candidate && !watchedPaths.includes(candidate)) {
          watchedPaths.push(candidate);
        }
      }
      if (watchedPaths.length > 0) {
        explain.watchModelProps(watchedPaths);
      }
    },
    applyRtWindowLimit() {
      const maxPoints = Math.max(1, Math.floor(this.rtWindowValidated * this.rtWindowSamplesPerSecond));
      const visibleLength = this.x_axis.length - this.rtWindowStartIndex;
      if (visibleLength > maxPoints) {
        this.rtWindowStartIndex += (visibleLength - maxPoints);
      }

      if (this.rtWindowStartIndex >= this.rtCompactionThreshold) {
        this.x_axis = this.x_axis.slice(this.rtWindowStartIndex);
        this.y_axis = this.y_axis.slice(this.rtWindowStartIndex);
        this.y2_axis = this.y2_axis.slice(this.rtWindowStartIndex);
        this.y3_axis = this.y3_axis.slice(this.rtWindowStartIndex);
        this.rtWindowStartIndex = 0;
      }
    },
    getAdaptiveRedrawMaxPoints(canvas) {
      const chartWidth = Number(canvas?.clientWidth) || 0;
      if (chartWidth <= 0) {
        return this.redrawMaxPoints;
      }
      const adaptivePoints = Math.floor(chartWidth * this.redrawPointsPerPixel);
      return Math.min(this.redrawMaxPoints, Math.max(this.redrawMinPoints, adaptivePoints));
    },
    getRedrawPlan(sourceLength, canvas) {
      const startIndex = this.rtWindowStartIndex;
      const windowLength = Math.max(0, sourceLength - startIndex);
      const maxPoints = this.getAdaptiveRedrawMaxPoints(canvas);

      if (windowLength <= maxPoints) {
        return {
          startIndex,
          step: 1,
          outLength: windowLength,
        };
      }

      const step = Math.ceil(windowLength / maxPoints);
      return {
        startIndex,
        step,
        outLength: Math.ceil(windowLength / step),
      };
    },
    getCurrentDataRange() {
      let min = Infinity;
      let max = -Infinity;

      for (let i = this.rtWindowStartIndex; i < this.y_axis.length; i++) {
        const value1 = this.y_axis[i];
        const value2 = this.y2_axis[i];
        const value3 = this.y3_axis[i];
        if (Number.isFinite(value1)) {
          if (value1 < min) {
            min = value1;
          }
          if (value1 > max) {
            max = value1;
          }
        }
        if (Number.isFinite(value2)) {
          if (value2 < min) {
            min = value2;
          }
          if (value2 > max) {
            max = value2;
          }
        }
        if (Number.isFinite(value3)) {
          if (value3 < min) {
            min = value3;
          }
          if (value3 > max) {
            max = value3;
          }
        }
      }

      if (!Number.isFinite(min) || !Number.isFinite(max)) {
        return null;
      }
      return { min, max };
    },
    drawSeries(ctx, plan, source, yMin, yMax, color, padLeft, padTop, plotWidth, plotHeight) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      let sourceIndex = plan.startIndex;
      let drawing = false;
      for (let i = 0; i < plan.outLength; i++) {
        const value = source[sourceIndex];
        const x = padLeft + (plotWidth * i) / (plan.outLength - 1);

        if (Number.isFinite(value)) {
          const norm = (value - yMin) / (yMax - yMin);
          const y = padTop + plotHeight * (1 - norm);
          if (!drawing) {
            ctx.moveTo(x, y);
            drawing = true;
          } else {
            ctx.lineTo(x, y);
          }
        } else {
          drawing = false;
        }

        sourceIndex += plan.step;
      }

      ctx.stroke();
    },
    formatAxisTick(value, yMin, yMax) {
      const range = Math.abs(yMax - yMin);
      if (range >= 100) {
        return value.toFixed(0);
      }
      if (range >= 10) {
        return value.toFixed(1);
      }
      return value.toFixed(2);
    },
    drawCanvas() {
      const canvas = this.$refs.aaCanvas;
      if (!canvas) {
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width || 600));
      const height = Math.max(1, Math.floor(rect.height || 240));
      const dpr = window.devicePixelRatio || 1;
      const targetWidth = Math.floor(width * dpr);
      const targetHeight = Math.floor(height * dpr);

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const plan = this.getRedrawPlan(this.x_axis.length, canvas);
      if (plan.outLength < 2) {
        return;
      }

      let minY = this.y_min;
      let maxY = this.y_max;
      if (this.autoscale) {
        minY = Infinity;
        maxY = -Infinity;
        let sourceIndex = plan.startIndex;
        for (let i = 0; i < plan.outLength; i++) {
          const value1 = this.y_axis[sourceIndex];
          const value2 = this.y2_axis[sourceIndex];
          const value3 = this.y3_axis[sourceIndex];
          if (Number.isFinite(value1)) {
            if (value1 < minY) {
              minY = value1;
            }
            if (value1 > maxY) {
              maxY = value1;
            }
          }
          if (Number.isFinite(value2)) {
            if (value2 < minY) {
              minY = value2;
            }
            if (value2 > maxY) {
              maxY = value2;
            }
          }
          if (Number.isFinite(value3)) {
            if (value3 < minY) {
              minY = value3;
            }
            if (value3 > maxY) {
              maxY = value3;
            }
          }
          sourceIndex += plan.step;
        }

        if (!Number.isFinite(minY) || !Number.isFinite(maxY)) {
          return;
        }

        if (minY === maxY) {
          minY -= 1;
          maxY += 1;
        }
      } else if (!Number.isFinite(minY) || !Number.isFinite(maxY) || minY >= maxY) {
        return;
      }

      const padLeft = 48;
      const padRight = 6;
      const padTop = 6;
      const padBottom = 8;
      const plotWidth = Math.max(1, width - padLeft - padRight);
      const plotHeight = Math.max(1, height - padTop - padBottom);

      const yTicks = 5;
      ctx.fillStyle = "#a0a0a0";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < yTicks; i++) {
        const y = padTop + (plotHeight * i) / (yTicks - 1);
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + plotWidth, y);
      }
      ctx.stroke();

      ctx.strokeStyle = "#5a5a5a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, padTop);
      ctx.lineTo(padLeft, padTop + plotHeight);
      ctx.stroke();

      for (let i = 0; i < yTicks; i++) {
        const ratio = 1 - i / (yTicks - 1);
        const y = padTop + (plotHeight * i) / (yTicks - 1);
        const tickValue = minY + (maxY - minY) * ratio;
        const label = this.formatAxisTick(tickValue, minY, maxY);

        ctx.strokeStyle = "#707070";
        ctx.beginPath();
        ctx.moveTo(padLeft - 4, y);
        ctx.lineTo(padLeft, y);
        ctx.stroke();

        ctx.fillText(label, padLeft - 6, y);
      }

      this.drawSeries(ctx, plan, this.y_axis, minY, maxY, "rgba(192, 0, 0, 1.0)", padLeft, padTop, plotWidth, plotHeight);
      this.drawSeries(ctx, plan, this.y2_axis, minY, maxY, "rgba(0, 192, 0, 1.0)", padLeft, padTop, plotWidth, plotHeight);
      this.drawSeries(ctx, plan, this.y3_axis, minY, maxY, "rgba(0, 192, 192, 1.0)", padLeft, padTop, plotWidth, plotHeight);
    },
    dataUpdateRt() {
      if (!this.alive || !this.isEnabled) {
        return;
      }

      const samples = explain.modelData || [];
      for (let i = 0; i < samples.length; i++) {
        const sample = samples[i];
        const value1 = sample?.[this.selectedPath];
        const value2 = sample?.[this.selectedPath2];
        const value3 = sample?.[this.selectedPath3];
        const hasValue1 = Number.isFinite(value1);
        const hasValue2 = Number.isFinite(value2);
        const hasValue3 = Number.isFinite(value3);

        if (!hasValue1 && !hasValue2 && !hasValue3) {
          continue;
        }

        const t = Number(sample?.time);
        if (Number.isFinite(t)) {
          this.seconds = t;
        }

        this.y_axis.push(hasValue1 ? value1 : null);
        this.y2_axis.push(hasValue2 ? value2 : null);
        this.y3_axis.push(hasValue3 ? value3 : null);
        this.x_axis.push(this.seconds);
        this.seconds += 0.005;
      }

      this.applyRtWindowLimit();

      if (!this.shouldRedrawChart()) {
        return;
      }
      if (this.showStats) {
        this.updateStatistics();
      }
      this.drawCanvas();
    },
    handleRtf() {
      this.dataUpdateRt();
    },
  },
  mounted() {
    this.applyDefaultAxisConfig();
    this.processAvailableModels();
    if (!this.applyExternalModelProperties()) {
      this.syncPresetSelection();
      this.selectProp();
      this.selectProp2();
      this.selectProp3();
    }
    this.$bus.on("state", this.processAvailableModels);
    this.$bus.on("rtf", this.handleRtf);
    this.$nextTick(() => {
      this.drawCanvas();
    });
  },
  beforeUnmount() {
    this.$bus.off("state", this.processAvailableModels);
    this.$bus.off("rtf", this.handleRtf);
  },
};
</script>

<style scoped>
.aa-canvas-wrap {
  position: relative;
}

.aa-series-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2px 4px 2px;
}

.aa-series-label {
  line-height: 1.2;
}

.aa-series-label-red {
  color: #ff6b6b;
}

.aa-series-label-green {
  color: #60d060;
}

.aa-series-label-blue {
  color: #59d3ff;
}

.aa-pressure-canvas {
  width: 100%;
  display: block;
}

.aa-select :deep(.q-field__native),
.aa-select :deep(.q-field__input),
.aa-select :deep(.q-field__label) {
  font-size: 12px;
}

.aa-time-input {
  min-width: 70px;
}

.aa-y-input {
  max-width: 90px;
}

.aa-axis-input-compact.aa-time-input {
  min-width: 56px;
}

.aa-axis-input-compact.aa-y-input {
  max-width: 72px;
}

.aa-axis-input-compact :deep(.q-field__native),
.aa-axis-input-compact :deep(.q-field__input),
.aa-axis-input-compact :deep(.q-field__label) {
  font-size: 11px;
}

.aa-stats-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.aa-stats-row {
  line-height: 1.2;
}

.aa-stats-row-red {
  color: #ff6b6b;
}

.aa-stats-row-green {
  color: #60d060;
}

.aa-stats-row-blue {
  color: #59d3ff;
}
</style>
