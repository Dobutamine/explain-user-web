<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-xs" bordered dark flat>
    <div class="q-mt-es row gutter text-overline justify-center" @click="toggleEnabled">
      {{ title }}
    </div>

    <div v-if="isEnabled && !hasExternalModelProperties" class="q-ma-sm row justify-center items-center q-gutter-sm">
      <q-select
        v-model="selectedModel"
        label="model"
        hide-hint
        dense
        dark
        filled
        style="min-width: 140px;"
        :options="modelNames"
        @update:model-value="selectModel"
      />
      <q-select
        v-if="selectedModel !== ''"
        v-model="selectedProp"
        label="property"
        hide-hint
        dense
        dark
        filled
        style="min-width: 140px;"
        :options="propNames"
        @update:model-value="selectProp"
      />
      <q-select
        v-model="selectedModel2"
        label="model 2"
        hide-hint
        dense
        dark
        filled
        style="min-width: 140px;"
        :options="modelNames"
        @update:model-value="selectModel2"
      />
      <q-select
        v-if="selectedModel2 !== ''"
        v-model="selectedProp2"
        label="property 2"
        hide-hint
        dense
        dark
        filled
        style="min-width: 140px;"
        :options="prop2Names"
        @update:model-value="selectProp2"
      />
    </div>

    <div v-if="isEnabled" class="q-px-sm q-pb-sm aa-canvas-wrap">
      <div class="aa-series-labels text-caption">
        <span class="aa-series-label aa-series-label-red">{{ selectedPath || "-" }}</span>
        <span class="aa-series-label aa-series-label-green"> {{ selectedPath2 || "-" }}</span>
      </div>
      <canvas ref="aaCanvas" class="aa-pressure-canvas" />

      <div class="q-mt-sm row justify-center items-center q-gutter-sm">
        <q-checkbox v-model="autoscale" dense label="autoscale" @update:model-value="toggleAutoscaling" />
        <q-input
          v-model.number="rtWindow"
          type="number"
          label="time (s)"
          filled
          dense
          min="1"
          max="30"
          hide-bottom-space
          style="min-width: 70px;"
          @update:model-value="updateRtWindow"
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
        <q-btn color="primary" size="sm" label="FFT" @click="runSeries1Fft" />
      </div>
      <div v-if="fftResult" class="q-mt-xs text-caption text-grey-4 text-center">
        {{ fftResultLabel }}
      </div>
    </div>
  </q-card>
</template>

