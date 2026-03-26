<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-xs" bordered dark flat>
    <div class="q-mt-es row gutter text-overline justify-center" @click="toggleEnabled">
      {{ resolvedTitle }}
    </div>

    <div v-if="isEnabled && !hasExternalModelProperties" class="q-ma-sm row justify-center items-center q-gutter-sm">
      <q-select
        class="loop-select"
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
        class="loop-select"
        v-model="selectedModelX"
        label="x model"
        hide-hint
        dense
        dark
        filled
        style="min-width: 110px;"
        :options="modelNames"
        @update:model-value="selectModelX"
      />
      <q-select
        class="loop-select"
        v-if="selectedModelX !== ''"
        v-model="selectedPropX"
        label="x property"
        hide-hint
        dense
        dark
        filled
        style="min-width: 110px;"
        :options="propNamesX"
        @update:model-value="selectPropX"
      />
      <q-select
        class="loop-select"
        v-model="selectedModelY"
        label="y model"
        hide-hint
        dense
        dark
        filled
        style="min-width: 110px;"
        :options="modelNames"
        @update:model-value="selectModelY"
      />
      <q-select
        class="loop-select"
        v-if="selectedModelY !== ''"
        v-model="selectedPropY"
        label="y property"
        hide-hint
        dense
        dark
        filled
        style="min-width: 110px;"
        :options="propNamesY"
        @update:model-value="selectPropY"
      />
    </div>

    <div v-if="isEnabled" class="q-px-sm q-pb-sm loop-canvas-wrap">
      <div class="loop-series-labels text-caption">
        <span class="loop-series-label loop-series-label-x">x: {{ selectedPathX || "-" }}</span>
        <span class="loop-series-label loop-series-label-y">y: {{ selectedPathY || "-" }}</span>
      </div>
      <canvas ref="loopCanvas" class="loop-canvas" />

      <div class="q-mt-sm row justify-center items-center q-gutter-sm">
        <q-checkbox v-model="autoscale" dense label="autoscale" @update:model-value="toggleAutoscaling" />
        <q-toggle v-if="state && state.configuration" v-model="state.configuration.chart_hires" label="hi-res" dense size="sm" @update:model-value="toggleHires" />
        <q-input
          v-if="!state || !state.configuration || !state.configuration.chart_hires"
          v-model.number="rtWindow"
          type="number"
          label="time (s)"
          filled
          dense
          min="1"
          max="30"
          hide-bottom-space
          style="min-width: 80px;"
          @update:model-value="updateRtWindow"
        />
        <q-input
          v-if="!autoscale"
          v-model.number="x_min"
          type="number"
          label="x min"
          filled
          dense
          hide-bottom-space
          style="max-width: 90px;"
          @update:model-value="updateManualScale"
        />
        <q-input
          v-if="!autoscale"
          v-model.number="x_max"
          type="number"
          label="x max"
          filled
          dense
          hide-bottom-space
          style="max-width: 90px;"
          @update:model-value="updateManualScale"
        />
        <q-input
          v-if="!autoscale"
          v-model.number="y_min"
          type="number"
          label="y min"
          filled
          dense
          hide-bottom-space
          style="max-width: 90px;"
          @update:model-value="updateManualScale"
        />
        <q-input
          v-if="!autoscale"
          v-model.number="y_max"
          type="number"
          label="y max"
          filled
          dense
          hide-bottom-space
          style="max-width: 90px;"
          @update:model-value="updateManualScale"
        />
        <q-btn color="negative" size="sm" icon="fa-solid fa-rotate-left" @click="clearSeries" />
      </div>
    </div>
  </q-card>
</template>

<script>
import { useStateStore } from "src/stores/state";
import { explain } from "../boot/explain";

const MANUAL_PRESET = "Manual";
const LOOP_PRESETS = {
  [MANUAL_PRESET]: [],
  "LV PV loop": ["LV.vol", "LV.pres"],
  "RV PV loop": ["RV.vol", "RV.pres"],
  "Left lung PV loop": ["DS.pres", "ALL.vol"],
  "Right lung PV loop": ["DS.pres", "ALR.vol"],
};

