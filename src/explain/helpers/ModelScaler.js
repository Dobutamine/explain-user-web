// ModelScaler provides granular factor-based controls for scaling
// model parameters by subsystem: blood, lung, heart, and containers.
// A factor of 1.0 means no change, 0.5 means half, 2.0 means double.
//
// The scaler uses the dedicated *_factor_scaling properties on each model,
// which form a third tier separate from non-persistent factors (reset each step)
// and persistent factors (_ps, used by ANS/Heart/etc.).

// Blood vascular types (volumes, elastances, built-in resistances)
const BLOOD_TYPES = new Set([
  "BloodCapacitance",
  "BloodVessel",
  "MicroVascularUnit",
  "BloodTimeVaryingElastance"
]);

// Gas/lung types (volumes, elastances)
const GAS_TYPES = new Set(["GasCapacitance"]);

// Heart types (volumes, elastances)
const HEART_TYPES = new Set(["HeartChamber"]);

// Components belonging to external devices — exclude from scaling
const DEVICE_PREFIXES = ["VENT_", "ECLS_"];

function _is_device(name) {
  for (const prefix of DEVICE_PREFIXES) {
    if (name.startsWith(prefix)) return true;
  }
  return false;
}

// Check if a Resistor model connects to a model of a given type set
function _resistor_connects_to(comp, models, typeSet) {
  const from = models[comp.comp_from];
  const to = models[comp.comp_to];
  return (from && typeSet.has(from.model_type)) ||
         (to && typeSet.has(to.model_type));
}

export default class ModelScaler {
  constructor(model) {
    this._model = model;

    // blood factors
    this._prev_blood_u_vol = 1.0;
    this._prev_blood_el = 1.0;
    this._prev_blood_res = 1.0;

    // lung factors
    this._prev_lung_u_vol = 1.0;
    this._prev_lung_el = 1.0;
    this._prev_lung_res = 1.0;

    // heart factors
    this._prev_heart_u_vol = 1.0;
    this._prev_heart_el_min = 1.0;
    this._prev_heart_el_max = 1.0;
    this._prev_heart_res = 1.0;

    // container factors
    this._prev_thorax_uvol = 1.0;
    this._prev_pericardium_uvol = 1.0;
  }

  // --- BLOOD ---

  scale_blood_u_vol(factor) {
    const delta = factor / this._prev_blood_u_vol;
    for (const [name, comp] of Object.entries(this._model.models)) {
      if (_is_device(name)) continue;
      if (comp.is_externally_managed) continue;
      if (BLOOD_TYPES.has(comp.model_type)) {
        if (comp.u_vol_factor_scaling !== undefined) comp.u_vol_factor_scaling *= delta;
      }
    }
    this._prev_blood_u_vol = factor;
  }

  scale_blood_elastances(factor) {
    const delta = factor / this._prev_blood_el;
    for (const [name, comp] of Object.entries(this._model.models)) {
      if (_is_device(name)) continue;
      if (comp.is_externally_managed) continue;
      if (BLOOD_TYPES.has(comp.model_type)) {
        if (comp.el_base_factor_scaling !== undefined) comp.el_base_factor_scaling *= delta;
        if (comp.el_min_factor_scaling !== undefined) comp.el_min_factor_scaling *= delta;
        if (comp.el_max_factor_scaling !== undefined) comp.el_max_factor_scaling *= delta;
      }
    }
    this._prev_blood_el = factor;
  }

  scale_blood_resistances(factor) {
    const delta = factor / this._prev_blood_res;
    for (const [name, comp] of Object.entries(this._model.models)) {
      if (_is_device(name)) continue;
      // BloodVessel and MicroVascularUnit have built-in r_factor_scaling
      if ((comp.model_type === "BloodVessel" || comp.model_type === "MicroVascularUnit") && !comp.is_externally_managed) {
        if (comp.r_factor_scaling !== undefined) comp.r_factor_scaling *= delta;
      }
      // Standalone Resistors connecting to blood types
      // but not to heart chambers or gas capacitances (handled by their own scalers)
      if (comp.model_type === "Resistor" &&
          !_resistor_connects_to(comp, this._model.models, GAS_TYPES)) {
        if (comp.r_factor_scaling !== undefined) comp.r_factor_scaling *= delta;
      }
    }
    this._prev_blood_res = factor;
  }

  // --- LUNG ---

  scale_lung_u_vol(factor) {
    const delta = factor / this._prev_lung_u_vol;
    for (const [name, comp] of Object.entries(this._model.models)) {
      if (_is_device(name)) continue;
      if (GAS_TYPES.has(comp.model_type)) {
        if (comp.u_vol_factor_scaling !== undefined) comp.u_vol_factor_scaling *= delta;
      }
    }
    this._prev_lung_u_vol = factor;
  }

  scale_lung_elastances(factor) {
    const delta = factor / this._prev_lung_el;
    for (const [name, comp] of Object.entries(this._model.models)) {
      if (_is_device(name)) continue;
      if (GAS_TYPES.has(comp.model_type)) {
        if (comp.el_base_factor_scaling !== undefined) comp.el_base_factor_scaling *= delta;
      }
    }
    this._prev_lung_el = factor;
  }

  // Scale airway resistances: Resistor models connected to GasCapacitance

  scale_lung_resistances(factor) {
    const delta = factor / this._prev_lung_res;
    for (const [name, comp] of Object.entries(this._model.models)) {
      if (_is_device(name)) continue;
      if (comp.model_type === "Resistor" &&
          _resistor_connects_to(comp, this._model.models, GAS_TYPES)) {
        if (comp.r_factor_scaling !== undefined) comp.r_factor_scaling *= delta;
      }
    }
    this._prev_lung_res = factor;
  }

