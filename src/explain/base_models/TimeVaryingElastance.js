import { BaseModelClass } from "./BaseModelClass";

export class TimeVaryingElastance extends BaseModelClass {
  // static properties
  static model_type = "TimeVaryingElastance";
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
      caption: "unstressed volume (L)",
      target: "u_vol",
      type: "number",
      factor: 1.0,
      delta: 0.001,
      rounding: 3,
    },
    {
      caption: "elastance minimum (mmHg/L)",
      target: "el_min",
      type: "number",
      factor: 1,
      delta: 1,
      rounding: 0,
    },
    {
      caption: "elastance maximum (mmHg/L)",
      target: "el_max",
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
      caption: "unstressed volume factor",
      target: "u_vol_factor_ps",
      type: "factor"
    },
    {
      caption: "elastance minimum baseline factor",
      target: "el_min_factor_ps",
      type: "factor"
    },
    {
      caption: "elastance maximum baseline factor",
      target: "el_max_factor_ps",
      type: "factor"
    },
    {
      caption: "elastance non linear factor",
      target: "el_k_factor_ps",
      type: "factor"
    },
  ];

  constructor(model_ref, name = "") {
    // call the parent constructor
    super(model_ref, name);

    // initialize independent properties
    this.u_vol = 0.0; // unstressed volume UV (L)
    this.el_min = 0.0; // minimal elastance Emin (mmHg/L)
    this.el_max = 0.0; // maximal elastance emax(n) (mmHg/L)
    this.el_k = 0.0; // non-linear elastance coefficient K2 (unitless)
    this.pres_ext = 0.0; // non persistent external pressure p2(t) (mmHg)
    this.act_factor = 0.0; // activation factor from the heart model (unitless)

    // non-persistent property factors. These factors reset to 1.0 after each model step
    this.u_vol_factor = 1.0; // non-persistent unstressed volume factor step (unitless)
    this.el_min_factor = 1.0; // non-persistent minimal elastance factor step (unitless)
    this.el_max_factor = 1.0; // non-persistent maximal elastance factor step (unitless)
    this.el_k_factor = 1.0; // non-persistent elastance factor step (unitless)

    // persistent property factors. These factors are persistent and do not reset
    this.u_vol_factor_ps = 1.0; // non-persistent unstressed volume factor step (unitless)
    this.el_min_factor_ps = 1.0; // non-persistent minimal elastance factor step (unitless)
    this.el_max_factor_ps = 1.0; // non-persistent maximal elastance factor step (unitless)
    this.el_k_factor_ps = 1.0; // non-persistent elastance factor step (unitless)

    // initialize dependent properties
    this.vol = 0.0; // volume v(t) (L)
    this.pres = 0.0; // pressure p1(t) (mmHg)
    this.pres_in = 0.0; // recoil pressure of the elastance (mmHg)
    this.pres_tm = 0.0; // transmural pressure (mmHg)

    // local properties
    this._el_min = 0.0; // calculated minimal elastance (mmHg/L)
    this._el_max = 0.0; // calculated minimal elastance (mmHg/L)
    this._u_vol = 0.0; // calculated unstressed volume (L)
    this._el_k = 0.0; // calculated elastance non-linear k (unitless)
  }

  // this routine is called in every model step by the ModelEngine Class
  calc_model() {
    // calculate the elastances and volumes
    this.calc_elastances();
    this.calc_volumes();
    // calculate the pressure
    this.calc_pressure();
  }

  calc_elastances() {    
    // calculate the elastances and non-linear elastance incorparting the factors
    this._el_min = this.el_min 
        + (this.el_min_factor - 1) * this.el_min
        + (this.el_min_factor_ps - 1) * this.el_min
    
    this._el_max = this.el_max 
        + (this.el_max_factor - 1) * this.el_max
        + (this.el_max_factor_ps - 1) * this.el_max

    this._el_k = this.el_k 
        + (this.el_k_factor - 1) * this.el_k
        + (this.el_k_factor_ps - 1) * this.el_k

    // reset the non persistent factors
    this.el_min_factor = 1.0;
    this.el_max_factor = 1.0;
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
    let p_ms = (this.vol - this._u_vol) * this._el_max;
    let p_ed = this._el_k * Math.pow(this.vol - this._u_vol, 2) + this._el_min * (this.vol - this._u_vol);

    // calculate the current recoil pressure
    this.pres_in = (p_ms - p_ed) * this.act_factor + p_ed;

    // calculate the total pressure by incorporating the external pressures
    this.pres = this.pres_in + this.pres_ext

    // calculate the transmural pressure
    this.pres_tm = this.pres_in - this.pres_ext;

    // reset the external pressure
    this.pres_ext = 0.0;
  }

  // override the volume_in method
  volume_in(dvol, comp_from) {
    // add volume to the capacitance
    this.vol += dvol;

    // return if the volume is zero or lower
    if (this.vol <= 0.0) return;
  }

  volume_out(dvol) {
    // remove volume from capacitance
    this.vol -= dvol;

    // if the volume is zero or lower, handle it
    if (this.vol < 0.0 && this.vol < this.u_vol) {
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
