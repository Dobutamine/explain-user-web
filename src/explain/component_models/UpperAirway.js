import { GasCapacitance } from "./GasCapacitance";

export class UpperAirway extends GasCapacitance {
  // static properties
  static model_type = "UpperAirway";
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
      caption: "fixed gas composition",
      target: "fixed_composition",
      type: "boolean"
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
      caption: "target temperature (dgs C)",
      target: "target_temp",
      type: "number",
      factor: 1,
      delta: 0.1,
      rounding: 1,
    },
    {
      caption: "atmospheric pressure (mmHg)",
      target: "pres_atm",
      type: "number",
      factor: 1,
      delta: 1,
      rounding: 0
    },
    {
      caption: "unstressed volume factor",
      target: "u_vol_factor",
      type: "factor"
    },
    {
      caption: "elastance baseline factor",
      target: "el_base_factor",
      type: "factor"
    },
    {
      caption: "elastance non linear factor",
      target: "el_k_factor",
      type: "factor"
    },
  ];
}
