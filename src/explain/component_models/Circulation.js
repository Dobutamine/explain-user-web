import { BaseModelClass } from "../base_models/BaseModelClass";

/*
  The ANS—chiefly via sympathetic adrenergic fibers—regulates vasotone across the arterial–venous tree by tuning 
  smooth‐muscle contraction through α₁, α₂ and β₂ receptors, under the guidance of central vasomotor centers and reflexes 
  (baroreceptors, chemoreceptors). Parasympathetic/cholinergic control of vascular tone is limited to specialized beds 
*/

export class Circulation extends BaseModelClass {
  // static properties
  static model_type = "Circulation";
  static model_interface = []

  /*
    The Circulation class is not a model but houses methods that influence groups of models. In case
    of the circulation class, these groups contain models related to blood circulation.
    */
  constructor(model_ref, name = "") {
    super(model_ref, name);

    // -----------------------------------------------
    // independent properties
    // -----------------------------------------------
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
    // local properties
    this._combined_list = []
    this._syst_models = []
    this._pulm_models = []
    this._prev_ans_activity = 0.0;
    this._update_interval = 0.015;      // update interval (s)
    this._update_counter = 0.0;         // update interval counter (s)
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
  }
}