<script>
import { explain } from "../boot/explain";

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
  },
  computed: {
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
    fftResultLabel() {
      if (!this.fftResult) {
        return "";
      }
      const hz = Number.isFinite(this.fftResult.dominantHz) ? this.fftResult.dominantHz.toFixed(3) : "-";
      const amp = Number.isFinite(this.fftResult.dominantAmplitude) ? this.fftResult.dominantAmplitude.toFixed(3) : "-";
      return `FFT(${this.selectedPath || "series 1"}): peak ${hz} Hz, amp ${amp}, n=${this.fftResult.originalSampleCount}`;
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
  },
  data() {
    return {
      title: "REALTIME CHART",
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
      selectedModel: "",
      selectedProp: "",
      selectedPath: "",
      selectedModel2: "",
      selectedProp2: "",
      selectedPath2: "",
      fftResult: null,
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

      const path1 = this.externalModelProperties[0] || "";
      const path2 = this.externalModelProperties[1] || "";

      this.selectedPath = path1;
      this.selectedPath2 = path2 && path2 !== path1 ? path2 : "";

      const parsed1 = this.parseModelPath(this.selectedPath);
      this.selectedModel = parsed1.model;
      this.selectedProp = parsed1.prop;

      const parsed2 = this.parseModelPath(this.selectedPath2);
      this.selectedModel2 = parsed2.model;
      this.selectedProp2 = parsed2.prop;

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
      this.fftResult = null;
      this.drawCanvas();
    },
    getVisibleSeries1Samples() {
      const values = [];
      const times = [];
      for (let i = this.rtWindowStartIndex; i < this.y_axis.length; i++) {
        const value = this.y_axis[i];
        const time = this.x_axis[i];
        if (Number.isFinite(value) && Number.isFinite(time)) {
          values.push(value);
          times.push(time);
        }
      }
      return { values, times };
    },
    estimateDt(times) {
      if (!Array.isArray(times) || times.length < 2) {
        return 0;
      }
      const deltas = [];
      for (let i = 1; i < times.length; i++) {
        const dt = times[i] - times[i - 1];
        if (Number.isFinite(dt) && dt > 0) {
          deltas.push(dt);
        }
      }
      if (deltas.length === 0) {
        return 0;
      }
      deltas.sort((a, b) => a - b);
      return deltas[Math.floor(deltas.length / 2)];
    },
    nextPow2(n) {
      if (n <= 1) {
        return 1;
      }
      return 2 ** Math.floor(Math.log2(n));
    },
    fftRadix2(real, imag) {
      const n = real.length;
      let j = 0;
      for (let i = 1; i < n; i++) {
        let bit = n >> 1;
        while (j & bit) {
          j ^= bit;
          bit >>= 1;
        }
        j ^= bit;
        if (i < j) {
          const tr = real[i];
          real[i] = real[j];
          real[j] = tr;
          const ti = imag[i];
          imag[i] = imag[j];
          imag[j] = ti;
        }
      }

      for (let len = 2; len <= n; len <<= 1) {
        const angle = (-2 * Math.PI) / len;
        const wLenCos = Math.cos(angle);
        const wLenSin = Math.sin(angle);
        for (let start = 0; start < n; start += len) {
          let wCos = 1;
          let wSin = 0;
          for (let offset = 0; offset < len / 2; offset++) {
            const evenIndex = start + offset;
            const oddIndex = evenIndex + len / 2;

            const oddReal = real[oddIndex] * wCos - imag[oddIndex] * wSin;
            const oddImag = real[oddIndex] * wSin + imag[oddIndex] * wCos;

            real[oddIndex] = real[evenIndex] - oddReal;
            imag[oddIndex] = imag[evenIndex] - oddImag;
            real[evenIndex] += oddReal;
            imag[evenIndex] += oddImag;

            const nextCos = wCos * wLenCos - wSin * wLenSin;
            const nextSin = wCos * wLenSin + wSin * wLenCos;
            wCos = nextCos;
            wSin = nextSin;
          }
        }
      }
    },
    runSeries1Fft() {
      const { values, times } = this.getVisibleSeries1Samples();
      if (values.length < 8) {
        this.fftResult = null;
        return;
      }

      const dt = this.estimateDt(times);
      if (!Number.isFinite(dt) || dt <= 0) {
        this.fftResult = null;
        return;
      }

      const n = this.nextPow2(values.length);
      if (n < 8) {
        this.fftResult = null;
        return;
      }

      let mean = 0;
      for (let i = values.length - n; i < values.length; i++) {
        mean += values[i];
      }
      mean /= n;

      const real = new Array(n);
      const imag = new Array(n).fill(0);
      const base = values.length - n;
      for (let i = 0; i < n; i++) {
        const hann = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));
        real[i] = (values[base + i] - mean) * hann;
      }

      this.fftRadix2(real, imag);

      const sampleRate = 1 / dt;
      const half = Math.floor(n / 2);
      let dominantIndex = 1;
      let dominantAmplitude = 0;

      for (let k = 1; k < half; k++) {
        const magnitude = Math.sqrt(real[k] * real[k] + imag[k] * imag[k]);
        if (magnitude > dominantAmplitude) {
          dominantAmplitude = magnitude;
          dominantIndex = k;
        }
      }

      this.fftResult = {
        dominantHz: (dominantIndex * sampleRate) / n,
        dominantAmplitude: dominantAmplitude / n,
        originalSampleCount: values.length,
      };
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
      this.refreshWatchedPaths();
      this.clearSeries();
    },
    selectModel2() {
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
      this.refreshWatchedPaths();
      this.clearSeries();
    },
    refreshWatchedPaths() {
      const watchedPaths = [];
      if (this.selectedPath) {
        watchedPaths.push(this.selectedPath);
      }
      if (this.selectedPath2 && this.selectedPath2 !== this.selectedPath) {
        watchedPaths.push(this.selectedPath2);
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
        const hasValue1 = Number.isFinite(value1);
        const hasValue2 = Number.isFinite(value2);

        if (!hasValue1 && !hasValue2) {
          continue;
        }

        const t = Number(sample?.time);
        if (Number.isFinite(t)) {
          this.seconds = t;
        }

        this.y_axis.push(hasValue1 ? value1 : null);
        this.y2_axis.push(hasValue2 ? value2 : null);
        this.x_axis.push(this.seconds);
        this.seconds += 0.005;
      }

      this.applyRtWindowLimit();

      if (!this.shouldRedrawChart()) {
        return;
      }
      this.drawCanvas();
    },
    handleRtf() {
      this.dataUpdateRt();
    },
  },
  mounted() {
    this.processAvailableModels();
    if (!this.applyExternalModelProperties()) {
      this.selectProp();
      this.selectProp2();
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

.aa-pressure-canvas {
  width: 100%;
  height: 260px;
  display: block;
}
</style>
