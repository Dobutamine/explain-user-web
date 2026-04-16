// ModelScaler provides granular factor-based controls for scaling
// model parameters by subsystem: blood, heart, lung, and containers.
// A factor of 1.0 means no change, 0.5 means half, 2.0 means double.
//
// Each scaling group targets a predefined list of component names rather
// than scanning all models by type. This makes scaling explicit and
// predictable. The lists can be customized via the config object.

export default class ModelScaler {
  constructor(model, config = null) {
    this._model = model;
    this._config = config

    // tracking previous factor values for delta calculation
    this._prev = {
      blood_vol: 1.0,
      heart_vol: 1.0,
      lung_vol: 1.0,
      thorax_vol: 1.0,
      pericardium_vol: 1.0,
      blood_el: 1.0,
      blood_res: 1.0,
      pulm_el: 1.0,
      pulm_res: 1.0,
      pulm_uvol: 1.0,
      sys_el: 1.0,
      sys_res: 1.0,
      sys_uvol: 1.0,
      lung_el: 1.0,
      lung_res: 1.0,
      heart_el_min: 1.0,
      heart_el_max: 1.0,
      left_heart_el_min: 1.0,
      left_heart_el_max: 1.0,
      left_heart_uvol: 1.0,
      right_heart_el_min: 1.0,
      right_heart_el_max: 1.0,
      right_heart_uvol: 1.0,
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
        comp.vol *= delta;
      }
      if (comp.u_vol_factor_scaling_ps !== undefined) {
        comp.u_vol_factor_scaling_ps = factor;
      }
    }
  }

  // Scale all volumes (blood, heart, lung, thorax, pericardium
  scale_blood_volume(factor) {
    const delta = factor / this._prev.blood_vol;
    this._prev.blood_vol = factor;
    this._scale_vol(this._config.blood.volume, factor, delta);
  }

  scale_heart_volume(factor) {
    const delta = factor / this._prev.heart_vol;
    this._scale_vol(this._config.heart.volume, factor, delta);
    this._prev.heart_vol = factor;
  }

  scale_lung_volume(factor) {
    const delta = factor / this._prev.lung_vol;
    this._scale_vol(this._config.lung.volume, factor, delta);
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

  // --- PULMONARY ---

  scale_pulmonary_elastances(factor) {
    this._apply(this._config.blood_pulmonary.el_base, "el_base_factor_scaling_ps", factor);
    this._prev.pulm_el = factor;
  }

  scale_pulmonary_resistances(factor) {
    this._apply(this._config.blood_pulmonary.resistance, "r_factor_scaling_ps", factor);
    this._prev.pulm_res = factor;
  }

  scale_pulmonary_u_vol(factor) {
    this._apply(this._config.blood_pulmonary.el_base, "u_vol_factor_scaling_ps", factor);
    this._prev.pulm_uvol = factor;
  }

  // --- SYSTEMIC ---

  scale_systemic_elastances(factor) {
    this._apply(this._config.blood_systemic.el_base, "el_base_factor_scaling_ps", factor);
    this._prev.sys_el = factor;
  }

  scale_systemic_resistances(factor) {
    this._apply(this._config.blood_systemic.resistance, "r_factor_scaling_ps", factor);
    this._prev.sys_res = factor;
  }

  scale_systemic_u_vol(factor) {
    this._apply(this._config.blood_systemic.el_base, "u_vol_factor_scaling_ps", factor);
    this._prev.sys_uvol = factor;
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

  // --- LEFT HEART ---

  scale_left_heart_el_min(factor) {
    this._apply(this._config.heart_left.el_min, "el_min_factor_scaling_ps", factor);
    this._prev.left_heart_el_min = factor;
  }

  scale_left_heart_el_max(factor) {
    this._apply(this._config.heart_left.el_max, "el_max_factor_scaling_ps", factor);
    this._prev.left_heart_el_max = factor;
  }

  scale_left_heart_u_vol(factor) {
    this._apply(this._config.heart_left.el_min, "u_vol_factor_scaling_ps", factor);
    this._prev.left_heart_uvol = factor;
  }

  // --- RIGHT HEART ---

  scale_right_heart_el_min(factor) {
    this._apply(this._config.heart_right.el_min, "el_min_factor_scaling_ps", factor);
    this._prev.right_heart_el_min = factor;
  }

  scale_right_heart_el_max(factor) {
    this._apply(this._config.heart_right.el_max, "el_max_factor_scaling_ps", factor);
    this._prev.right_heart_el_max = factor;
  }

  scale_right_heart_u_vol(factor) {
    this._apply(this._config.heart_right.el_min, "u_vol_factor_scaling_ps", factor);
    this._prev.right_heart_uvol = factor;
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

  // --- INCORPORATE ---

  // Bake all scaling factors into base properties, then reset factors to 1.0
  incorporate() {
    // bake u_vol factors
    const u_vol_groups = [
      ...this._config.blood.volume,
      ...this._config.blood_pulmonary.el_base,
      ...this._config.blood_systemic.el_base,
      ...this._config.heart.volume,
      ...this._config.heart_left.el_min,
      ...this._config.heart_right.el_min,
      ...this._config.lung.volume,
      ...this._config.thorax,
      ...this._config.pericardium,
    ];
    this._bake(u_vol_groups, "u_vol", "u_vol_factor_scaling_ps");

    // bake el_base factors
    const el_base_groups = [
      ...this._config.blood.el_base,
      ...this._config.blood_pulmonary.el_base,
      ...this._config.blood_systemic.el_base,
      ...this._config.lung.el_base,
      ...this._config.thorax,
      ...this._config.pericardium,
    ];
    this._bake(el_base_groups, "el_base", "el_base_factor_scaling_ps");

    // bake heart el_min and el_max factors
    this._bake(this._config.heart.el_min, "el_min", "el_min_factor_scaling_ps");
    this._bake(this._config.heart.el_max, "el_max", "el_max_factor_scaling_ps");

    // bake resistance factors
    const res_groups = [
      ...this._config.blood.resistance,
      ...this._config.blood_pulmonary.resistance,
      ...this._config.blood_systemic.resistance,
      ...this._config.lung.resistance,
      ...this._config.heart.resistance,
    ];
    this._bake_resistance(res_groups);

    // reset all tracking
    for (const key of Object.keys(this._prev)) {
      this._prev[key] = 1.0;
    }
  }

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
      const f = comp.r_factor_scaling_ps;
      if (f !== undefined && f !== 1.0) {
        if (comp.r_for !== undefined) comp.r_for *= f;
        if (comp.r_back !== undefined) comp.r_back *= f;
        comp.r_factor_scaling_ps = 1.0;
      }
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
    this.scale_blood_volume(1.0);
    this.scale_heart_volume(1.0);
    this.scale_lung_volume(1.0);
    this.scale_thorax_volume(1.0);
    this.scale_pericardium_volume(1.0);

    this.scale_blood_elastances(1.0);
    this.scale_blood_resistances(1.0);

    this.scale_pulmonary_elastances(1.0);
    this.scale_pulmonary_resistances(1.0);
    this.scale_pulmonary_u_vol(1.0);

    this.scale_systemic_elastances(1.0);
    this.scale_systemic_resistances(1.0);
    this.scale_systemic_u_vol(1.0);

    this.scale_lung_elastances(1.0);
    this.scale_lung_resistances(1.0);

    this.scale_heart_el_min(1.0);
    this.scale_heart_el_max(1.0);
    this.scale_left_heart_el_min(1.0);
    this.scale_left_heart_el_max(1.0);
    this.scale_left_heart_u_vol(1.0);
    this.scale_right_heart_el_min(1.0);
    this.scale_right_heart_el_max(1.0);
    this.scale_right_heart_u_vol(1.0);
    this.scale_heart_resistances(1.0);

    this.scale_thorax_elastances(1.0);
    this.scale_pericardium_elastances(1.0);
  }
}
