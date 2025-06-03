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
      type: "function",
      caption: "set_lb_compliances",
      target: "set_lower_body_compliances",
      args: [
        {
          caption: "new_comp_lb",
          target: "new_comp_lb",
          type: "number",
          factor: 1.0,
          delta: 1,
          rounding: 0
        }
      ]
    },
    {
      type: "function",
      caption: "set_lb_resistance",
      target: "set_lower_body_resistance",
      args: [
        {
          caption: "new_res_lb",
          target: "new_res_lb",
          type: "number",
          factor: 1.0,
          delta: 1,
          rounding: 0
        }
      ]
    },
        {
      type: "function",
      caption: "set_ub_compliances",
      target: "set_upper_body_compliances",
      args: [
        {
          caption: "new_comp_ub",
          target: "new_comp_ub",
          type: "number",
          factor: 1.0,
          delta: 1,
          rounding: 0
        }
      ]
    },
    {
      type: "function",
      caption: "set_ub_resistance",
      target: "set_upper_body_resistance",
      args: [
        {
          caption: "new_res_ub",
          target: "new_res_ub",
          type: "number",
          factor: 1.0,
          delta: 1,
          rounding: 0
        }
      ]
    },
    {
      type: "function",
      caption: "set_paa_resistance",
      target: "set_paa_resistance",
      args: [
        {
          caption: "new_paa_res",
          target: "new_paa_res",
          type: "number",
          factor: 1.0,
          delta: 1,
          rounding: 0
        }
      ]
    },
    {
      type: "function",
      caption: "set_lung_resistance",
      target: "set_lung_resistance",
      args: [
        {
          caption: "new_lung_res",
          target: "new_lung_res",
          type: "number",
          factor: 1.0,
          delta: 1,
          rounding: 0
        }
      ]
    },

  ]

  /*
    The Circulation class is not a model but houses methods that influence groups of models. In case
    of the circulation class, these groups contain models related to blood circulation.
    */
  constructor(model_ref, name = "") {
    super(model_ref, name);

    // -----------------------------------------------
    // independent properties
    // -----------------------------------------------
    this.heart_chambers = []
    this.coronaries = []
    this.systemic_arteries = [];        // list of systemic arteries
    this.systemic_veins = [];           // list of systemic veins
    this.systemic_capillaries = [];     // list of systemic capillaries 

    this.pulmonary_arteries = [];       // list of pulmonary arteries
    this.pulmonary_veins = [];          // list of pulmonary veins 
    this.pulmonary_capillaries = [];    // list of pulmonary capillaries

    this.ans_activity = 1.0;     // ans influence on circulation (1.0 = no effect)

    // -----------------------------------------------
    // dependent properties
    // -----------------------------------------------
    this.total_blood_volume = 0.0;
    this.syst_blood_volume = 0.0;
    this.pulm_blood_volume = 0.0;
    this.heart_blood_volume = 0.0;
    this.syst_blood_volume_perc = 0.0;
    this.pulm_blood_volume_perc = 0.0;
    this.heart_blood_volume_perc = 0.0;


    this.new_comp_lb = 10000;
    this.new_res_lb = 15000;
    
    this.new_comp_ub = 10000;
    this.new_res_ub = 15000;

    this.new_paa_res = 1500.0
    this.new_lung_res = 2000.0

    // local properties
    this._combined_list = []
    this._syst_models = []
    this._pulm_models = []
    this._prev_ans_activity = 0.0;
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

  set_lower_body_compliances(new_comp) {
    this.new_comp_lb = new_comp;
    this._model_engine.models["INT"].el_base = new_comp
    this._model_engine.models["KID"].el_base = new_comp
    this._model_engine.models["LS"].el_base = new_comp
    this._model_engine.models["RLB"].el_base = new_comp
  }

  set_lower_body_resistance(new_res) {
    this.new_res_lb = new_res;
    this._model_engine.models["INT"].r_for = new_res
    this._model_engine.models["KID"].r_for = new_res
    this._model_engine.models["LS"].r_for = new_res
    this._model_engine.models["RLB"].r_for = new_res
  }

  set_upper_body_compliances(new_comp) {
    this.new_comp_ub = new_comp;
    this._model_engine.models["BR"].el_base = new_comp
    this._model_engine.models["RUB"].el_base = new_comp
  }

  set_upper_body_resistance(new_res) {
    this.new_res_ub = new_res;
    this._model_engine.models["BR"].r_for = new_res
    this._model_engine.models["RUB"].r_for = new_res
  }

  set_paa_resistance(new_res) {
    this.new_paa_res = new_res;
    this._model_engine.models["PAAL"].r_for = new_res
    this._model_engine.models["PAAR"].r_for = new_res
  }

  set_lung_resistance(new_res) {
    this.new_lung_res = new_res;
    this._model_engine.models["LL"].r_for = new_res
    this._model_engine.models["RL"].r_for = new_res
  }



  calc_model() {
    this._update_counter += this._t;
    if (this._update_counter > this._update_interval) {
      this._update_counter = 0.0;

      // BloodVessels expose a ans_activity and an ans_sensitivity parameter which control
      // the amount of vasoreactivity. The alpha parameter of the BloodVessel determines
      // the relation between resistance change and elastance change.
      // The ciruclation model has an ans_activity parameter which can be set by an ANS effector
      // and this ans_activity parameter is set on all BloodVessels and MicroVascular units.

      // update the ans influence on the circulation
      if (this._prev_ans_activity != this.ans_activity) {
        this._combined_list.forEach(model => {
          // update the models
          this._model_engine.models[model].ans_activity = this.ans_activity;
          // store curtrent value
          this._prev_ans_activity = this.ans_activity
        })
      }
    }

    this._update_counter_slow += this._t;
    if (this._update_counter_slow > this._update_interval_slow) {
      this._update_counter_slow = 0.0;
      this.calc_blood_volumes();
    }
  }

  set_svr_factor(factor) {
    this._syst_models.forEach(model => {
      if (this._model_engine.models[model].is_enabled) {
        this._model_engine.models[model].r_factor_ps = factor
      }
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
}
