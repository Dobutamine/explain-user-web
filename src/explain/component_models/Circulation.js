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
      options: ["BloodVessel", "MicroVascularUnit"]
    },
    {
      caption: "systemic capillaries",
      target: "systemic_capillaries",
      type: "multiple-list",
      edit_mode: "extra",
      build_prop: true,
      readonly: false,
      options: ["BloodVessel", "MicroVascularUnit"]
    },
    {
      caption: "systemic veins",
      target: "systemic_veins",
      type: "multiple-list",
      edit_mode: "extra",
      build_prop: true,
      readonly: false,
      options: ["BloodVessel", "MicroVascularUnit"]
    },
    {
      caption: "pulmonary arteries",
      target: "pulmonary_arteries",
      type: "multiple-list",
      edit_mode: "extra",
      build_prop: true,
      readonly: false,
      options: ["BloodVessel", "MicroVascularUnit"]
    },
    {
      caption: "pulmonary capillaries",
      target: "pulmonary_capillaries",
      type: "multiple-list",
      edit_mode: "extra",
      build_prop: true,
      readonly: false,
      options: ["BloodVessel", "MicroVascularUnit"]
    },
    {
      caption: "pulmonary veins",
      target: "pulmonary_veins",
      type: "multiple-list",
      edit_mode: "extra",
      build_prop: true,
      readonly: false,
      options: ["BloodVessel", "MicroVascularUnit"]
    },
    {
      caption: "svr factor",
      target: "svr_factor",
      type: "factor",
      delta: 0.01,
      rounding: 2,
      ll: -5.0,
      ul: 5.0
    },
    {
      caption: "pvr factor",
      target: "pvr_factor",
      type: "factor",
      delta: 0.01,
      rounding: 2,
      ll: -5.0,
      ul: 5
    },
    {
      caption: "blood volume",
      type: "function",
      target: "set_blood_volume",
      edit_mode: "basic",
      build_prop: false,
      readonly: false,
      args: [
        {
          caption: "new blood volume (ml)",
          target: "total_blood_volume",
          type: "number",
          factor: 1000,
          delta: 1,
          rounding: 0
        }
      ]
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
    this.systemic_veins = [];           // list of systemic veins
    this.systemic_capillaries = [];     // list of systemic capillaries 
    this.pulmonary_arteries = [];       // list of pulmonary arteries
    this.pulmonary_veins = [];          // list of pulmonary veins 
    this.pulmonary_capillaries = [];    // list of pulmonary capillaries
    this.ans_activity = 1.0;            // ans influence on circulation (1.0 = no effect)
    this.svr_factor = 1.0;              // factor influencing the systemic vascular resistance
    this.pvr_factor = 1.0;              // factor influencing the pulmonary vascular resistance


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
    this._combined_list = [];
    this._syst_models = []
    this._pulm_models = []
    this._prev_ans_activity = 0.0;
    this._prev_svr_factor = 1.0;
    this._prev_pvr_factor = 1.0;
    this._update_interval = 0.015;      // update interval (s)
    this._update_counter = 0.0;         // update interval counter (s)
    this._update_interval_slow = 1.0;      // update interval (s)
    this._update_counter_slow = 0.0;         // update interval counter (s)
  }
  init_model(args = {}) {
    super.init_model(args);

    // build a combined list of all circulation models
    this._combined_list = [
      ...this.systemic_arteries, 
      ...this.systemic_capillaries,
      ...this.systemic_veins,
      ...this.pulmonary_arteries,
      ...this.pulmonary_capillaries,
      ...this.pulmonary_veins
    ]

    // build a list of all systemic models
    this._syst_models = [
      ...this.systemic_arteries, 
      ...this.systemic_capillaries,
      ...this.systemic_veins
    ]

    // build a llist of all pulmonary models
    this._pulm_models = [
      ...this.pulmonary_arteries,
      ...this.pulmonary_capillaries,
      ...this.pulmonary_veins
    ]

  }

  calc_model() {
    this._update_counter += this._t;
    if (this._update_counter > this._update_interval) {
      this._update_counter = 0.0;

      // BloodVessels (and MicroVascular Units) expose an ans_activity and an ans_sensitivity parameter which control the amount of vasoreactivity. 
      // The ciruclation model has an ans_activity parameter which can be set by an ANS effector and this ans_activity parameter is 
      // set on all BloodVessels and MicroVascular units of the circulation.

      // update the ans influence on the circulation if the influence has changed
      if (this._prev_ans_activity != this.ans_activity) {
        this._combined_list.forEach(model => {
          // update the models
          this._model_engine.models[model].ans_activity = this.ans_activity;
          // store current value
          this._prev_ans_activity = this.ans_activity
        })
      }

      if (this._prev_svr_factor !== this.svr_factor) {
        this.set_svr_factor(this.svr_factor)
        this._prev_svr_factor = this.svr_factor
      }

      if (this._prev_pvr_factor !== this.pvr_factor) {
        this.set_pvr_factor(this.pvr_factor)
        this._prev_pvr_factor = this.pvr_factor
      }
    }

    this._update_counter_slow += this._t;
    if (this._update_counter_slow > this._update_interval_slow) {
      this._update_counter_slow = 0.0;
      // calculate all the blood volumes (every 1 second for performance reasons)
      this.calc_blood_volumes();
    }
  }

  set_svr_factor(new_svr_factor) {
    this._syst_models.forEach(syst_model_name => {
      // get a reference to the model
      let m = this._model_engine.models[syst_model_name]
      // get the current r_factor from the model
      let f_ps = m.r_factor_ps;
      // as this is a presistent resistance factor which cumulates all effects from different models we can't just add the new factor
      // we have to add the difference 
      let delta_svr = new_svr_factor - this._prev_svr_factor
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
      this.svr_factor = new_svr_factor
    })
  }

  set_pvr_factor(new_pvr_factor) {
    this._pulm_models.forEach(pulm_model_name => {
      // get a reference to the model
      let m = this._model_engine.models[pulm_model_name]
      // get the current r_factor from the model
      let f_ps = m.r_factor_ps;
      // as this is a presistent resistance factor which cumulates all effects from different models we can't just add the new factor
      // we have to add the difference 
      let delta_pvr = new_pvr_factor - this._prev_pvr_factor
      // add the increase/decrease in factor
      f_ps += delta_pvr;
      // guard against negative values
      if (f_ps < 0) {
        new_pvr_factor = -f_ps
        f_ps = 0;
      }
      // transfer the factor
      m.r_factor_ps = f_ps
      // store the new svr factor
      this.pvr_factor = new_pvr_factor
    })
  }

  calc_blood_volumes() {
    // return the total blood volume
    this.total_blood_volume = 0.0;
    this.syst_blood_volume = 0.0;
    this.pulm_blood_volume = 0.0;
    this.heart_blood_volume = 0.0;

    this._syst_models.forEach(model => {
      if (this._model_engine.models[model].is_enabled) {
        this.syst_blood_volume += this._model_engine.models[model].vol
      }
    })

    this.heart_chambers.forEach(model => {
      if (this._model_engine.models[model].is_enabled) {
        this.heart_blood_volume += this._model_engine.models[model].vol
      }
    })

    this.coronaries.forEach(model => {
      if (this._model_engine.models[model].is_enabled) {
        this.syst_blood_volume += this._model_engine.models[model].vol
      }
    })

    this._pulm_models.forEach(model => {
      if (this._model_engine.models[model].is_enabled) {
        this.pulm_blood_volume += this._model_engine.models[model].vol
      }
    })

    this.total_blood_volume = this.syst_blood_volume + this.pulm_blood_volume + this.heart_blood_volume
    this.syst_blood_volume_perc = this.syst_blood_volume / this.total_blood_volume * 100.0
    this.pulm_blood_volume_perc = this.pulm_blood_volume / this.total_blood_volume * 100.0
    this.heart_blood_volume_perc = this.heart_blood_volume / this.total_blood_volume * 100.0

  }

  set_blood_volume(new_volume) {
    // first calculate the current blood volume
    this.calc_blood_volumes()
    // calculate the scaling factor
    const scaling_factor = new_volume / this.total_blood_volume;

    // scale the blood volumes
     this._syst_models.forEach(model => {
      if (this._model_engine.models[model].is_enabled) {
        this._model_engine.models[model].vol = this._model_engine.models[model].vol * scaling_factor
        this._model_engine.models[model].u_vol = this._model_engine.models[model].u_vol * scaling_factor
      }
    })

    this.heart_chambers.forEach(model => {
      if (this._model_engine.models[model].is_enabled) {
        this._model_engine.models[model].vol = this._model_engine.models[model].vol * scaling_factor
        this._model_engine.models[model].u_vol = this._model_engine.models[model].u_vol * scaling_factor
      }
    })

    this.coronaries.forEach(model => {
      if (this._model_engine.models[model].is_enabled) {
        this._model_engine.models[model].vol = this._model_engine.models[model].vol * scaling_factor
        this._model_engine.models[model].u_vol = this._model_engine.models[model].u_vol * scaling_factor
      }
    })

    this._pulm_models.forEach(model => {
      if (this._model_engine.models[model].is_enabled) {
        this._model_engine.models[model].vol = this._model_engine.models[model].vol * scaling_factor
        this._model_engine.models[model].u_vol = this._model_engine.models[model].u_vol * scaling_factor
      }
    })
    // first calculate the new blood volume
    this.calc_blood_volumes()
  }
}
