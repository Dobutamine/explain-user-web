import { BaseModelClass } from "./BaseModelClass";

export class Capacitance extends BaseModelClass {
  // static properties
  static model_type = "Capacitance";
  static model_interface = [
    {    
      target: "model_type",  
      type: "string",
      build_prop: false,
      edit_mode: "basic",
      readonly: true,
      caption: "model type",
    },
    {
      target: "description",
      type: "string",
      build_prop: true,
      edit_mode: "basic",
      readonly: true,
      caption: "description",
    },
    {
      target: "is_enabled",
      type: "boolean",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "enabled",
    },
    {
      target: "fixed_composition",
      type: "boolean",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "fixed composition",
    },
    {
      target: "u_vol",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "unstressed volume (L)",
      factor: 1.0,
      delta: 0.001,
      rounding: 3,
    },
    {
      target: "el_base",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "elastance baseline (mmHg/L)",
      factor: 1,
      delta: 1,
      rounding: 0,
    },
    {
      target: "el_k",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "elastance non linear k",
      factor: 1,
      delta: 1,
      rounding: 0,
    },
    {
      target: "u_vol_factor_ps",
      type: "factor",
      edit_mode: "factors",
      caption: "unstressed volume factor"
    },
    {
      target: "el_base_factor_ps",
      type: "factor",
      edit_mode: "factors",
      caption: "elastance baseline factor"
    },
    {
      target: "el_k_factor_ps",
      type: "factor",
      edit_mode: "factors",
      caption: "elastance non linear  factor"  
    },

  ];

  constructor(model_ref, name = "") {
    // call the parent constructor
    super(model_ref, name);

    // initialize independent properties
    this.u_vol = 0.0; // unstressed volume UV (L)
    this.el_base = 0.0; // baseline elastance E (mmHg/L)
    this.el_k = 0.0; // non-linear elastance factor K2 (unitless)
    this.pres_ext = 0.0; // non persistent external pressure p2(t) (mmHg)
    this.fixed_composition = false;

    // non-persistent property factors. These factors reset to 1.0 after each model step
    this.u_vol_factor = 1.0; // non-persistent unstressed volume factor step (unitless)
    this.el_base_factor = 1.0; // non-persistent elastance factor step (unitless)
    this.el_k_factor = 1.0; // non-persistent elastance factor step (unitless)

    // persistent property factors. These factors are persistent and do not reset
    this.u_vol_factor_ps = 1.0;  // persistent unstressed volume factor (unitless)
    this.el_base_factor_ps = 1.0; // persistent elastance factor (unitless)
    this.el_k_factor_ps = 1.0; // persistent elastance factor (unitless)

    // initialize dependent properties
    this.vol = 0.0; // volume v(t) (L)
    this.el = 0.0; // elastance e(t) (mmHg/L)
    this.pres = 0.0; // pressure p1(t) (mmHg)
    this.pres_in = 0.0; // recoil pressure of the elastance (mmHg)
    this.pres_tm = 0.0; // transmural pressure (mmHg)

    // local variables
    this._el = 0.0; // calculated elastance (mmHg/L)
    this._u_vol = 0.0; // calculated unstressed volume (L)
    this._el_k = 0.0; // calculated elastance non-linear k (unitless)
  }

  // this routine is called in every model step by the ModelEngine
  calc_model() {
    // first calculate the current elastances and volumes
    this.calc_elastances();
    this.calc_volumes();
    // then calculate the pressure
    this.calc_pressure();
  }

  calc_elastances() {
    // calculate the elastance and non-linear elastance incorparting the factors
    this._el = this.el_base 
        + (this.el_base_factor - 1) * this.el_base
        + (this.el_base_factor_ps - 1) * this.el_base

    this._el_k = this.el_k 
        + (this.el_k_factor - 1) * this.el_k
        + (this.el_k_factor_ps - 1) * this.el_k

    // set the elastance property
    this.el = this._el;
    
    // reset the non persistent factors
    this.el_base_factor = 1.0;
    this.el_k_factor = 1.0;
  }

  calc_volumes() {
    // calculate the unstressed volume incorporating the factors
    this._u_vol = this.u_vol 
        + (this.u_vol_factor - 1) * this.u_vol
        + (this.u_vol_factor_ps - 1) * this.u_vol

    // reset the non persistent factors
    this.u_vol_factor = 1.0;
  }
  
  calc_pressure() {
    // calculate the recoil pressure
    this.pres_in = this._el_k * Math.pow(this.vol - this._u_vol, 2) + this._el * (this.vol - this._u_vol);

    // calculate the transmural pressure
    this.pres_tm = this.pres_in - this.pres_ext;

    // calculate the total pressure by incorporating the external pressures
    this.pres = this.pres_in + this.pres_ext;

    // reset the external pressures
    this.pres_ext = 0.0;
  }

  volume_in(dvol) {
    if (!this.fixed_composition) {
      // add volume to the capacitance
      this.vol += dvol;
    }

    // return if the volume is zero or lower
    if (this.vol <= 0.0) return;
  }

  volume_out(dvol) {
    if (!this.fixed_composition) {
      // remove volume from capacitance
      this.vol -= dvol;
    }

    // if the volume is zero or lower, handle it
    if (this.vol < 0.0) {
      let _vol_not_removed = -this.vol;
      // reset the volume to zero.
      this.vol = 0.0;
      // return the volume that was not removed
      return _vol_not_removed;
    }

    // return zero as all volume is removed
    return 0.0;
  }
}
