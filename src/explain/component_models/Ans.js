import { BaseModelClass } from "../base_models/BaseModelClass";
import { calc_blood_composition } from "./BloodComposition";

export class Ans extends BaseModelClass {
  // static properties
  static model_type = "Ans";
  static model_interface = [
    {
      target: "description",
      type: "string",
      caption: "description",
      build_prop: true,
      edit_mode: "basic",
      readonly: true
    },
    {
      target: "is_enabled",
      type: "boolean",
      caption: "enabled",
      build_prop: true,
      edit_mode: "all",
      readonly: false,
    },
    {
      target: "ans_active",
      type: "boolean",
      caption: "ANS active",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
    },
    {
      target: "BR_MAP",
      type: "reference",
      caption: "Baroreceptor",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
    }
  ];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.ans_active = true; // flag whether the ANS is active
    this.components = {}
    this.blood_composition_models= []; // list of models from which the ANS needs to calculate blood gases
    this.baroreflex_model = {}
    this.chemoreflex_ph = {}
    this.chemoreflex_po2 = {}
    this.chemoreflex_pco2 = {}
    this.chemoreflex_hco3 = {}
    this.chemoreflex_be = {}

    this.br_map = "BR_MAP"

    // initialize local properties
    this._update_interval = 0.05; // update interval of the ANS (seconds)
    this._update_counter = 0.0; // update counter (seconds)
   
  }

  calc_model() {

    // Increase the update counter
    this._update_counter += this._t;

    // Check if it's time to run the calculations
    if (this._update_counter >= this._update_interval) {
      // Reset the update counter
      this._update_counter = 0.0;

      // switch through all components
      Object.keys(this.components).forEach(component => 
        {
          this._model_engine.models[component].is_enabled = this.ans_active;
        }
      );

      // calculate the necessary blood compositions
      this.blood_composition_models.forEach(model => {
        let m = this._model_engine.models[model];
        if (m.is_enabled) {
          calc_blood_composition(m);
        }
      });
    }
  }

  // Afferents
  baroreflex() {

  }

  chemoreceptor_pco2() {

  }

  chemoreceptor_po2() {

  }

  chemoreceptor_ph() {

  }
}