  // --- HEART ---

  scale_heart_u_vol(factor) {
    const delta = factor / this._prev_heart_u_vol;
    for (const comp of Object.values(this._model.models)) {
      if (comp.model_type === "HeartChamber") {
        if (comp.u_vol_factor_scaling !== undefined) comp.u_vol_factor_scaling *= delta;
      }
    }
    this._prev_heart_u_vol = factor;
  }

  scale_heart_el_min(factor) {
    const delta = factor / this._prev_heart_el_min;
    for (const comp of Object.values(this._model.models)) {
      if (comp.model_type === "HeartChamber") {
        if (comp.el_min_factor_scaling !== undefined) comp.el_min_factor_scaling *= delta;
      }
    }
    this._prev_heart_el_min = factor;
  }

  scale_heart_el_max(factor) {
    const delta = factor / this._prev_heart_el_max;
    for (const comp of Object.values(this._model.models)) {
      if (comp.model_type === "HeartChamber") {
        if (comp.el_max_factor_scaling !== undefined) comp.el_max_factor_scaling *= delta;
      }
    }
    this._prev_heart_el_max = factor;
  }

  // Scale heart resistances: Resistor models connected to HeartChamber

  scale_heart_resistances(factor) {
    const delta = factor / this._prev_heart_res;
    for (const comp of Object.values(this._model.models)) {
      if (comp.model_type === "Resistor" &&
          _resistor_connects_to(comp, this._model.models, HEART_TYPES)) {
        if (comp.r_factor_scaling !== undefined) comp.r_factor_scaling *= delta;
      }
    }
    this._prev_heart_res = factor;
  }

  // --- CONTAINERS ---

  scale_thorax_uvol(factor) {
    const delta = factor / this._prev_thorax_uvol;
    const thorax = this._model.models["THORAX"];
    if (thorax && thorax.u_vol_factor_scaling !== undefined) {
      thorax.u_vol_factor_scaling *= delta;
    }
    this._prev_thorax_uvol = factor;
  }

  scale_pericardium_uvol(factor) {
    const delta = factor / this._prev_pericardium_uvol;
    const peri = this._model.models["PERICARDIUM"];
    if (peri && peri.u_vol_factor_scaling !== undefined) {
      peri.u_vol_factor_scaling *= delta;
    }
    this._prev_pericardium_uvol = factor;
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

  incorporate() {
    for (const [name, comp] of Object.entries(this._model.models)) {
      if (_is_device(name)) continue;
      if (comp.is_externally_managed) continue;

      // bake unstressed volume scaling
      if (comp.u_vol !== undefined && comp.u_vol_factor_scaling !== undefined && comp.u_vol_factor_scaling !== 1.0) {
        comp.u_vol *= comp.u_vol_factor_scaling;
        comp.u_vol_factor_scaling = 1.0;
      }

      // bake elastance baseline scaling (Capacitance, BloodVessel, MVU, GasCapacitance)
      if (comp.el_base !== undefined && comp.el_base_factor_scaling !== undefined && comp.el_base_factor_scaling !== 1.0) {
        comp.el_base *= comp.el_base_factor_scaling;
        comp.el_base_factor_scaling = 1.0;
      }

      // bake elastance non-linear k scaling
      if (comp.el_k !== undefined && comp.el_k_factor_scaling !== undefined && comp.el_k_factor_scaling !== 1.0) {
        comp.el_k *= comp.el_k_factor_scaling;
        comp.el_k_factor_scaling = 1.0;
      }

      // bake el_min scaling (TimeVaryingElastance / HeartChamber)
      if (comp.el_min !== undefined && comp.el_min_factor_scaling !== undefined && comp.el_min_factor_scaling !== 1.0) {
        comp.el_min *= comp.el_min_factor_scaling;
        comp.el_min_factor_scaling = 1.0;
      }

      // bake el_max scaling (TimeVaryingElastance / HeartChamber)
      if (comp.el_max !== undefined && comp.el_max_factor_scaling !== undefined && comp.el_max_factor_scaling !== 1.0) {
        comp.el_max *= comp.el_max_factor_scaling;
        comp.el_max_factor_scaling = 1.0;
      }

      // bake resistance scaling (BloodVessel, MVU)
      if (comp.r_for !== undefined && comp.r_factor_scaling !== undefined && comp.r_factor_scaling !== 1.0) {
        comp.r_for *= comp.r_factor_scaling;
        comp.r_back *= comp.r_factor_scaling;
        comp.r_factor_scaling = 1.0;
      }
    }

    // also bake standalone Resistor models
    for (const [name, comp] of Object.entries(this._model.models)) {
      if (_is_device(name)) continue;
      if (comp.model_type === "Resistor" && comp.r_factor_scaling !== undefined && comp.r_factor_scaling !== 1.0) {
        comp.r_for *= comp.r_factor_scaling;
        comp.r_back *= comp.r_factor_scaling;
        comp.r_factor_scaling = 1.0;
      }
    }

    // reset all scaler tracking since factors are now absorbed
    this._prev_blood_u_vol = 1.0;
    this._prev_blood_el = 1.0;
    this._prev_blood_res = 1.0;
    this._prev_lung_u_vol = 1.0;
    this._prev_lung_el = 1.0;
    this._prev_lung_res = 1.0;
    this._prev_heart_u_vol = 1.0;
    this._prev_heart_el_min = 1.0;
    this._prev_heart_el_max = 1.0;
    this._prev_heart_res = 1.0;
    this._prev_thorax_uvol = 1.0;
    this._prev_pericardium_uvol = 1.0;
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
