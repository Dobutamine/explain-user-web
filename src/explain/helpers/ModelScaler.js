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

    // scaling factors
    this._factors = {
      blood_vol: 1.0,
      heart_vol: 1.0,
      lung_vol: 1.0,
      thorax_vol: 1.0,
      pericardium_vol: 1.0,
      blood_el: 1.0,
      blood_res: 1.0,
      lung_el: 1.0,
      lung_res: 1.0,
      heart_el_min: 1.0,
      heart_el_max: 1.0,
      heart_res: 1.0,
      thorax_el: 1.0,
      pericardium_el: 1.0,
    };

    // tracking previous factor values for delta calculation
    this._prev = {
      blood_vol: 1.0,
      heart_vol: 1.0,
      lung_vol: 1.0,
      thorax_vol: 1.0,
      pericardium_vol: 1.0,
      blood_el: 1.0,
      blood_res: 1.0,
      lung_el: 1.0,
      lung_res: 1.0,
      heart_el_min: 1.0,
      heart_el_max: 1.0,
      heart_res: 1.0,
      thorax_el: 1.0,
      pericardium_el: 1.0,
    };
  }

  // Apply a scaling delta to a specific factor property on a list of named components
  _apply(names, prop, factor) {
    for (const name of names) {
      const comp = this._model.models[name];
      if (comp && comp[prop] !== undefined) {
        comp[prop] = factor;
      }
    }
  }

  // --- VOLUME SCALING ---

  // Scale vol and u_vol_factor_scaling on a list of named components
  _scale_vol(names, factor, delta) {
    for (const name of names) {
      const comp = this._model.models[name];
      if (!comp) continue;
      if (comp.vol !== undefined) {
        console.log(`Scaling ${name} vol: ${comp.vol.toFixed(3)} * ${delta.toFixed(3)}`);
        comp.vol *= delta;
      }
      if (comp.u_vol_factor_scaling_ps !== undefined) {
        console.log(`Scaling ${name} u_vol_factor_scaling_ps: ${factor.toFixed(3)}`);
        comp.u_vol_factor_scaling_ps = factor;
      }
    }
  }

  _current_vol(names) {
    let total_vol = 0.0;
    for (const name of names) {
      const comp = this._model.models[name];
      if (!comp) continue;
      if (comp.vol !== undefined && comp.is_enabled) {
        total_vol += comp.vol;
      }
    }

    return total_vol;
  }

  // Scale all volumes (blood, heart, lung, thorax, pericardium
  scale_blood_volume(factor) {
    const delta = factor / this._prev.blood_vol;
    console.log(`Scaling blood volume by factor ${factor.toFixed(3)} (delta: ${delta.toFixed(3)})`);
    this._prev.blood_vol = factor;
    this._scale_vol(this._config.blood.u_vol, factor, delta);
  }

  scale_heart_volume(factor) {
    const delta = factor / this._prev.heart_vol;
    console.log(`Scaling heart volume by factor ${factor.toFixed(3)} (delta: ${delta.toFixed(3)})`);
    this._scale_vol(this._config.heart.u_vol, factor, delta);
    this._prev.heart_vol = factor;
  }

  scale_lung_volume(factor) {
    const delta = factor / this._prev.lung_vol;
    this._scale_vol(this._config.lung.u_vol, factor, delta);
    this._prev.lung_vol = factor;
  }

  scale_thorax_volume(factor) {
    const delta = factor / this._prev.thorax_vol;
    this._scale_vol(this._config.thorax, factor, delta);
    this._prev.thorax_vol = factor;
  }

  scale_pericardium_volume(factor) {
    const delta = factor / this._prev.pericardium_vol;
    this._scale_vol(this._config.pericardium, factor, delta);
    this._prev.pericardium_vol = factor;
  }

  // --- BLOOD ---

  scale_blood_elastances(factor) {
    this._apply(this._config.blood.el_base, "el_base_factor_scaling_ps", factor);
    this._prev.blood_el = factor;
  }

  scale_blood_resistances(factor) {
    this._apply(this._config.blood.resistance, "r_factor_scaling_ps", factor);
    this._prev.blood_res = factor;
  }

  // --- LUNG ---

  scale_lung_elastances(factor) {
    this._apply(this._config.lung.el_base, "el_base_factor_scaling_ps", factor);
    this._prev.lung_el = factor;
  }

  scale_lung_resistances(factor) {
    this._apply(this._config.lung.resistance, "r_factor_scaling_ps", factor);
    this._prev.lung_res = factor;
  }

  // --- HEART ---

  scale_heart_el_min(factor) {
    this._apply(this._config.heart.el_min, "el_min_factor_scaling_ps", factor);
    this._prev.heart_el_min = factor;
  }

  scale_heart_el_max(factor) {
    this._apply(this._config.heart.el_max, "el_max_factor_scaling_ps", factor);
    this._prev.heart_el_max = factor;
  }

  scale_heart_resistances(factor) {
    this._apply(this._config.heart.resistance, "r_factor_scaling_ps", factor);
    this._prev.heart_res = factor;
  }

  // --- CONTAINERS ---

  scale_thorax_elastances(factor) {
    this._apply(this._config.thorax, "el_base_factor_scaling_ps", factor);
    this._prev.thorax_el = factor;
  }

  scale_pericardium_elastances(factor) {
    this._apply(this._config.pericardium, "el_base_factor_scaling_ps", factor);
    this._prev.pericardium_el = factor;
  }

  // --- UTILITY ---

  add_volume(vol_liters) {
    const ivci = this._model.models["IVCI"];
    if (ivci && ivci.vol !== undefined) {
      ivci.vol += vol_liters;
    }
  }

  reset() {
    this.scale_blood_volume(1.0);
    this.scale_heart_volume(1.0);
    this.scale_lung_volume(1.0);
    this.scale_thorax_volume(1.0);
    this.scale_pericardium_volume(1.0);

    this.scale_blood_elastances(1.0);
    this.scale_blood_resistances(1.0);

    this.scale_lung_elastances(1.0);
    this.scale_lung_resistances(1.0);

    this.scale_heart_el_min(1.0);
    this.scale_heart_el_max(1.0);
    this.scale_heart_resistances(1.0);

    this.scale_thorax_elastances(1.0);
    this.scale_pericardium_elastances(1.0);
  }
}
