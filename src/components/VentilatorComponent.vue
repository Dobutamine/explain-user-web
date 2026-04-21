<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-xs" bordered dark flat>
    <div class="q-mt-es row gutter text-overline justify-center" @click="isEnabled = !isEnabled">
      {{ title }}
    </div>
    <!-- chart -->
    <div>
    <div v-if="isEnabled" class="q-mt-xs text-overline justify-center q-gutter-xs row">
        <div v-if="ventilator_running">
          <q-btn-toggle class="q-ml-sm" v-model="show_loops" color="grey-9" size="xs" text-color="white"
            toggle-color="primary" :options="[
              { label: 'CURVES', value: false },
              { label: 'LOOPS', value: true },
            ]" />
        </div>
        <div v-if="ventilator_running && !show_loops">
          <q-btn-toggle class="q-ml-sm" v-model="curve_param" color="grey-9" size="xs" text-color="white"
            toggle-color="primary" :options="[
              { label: 'PRES', value: 'pres' },
              { label: 'FLOW', value: 'flow' },
              { label: 'VOL', value: 'vol' },
            ]" />
        </div>
        <div v-if="ventilator_running && show_loops">
          <q-btn-toggle class="q-ml-sm" v-model="loop_preset" color="grey-9" size="xs" text-color="white"
            toggle-color="primary" :options="[
              { label: 'PV', value: 'PV LOOP' },
              { label: 'VF', value: 'VF LOOP' },
              { label: 'SPONT', value: 'PV SPONT' },
            ]" />
        </div>
    </div>

      <RealtimeChart v-if="isEnabled && !show_loops && ventilator_running"
        :alive="alive && !show_loops"
        :model-properties="realtimeModelProperties"
        :default-autoscale="true"
        :show-controls="true" />

    </div>

    <LoopChart v-if="isEnabled && show_loops && ventilator_running"
      :alive="alive && show_loops"
      :model-properties="loopModelProperties"
      :default-autoscale="true" />

    <div v-if="isEnabled" class="q-mt-xs text-overline justify-center q-gutter-xs row">
        <div>
            <q-toggle class="q-ml-sm q-mr-sm" v-model="ventilator_running" left-label dense size="xs"
              @update:model-value="toggleVentilator">
              <q-icon name="fa-solid fa-power-off" size="xs"></q-icon>
              <q-tooltip>Ventilator on/off</q-tooltip>
            </q-toggle>
        </div>
        <div>
          <q-toggle v-model="spont_breathing" class="q-ml-sm q-mr-sm" left-label size="xs" dense
              @update:model-value="toggle_spont_breathing">
              <q-icon name="fa-solid fa-lungs" size="xs"></q-icon>
              <q-tooltip>Spontaneous breathing on/off</q-tooltip>
          </q-toggle>
        </div>
      </div>
      <div v-if="isEnabled" class="q-mt-xs text-overline justify-center q-gutter-xs row">
        <div v-if="ventilator_running">
          <q-btn-toggle v-model="mode" color="grey-9" size="xs" text-color="white" toggle-color="primary" :options="[
            { label: 'PC', value: 'PC' },
            { label: 'PRVC', value: 'PRVC' },
            { label: 'PSV', value: 'PSV' },
          ]" @update:model-value="update_ventilator_setttings" />
        </div>
      </div>


    <!-- ventilator controls -->
    <div v-if="isEnabled && ventilator_running" class="text-overline justify-center q-gutter-sm row">
      <div  class="q-mr-sm text-center">
        <div>{{ pip_caption }}</div>
        <q-knob show-value font-size="12px" v-model="pip_cmh2o" size="50px" :min="0" :max="50" :step="1"
          :thickness="0.22" color="teal" track-color="grey-3" class="col"
          @update:model-value="update_ventilator_setttings">
          {{ pip_cmh2o }}
        </q-knob>
        <div :style="{ fontSize: '10px' }">cmh2o</div>
      </div>
      <div  class="q-mr-sm text-center">
        <div>peep</div>
        <q-knob show-value font-size="12px" v-model="peep_cmh2o" size="50px" :min="0" :max="20" :step="1"
          :thickness="0.22" color="teal" track-color="grey-3" class="col"
          @update:model-value="update_ventilator_setttings">
          {{ peep_cmh2o }}
        </q-knob>
        <div :style="{ fontSize: '10px' }">cmH2O</div>
      </div>
      <div  class="q-mr-sm text-center">
        <div class="knob-label">flow</div>
        <q-knob show-value font-size="12px" v-model="insp_flow" size="50px" :thickness="0.22" :min="0" :max="20"
          :step="1" color="teal" track-color="grey-3" class="col" @update:model-value="update_ventilator_setttings">
          {{ insp_flow }}
        </q-knob>
        <div :style="{ fontSize: '10px' }">l/min</div>
      </div>
      <div  class="q-mr-sm text-center">
        <div class="knob-label">t insp</div>
        <q-knob show-value font-size="12px" v-model="insp_time" size="50px" :min="0.1" :max="2.0" :step="0.05"
          :thickness="0.22" color="teal" track-color="grey-3" class="col"
          @update:model-value="update_ventilator_setttings">
          {{ insp_time }}
        </q-knob>
        <div :style="{ fontSize: '10px' }">sec</div>
      </div>
      </div>
      <div v-if="isEnabled && ventilator_running" class="text-overline justify-center q-gutter-sm row">
        <div  class="q-mr-sm text-center">
        <div class="knob-label">freq</div>
        <q-knob show-value font-size="12px" v-model="freq" :min="0" :max="70" :step="1" size="50px" :thickness="0.22"
          color="teal" track-color="grey-3" class="col" @update:model-value="update_ventilator_setttings">
          {{ freq }}
        </q-knob>
        <div :style="{ fontSize: '10px' }">/min</div>
      </div>

      <div v-if="(mode == 'PRVC' || mode == 'VC')" class="q-mr-sm text-center">
        <div class="knob-label">tv</div>
        <q-knob show-value font-size="12px" v-model="tidal_volume" size="50px" :thickness="0.22" :min="1" :max="50"
          :step="1" color="teal" track-color="grey-3" class="col" @update:model-value="update_ventilator_setttings">
          {{ tidal_volume }}
        </q-knob>
        <div :style="{ fontSize: '10px' }">ml</div>
      </div>
      <div class="q-mr-sm text-center">
        <div class="knob-label">fio2</div>
        <q-knob show-value font-size="12px" v-model="fio2" size="50px" :thickness="0.22" :min="21" :max="100" :step="1"
          color="teal" track-color="grey-3" class="col" @update:model-value="set_fio2">
          {{ fio2 }}
        </q-knob>
        <div :style="{ fontSize: '10px' }">%</div>
      </div>
      <!-- <div  class="q-mr-sm text-center">
        <div class="knob-label">trigger</div>
        <q-knob show-value font-size="12px" v-model="trigger_perc" size="50px" :thickness="0.22" :min="1" :max="50"
          :step="1" color="teal" track-color="grey-3" class="col" @update:model-value="set_trigger">
          {{ trigger_perc }}
        </q-knob>
        <div :style="{ fontSize: '10px' }">%</div>
      </div> -->
    </div>

    <div v-if="isEnabled && ventilator_running" class="q-mt-md q-mb-md text-overline justify-center q-gutter-xs row">
      <q-input v-model="et_tube_diameter" @update:model-value="set_ettube_diameter" color="blue" hide-hint filled
        label="et tube diameter (mm)" :min="2.0" :max="5.0" :step="0.5" dense stack-label type="number"
        style="font-size: 14px; width: 120px;" class="q-mr-sm text-center" squared>

      </q-input>
      <q-input v-model="et_tube_length" @update:model-value="set_ettube_length" color="blue" hide-hint filled
        label="et tube length (mm)" :min="50" :max="110" :step="5" dense stack-label type="number"
        style="font-size: 14px; width: 120px;" class="q-mr-sm text-center" squared>
      </q-input>
      <q-input v-model="temp" @update:model-value="set_temp" color="blue" hide-hint filled label="temperature (C)"
        :min="0" :max="60" :step="0.1" dense stack-label type="number" style="font-size: 14px; width: 120px;"
        class="q-mr-sm text-center" squared>
      </q-input>
      <q-input v-model="humidity" @update:model-value="set_humidity" color="blue" hide-hint filled label="humidity (%)"
        :min="0" :max="100" :step="1" dense stack-label type="number" style="font-size: 14px; width: 120px;"
        class="q-mr-sm text-center" squared>
      </q-input>
    </div>

  </q-card>
