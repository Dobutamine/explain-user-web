import { BaseModelClass } from "../base_models/BaseModelClass";

/*
  The ANS—chiefly via sympathetic adrenergic fibers—regulates vasotone across the arterial–venous tree by tuning 
  smooth‐muscle contraction through α₁, α₂ and β₂ receptors, under the guidance of central vasomotor centers and reflexes 
  (baroreceptors, chemoreceptors). Parasympathetic/cholinergic control of vascular tone is limited to specialized beds 
*/

export class Circulation extends BaseModelClass {
  // static properties
  static model_type = "Circulation";
  static model_interface = [
    {
      target: "description",
      type: "string",
      build_prop: true,
      edit_mode: "caption",
      readonly: true,
      caption: "description",
    },
    {
      target: "is_enabled",
      type: "boolean",
      build_prop: true,
      edit_mode: "all",
      readonly: false,
      caption: "enabled",
    },
    {
      caption: "heart chambers",
      target: "heart_chambers",
      type: "multiple-list",
      edit_mode: "extra",
      build_prop: true,
      readonly: false,
      options: ["HeartChamber", "BloodTimeVaryingElastance"]
    },
    {
      caption: "systemic arteries",
      target: "systemic_arteries",
      type: "multiple-list",
      edit_mode: "extra",
      build_prop: true,
      readonly: false,
      options: ["BloodVessel"]
    },
    {
      caption: "systemic arterioles",
      target: "systemic_arterioles",
      type: "multiple-list",
      edit_mode: "extra",
      build_prop: true,
      readonly: false,
      options: ["BloodVessel"]
    },
    {
      caption: "systemic capillaries",
      target: "systemic_capillaries",
      type: "multiple-list",
      edit_mode: "extra",
      build_prop: true,
      readonly: false,
      options: ["BloodVessel"]
    },
    {
      caption: "systemic venules",
      target: "systemic_venules",
      type: "multiple-list",
      edit_mode: "extra",
      build_prop: true,
      readonly: false,
      options: ["BloodVessel"]
    },
    {
      caption: "systemic veins",
      target: "systemic_veins",
      type: "multiple-list",
      edit_mode: "extra",
      build_prop: true,
      readonly: false,
      options: ["BloodVessel"]
    },
    {
      caption: "pulmonary arteries",
      target: "pulmonary_arteries",
      type: "multiple-list",
      edit_mode: "extra",
      build_prop: true,
      readonly: false,
      options: ["BloodVessel"]
    },
    {
      caption: "pulmonary arterioles",
      target: "pulmonary_arterioles",
      type: "multiple-list",
      edit_mode: "extra",
      build_prop: true,
      readonly: false,
      options: ["BloodVessel"]
    },
    {
      caption: "pulmonary capillaries",
      target: "pulmonary_capillaries",
      type: "multiple-list",
      edit_mode: "extra",
      build_prop: true,
      readonly: false,
      options: ["BloodVessel"]
    },
    {
      caption: "pulmonary venules",
      target: "pulmonary_venules",
      type: "multiple-list",
      edit_mode: "extra",
      build_prop: true,
      readonly: false,
      options: ["BloodVessel"]
    },
    {
      caption: "pulmonary veins",
      target: "pulmonary_veins",
      type: "multiple-list",
      edit_mode: "extra",
      build_prop: true,
      readonly: false,
      options: ["BloodVessel"]
    },
    {
      caption: "svr factor (arterioles)",
      target: "svr_factor_art",
      type: "factor",
      delta: 0.1,
      rounding: 1,
      ll: -10.0,
      ul: 10.0
    },
    {
      caption: "svr factor (venules)",
      target: "svr_factor_ven",
      type: "factor",
      delta: 0.1,
      rounding: 1,
      ll: -10.0,
      ul: 10.0
    },
    {
      caption: "pvr factor (arterioles)",
      target: "pvr_factor_art",
      type: "factor",
      delta: 0.1,
      rounding: 1,
      ll: -10.0,
      ul: 10.0
    },
     {
      caption: "pvr factor (venules)",
      target: "pvr_factor_ven",
      type: "factor",
      delta: 0.1,
      rounding: 1,
      ll: -10.0,
      ul: 10.0
    }
  ]

