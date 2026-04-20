<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-xs" bordered dark flat>
    <div class="q-mt-xs row gutter text-overline justify-center" @click="isEnabled = !isEnabled">
      {{ title }}
    </div>



    <div v-if="isEnabled">
      <!-- SCALING PREPARATION -->
      <q-separator class="q-mt-xs" />
      <div class="text-overline text-center q-mt-sm">SCALING PREPARATION</div>
      <div class="q-px-sm q-mt-sm column items-start">  
        <q-toggle  v-model="ans_on" label="Autonomic Nervous System (ANS)" dense
          color="primary" @update:model-value="toggleAns" />
        <q-toggle class="q-mt-sm" v-model="metabolism_on" label="Metabolism (VO2)" dense
          color="primary" @update:model-value="toggleMetabolism" />
        <q-toggle class="q-mt-sm" v-model="mob_on" label="Myocardial O2 Balance (MOB)" dense
          color="primary" @update:model-value="toggleMob" />
        <q-toggle class="q-mt-sm" v-model="gasex_on" label="Gas Exchange (LL + RL)" dense
          color="primary" @update:model-value="toggleGasExchange" />
        <q-toggle class="q-mt-sm" v-model="breathing_on" label="Spontaneous Breathing" dense
          color="primary" @update:model-value="toggleBreathing" />
        <q-toggle class="q-mt-sm" v-model="hr_override_on" label="Heart Rate Override" dense
          color="primary" @update:model-value="toggleHrOverride" />

      </div>

      
      <div class="text-overline justify-left q-gutter-sm row q-ml-xs q-mt-sm q-mb-md">
                <q-toggle v-model="invert_prep" label="toggle all" dense small
          color="danger" @update:model-value="invertAllPrep" />
        <q-btn
          label="FIXATE FACTORS"
          color="red-10"
          size="sm"
          dense
          @click="incorporate"
        />
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

      <!-- BLOOD VOLUME -->
      <q-separator class="q-mt-md" />
      <div class="text-overline text-center q-mt-sm">BLOOD VESSELS</div>
      <div class="text-overline justify-center q-gutter-sm row q-mt-xs">
        <div class="q-mr-sm text-center">
          <div>total volume</div>
          <q-knob
            show-value font-size="12px"
            v-model="blood_vol" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="teal" track-color="grey-3"
            @update:model-value="apply('blood_volume', blood_vol)"
          >{{ blood_vol.toFixed(2) }}</q-knob>
        </div>
      </div>

      <!-- PULMONARY VESSELS -->
      <div class="text-overline text-center q-mt-sm">PULMONARY VESSELS</div>
      <div class="text-overline justify-center q-gutter-sm row q-mt-xs">
        <div class="q-mr-sm text-center">
          <div>stiffness</div>
          <q-knob
            show-value font-size="12px"
            v-model="pulm_el" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="purple" track-color="grey-3"
            @update:model-value="apply('pulmonary_elastances', pulm_el)"
          >{{ pulm_el.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>resistance</div>
          <q-knob
            show-value font-size="12px"
            v-model="pulm_res" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="purple" track-color="grey-3"
            @update:model-value="apply('pulmonary_resistances', pulm_res)"
          >{{ pulm_res.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>u_vol</div>
          <q-knob
            show-value font-size="12px"
            v-model="pulm_uvol" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="purple" track-color="grey-3"
            @update:model-value="apply('pulmonary_u_vol', pulm_uvol)"
          >{{ pulm_uvol.toFixed(2) }}</q-knob>
        </div>
      </div>

      <!-- SYSTEMIC VESSELS -->
      <div class="text-overline text-center q-mt-sm">SYSTEMIC VESSELS</div>
      <div class="text-overline justify-center q-gutter-sm row q-mt-xs">
        <div class="q-mr-sm text-center">
          <div>stiffness</div>
          <q-knob
            show-value font-size="12px"
            v-model="sys_el" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="teal" track-color="grey-3"
            @update:model-value="apply('systemic_elastances', sys_el)"
          >{{ sys_el.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>resistance</div>
          <q-knob
            show-value font-size="12px"
            v-model="sys_res" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="teal" track-color="grey-3"
            @update:model-value="apply('systemic_resistances', sys_res)"
          >{{ sys_res.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>u_vol</div>
          <q-knob
            show-value font-size="12px"
            v-model="sys_uvol" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="teal" track-color="grey-3"
            @update:model-value="apply('systemic_u_vol', sys_uvol)"
          >{{ sys_uvol.toFixed(2) }}</q-knob>
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
          <div>valve res</div>
          <q-knob
            show-value font-size="12px"
            v-model="heart_res" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="red" track-color="grey-3"
            @update:model-value="apply('heart_resistances', heart_res)"
          >{{ heart_res.toFixed(2) }}</q-knob>
        </div>
      </div>

      <!-- LEFT HEART -->
      <div class="text-overline text-center q-mt-sm">LEFT HEART</div>
      <div class="text-overline justify-center q-gutter-sm row q-mt-xs">
        <div class="q-mr-sm text-center">
          <div>el min</div>
          <q-knob
            show-value font-size="10px"
            v-model="left_heart_el_min" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="red-10" track-color="grey-3"
            @update:model-value="apply('left_heart_el_min', left_heart_el_min)"
          >{{ left_heart_el_min.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>el max</div>
          <q-knob
            show-value font-size="10px"
            v-model="left_heart_el_max" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="red-10" track-color="grey-3"
            @update:model-value="apply('left_heart_el_max', left_heart_el_max)"
          >{{ left_heart_el_max.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>u_vol</div>
          <q-knob
            show-value font-size="10px"
            v-model="left_heart_uvol" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="red-10" track-color="grey-3"
            @update:model-value="apply('left_heart_u_vol', left_heart_uvol)"
          >{{ left_heart_uvol.toFixed(2) }}</q-knob>
        </div>
      </div>

      <!-- RIGHT HEART -->
      <div class="text-overline text-center q-mt-sm">RIGHT HEART</div>
      <div class="text-overline justify-center q-gutter-sm row q-mt-xs">
        <div class="q-mr-sm text-center">
          <div>el min</div>
          <q-knob
            show-value font-size="10px"
            v-model="right_heart_el_min" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="deep-orange" track-color="grey-3"
            @update:model-value="apply('right_heart_el_min', right_heart_el_min)"
          >{{ right_heart_el_min.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>el max</div>
          <q-knob
            show-value font-size="10px"
            v-model="right_heart_el_max" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="deep-orange" track-color="grey-3"
            @update:model-value="apply('right_heart_el_max', right_heart_el_max)"
          >{{ right_heart_el_max.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>u_vol</div>
          <q-knob
            show-value font-size="10px"
            v-model="right_heart_uvol" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="deep-orange" track-color="grey-3"
            @update:model-value="apply('right_heart_u_vol', right_heart_uvol)"
          >{{ right_heart_uvol.toFixed(2) }}</q-knob>
        </div>
      </div>

      <!-- AIRWAY (per-compartment) -->
      <q-separator class="q-mt-md" />
      <div class="text-overline text-center q-mt-sm">AIRWAY</div>
      <div class="text-overline justify-center q-gutter-sm row q-mt-xs">
        <div class="q-mr-sm text-center">
          <div>stiffness</div>
          <q-knob
            show-value font-size="10px"
            v-model="airway_el" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="cyan" track-color="grey-3"
            @update:model-value="apply('airway_elastances', airway_el)"
          >{{ airway_el.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>u_vol</div>
          <q-knob
            show-value font-size="10px"
            v-model="airway_uvol" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="cyan" track-color="grey-3"
            @update:model-value="apply('airway_u_vol', airway_uvol)"
          >{{ airway_uvol.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>upper res</div>
          <q-knob
            show-value font-size="10px"
            v-model="airway_upper_res" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="cyan" track-color="grey-3"
            @update:model-value="apply('airway_upper_resistances', airway_upper_res)"
          >{{ airway_upper_res.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>lower res</div>
          <q-knob
            show-value font-size="10px"
            v-model="airway_lower_res" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="cyan" track-color="grey-3"
            @update:model-value="apply('airway_lower_resistances', airway_lower_res)"
          >{{ airway_lower_res.toFixed(2) }}</q-knob>
        </div>
      </div>

      <!-- LEFT LUNG -->
      <q-separator class="q-mt-md" />
      <div class="text-overline text-center q-mt-sm">LEFT LUNG</div>
      <div class="text-overline justify-center q-gutter-sm row q-mt-xs">
        <div class="q-mr-sm text-center">
          <div>stiffness</div>
          <q-knob
            show-value font-size="10px"
            v-model="left_lung_el" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="blue" track-color="grey-3"
            @update:model-value="apply('left_lung_elastances', left_lung_el)"
          >{{ left_lung_el.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>u_vol</div>
          <q-knob
            show-value font-size="10px"
            v-model="left_lung_uvol" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="blue" track-color="grey-3"
            @update:model-value="apply('left_lung_u_vol', left_lung_uvol)"
          >{{ left_lung_uvol.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>resistance</div>
          <q-knob
            show-value font-size="10px"
            v-model="left_lung_res" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="blue" track-color="grey-3"
            @update:model-value="apply('left_lung_resistances', left_lung_res)"
          >{{ left_lung_res.toFixed(2) }}</q-knob>
        </div>
      </div>

      <!-- RIGHT LUNG -->
      <q-separator class="q-mt-md" />
      <div class="text-overline text-center q-mt-sm">RIGHT LUNG</div>
      <div class="text-overline justify-center q-gutter-sm row q-mt-xs">
        <div class="q-mr-sm text-center">
          <div>stiffness</div>
          <q-knob
            show-value font-size="10px"
            v-model="right_lung_el" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="indigo" track-color="grey-3"
            @update:model-value="apply('right_lung_elastances', right_lung_el)"
          >{{ right_lung_el.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>u_vol</div>
          <q-knob
            show-value font-size="10px"
            v-model="right_lung_uvol" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="indigo" track-color="grey-3"
            @update:model-value="apply('right_lung_u_vol', right_lung_uvol)"
          >{{ right_lung_uvol.toFixed(2) }}</q-knob>
        </div>
        <div class="q-mr-sm text-center">
          <div>resistance</div>
          <q-knob
            show-value font-size="10px"
            v-model="right_lung_res" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="indigo" track-color="grey-3"
            @update:model-value="apply('right_lung_resistances', right_lung_res)"
          >{{ right_lung_res.toFixed(2) }}</q-knob>
        </div>
      </div>

      <!-- CONTAINERS -->
      <q-separator class="q-mt-md" />
      <div class="text-overline text-center q-mt-sm">CHEST &amp; PERICARDIUM</div>
      <div class="text-overline justify-center q-gutter-sm row q-mt-xs">
        <div class="q-mr-sm text-center">
          <div>chest stiff</div>
          <q-knob
            show-value font-size="10px"
            v-model="thorax_el" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="orange" track-color="grey-3"
            @update:model-value="apply('thorax_elastances', thorax_el)"
          >{{ thorax_el.toFixed(2) }}</q-knob>
          <div :style="{ fontSize: '10px' }">el_base</div>
        </div>
        <div class="q-mr-sm text-center">
          <div>chest u_vol</div>
          <q-knob
            show-value font-size="10px"
            v-model="thorax_uvol" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="orange" track-color="grey-3"
            @update:model-value="apply('thorax_volume', thorax_uvol)"
          >{{ thorax_uvol.toFixed(2) }}</q-knob>
          <div :style="{ fontSize: '10px' }">u_vol</div>
        </div>
        </div>
        <div class="text-overline justify-center q-gutter-sm row q-mt-xs">
        <div class="q-mr-sm text-center">
          <div>peri stiff</div>
          <q-knob
            show-value font-size="10px"
            v-model="pericardium_el" size="60px" :min="0.1" :max="5.0" :step="0.01"
            :thickness="0.22" color="orange" track-color="grey-3"
            @update:model-value="apply('pericardium_elastances', pericardium_el)"
          >{{ pericardium_el.toFixed(2) }}</q-knob>
          <div :style="{ fontSize: '10px' }">el_base</div>
        </div>

        <div class="q-mr-sm text-center">
          <div>peri u_vol</div>
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
      // pulmonary
      pulm_el: 1.0,
      pulm_res: 1.0,
      pulm_uvol: 1.0,
      // systemic
      sys_el: 1.0,
      sys_res: 1.0,
      sys_uvol: 1.0,
      // lung
      lung_vol: 1.0,
      // airway (dead space + conducting airways)
      airway_el: 1.0,
      airway_uvol: 1.0,
      airway_upper_res: 1.0,
      airway_lower_res: 1.0,
      // left lung
      left_lung_el: 1.0,
      left_lung_res: 1.0,
      left_lung_uvol: 1.0,
      // right lung
      right_lung_el: 1.0,
      right_lung_res: 1.0,
      right_lung_uvol: 1.0,
      // heart
      heart_vol: 1.0,
      heart_el_min: 1.0,
      heart_el_max: 1.0,
      heart_res: 1.0,
      // left heart
      left_heart_el_min: 1.0,
      left_heart_el_max: 1.0,
      left_heart_uvol: 1.0,
      // right heart
      right_heart_el_min: 1.0,
      right_heart_el_max: 1.0,
      right_heart_uvol: 1.0,
      // containers
      thorax_uvol: 1.0,
      thorax_el: 1.0,
      pericardium_uvol: 1.0,
      pericardium_el: 1.0,
      // ANS / heart rate
      map_min: 25,
      map_set: 50,
      map_max: 100,
      heart_rate_ref: 70,
      add_volume_ml: 10,
      target_weight: 3.545,
      // scaling preparation toggles
      invert_prep: false,
      breathing_on: true,
      gasex_on: true,
      metabolism_on: true,
      ans_on: true,
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
    invertAllPrep() {
      this.ans_on = !this.ans_on;
      this.metabolism_on = !this.metabolism_on;
      this.mob_on = !this.mob_on;
      this.gasex_on = !this.gasex_on;
      this.breathing_on = !this.breathing_on;
      this.hr_override_on = !this.hr_override_on;
      this.toggleAns(this.ans_on);
      this.toggleMetabolism(this.metabolism_on);
      this.toggleMob(this.mob_on);
      this.toggleGasExchange(this.gasex_on);
      this.toggleBreathing(this.breathing_on);
      this.toggleHrOverride(this.hr_override_on);
    },
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
    toggleAns(val) {
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
        if (group === "pulmonary_elastances") {
            explain.scaleModel("pulmonary_elastances", factor);
          }
        if (group === "pulmonary_resistances") {
            explain.scaleModel("pulmonary_resistances", factor);
          }
        if (group === "pulmonary_u_vol") {
            explain.scaleModel("pulmonary_u_vol", factor);
          }
        if (group === "systemic_elastances") {
            explain.scaleModel("systemic_elastances", factor);
          }
        if (group === "systemic_resistances") {
            explain.scaleModel("systemic_resistances", factor);
          }
        if (group === "systemic_u_vol") {
            explain.scaleModel("systemic_u_vol", factor);
          }
        if (group === "airway_elastances") {
            explain.scaleModel("airway_elastances", factor);
          }
        if (group === "airway_u_vol") {
            explain.scaleModel("airway_u_vol", factor);
          }
        if (group === "airway_upper_resistances") {
            explain.scaleModel("airway_upper_resistances", factor);
          }
        if (group === "airway_lower_resistances") {
            explain.scaleModel("airway_lower_resistances", factor);
          }
        if (group === "left_lung_elastances") {
            explain.scaleModel("left_lung_elastances", factor);
          }
        if (group === "left_lung_resistances") {
            explain.scaleModel("left_lung_resistances", factor);
          }
        if (group === "left_lung_u_vol") {
            explain.scaleModel("left_lung_u_vol", factor);
          }
        if (group === "right_lung_elastances") {
            explain.scaleModel("right_lung_elastances", factor);
          }
        if (group === "right_lung_resistances") {
            explain.scaleModel("right_lung_resistances", factor);
          }
        if (group === "right_lung_u_vol") {
            explain.scaleModel("right_lung_u_vol", factor);
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
        if (group === "left_heart_el_min") {
            explain.scaleModel("left_heart_el_min", factor);
        }
        if (group === "left_heart_el_max") {
            explain.scaleModel("left_heart_el_max", factor);
        }
        if (group === "left_heart_u_vol") {
            explain.scaleModel("left_heart_u_vol", factor);
        }
        if (group === "right_heart_el_min") {
            explain.scaleModel("right_heart_el_min", factor);
        }
        if (group === "right_heart_el_max") {
            explain.scaleModel("right_heart_el_max", factor);
        }
        if (group === "right_heart_u_vol") {
            explain.scaleModel("right_heart_u_vol", factor);
        }
        if (group === "thorax_elastances") {
            explain.scaleModel("thorax_elastances", factor);
        }
        if (group === "pericardium_elastances") {
            explain.scaleModel("pericardium_elastances", factor);
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
    incorporate() {
      explain.scaleModel("incorporate");
      this.blood_vol = 1.0;
      this.blood_el = 1.0;
      this.blood_res = 1.0;
      this.pulm_el = 1.0;
      this.pulm_res = 1.0;
      this.pulm_uvol = 1.0;
      this.sys_el = 1.0;
      this.sys_res = 1.0;
      this.sys_uvol = 1.0;
      this.lung_vol = 1.0;
      this.airway_el = 1.0;
      this.airway_uvol = 1.0;
      this.airway_upper_res = 1.0;
      this.airway_lower_res = 1.0;
      this.left_lung_el = 1.0;
      this.left_lung_res = 1.0;
      this.left_lung_uvol = 1.0;
      this.right_lung_el = 1.0;
      this.right_lung_res = 1.0;
      this.right_lung_uvol = 1.0;
      this.heart_vol = 1.0;
      this.heart_el_min = 1.0;
      this.heart_el_max = 1.0;
      this.heart_res = 1.0;
      this.left_heart_el_min = 1.0;
      this.left_heart_el_max = 1.0;
      this.left_heart_uvol = 1.0;
      this.right_heart_el_min = 1.0;
      this.right_heart_el_max = 1.0;
      this.right_heart_uvol = 1.0;
      this.thorax_uvol = 1.0;
      this.thorax_el = 1.0;
      this.pericardium_uvol = 1.0;
      this.pericardium_el = 1.0;
    },
    _debounce(timerKey, fn) {
      clearTimeout(this[timerKey]);
      this[timerKey] = setTimeout(fn, 500);
    },
    resetAll() {
      this.blood_vol = 1.0;
      this.blood_el = 1.0;
      this.blood_res = 1.0;
      this.pulm_el = 1.0;
      this.pulm_res = 1.0;
      this.pulm_uvol = 1.0;
      this.sys_el = 1.0;
      this.sys_res = 1.0;
      this.sys_uvol = 1.0;
      this.lung_vol = 1.0;
      this.airway_el = 1.0;
      this.airway_uvol = 1.0;
      this.airway_upper_res = 1.0;
      this.airway_lower_res = 1.0;
      this.left_lung_el = 1.0;
      this.left_lung_res = 1.0;
      this.left_lung_uvol = 1.0;
      this.right_lung_el = 1.0;
      this.right_lung_res = 1.0;
      this.right_lung_uvol = 1.0;
      this.heart_vol = 1.0;
      this.heart_el_min = 1.0;
      this.heart_el_max = 1.0;
      this.heart_res = 1.0;
      this.left_heart_el_min = 1.0;
      this.left_heart_el_max = 1.0;
      this.left_heart_uvol = 1.0;
      this.right_heart_el_min = 1.0;
      this.right_heart_el_max = 1.0;
      this.right_heart_uvol = 1.0;
      this.thorax_uvol = 1.0;
      this.thorax_el = 1.0;
      this.pericardium_uvol = 1.0;
      this.pericardium_el = 1.0;
      this.heart_rate_ref = 70;
      this.map_min = 25;
      this.map_set = 50;
      this.map_max = 100;
      explain.scaleModel("reset");
    },
  },
};
</script>

<style></style>
