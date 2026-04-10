// ModelScaler provides granular factor-based controls for scaling
// model parameters by subsystem: blood, heart, lung, and containers.
// A factor of 1.0 means no change, 0.5 means half, 2.0 means double.
//
// Each scaling group targets a predefined list of component names rather
// than scanning all models by type. This makes scaling explicit and
// predictable. The lists can be customized via the config object.

// Components belonging to external devices — exclude from scaling
const DEVICE_PREFIXES = ["VENT_", "ECLS_"];

function _is_device(name) {
  for (const prefix of DEVICE_PREFIXES) {
    if (name.startsWith(prefix)) return true;
  }
  return false;
}

// Default component name lists per scaling group.
// These match the term_neonate model definition.
const DEFAULT_CONFIG = {
  blood: {
    // components whose u_vol_factor_scaling is set by scale_blood_u_vol
    u_vol: [
      // large arteries
      "AA", "AAR", "AD",
      // pulmonary arteries
      "PA", "PAAL", "PAAR",
      // pulmonary veins
      "PV",
      // systemic veins
      "IVCI", "SVC", "VLB", "VUB", "RLB", "RUB",
      // ductus arteriosus
      "DA",
      // coronaries
      "COR",
      // microvascular units (distribute to sub-components internally)
      "BR", "INT", "KID", "LL", "LS", "RL",
      // placental
      "PL_FETAL", "PL_UMB_ART", "PL_UMB_VEN",
    ],

    // components whose el_base_factor_scaling is set by scale_blood_elastances
    el_base: [
      "AA", "AAR", "AD",
      "PA", "PAAL", "PAAR",
      "PV",
      "IVCI", "SVC", "VLB", "VUB", "RLB", "RUB",
      "DA",
      "COR",
      "BR", "INT", "KID", "LL", "LS", "RL",
      "PL_FETAL", "PL_UMB_ART", "PL_UMB_VEN",
    ],

    // components whose r_factor_scaling is set by scale_blood_resistances
    // includes BloodVessels, MVUs, and standalone Resistors in the blood circuit
    resistance: [
      // blood vessels with built-in resistance
      "AA", "AAR", "AD",
      "PA", "PAAL", "PAAR",
      "PV",
      "IVCI", "SVC", "VLB", "VUB", "RLB", "RUB",
      // microvascular units
      "BR", "INT", "KID", "LL", "LS", "RL",
      // placental vessels
      "PL_FETAL", "PL_UMB_ART", "PL_UMB_VEN",
      // standalone resistors: venous return
      "IVCI_RAIVCI", "SVC_RASVC", "PV_LA",
      // standalone resistors: coronary
      "COR_RAIVCI", "COR_RASVC",
      // standalone resistors: atrial
      "RAIVCI_RASVC"
    ],
  },

  heart: {
    // heart chamber components
    u_vol: ["LA", "LV", "RAIVCI", "RASVC", "RV"],
    el_min: ["LA", "LV", "RAIVCI", "RASVC", "RV"],
    el_max: ["LA", "LV", "RAIVCI", "RASVC", "RV"],

    // heart valve resistors
    resistance: [
      "LA_LV",        // mitral valve
      "LV_AA",        // aortic valve
      "RV_PA",        // pulmonary valve
      "RAIVCI_RV",    // tricuspid valve (IVC portion)
      "RASVC_RV",     // tricuspid valve (SVC portion)
    ],
  },

  lung: {
    // gas capacitance components (airway side)
    u_vol: ["ALL", "ALR", "DS", "MOUTH"],
    el_base: ["ALL", "ALR", "DS", "MOUTH"],

    // airway resistors
    resistance: ["MOUTH_DS", "DS_ALL", "DS_ALR"],
  },

  // container components
  thorax: ["THORAX"],
  pericardium: ["PERICARDIUM"],
};

export default class ModelScaler {
  constructor(model, config = null) {
    this._model = model;
    this._config = config || JSON.parse(JSON.stringify(DEFAULT_CONFIG));

    // tracking previous factor values for delta calculation
    this._prev = {
      blood_u_vol: 1.0,
      blood_el: 1.0,
      blood_res: 1.0,
      lung_u_vol: 1.0,
      lung_el: 1.0,
      lung_res: 1.0,
      heart_u_vol: 1.0,
      heart_el_min: 1.0,
      heart_el_max: 1.0,
      heart_res: 1.0,
      thorax_uvol: 1.0,
      pericardium_uvol: 1.0,
    };
  }

