import { BloodVessel } from "./BloodVessel";

export class Venule extends BloodVessel {
  // static properties
  static model_type = "Venule";
    static model_interface = [
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
      caption: "no flow allowed",
      target: "no_flow",
      type: "boolean"
    },
    {
      caption: "no back flow allowed",
      target: "no_back_flow",
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
      caption: "r_for (mmHg/L/s)",
      target: "r_for",
      type: "number",
      factor: 1.0,
      delta: 0.001,
      rounding: 3
    },
    {
      caption: "r_back (mmHg/L/s)",
      target: "r_back",
      type: "number",
      factor: 1.0,
      delta: 0.001,
      rounding: 3
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
      caption: "resistance-elastance coupling factor",
      target: "alpha",
      type: "number",
      factor: 1,
      delta: 0.1,
      rounding: 0.1,
    },
    {
      caption: "ans sensitivity (0-1)",
      target: "ans_sens",
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
      caption: "elastance non linear factor",
      target: "el_k_factor",
      type: "factor",
      range: [-1, 1],
      delta: 0.01,
      hidden: true
    },
  ];

  constructor(model_ref, name = "") {
    super(model_ref, name);
    // initialize independent properties
    this.alpha = 0.75;        // alpha value for the arteries
    this.ans_sens = 0.5;      // sensitivity of the arteries to the ANS
    this.no_back_flow = false;   
  }
}