</template>

<script>
import { useStateStore } from "src/stores/state";
import { useModelStore } from "src/stores/model";
import { explain } from "../boot/explain";
import RealtimeChart from "./RealtimeChart.vue";
import LoopChart from "./LoopChart.vue";

export default {
  setup() {
    const state = useStateStore()
    const modelStore = useModelStore()

    return {
      state,
      modelStore,
    }
  },
  props: {
    alive: Boolean,
    collapsed: Boolean
  },
  components: {
    RealtimeChart,
    LoopChart
  },
  computed: {
    realtimeModelProperties() {
      return [`Ventilator.${this.curve_param}`]
    },
    loopModelProperties() {
      const presets = {
        "PV LOOP": ["Ventilator.pres", "Ventilator.vol"],
        "VF LOOP": ["Ventilator.vol", "Ventilator.flow"],
        "PV SPONT": ["THORAX.pres", "THORAX.vol"]
      }
      return presets[this.loop_preset] || presets["PV LOOP"]
    }
  },
  data() {
    return {
      ventilator_running: false,
      spont_breathing: true,
      show_loops: false,
      isEnabled: true,
      et_tube_diameter: 3.5,
      et_tube_length: 110,
      pip_caption: "pip",
      pip_cmh2o: 14.0,
      peep_cmh2o: 4.0,
      freq: 40,
      insp_time: 0.4,
      insp_flow: 8.0,
      tidal_volume: 15,
      fio2: 21,
      temp: 37.0,
      humidity: 100,
      trigger_perc: 6.0,
      mode: "PC",
      title: "MECHANICAL VENTILATOR",
      update_model: true,
      curve_param: "pres",
      loop_preset: "PV LOOP"
    };
  },
  methods: {
    toggleVentilator() {
      explain.callModelFunction("Ventilator.switch_ventilator", [this.ventilator_running])
    },
    toggle_spont_breathing() {
      if (this.update_model) {
        explain.callModelFunction("Breathing.switch_breathing", [this.spont_breathing])
      }
    },
    set_ettube_diameter() {
      if (this.update_model) {
        if (this.et_tube_diameter >= 1.5 && this.et_tube_diameter < 10.0) {
          explain.callModelFunction("Ventilator.set_ettube_diameter", [this.et_tube_diameter])
        }
      }
    },
    set_ettube_length() {
      if (this.update_model) {
        if (this.et_tube_length >= 50 && this.et_tube_length < 300) {
          explain.callModelFunction("Ventilator.set_ettube_length", [this.et_tube_length])
        }
      }
    },
    set_trigger() {
      if (this.update_model) {
        explain.callModelFunction("Ventilator.set_trigger_perc", [parseFloat[this.trigger_perc]])
      }
    },
    set_fio2() {
      if (this.update_model) {
        explain.callModelFunction("Ventilator.set_fio2", [parseFloat(this.fio2)])
      }
    },
    set_temp() {
      if (this.update_model) {
        explain.callModelFunction("Ventilator.set_temp", [parseFloat(this.temp)])
      }
    },
    set_humidity() {
      if (this.update_model) {
        explain.callModelFunction("Ventilator.set_humidity", [parseFloat(this.humidity / 100.0)])
      }
    },
    update_ventilator_setttings() {
      if (this.update_model) {

        switch (this.mode) {
          case "PC":
            if (!this.ventilator_running) {
              this.ventilator_running = true;
              explain.callModelFunction("Ventilator.switch_ventilator", [true])
            }
            if (this.ventilator_running) {
              explain.callModelFunction("Ventilator.set_pc", [this.pip_cmh2o, this.peep_cmh2o, this.freq, this.insp_time, this.insp_flow])
            }
            break;
          case "PRVC":
            if (!this.ventilator_running) {
              this.ventilator_running = true;
              explain.callModelFunction("Ventilator.switch_ventilator", [true])
            }
            if (this.ventilator_running) {
              this.pip_caption = "pip max"
              explain.callModelFunction("Ventilator.set_prvc", [this.pip_cmh2o, this.peep_cmh2o, this.freq, this.tidal_volume, this.insp_time, this.insp_flow])
            }
            this.spont_breathing = false
            this.toggle_spont_breathing()
            break;
          case "PSV":
            if (!this.ventilator_running) {
              this.ventilator_running = true;
              explain.callModelFunction("Ventilator.switch_ventilator", [true])
            }
            if (this.ventilator_running) {
              explain.callModelFunction("Ventilator.set_psv", [this.pip_cmh2o, this.peep_cmh2o, this.freq, this.insp_time, this.insp_flow])
            }
            break;
          case "VC":

            if (!this.ventilator_running) {
              this.ventilator_running = true;
              explain.callModelFunction("Ventilator.switch_ventilator", [true])
            }
            if (this.ventilator_running) {
              this.pip_caption = "pip max"
              explain.callModelFunction("Ventilator.set_vc", [this.pip_cmh2o, this.peep_cmh2o, this.freq, this.tidal_volume, this.insp_time, this.insp_flow])
            }
            this.spont_breathing = false
            this.toggle_spont_breathing()
            break;

        }
      }
    },
    switch_vent() {
      if (this.update_model) {
        explain.callModelFunction("Ventilator.switch_ventilator", [true])
      }
    },
    processModelState() {
      if (explain.modelState.models) {
        this.ventilator_running = explain.modelState.models["Ventilator"].is_enabled
        if (this.ventilator_running) {
          this.mode = explain.modelState.models["Ventilator"].vent_mode
          explain.watchModelProps(["Ventilator.pres", "Ventilator.flow", "Ventilator.vol", "Ventilator.co2", "Ventilator.etco2", "Breathing.breathing_enabled"])
        }
        this.et_tube_diameter = explain.modelState.models["Ventilator"].ettube_diameter
        this.et_tube_length = explain.modelState.models["Ventilator"].ettube_length
        this.temp = explain.modelState.models["Ventilator"].temp
        this.humidity = explain.modelState.models["Ventilator"].humidity * 100.0
        this.pip_cmh2o = explain.modelState.models["Ventilator"].pip_cmh2o_max
        this.peep_cmh2o = explain.modelState.models["Ventilator"].peep_cmh2o
        this.freq = explain.modelState.models["Ventilator"].vent_rate
        this.insp_time = explain.modelState.models["Ventilator"].insp_time
        this.insp_flow = explain.modelState.models["Ventilator"].insp_flow
        this.tidal_volume = explain.modelState.models["Ventilator"].tidal_volume * 1000.0
        this.fio2 = explain.modelState.models["Ventilator"].fio2 * 100.0
        this.trigger_perc = explain.modelState.models["Ventilator"].trigger_volume_perc
        this.spont_breathing = explain.modelState.models["Breathing"].breathing_enabled
      }
    }
  },
  beforeUnmount() {
    if (this._unwatchState) this._unwatchState()
  },
  mounted() {
    this.isEnabled = !this.collapsed

    this._unwatchState = this.$watch(
      () => this.modelStore.modelState,
      () => this.processModelState()
    )

    explain.watchModelProps([
      "Ventilator.pres",
      "Ventilator.flow",
      "Ventilator.vol",
      "Ventilator.co2",
      "Ventilator.etco2",
      "Breathing.breathing_enabled"
    ])
  },
};
</script>

<style></style>