  // Apply a scaling delta to a specific factor property on a list of named components
  _apply(names, prop, delta) {
    for (const name of names) {
      const comp = this._model.models[name];
      if (comp && comp[prop] !== undefined) {
        comp[prop] *= delta;
      }
    }
  }

  // --- BLOOD ---

  scale_blood_u_vol(factor) {
    const delta = factor / this._prev.blood_u_vol;
    this._apply(this._config.blood.u_vol, "u_vol_factor_scaling", delta);
    this._prev.blood_u_vol = factor;
  }

  scale_blood_elastances(factor) {
    const delta = factor / this._prev.blood_el;
    this._apply(this._config.blood.el_base, "el_base_factor_scaling", delta);
    this._prev.blood_el = factor;
  }

  scale_blood_resistances(factor) {
    const delta = factor / this._prev.blood_res;
    this._apply(this._config.blood.resistance, "r_factor_scaling", delta);
    this._prev.blood_res = factor;
  }

  // --- LUNG ---

  scale_lung_u_vol(factor) {
    const delta = factor / this._prev.lung_u_vol;
    this._apply(this._config.lung.u_vol, "u_vol_factor_scaling", delta);
    this._prev.lung_u_vol = factor;
  }

  scale_lung_elastances(factor) {
    const delta = factor / this._prev.lung_el;
    this._apply(this._config.lung.el_base, "el_base_factor_scaling", delta);
    this._prev.lung_el = factor;
  }

  scale_lung_resistances(factor) {
    const delta = factor / this._prev.lung_res;
    this._apply(this._config.lung.resistance, "r_factor_scaling", delta);
    this._prev.lung_res = factor;
  }

  // --- HEART ---

  scale_heart_u_vol(factor) {
    const delta = factor / this._prev.heart_u_vol;
    this._apply(this._config.heart.u_vol, "u_vol_factor_scaling", delta);
    this._prev.heart_u_vol = factor;
  }

  scale_heart_el_min(factor) {
    const delta = factor / this._prev.heart_el_min;
    this._apply(this._config.heart.el_min, "el_min_factor_scaling", delta);
    this._prev.heart_el_min = factor;
  }

  scale_heart_el_max(factor) {
    const delta = factor / this._prev.heart_el_max;
    this._apply(this._config.heart.el_max, "el_max_factor_scaling", delta);
    this._prev.heart_el_max = factor;
  }

  scale_heart_resistances(factor) {
    const delta = factor / this._prev.heart_res;
    this._apply(this._config.heart.resistance, "r_factor_scaling", delta);
    this._prev.heart_res = factor;
  }

  // --- CONTAINERS ---

  scale_thorax_uvol(factor) {
    const delta = factor / this._prev.thorax_uvol;
    this._apply(this._config.thorax, "u_vol_factor_scaling", delta);
    this._prev.thorax_uvol = factor;
  }

  scale_pericardium_uvol(factor) {
    const delta = factor / this._prev.pericardium_uvol;
    this._apply(this._config.pericardium, "u_vol_factor_scaling", delta);
    this._prev.pericardium_uvol = factor;
  }

  // --- PRESETS ---

  apply_preset(preset) {
    this.reset();
    if (preset.blood_u_vol) this.scale_blood_u_vol(preset.blood_u_vol);
    if (preset.blood_el) this.scale_blood_elastances(preset.blood_el);
    if (preset.blood_res) this.scale_blood_resistances(preset.blood_res);
    if (preset.lung_u_vol) this.scale_lung_u_vol(preset.lung_u_vol);
    if (preset.lung_el) this.scale_lung_elastances(preset.lung_el);
    if (preset.lung_res) this.scale_lung_resistances(preset.lung_res);
    if (preset.heart_u_vol) this.scale_heart_u_vol(preset.heart_u_vol);
    if (preset.heart_el_min) this.scale_heart_el_min(preset.heart_el_min);
    if (preset.heart_el_max) this.scale_heart_el_max(preset.heart_el_max);
    if (preset.heart_res) this.scale_heart_resistances(preset.heart_res);
    if (preset.thorax_uvol) this.scale_thorax_uvol(preset.thorax_uvol);
    if (preset.pericardium_uvol) this.scale_pericardium_uvol(preset.pericardium_uvol);
  }