  /*
    The Circulation class is not a model but houses methods that influence groups of models. In case
    of the circulation class, these groups contain models related to blood circulation.
    */
  constructor(model_ref, name = "") {
    // initialize the parent class
    super(model_ref, name);

    // -----------------------------------------------
    // independent properties
    // -----------------------------------------------
    this.heart_chambers = [];           // list of all heart chambers
    this.coronaries = [];               // list of all coronary models
    
    this.systemic_arteries = [];        // list of systemic arteries
    this.systemic_arterioles = [];       // list of systemic arterioles
    this.systemic_capillaries = [];     // list of systemic capillaries 
    this.systemic_venules = [];        // list of systemic venules
    this.systemic_veins = [];           // list of systemic veins
    
    this.pulmonary_arteries = [];       // list of pulmonary arteries
    this.pulmonary_arterioles = [];     // list of pulmonary arterioles
    this.pulmonary_capillaries = [];    // list of pulmonary capillaries
    this.pulmonary_venules = [];        // list of pulmonary venules
    this.pulmonary_veins = [];          // list of pulmonary veins 
    
    this.ans_activity = 1.0;            // ans influence on circulation (1.0 = no effect)
    this.svr_factor_art = 1.0;          // factor influencing the systemic arteriolar vascular resistance
    this.svr_factor_ven = 1.0;          // factor influencing the systemic venular vascular resistance
    this.pvr_factor_art = 1.0;          // factor influencing the pulmonary arteriolar vascular resistance
    this.pvr_factor_ven = 1.0;          // factor influencing the pulmonary venular vascular resistance


    // -----------------------------------------------
    // dependent properties
    // -----------------------------------------------
    this.total_blood_volume = 0.0;      // total blood volume (L)
    this.syst_blood_volume = 0.0;       // total blood volume in systemic circulation (L)
    this.pulm_blood_volume = 0.0;       // total blood volume in pulmonary circulatino (L)
    this.heart_blood_volume = 0.0;      // blood volume of the heart (L)
    this.syst_blood_volume_perc = 0.0;  // percentage of total blood volume in systemic circulation (%)
    this.pulm_blood_volume_perc = 0.0;  // percentage of total blood volume in pulmonary circulation (%)
    this.heart_blood_volume_perc = 0.0; // percentage of total blood volume in heart (%)

    // local properties
    this._bloodvessel_list = [];
    this._systemic_bloodvessel_list = [];
    this._pulmonary_bloodvessel_list = [];

    this.prev_ans_activity = 0.0;
    this.prev_svr_factor_art = 1.0;
    this.prev_svr_factor_ven = 1.0;
    this.prev_pvr_factor_art = 1.0;
    this.prev_pvr_factor_ven = 1.0;
    this._update_interval = 0.015;      // update interval (s)
    this._update_counter = 0.0;         // update interval counter (s)
    this._update_interval_slow = 1.0;      // update interval (s)
    this._update_counter_slow = 0.0;         // update interval counter (s)
  }
  init_model(args = {}) {
    super.init_model(args);

    // build a list of all blood vessel models for easy access
    this._bloodvessel_list = [
      ...this.systemic_arteries, 
      ...this.systemic_arterioles,
      ...this.systemic_capillaries,
      ...this.systemic_venules,
      ...this.systemic_veins,
      ...this.pulmonary_arteries,
      ...this.pulmonary_arterioles,
      ...this.pulmonary_capillaries,
      ...this.pulmonary_venules,
      ...this.pulmonary_veins
    ]

    this._systemic_bloodvessel_list = [
      ...this.systemic_arteries, 
      ...this.systemic_arterioles,
      ...this.systemic_capillaries,
      ...this.systemic_venules,
      ...this.systemic_veins
    ]

    this._pulmonary_bloodvessel_list = [
      ...this.pulmonary_arteries,
      ...this.pulmonary_arterioles,
      ...this.pulmonary_capillaries,
      ...this.pulmonary_venules,
      ...this.pulmonary_veins
    ]

  }

  calc_model() {
    this._update_counter += this._t;
    if (this._update_counter > this._update_interval) {
      this._update_counter = 0.0;

      // BloodVessels expose an ans_activity and an ans_sensitivity parameter which control the amount of vasoreactivity. 
      // The ciruclation model has an ans_activity parameter which can be set by an ANS effector and this ans_activity parameter is 
      // set on all BloodVessels and MicroVascular units of the circulation.

      // update the ans influence on the circulation if the influence has changed
      if (this.prev_ans_activity !== this.ans_activity) {
        for (const name of this._bloodvessel_list) {
          const m = this._model_engine.models[name];
          if (m && m.ans_activity !== undefined) {
            m.ans_activity = this.ans_activity;
          }
        }
        this.prev_ans_activity = this.ans_activity;
      }

      if (this.prev_svr_factor_art !== this.svr_factor_art) {
        this.set_svr_factor_art(this.svr_factor_art)
        this.prev_svr_factor_art = this.svr_factor_art
      }
      
      if (this.prev_svr_factor_ven !== this.svr_factor_ven) {
        this.set_svr_factor_ven(this.svr_factor_ven)
        this.prev_svr_factor_ven = this.svr_factor_ven
      }

      if (this.prev_pvr_factor_art !== this.pvr_factor_art) {
        this.set_pvr_factor_art(this.pvr_factor_art)
        this.prev_pvr_factor_art = this.pvr_factor_art
      }

      if (this.prev_pvr_factor_ven !== this.pvr_factor_ven) {
        this.set_pvr_factor_ven(this.pvr_factor_ven)
        this.prev_pvr_factor_ven = this.pvr_factor_ven
      }


    }

    this._update_counter_slow += this._t;
    if (this._update_counter_slow > this._update_interval_slow) {
      this._update_counter_slow = 0.0;
      // calculate all the blood volumes (every 1 second for performance reasons)
      this.calc_blood_volumes();
    }
  }

