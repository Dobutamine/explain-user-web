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
      edit_mode: "caption",
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
    },
    {
      target: "CR_PCO2",
      type: "reference",
      caption: "Chemoreceptor pCO2",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
    },
    {
      target: "CR_PH",
      type: "reference",
      caption: "Chemoreceptor pH",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
    },
    {
      target: "CR_PO2",
      type: "reference",
      caption: "Chemoreceptor pO2",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
    },
    {
      target: "EF_HR",
      type: "reference",
      caption: "Ans efferent heartrate",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
    },
    {
      target: "EF_SVR",
      type: "reference",
      caption: "Ans efferent systemic vascular resistance",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
    },
    {
      target: "EF_HEART",
      type: "reference",
      caption: "Ans efferent heart contractility",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
    },
    {
      target: "EF_MV",
      type: "reference",
      caption: "Ans efferent minute volume",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
    }
  ];

  constructor(model_ref, name = "") {
    // initialize the parent class
    super(model_ref, name);

    // initialize independent properties
    this.ans_active = true; // flag whether the ANS is active
    this.components = {}
    this.blood_composition_models= []; // list of models from which the ANS needs to calculate blood gases

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
}
