import { BloodCapacitance } from "../base_models/BloodCapacitance";

export class BloodVessel extends BloodCapacitance {
  // static properties
  static model_type = "BloodVessel";
  model_interface = [
    {
      caption: "model type",
      target: "model_type",
      type: "string",
      readonly: true
    },
    {
      caption: "description",
      target: "description",
      type: "string",
      readonly: true
    },
    {
      caption: "enabled",
      target: "is_enabled",
      type: "boolean"
    },
    {
      caption: "volume (L)",
      target: "vol",
      type: "number",
      factor: 1.0,
      delta: 0.001,
      rounding: 3
    },
    {
      caption: "unstressed volume (L)",
      target: "u_vol",
      type: "number",
      factor: 1.0,
      delta: 0.001,
      rounding: 3,
    },
    {
      caption: "elastance baseline (mmHg/L)",
      target: "el_base",
      type: "number",
      factor: 1,
      delta: 1,
      rounding: 0,
    },
    {
      caption: "elastance non linear k",
      target: "el_k",
      type: "number",
      factor: 1,
      delta: 1,
      rounding: 0,
    },
    {
      caption: "temperature (C)",
      target: "temp",
      type: "number",
      factor: 1,
      delta: 0.1,
      rounding: 0.1,
    },
    {
      caption: "viscosity (cP)",
      target: "viscosity",
      type: "number",
      factor: 1,
      delta: 0.1,
      rounding: 0.1,
    },
    {
      caption: "resistance elastance coupling factor",
      target: "alpha",
      type: "number",
      factor: 1,
      delta: 0.1,
      rounding: 0.1,
    },
    {
      caption: "ans sensitivity (0-1)",
      target: "ans_sensitivity",
      type: "number",
      factor: 1,
      delta: 0.1,
      rounding: 0.1,
    },
    {
      caption: "unstressed volume factor",
      target: "u_vol_factor",
      type: "factor",
      range: [-1, 1],
      delta: 0.01,
      hidden: true
    },
    {
      caption: "elastance baseline factor",
      target: "el_base_factor",
      type: "factor",
      range: [-1, 1],
      delta: 0.01,
      hidden: true
    },
    {
      caption: "elastance non linear  factor",
      target: "el_k_factor",
      type: "factor",
      range: [-1, 1],
      delta: 0.01,
      hidden: true
    },
  ];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize addtional independent properties  
    this.alpha = 0.5                          // determines relation between resistance change and elastance change. Veins/venules: 0.75, arterioles: 0.63, large arteries: 0.5
    this.ans_sens = 0.0;                      // sensitivity of this blood vessel for autonomic control. 0.0 is no effect, 1.0 is full effect


    // property factors
    this.el_base_factor = 1.0;                // elastance change factor
    this.el_k_factor = 1.0;                   // elastance change factor
    this.u_vol_factor = 1.0;                  // unstressed volume change factor
    this.ans_res_factor = 1.0;                // ans vaso-active control factor coming from the autonomic nervous system model
    this.circ_res_factor = 1.0;               // vaso-active control factor coming from the circulation model
    this.circ_el_factor = 1.0;                // elastance change factor coming from the circulation model
  }

  calc_model() {
    this.calc_resistances();
    this.calc_elastances();
    this.calc_volumes();
    this.calc_pressure();
  }

  calc_resistances() {
    // update the resistances of the associated bloodvessel resistances
    Object.keys(this.components).forEach(res => {
      this._model_engine.models[res].ans_sens = this.ans_sens
      this._model_engine.models[res].ans_factor = this.ans_res_factor
      this._model_engine.models[res].circ_factor = this.circ_res_factor
    })
  }

  calc_elastances() {
    // calculate the elastance factors depending ans and circulation model factors and the alpha factor
    let _ans_elas_res_factor = Math.pow(this.ans_res_factor, this.alpha)
    let _circ_elas_res_factor = Math.pow(this.circ_res_factor, this.alpha)

    this._el = this.el_base + 
        (this.el_base_factor - 1) * this.el_base +
        (_ans_elas_res_factor - 1) * this.el_base * this.ans_sens +
        (_circ_elas_res_factor - 1) * this.el_base +
        (this.circ_el_factor - 1) * this.el_base

    this._el_k = this.el_k + 
        (this.el_k_factor - 1) * this.el_k
  }
}
