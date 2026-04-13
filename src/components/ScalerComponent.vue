<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-xs" bordered dark flat>
    <div class="q-mt-xs row gutter text-overline justify-center" @click="isEnabled = !isEnabled">
      {{ title }}
    </div>



    <div v-if="isEnabled">
      <!-- SCALING PREPARATION -->
      <q-separator class="q-mt-xs" />
      <div class="text-overline text-center q-mt-sm">SCALING PREPARATION</div>
      <div class="q-px-sm q-mt-sm">
        <q-toggle  v-model="baroreflex_on" label="baroreflex MAP (ANS)" dense
          color="primary" @update:model-value="toggleBaroreflex" />
        <q-toggle class="q-mt-sm" v-model="metabolism_on" label="metabolism (VO2)" dense
          color="primary" @update:model-value="toggleMetabolism" />
        <q-toggle class="q-mt-sm" v-model="mob_on" label="mob (myocardial O2 balance)" dense
          color="primary" @update:model-value="toggleMob" />
        <q-toggle class="q-mt-sm" v-model="gasex_on" label="gas exchange (LL + RL)" dense
          color="primary" @update:model-value="toggleGasExchange" />
        <q-toggle class="q-mt-sm" v-model="breathing_on" label="spontaneous breathing" dense
          color="primary" @update:model-value="toggleBreathing" />
        <q-toggle class="q-mt-sm" v-model="hr_override_on" label="heart rate override" dense
          color="primary" @update:model-value="toggleHrOverride" />

      </div>

      <!-- TARGET WEIGHT -->
      <div class="text-overline text-center q-mt-sm">TARGET WEIGHT</div>
      <div class="text-overline justify-center items-center q-gutter-xs row q-mt-xs">
        <q-input v-model.number="target_weight" color="green" hide-hint filled
          label="kg" dense stack-label type="number" :step="0.1"
          style="font-size: 14px; width: 80px;" class="text-center" squared/>
        <q-btn label="APPLY" color="green" size="sm" dense @click="applyTargetWeight" style="width: 70px;" />
      </div>
            <!-- calculated weight -->
      <div class="text-overline text-center q-mt-sm">
        current weight: {{ calculated_weight.toFixed(3) }} kg
      </div>
                <div class="text-overline justify-center q-gutter-sm row q-mt-sm q-mb-md">
        <q-btn
          label="RESET FACTORS"
          color="grey-7"
          size="sm"
          dense
          @click="resetAll"
        />
      </div>

      <!-- heart rate -->
      <q-separator class="q-mt-md" />
      <div class="text-overline text-center q-mt-md">HEARTRATE REFERENCE</div>
      <div class="text-overline justify-center q-gutter-xs row q-mt-xs">
        <q-input v-model.number="heart_rate_ref" @update:model-value="applyHeartRate" color="red" hide-hint filled
          label="heart rate ref (bpm)" dense stack-label type="number" :step="1"
          style="font-size: 14px; width: 160px;" class="text-center" squared />
      </div>

      <!-- BLOOD -->
      <q-separator class="q-mt-md" />
      <div class="text-overline text-center q-mt-sm">BLOOD VESSELS</div>
      <div class="text-overline justify-center q-gutter-sm row q-mt-xs">
        <div class="q-mr-sm text-center">
          <div>volume</div>
          <q-knob
            show-value font-size="12px"
            v-model="blood_vol" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="teal" track-color="grey-3"
            @update:model-value="apply('blood_volume', blood_vol)"
          >{{ blood_vol.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>stiffness</div>
          <q-knob
            show-value font-size="12px"
            v-model="blood_el" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="teal" track-color="grey-3"
            @update:model-value="apply('blood_elastances', blood_el)"
          >{{ blood_el.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>resistance</div>
          <q-knob
            show-value font-size="12px"
            v-model="blood_res" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="teal" track-color="grey-3"
            @update:model-value="apply('blood_resistances', blood_res)"
          >{{ blood_res.toFixed(2) }}</q-knob>
        </div>
      </div>

      <!-- HEART -->
      <q-separator class="q-mt-md" />
      <div class="text-overline text-center q-mt-sm">HEART CHAMBERS</div>
      <div class="text-overline justify-center q-gutter-sm row q-mt-xs">
        <div class="q-mr-sm text-center">
          <div>volume</div>
          <q-knob
            show-value font-size="12px"
            v-model="heart_vol" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="red" track-color="grey-3"
            @update:model-value="apply('heart_volume', heart_vol)"
          >{{ heart_vol.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>diastole</div>
          <q-knob
            show-value font-size="10px"
            v-model="heart_el_min" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="red" track-color="grey-3"
            @update:model-value="apply('heart_el_min', heart_el_min)"
          >{{ heart_el_min.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>contractility</div>
          <q-knob
            show-value font-size="10px"
            v-model="heart_el_max" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="red" track-color="grey-3"
            @update:model-value="apply('heart_el_max', heart_el_max)"
          >{{ heart_el_max.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>valve res</div>
          <q-knob
            show-value font-size="12px"
            v-model="heart_res" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="red" track-color="grey-3"
            @update:model-value="apply('heart_resistances', heart_res)"
          >{{ heart_res.toFixed(2) }}</q-knob>
        </div>
      </div>

      <!-- LUNG -->
      <q-separator class="q-mt-md" />
      <div class="text-overline text-center q-mt-sm">LUNGS &amp; AIRWAYS</div>
      <div class="text-overline justify-center q-gutter-sm row q-mt-xs">
        <div class="q-mr-sm text-center">
          <div>volume</div>
          <q-knob
            show-value font-size="12px"
            v-model="lung_vol" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="light-blue" track-color="grey-3"
            @update:model-value="apply('lung_volume', lung_vol)"
          >{{ lung_vol.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>compliance</div>
          <q-knob
            show-value font-size="12px"
            v-model="lung_el" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="light-blue" track-color="grey-3"
            @update:model-value="apply('lung_elastances', lung_el)"
          >{{ lung_el.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>airway res</div>
          <q-knob
            show-value font-size="12px"
            v-model="lung_res" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="light-blue" track-color="grey-3"
            @update:model-value="apply('lung_resistances', lung_res)"
          >{{ lung_res.toFixed(2) }}</q-knob>
        </div>
      </div>

      <!-- CONTAINERS -->
      <q-separator class="q-mt-md" />
      <div class="text-overline text-center q-mt-sm">CHEST &amp; PERICARDIUM</div>
      <div class="text-overline justify-center q-gutter-sm row q-mt-xs">
        <div class="q-mr-sm text-center">
          <div>chest size</div>
          <q-knob
            show-value font-size="10px"
            v-model="thorax_uvol" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="orange" track-color="grey-3"
            @update:model-value="apply('thorax_volume', thorax_uvol)"
          >{{ thorax_uvol.toFixed(2) }}</q-knob>
          <div :style="{ fontSize: '10px' }">u_vol</div>
        </div>
        <div class="q-mr-sm text-center">
          <div>peri size</div>
          <q-knob
            show-value font-size="10px"
            v-model="pericardium_uvol" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="orange" track-color="grey-3"
            @update:model-value="apply('pericardium_volume', pericardium_uvol)"
          >{{ pericardium_uvol.toFixed(2) }}</q-knob>
          <div :style="{ fontSize: '10px' }">u_vol</div>
        </div>
      </div>

      <!-- BR_MAP ANS afferent controls -->
      <q-separator class="q-mt-md" />
      <div class="text-overline text-center q-mt-md">BAROREFLEX (MAP mmHg)</div>
      <div class="text-overline justify-center q-gutter-xs row q-mt-xs">
        <q-input v-model.number="map_min" @update:model-value="applyAnsMap" color="orange" hide-hint filled
          label="min" dense stack-label type="number" :step="1"
          style="font-size: 14px; width: 80px;" class="text-center" squared />
        <q-input v-model.number="map_set" @update:model-value="applyAnsMap" color="orange" hide-hint filled
          label="set" dense stack-label type="number" :step="1"
          style="font-size: 14px; width: 80px;" class="text-center" squared />
        <q-input v-model.number="map_max" @update:model-value="applyAnsMap" color="orange" hide-hint filled
          label="max" dense stack-label type="number" :step="1"
          style="font-size: 14px; width: 80px;" class="text-center" squared />
      </div>


      <!-- add/remove volume -->
      <q-separator class="q-mt-md" />
      <div class="text-overline text-center q-mt-md">CHANGE BLOOD VOLUME (ml)</div>
      <div class="text-overline justify-center items-center q-gutter-xs row q-mt-xs">
        <q-input v-model.number="add_volume_ml" color="blue" hide-hint filled
          label="ml" dense stack-label type="number" :step="1"
          style="font-size: 14px; width: 80px;" class="text-center" squared />
        <q-btn label="ADD" color="blue" size="sm" dense @click="addVolume" style="width: 70px;" />
        <q-btn label="REMOVE" color="red-7" size="sm" dense @click="removeVolume" style="width: 70px;" />
      </div>


    </div>
  </q-card>
</template>

<script>
import { useModelStore } from "src/stores/model";
import { explain } from "../boot/explain";

export default {
  setup() {
    const modelStore = useModelStore();
    return { modelStore };
  },
  data() {
    return {
      title: "MODEL SCALER",
      isEnabled: true,
      baseline_weight: 3.545,
      // blood
      blood_vol: 1.0,
      blood_el: 1.0,
      blood_res: 1.0,
      // lung
      lung_vol: 1.0,
      lung_el: 1.0,
      lung_res: 1.0,
      // heart
      heart_vol: 1.0,
      heart_el_min: 1.0,
      heart_el_max: 1.0,
      heart_res: 1.0,
      // containers
      thorax_uvol: 1.0,
      pericardium_uvol: 1.0,
      // ANS / heart rate
      map_min: 25,
      map_set: 50,
      map_max: 100,
      heart_rate_ref: 110,
      add_volume_ml: 10,
      target_weight: 3.545,
      // scaling preparation toggles
      breathing_on: true,
      gasex_on: true,
      metabolism_on: true,
      baroreflex_on: true,
      mob_on: true,
      hr_override_on: false,
    };
  },
  computed: {
    calculated_weight() {
      return this.baseline_weight * this.blood_vol;
    },
  },
  methods: {
    toggleBreathing(val) {
      explain.setPropValue("Breathing.breathing_enabled", val, 0);
    },
    toggleGasExchange(val) {
      explain.setPropValue("GASEX_LL.is_enabled", val, 0);
      explain.setPropValue("GASEX_RL.is_enabled", val, 0);
    },
    toggleMetabolism(val) {
      explain.setPropValue("Metabolism.met_active", val, 0);
    },
    toggleBaroreflex(val) {
      explain.setPropValue("Ans.ans_active", val, 0);
    },
    toggleMob(val) {
      explain.setPropValue("Mob.mob_active", val, 0);
    },
    toggleHrOverride(val) {
      explain.setPropValue("Heart.hr_override", val, 0);
    },
    apply(group, factor) {
      this._debounce(`_t_${group}`, () => {
        if (group === "blood_volume") {
          explain.scaleModel("blood_volume", factor);
        }
        if (group === "heart_volume") {
          explain.scaleModel("heart_volume", factor);
        }
        if (group === "lung_volume") {
          explain.scaleModel("lung_volume", factor);
        }
        if (group === "thorax_volume") {
          explain.scaleModel("thorax_volume", factor);
        }
        if (group === "pericardium_volume") {
          explain.scaleModel("pericardium_volume", factor);
        }
        if (group === "blood_elastances") {
            explain.scaleModel("blood_elastances", factor);
          }
        if (group === "blood_resistances") {
            explain.scaleModel("blood_resistances", factor);
          }
        if (group === "lung_elastances") {
            explain.scaleModel("lung_elastances", factor);
          }
        if (group === "lung_resistances") {
            explain.scaleModel("lung_resistances", factor);
          }
        if (group === "heart_el_min") {
            explain.scaleModel("heart_el_min", factor);
          }
        if (group === "heart_el_max") {
            explain.scaleModel("heart_el_max", factor);
          }
        if (group === "heart_resistances") {
            explain.scaleModel("heart_resistances", factor);  
        }

      });
    },
    applyTargetWeight() {
      const vol_factor = this.target_weight / this.baseline_weight;
      // only set volume knobs
      this.blood_vol = vol_factor;
      this.lung_vol = vol_factor;
      this.heart_vol = vol_factor;
      this.thorax_uvol = vol_factor;
      this.pericardium_uvol = vol_factor;
      
      // send volume scale commands to the engine
      explain.scaleModel("blood_volume", vol_factor);
      explain.scaleModel("lung_volume", vol_factor);
      explain.scaleModel("heart_volume", vol_factor);
      explain.scaleModel("thorax_volume", vol_factor);
      explain.scaleModel("pericardium_volume", vol_factor);
      explain.scaleModel("weight", this.target_weight);
    },
    applyAnsMap() {
      this._debounce("_ans_timer", () => {
        explain.setPropValue("BR_MAP.min_value", this.map_min, 0);
        explain.setPropValue("BR_MAP.set_value", this.map_set, 0);
        explain.setPropValue("BR_MAP.max_value", this.map_max, 0);
      });
    },
    applyHeartRate() {
      this._debounce("_hr_timer", () => explain.setPropValue("Heart.heart_rate_ref", this.heart_rate_ref, 0));
    },
    addVolume() {
      const vol_liters = Math.abs(this.add_volume_ml) / 1000.0;
      explain.scaleModel("add_volume", vol_liters);
    },
    removeVolume() {
      const vol_liters = -(Math.abs(this.add_volume_ml) / 1000.0);
      explain.scaleModel("add_volume", vol_liters);
    },
    _debounce(timerKey, fn) {
      clearTimeout(this[timerKey]);
      this[timerKey] = setTimeout(fn, 500);
    },
    resetAll() {
      this.blood_vol = 1.0;
      this.blood_el = 1.0;
      this.blood_res = 1.0;
      this.lung_vol = 1.0;
      this.lung_el = 1.0;
      this.lung_res = 1.0;
      this.heart_vol = 1.0;
      this.heart_el_min = 1.0;
      this.heart_el_max = 1.0;
      this.heart_res = 1.0;
      this.thorax_uvol = 1.0;
      this.pericardium_uvol = 1.0;
      this.heart_rate_ref = 110;
      this.map_min = 25;
      this.map_set = 50;
      this.map_max = 100;
      explain.scaleModel("reset");
    },
  },
};
</script>

<style></style>