  set_svr_factor_art(new_svr_factor) {
    this.systemic_arterioles.forEach(syst_model_name => {
      // get a reference to the model
      let m = this._model_engine.models[syst_model_name]
      // get the current r_factor from the model
      let f_ps = m.r_factor_ps;
      // as this is a presistent resistance factor which cumulates all effects from different models we can't just add the new factor
      // we have to add the difference 
      let delta_svr = new_svr_factor - this.prev_svr_factor_art
      // add the increase/decrease in factor
      f_ps += delta_svr;
      // guard against negative values
      if (f_ps < 0) {
        new_svr_factor = -f_ps
        f_ps = 0;
      }
      // transfer the factor
      m.r_factor_ps = f_ps
      // store the new svr factor
      this.svr_factor_art = new_svr_factor
    })
  }

  set_svr_factor_ven(new_svr_factor) {
    this.systemic_venules.forEach(syst_model_name => {
      // get a reference to the model
      let m = this._model_engine.models[syst_model_name]
      // get the current r_factor from the model
      let f_ps = m.r_factor_ps;
      // as this is a presistent resistance factor which cumulates all effects from different models we can't just add the new factor
      // we have to add the difference 
      let delta_svr = new_svr_factor - this.prev_svr_factor_ven
      // add the increase/decrease in factor
      f_ps += delta_svr;
      // guard against negative values
      if (f_ps < 0) {
        new_svr_factor = -f_ps
        f_ps = 0;
      }
      // transfer the factor
      m.r_factor_ps = f_ps
      // store the new svr factor
      this.svr_factor_ven = new_svr_factor
    })
  }

  set_pvr_factor_art(new_pvr_factor) {
    this.pulmonary_arterioles.forEach(pulm_model_name => {
      // get a reference to the model
      let m = this._model_engine.models[pulm_model_name]
      // get the current r_factor from the model
      let f_ps = m.r_factor_ps;
      // as this is a presistent resistance factor which cumulates all effects from different models we can't just add the new factor
      // we have to add the difference 
      let delta_pvr = new_pvr_factor - this.prev_pvr_factor_art
      // add the increase/decrease in factor
      f_ps += delta_pvr;
      // guard against negative values
      if (f_ps < 0) {
        new_pvr_factor = -f_ps
        f_ps = 0;
      }
      //console.log(`Setting PVR factor for model ${pulm_model_name} to ${f_ps} (delta: ${delta_pvr})`)
      // transfer the factor
      m.r_factor_ps = f_ps
      // store the new pvr factor for arterioles
      this.pvr_factor_art = new_pvr_factor
    })
  }

  set_pvr_factor_ven(new_pvr_factor) {
    this.pulmonary_venules.forEach(pulm_model_name => {
      // get a reference to the model
      let m = this._model_engine.models[pulm_model_name]
      // get the current r_factor from the model
      let f_ps = m.r_factor_ps;
      // as this is a presistent resistance factor which cumulates all effects from different models we can't just add the new factor
      // we have to add the difference 
      let delta_pvr = new_pvr_factor - this.prev_pvr_factor_ven
      // add the increase/decrease in factor
      f_ps += delta_pvr;
      // guard against negative values
      if (f_ps < 0) {
        new_pvr_factor = -f_ps
        f_ps = 0;
      }
      //console.log(`Setting PVR factor for model ${pulm_model_name} to ${f_ps} (delta: ${delta_pvr})`)
      // transfer the factor
      m.r_factor_ps = f_ps
      // store the new pvr factor for venules
      this.pvr_factor_ven = new_pvr_factor
    })
  }

  calc_blood_volumes() {
    // return the total blood volume
    this.total_blood_volume = 0.0;
    this.syst_blood_volume = 0.0;
    this.pulm_blood_volume = 0.0;
    this.heart_blood_volume = 0.0;

    this._systemic_bloodvessel_list.forEach(name => {
      const m = this._model_engine.models[name];
      if (m.vol && m.is_enabled) this.syst_blood_volume += m.vol;
    })

    this.heart_chambers.forEach(name => {
      const m = this._model_engine.models[name];
      if (m.vol && m.is_enabled) this.heart_blood_volume += m.vol;
    })

    this.coronaries.forEach(name => {
      const m = this._model_engine.models[name];
      if (m.vol && m.is_enabled) this.syst_blood_volume += m.vol;
    })

    this._pulmonary_bloodvessel_list.forEach(name => {
      const m = this._model_engine.models[name];
      if (m.vol && m.is_enabled) this.pulm_blood_volume += m.vol;
    })

    this.total_blood_volume = this.syst_blood_volume + this.pulm_blood_volume + this.heart_blood_volume
    this.syst_blood_volume_perc = this.syst_blood_volume / this.total_blood_volume * 100.0
    this.pulm_blood_volume_perc = this.pulm_blood_volume / this.total_blood_volume * 100.0
    this.heart_blood_volume_perc = this.heart_blood_volume / this.total_blood_volume * 100.0

  }
}