export default {
  name: "LoopChart",
  setup() {
    const state = useStateStore();
    return { state };
  },
  props: {
    alive: {
      type: Boolean,
      default: true,
    },
    modelProperties: {
      type: Array,
      default: () => [],
    },
    chartTitle: {
      type: String,
      default: "",
    },
    defaultAutoscale: {
      type: Boolean,
      default: true,
    },
    defaultRtWindow: {
      type: Number,
      default: 3,
    },
    defaultXMin: {
      type: Number,
      default: 0,
    },
    defaultXMax: {
      type: Number,
      default: 100,
    },
    defaultYMin: {
      type: Number,
      default: 0,
    },
    defaultYMax: {
      type: Number,
      default: 100,
    },
  },
  computed: {
    resolvedTitle() {
      if (typeof this.chartTitle === "string" && this.chartTitle.trim() !== "") {
        return this.chartTitle;
      }
      return this.title;
    },
    presetNames() {
      return Object.keys(LOOP_PRESETS);
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
  },
  watch: {
    defaultAutoscale: {
      handler(value) {
        if (typeof value === "boolean") {
          this.autoscale = value;
          this.drawCanvas();
        }
      },
      immediate: true,
    },
    defaultRtWindow: {
      handler(value) {
        if (Number.isFinite(value)) {
          this.rtWindow = value;
          this.updateRtWindow();
        }
      },
      immediate: true,
    },
    defaultXMin: {
      handler(value) {
        if (Number.isFinite(value)) {
          this.x_min = value;
          if (!this.autoscale) {
            this.drawCanvas();
          }
        }
      },
      immediate: true,
    },
    defaultXMax: {
      handler(value) {
        if (Number.isFinite(value)) {
          this.x_max = value;
          if (!this.autoscale) {
            this.drawCanvas();
          }
        }
      },
      immediate: true,
    },
    defaultYMin: {
      handler(value) {
        if (Number.isFinite(value)) {
          this.y_min = value;
          if (!this.autoscale) {
            this.drawCanvas();
          }
        }
      },
      immediate: true,
    },
    defaultYMax: {
      handler(value) {
        if (Number.isFinite(value)) {
          this.y_max = value;
          if (!this.autoscale) {
            this.drawCanvas();
          }
        }
      },
      immediate: true,
    },
    modelProperties: {
      handler() {
        if (this.applyExternalModelProperties()) {
          this.clearSeries();
        }
      },
      deep: true,
    },
  },
  data() {
    return {
      title: "LOOP CHART",
      isEnabled: true,
      rtWindow: 3,
      rtWindowValidated: 3,
      autoscale: true,
      x_min: 0,
      x_max: 100,
      y_min: 0,
      y_max: 100,
      t_axis: [],
      x_axis: [],
      y_axis: [],
      rtWindowStartIndex: 0,
      rtWindowSamplesPerSecond: 200,
      rtCompactionThreshold: 4000,
      redrawMinIntervalMs: 1000 / 50,
      redrawLastTs: 0,
      redrawPointsPerPixel: 1.5,
      redrawMinPoints: 250,
      redrawMaxPoints: 1000,
      selectedPreset: MANUAL_PRESET,
      modelNames: [""],
      propNamesX: [""],
      propNamesY: [""],
      selectedModelX: "",
      selectedPropX: "",
      selectedPathX: "",
      selectedModelY: "",
      selectedPropY: "",
      selectedPathY: "",
    };
  },
  methods: {
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

      const xPath = this.externalModelProperties[0] || "";
      const yPath = this.externalModelProperties[1] || "";

      this.selectedPathX = xPath;
      this.selectedPathY = yPath && yPath !== xPath ? yPath : "";

      const parsedX = this.parseModelPath(this.selectedPathX);
      this.selectedModelX = parsedX.model;
      this.selectedPropX = parsedX.prop;

      const parsedY = this.parseModelPath(this.selectedPathY);
      this.selectedModelY = parsedY.model;
      this.selectedPropY = parsedY.prop;

      this.refreshWatchedPaths();
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
    shouldRedraw() {
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
          this.x_min = range.minX;
          this.x_max = range.maxX;
          this.y_min = range.minY;
          this.y_max = range.maxY;
          if (this.x_min === this.x_max) {
            this.x_min -= 1;
            this.x_max += 1;
          }
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
      if (!Number.isFinite(this.x_min)) {
        this.x_min = 0;
      }
      if (!Number.isFinite(this.x_max)) {
        this.x_max = this.x_min + 1;
      }
      if (!Number.isFinite(this.y_min)) {
        this.y_min = 0;
      }
      if (!Number.isFinite(this.y_max)) {
        this.y_max = this.y_min + 1;
      }
      if (this.x_min >= this.x_max) {
        this.x_max = this.x_min + 1;
      }
      if (this.y_min >= this.y_max) {
        this.y_max = this.y_min + 1;
      }
      this.drawCanvas();
    },
    toggleHires() {
      if (!this.state || !this.state.configuration) {
        return;
      }
      if (this.state.configuration.chart_hires) {
        this.rtWindow = 1.0;
        explain.setSampleInterval(0.0015);
      } else {
        this.rtWindow = 3.0;
        explain.setSampleInterval(0.005);
      }
      this.updateRtWindow();
    },
    clearSeries() {
      this.rtWindowStartIndex = 0;
      this.t_axis = [];
      this.x_axis = [];
      this.y_axis = [];
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

      if (this.selectedModelX && !this.modelNames.includes(this.selectedModelX)) {
        this.selectedModelX = "";
        this.selectedPropX = "";
        this.selectedPathX = "";
        this.propNamesX = [""];
      }
      if (this.selectedModelY && !this.modelNames.includes(this.selectedModelY)) {
        this.selectedModelY = "";
        this.selectedPropY = "";
        this.selectedPathY = "";
        this.propNamesY = [""];
      }

      if (this.selectedModelX) {
        this.propNamesX = this.getNumericPropsForModel(this.selectedModelX);
        if (this.selectedPropX && !this.propNamesX.includes(this.selectedPropX)) {
          this.selectedPropX = "";
          this.selectedPathX = "";
        }
      }
      if (this.selectedModelY) {
        this.propNamesY = this.getNumericPropsForModel(this.selectedModelY);
        if (this.selectedPropY && !this.propNamesY.includes(this.selectedPropY)) {
          this.selectedPropY = "";
          this.selectedPathY = "";
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
      const pathX = paths[0] || "";
      const pathY = paths[1] || "";

      this.selectedPathX = pathX;
      this.selectedPathY = pathY && pathY !== pathX ? pathY : "";

      const parsedX = this.parseModelPath(this.selectedPathX);
      this.selectedModelX = parsedX.model;
      this.selectedPropX = parsedX.prop;
      this.propNamesX = this.selectedModelX
        ? this.ensureOptionInList(this.getNumericPropsForModel(this.selectedModelX), this.selectedPropX)
        : [""];

      const parsedY = this.parseModelPath(this.selectedPathY);
      this.selectedModelY = parsedY.model;
      this.selectedPropY = parsedY.prop;
      this.propNamesY = this.selectedModelY
        ? this.ensureOptionInList(this.getNumericPropsForModel(this.selectedModelY), this.selectedPropY)
        : [""];

      this.refreshWatchedPaths();
    },
    syncPresetSelection() {
      const selectedPaths = [this.selectedPathX, this.selectedPathY].filter((entry) => entry);
      const presetNames = Object.keys(LOOP_PRESETS);
      for (let i = 0; i < presetNames.length; i++) {
        const presetName = presetNames[i];
        const presetPaths = LOOP_PRESETS[presetName];
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

      this.applyPathSelections(LOOP_PRESETS[this.selectedPreset] || []);
      explain.getModelState();
      this.clearSeries();
    },
    selectModelX() {
      this.selectedPreset = MANUAL_PRESET;
      this.selectedPropX = "";
      this.selectedPathX = "";
      this.propNamesX = this.getNumericPropsForModel(this.selectedModelX);
      this.refreshWatchedPaths();
      this.clearSeries();
    },
    selectPropX() {
      if (this.selectedModelX && this.selectedPropX) {
        this.selectedPathX = `${this.selectedModelX}.${this.selectedPropX}`;
      } else {
        this.selectedPathX = "";
      }
      this.syncPresetSelection();
      this.refreshWatchedPaths();
      this.clearSeries();
    },
    selectModelY() {
      this.selectedPreset = MANUAL_PRESET;
      this.selectedPropY = "";
      this.selectedPathY = "";
      this.propNamesY = this.getNumericPropsForModel(this.selectedModelY);
      this.refreshWatchedPaths();
      this.clearSeries();
    },
    selectPropY() {
      if (this.selectedModelY && this.selectedPropY) {
        this.selectedPathY = `${this.selectedModelY}.${this.selectedPropY}`;
      } else {
        this.selectedPathY = "";
      }
      this.syncPresetSelection();
      this.refreshWatchedPaths();
      this.clearSeries();
    },
    refreshWatchedPaths() {
      const watchedPaths = [];
      if (this.selectedPathX) {
        watchedPaths.push(this.selectedPathX);
      }
      if (this.selectedPathY && this.selectedPathY !== this.selectedPathX) {
        watchedPaths.push(this.selectedPathY);
      }
      if (watchedPaths.length > 0) {
        explain.watchModelProps(watchedPaths);
      }
    },
    applyRtWindowLimit() {
      const maxPoints = Math.max(1, Math.floor(this.rtWindowValidated * this.rtWindowSamplesPerSecond));
      const visibleLength = this.t_axis.length - this.rtWindowStartIndex;
      if (visibleLength > maxPoints) {
        this.rtWindowStartIndex += visibleLength - maxPoints;
      }

      if (this.rtWindowStartIndex >= this.rtCompactionThreshold) {
        this.t_axis = this.t_axis.slice(this.rtWindowStartIndex);
        this.x_axis = this.x_axis.slice(this.rtWindowStartIndex);
        this.y_axis = this.y_axis.slice(this.rtWindowStartIndex);
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
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      for (let i = this.rtWindowStartIndex; i < this.x_axis.length; i++) {
        const x = this.x_axis[i];
        const y = this.y_axis[i];
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          continue;
        }
        if (x < minX) {
          minX = x;
        }
        if (x > maxX) {
          maxX = x;
        }
        if (y < minY) {
          minY = y;
        }
        if (y > maxY) {
          maxY = y;
        }
      }

      if (!Number.isFinite(minX) || !Number.isFinite(maxX) || !Number.isFinite(minY) || !Number.isFinite(maxY)) {
        return null;
      }
      return { minX, maxX, minY, maxY };
    },
    formatAxisTick(value, min, max) {
      const range = Math.abs(max - min);
      if (range >= 100) {
        return value.toFixed(0);
      }
      if (range >= 10) {
        return value.toFixed(1);
      }
      return value.toFixed(2);
    },
    drawCanvas() {
      const canvas = this.$refs.loopCanvas;
      if (!canvas) {
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width || 600));
      const height = Math.max(1, Math.floor(rect.height || 260));
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

      let minX = this.x_min;
      let maxX = this.x_max;
      let minY = this.y_min;
      let maxY = this.y_max;

      if (this.autoscale) {
        const range = this.getCurrentDataRange();
        if (!range) {
          return;
        }
        minX = range.minX;
        maxX = range.maxX;
        minY = range.minY;
        maxY = range.maxY;
        if (minX === maxX) {
          minX -= 1;
          maxX += 1;
        }
        if (minY === maxY) {
          minY -= 1;
          maxY += 1;
        }
      } else if (!Number.isFinite(minX) || !Number.isFinite(maxX) || !Number.isFinite(minY) || !Number.isFinite(maxY) || minX >= maxX || minY >= maxY) {
        return;
      }

      const padLeft = 52;
      const padRight = 10;
      const padTop = 8;
      const padBottom = 28;
      const plotWidth = Math.max(1, width - padLeft - padRight);
      const plotHeight = Math.max(1, height - padTop - padBottom);

      const xTicks = 5;
      const yTicks = 5;

      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < yTicks; i++) {
        const y = padTop + (plotHeight * i) / (yTicks - 1);
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + plotWidth, y);
      }
      for (let i = 0; i < xTicks; i++) {
        const x = padLeft + (plotWidth * i) / (xTicks - 1);
        ctx.moveTo(x, padTop);
        ctx.lineTo(x, padTop + plotHeight);
      }
      ctx.stroke();

      ctx.strokeStyle = "#5a5a5a";
      ctx.beginPath();
      ctx.moveTo(padLeft, padTop);
      ctx.lineTo(padLeft, padTop + plotHeight);
      ctx.lineTo(padLeft + plotWidth, padTop + plotHeight);
      ctx.stroke();

      ctx.fillStyle = "#a0a0a0";
      ctx.font = "11px sans-serif";

      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let i = 0; i < yTicks; i++) {
        const ratio = 1 - i / (yTicks - 1);
        const y = padTop + (plotHeight * i) / (yTicks - 1);
        const tickValue = minY + (maxY - minY) * ratio;
        ctx.fillText(this.formatAxisTick(tickValue, minY, maxY), padLeft - 6, y);
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (let i = 0; i < xTicks; i++) {
        const ratio = i / (xTicks - 1);
        const x = padLeft + (plotWidth * i) / (xTicks - 1);
        const tickValue = minX + (maxX - minX) * ratio;
        ctx.fillText(this.formatAxisTick(tickValue, minX, maxX), x, padTop + plotHeight + 6);
      }

      ctx.strokeStyle = "rgba(255, 107, 107, 1.0)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let sourceIndex = plan.startIndex;
      let drawing = false;
      for (let i = 0; i < plan.outLength; i++) {
        const xValue = this.x_axis[sourceIndex];
        const yValue = this.y_axis[sourceIndex];
        if (Number.isFinite(xValue) && Number.isFinite(yValue)) {
          const xNorm = (xValue - minX) / (maxX - minX);
          const yNorm = (yValue - minY) / (maxY - minY);
          const px = padLeft + plotWidth * xNorm;
          const py = padTop + plotHeight * (1 - yNorm);
          if (!drawing) {
            ctx.moveTo(px, py);
            drawing = true;
          } else {
            ctx.lineTo(px, py);
          }
        } else {
          drawing = false;
        }
        sourceIndex += plan.step;
      }
      ctx.stroke();
    },
    dataUpdateRt() {
      if (!this.alive || !this.isEnabled) {
        return;
      }

      const samples = explain.modelData || [];
      for (let i = 0; i < samples.length; i++) {
        const sample = samples[i];
        const xValue = sample?.[this.selectedPathX];
        const yValue = sample?.[this.selectedPathY];

        if (!Number.isFinite(xValue) || !Number.isFinite(yValue)) {
          continue;
        }

        const t = Number(sample?.time);
        if (!Number.isFinite(t)) {
          continue;
        }

        this.t_axis.push(t);
        this.x_axis.push(xValue);
        this.y_axis.push(yValue);
      }

      this.applyRtWindowLimit();

      if (!this.shouldRedraw()) {
        return;
      }
      this.drawCanvas();
    },
    handleRtf() {
      this.dataUpdateRt();
    },
    onModelReady() {
      this.processAvailableModels();
      this.refreshWatchedPaths();
      this.clearSeries();
    },
  },
  mounted() {
    this.autoscale = this.defaultAutoscale;
    this.rtWindow = this.defaultRtWindow;
    this.updateRtWindow();
    this.x_min = this.defaultXMin;
    this.x_max = this.defaultXMax;
    this.y_min = this.defaultYMin;
    this.y_max = this.defaultYMax;

    this.processAvailableModels();
    if (!this.applyExternalModelProperties()) {
      this.syncPresetSelection();
      this.selectPropX();
      this.selectPropY();
    }
    this.$bus.on("state", this.processAvailableModels);
    this.$bus.on("model_ready", this.onModelReady);
    this.$bus.on("rtf", this.handleRtf);
    this.$nextTick(() => {
      this.drawCanvas();
    });
  },
  beforeUnmount() {
    this.$bus.off("state", this.processAvailableModels);
    this.$bus.off("model_ready", this.onModelReady);
    this.$bus.off("rtf", this.handleRtf);
  },
};
</script>

<style scoped>
.loop-canvas-wrap {
  position: relative;
}

.loop-series-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2px 4px 2px;
}

.loop-series-label {
  line-height: 1.2;
}

.loop-series-label-x {
  color: #ff6b6b;
}

.loop-series-label-y {
  color: #60d060;
}

.loop-canvas {
  width: 100%;
  height: 280px;
  display: block;
}

.loop-select :deep(.q-field__native),
.loop-select :deep(.q-field__input),
.loop-select :deep(.q-field__label) {
  font-size: 12px;
}
</style>
