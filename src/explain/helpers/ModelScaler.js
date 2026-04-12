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
      // pulmonary arteries
      "PA", "PAAL", "PAAR",
      // pumonary arterioles
      "LL_ART", "RL_ART",
      // pulmnary capilaries
      "LL_CAP", "RL_CAP",
      // pulomonary venules
      "LL_VEN", "RL_VEN",
      // pulmonary veins
      "PV",
      // systemic arteries
      "AA", "AAR", "AD",
      // systemic arterioles
      "INT_ART", "KID_ART", "LS_ART", "BR_ART",
      // systemic capillaries
      "INT_CAP", "KID_CAP", "LS_CAP", "BR_CAP",
      // stsemic venules
      "INT_VEN", "KID_VEN", "LS_VEN", "BR_VEN",
      // large veins and venous return
      "IVCI", "SVC", "VLB", "VUB", "RLB", "RUB",
      // ductus arteriosus and coronary
      "DA", "COR"
    ],
    // components whose el_base_factor_scaling is set by scale_blood_elastances
    el_base: [
      // pulmonary arteries
      "PA", "PAAL", "PAAR",
      // pumonary arterioles
      "LL_ART", "RL_ART",
      // pulmnary capilaries
      "LL_CAP", "RL_CAP",
      // pulomonary venules
      "LL_VEN", "RL_VEN",
      // pulmonary veins
      "PV",
      // systemic arteries
      "AA", "AAR", "AD",
      // systemic arterioles
      "INT_ART", "KID_ART", "LS_ART", "BR_ART",
      // systemic capillaries
      "INT_CAP", "KID_CAP", "LS_CAP", "BR_CAP",
      // stsemic venules
      "INT_VEN", "KID_VEN", "LS_VEN", "BR_VEN",
      // large veins and venous return
      "IVCI", "SVC", "VLB", "VUB", "RLB", "RUB",
      // ductus arteriosus and coronary
      "DA", "COR"
    ],
    resistance: [
      // pulmonary arteries
      "PA", "PAAL", "PAAR",
      // pumonary arterioles
      "LL_ART", "RL_ART",
      // pulmnary capilaries
      "LL_CAP", "RL_CAP",
      // pulomonary venules
      "LL_VEN", "RL_VEN",
      // pulmonary veins
      "PV",
      // systemic arteries
      "AA", "AAR", "AD",
      // systemic arterioles
      "INT_ART", "KID_ART", "LS_ART", "BR_ART",
      // systemic capillaries
      "INT_CAP", "KID_CAP", "LS_CAP", "BR_CAP",
      // stsemic venules
      "INT_VEN", "KID_VEN", "LS_VEN", "BR_VEN",
      // large veins and venous return
      "IVCI", "SVC", "VLB", "VUB", "RLB", "RUB",
      // ductus arteriosus and coronary
      "DA",
      // standalone resistors
       "IVCI_RAIVC", "SVC_RASVC", "PV_LA", "PV_RAIVC", "PV_RASVC"
    ],
  },

  heart: {
    // heart chamber components
    u_vol: ["LA", "LV", "RAIVCI", "RASVC", "RV", "COR"],
    el_min: ["LA", "LV", "RAIVCI", "RASVC", "RV", "COR"],
    el_max: ["LA", "LV", "RAIVCI", "RASVC", "RV", "COR"],

    // heart valve resistors
    resistance: [
      "LA_LV",        // mitral valve
      "LV_AA",        // aortic valve
      "RV_PA",        // pulmonary valve
      "RAIVCI_RV",    // tricuspid valve (IVC portion)
      "RASVC_RV",     // tricuspid valve (SVC portion)
      "LV_PA",        // aortic valve in TGA
      "RV_AA",        // pulonary valve in TGA
      "COR_RA",       // coronary flow resistor
    ],
  },

  lung: {
    // gas capacitance components (airway side)
    u_vol: ["ALL", "ALR", "DS"],
    el_base: ["ALL", "ALR", "DS"],

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
      vol_blood: 1.0,
      vol_lung: 1.0,
      vol_thorax: 1.0,
      vol_pericardium: 1.0,
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

  // --- VOLUME SCALING ---

  // Scale vol and u_vol_factor_scaling on a list of named components
  _scale_vol(names, delta) {
    for (const name of names) {
      const comp = this._model.models[name];
      if (!comp) continue;
      if (comp.vol !== undefined) {
        comp.vol *= delta;
      }
      if (comp.u_vol_factor_scaling !== undefined) {
        comp.u_vol_factor_scaling *= delta;
      }
    }
  }

  // Scale all volumes (blood, heart, lung, thorax, pericardium)
  scale_volume(factor) {
    this.scale_volume_blood(factor);
    this.scale_volume_lung(factor);
    this.scale_volume_thorax(factor);
    this.scale_volume_pericardium(factor);
  }

  scale_volume_blood(factor) {
    const delta = factor / this._prev.vol_blood;
    this._scale_vol([...this._config.blood.u_vol, ...this._config.heart.u_vol], delta);
    this._prev.vol_blood = factor;
  }

  scale_volume_lung(factor) {
    const delta = factor / this._prev.vol_lung;
    this._scale_vol(this._config.lung.u_vol, delta);
    this._prev.vol_lung = factor;
  }

  scale_volume_thorax(factor) {
    const delta = factor / this._prev.vol_thorax;
    this._scale_vol(this._config.thorax, delta);
    this._prev.vol_thorax = factor;
  }

  scale_volume_pericardium(factor) {
    const delta = factor / this._prev.vol_pericardium;
    this._scale_vol(this._config.pericardium, delta);
    this._prev.vol_pericardium = factor;
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
    if (preset.volume) this.scale_volume(preset.volume);
    if (preset.vol_blood) this.scale_volume_blood(preset.vol_blood);
    if (preset.vol_lung) this.scale_volume_lung(preset.vol_lung);
    if (preset.vol_thorax) this.scale_volume_thorax(preset.vol_thorax);
    if (preset.vol_pericardium) this.scale_volume_pericardium(preset.vol_pericardium);
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
    this.scale_volume_blood(1.0);
    this.scale_volume_lung(1.0);
    this.scale_volume_thorax(1.0);
    this.scale_volume_pericardium(1.0);
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