  static compute_allometric_preset(target_weight, baseline_weight = 3.545) {
    const w_ratio = target_weight / baseline_weight;

    // Estimate gestational age from weight (simplified Fenton curve)
    const ga = Math.min(40, Math.max(24, 24 + 16 * Math.pow(target_weight / 3.5, 0.5)));

    // MAP approximation: MAP ≈ gestational age in weeks for preterm
    const baseline_map = 43;
    const target_map = 24 + 0.5 * ga;
    const p_ratio = target_map / baseline_map;

    // CO scales allometrically: CO ~ W^0.75
    const co_ratio = Math.pow(w_ratio, 0.75);

    // Heart rate: HR ~ W^-0.25
    const target_hr = Math.round(110 * Math.pow(w_ratio, -0.25));

    // Lung stiffness correction for preterm surfactant deficiency
    const lung_stiffness = ga < 34 ? 1.3 : 1.0;

    return {
      blood_u_vol: w_ratio,
      blood_el: p_ratio / w_ratio,
      blood_res: p_ratio / co_ratio,
      lung_u_vol: w_ratio,
      lung_el: (1.0 / w_ratio) * lung_stiffness,
      lung_res: Math.pow(w_ratio, -0.75),
      heart_u_vol: w_ratio,
      heart_el_min: p_ratio / w_ratio * 0.95,
      heart_el_max: p_ratio / w_ratio,
      heart_res: 1.0,
      thorax_uvol: w_ratio,
      pericardium_uvol: w_ratio,
      weight: target_weight,
      heart_rate_ref: target_hr,
      br_map_min: Math.round(target_map * 0.5),
      br_map_set: Math.round(target_map),
      br_map_max: Math.round(target_map * 2.0),
    };
  }

  // Bake all scaling factors into the base model properties, then reset
  // scaling factors to 1.0. After this, the model state reflects the scaled
  // values as its new baseline.

  _bake(names, base_prop, factor_prop) {
    for (const name of names) {
      const comp = this._model.models[name];
      if (!comp) continue;
      const f = comp[factor_prop];
      if (f !== undefined && f !== 1.0) {
        comp[base_prop] *= f;
        comp[factor_prop] = 1.0;
      }
    }
  }

  _bake_resistance(names) {
    for (const name of names) {
      const comp = this._model.models[name];
      if (!comp) continue;
      const f = comp.r_factor_scaling;
      if (f !== undefined && f !== 1.0) {
        comp.r_for *= f;
        comp.r_back *= f;
        comp.r_factor_scaling = 1.0;
      }
    }
  }

  incorporate() {
    // bake blood scaling factors
    this._bake(this._config.blood.u_vol, "u_vol", "u_vol_factor_scaling");
    this._bake(this._config.blood.el_base, "el_base", "el_base_factor_scaling");
    this._bake_resistance(this._config.blood.resistance);

    // bake lung scaling factors
    this._bake(this._config.lung.u_vol, "u_vol", "u_vol_factor_scaling");
    this._bake(this._config.lung.el_base, "el_base", "el_base_factor_scaling");
    this._bake_resistance(this._config.lung.resistance);

    // bake heart scaling factors
    this._bake(this._config.heart.u_vol, "u_vol", "u_vol_factor_scaling");
    this._bake(this._config.heart.el_min, "el_min", "el_min_factor_scaling");
    this._bake(this._config.heart.el_max, "el_max", "el_max_factor_scaling");
    this._bake_resistance(this._config.heart.resistance);

    // bake container scaling factors
    this._bake(this._config.thorax, "u_vol", "u_vol_factor_scaling");
    this._bake(this._config.pericardium, "u_vol", "u_vol_factor_scaling");

    // reset all tracking
    for (const key of Object.keys(this._prev)) {
      this._prev[key] = 1.0;
    }
  }

  // --- UTILITY ---

  add_volume(vol_liters) {
    const ivci = this._model.models["IVCI"];
    if (ivci && ivci.vol !== undefined) {
      ivci.vol += vol_liters;
    }
  }

  reset() {
    this.scale_blood_u_vol(1.0);
    this.scale_blood_elastances(1.0);
    this.scale_blood_resistances(1.0);
    this.scale_lung_u_vol(1.0);
    this.scale_lung_elastances(1.0);
    this.scale_lung_resistances(1.0);
    this.scale_heart_u_vol(1.0);
    this.scale_heart_el_min(1.0);
    this.scale_heart_el_max(1.0);
    this.scale_heart_resistances(1.0);
    this.scale_thorax_uvol(1.0);
    this.scale_pericardium_uvol(1.0);
  }
}
