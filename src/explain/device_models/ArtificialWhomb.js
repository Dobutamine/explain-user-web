

import { BaseModelClass } from "../base_models/BaseModelClass.js";


export class ArtificialWhomb extends BaseModelClass {
  // static properties
  static model_type = "ArtificialWhomb";
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
      target: "aw_running",
      type: "boolean",
      build_prop: true,
      edit_mode: "caption",
      readonly: false,
      caption: "artifical placenta model running",
    },
    {
      target: "aw_clamped",
      type: "boolean",
      build_prop: true,
      edit_mode: "caption",
      readonly: false,
      caption: "aw clamped",
    },
    {
      caption: "drainage cannula resistance factor",
      target: "drainage_res_factor",
      type: "factor",
      delta: 0.01,
      rounding: 2,
      ll: 0.0,
      ul: 100
    },
    {
      caption: "return cannula resistance factor",
      target: "return_res_factor",
      type: "factor",
      delta: 0.01,
      rounding: 2,
      ll: 0.0,
      ul: 100
    },
    {
      caption: "tubing resistance factor",
      target: "tubing_res_factor",
      type: "factor",
      delta: 0.01,
      rounding: 2,
      ll: 0.0,
      ul: 100
    },
    {
      caption: "pump resistance factor",
      target: "pump_res_factor",
      type: "factor",
      delta: 0.01,
      rounding: 2,
      ll: 0.0,
      ul: 100
    },
    {
      caption: "oxygenator resistance factor",
      target: "oxy_res_factor",
      type: "factor",
      delta: 0.01,
      rounding: 2,
      ll: 0.0,
      ul: 100   
    },
    {
      target: "drainage_res",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "drainage cannula resistance (mmHg/(L/s))",
      factor: 1,
      delta: 1,
      rounding: 0,
      ll:100,
      ul:100000
    },
    {
      target: "return_res",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "return cannula resistance (mmHg/(L/s))",
      factor: 1,
      delta: 1,
      rounding: 0,
      ll:100,
      ul:100000
    },
    {
      target: "tubing_in_res",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "tubing in resistance (mmHg/(L/s))",
      factor: 1,
      delta: 1,
      rounding: 0,
      ll:100,
      ul:100000
    },
    {
      target: "tubing_out_res",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "tubing out resistance (mmHg/(L/s))",
      factor: 1,
      delta: 1,
      rounding: 0,
      ll:100,
      ul:100000
    },
    {
      target: "pump_res_for",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "pump forward resistance (mmHg/(L/s))",
      factor: 1,
      delta: 1,
      rounding: 0,
      ll:100,
      ul:100000
    },
    {
      target: "pump_res_back",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "pump backward resistance (mmHg/(L/s))",
      factor: 1,
      delta: 1,
      rounding: 0,
      ll:100,
      ul:100000
    },
    {
      target: "oxy_res_for",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "oxygenator forward resistance (mmHg/(L/s))",
      factor: 1,
      delta: 1,
      rounding: 0,
      ll:100,
      ul:100000
    },
    {
      target: "oxy_res_back",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "oxygenator backward resistance (mmHg/(L/s))",
      factor: 1,
      delta: 1,
      rounding: 0,
      ll:100,
      ul:100000
    },
    {
      caption: "o2 diffusion constant",
      target: "dif_o2",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      factor: 1.0,
      delta: 0.0001,
      rounding: 4,
      ll:0.0,
      ul:0.1
    },
    {
      caption: "co2 dioxide diffusion constant",
      target: "dif_co2",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      factor: 1.0,
      delta: 0.0001,
      rounding: 4,
      ll:0.0,
      ul:0.1
    },
  ];

  /*

    */

  constructor(model_ref, name = "") {
    // initialize the base model class setting all the general properties of the model which all models have in common

    super(model_ref, name);
    // -----------------------------------------------
    // initialize independent parameters
    this.aw_running = false
    this.aw_clamped = true; // flags whether the umbilical vessels are clamped or not
    this.drainage_res = 1000; // resistance of the drainage cannula (mmHg/(L/s))
    this.drainage_res_factor = 1.0; // factor to adjust the drainage resistance
    this.return_res = 1000; // resistance of the return cannula (mmHg/(L/s))
    this.return_res_factor = 1.0; // factor to adjust the return resistance
    this.tubing_in_res = 1000; // resistance of the tubing in (mmHg/(L/s))
    this.tubing_out_res = 1000; // resistance of the tubing out (mmHg/(L/s))
    this.tubing_res_factor = 1.0; // factor to adjust the tubing in resistance
    this.pump_res_for = 50; // resistance of the pump (mmHg/(L/s))
    this.pump_res_factor = 1.0; // factor to adjust the pump resistance
    this.pump_res_back = 50; // resistance of the pump (mmHg/(L/s))
    this.oxy_res_for = 50; // resistance of the oxygenator (mmHg/(L/s))
    this.oxy_res_factor = 1.0; // factor to adjust the oxygenator resistance
    this.oxy_res_back = 50; // resistance of the oxygenator (mmHg/(L/s))
    this.gas_flow = 0.5; // gas flow rate through the oxygenator (L/min)
    this.gas_fio2 = 0.21; // fraction of inspired oxygen in the gas flow through the oxygenator
    this.gas_fico2 = 0.0004; // fraction of inspired carbon dioxide in the gas flow through the oxygenator
    this.dif_o2 = 0.0005; // diffusion constant for oxygen (mmol/mmHg * s)
    this.dif_co2 = 0.001; // diffusion constant for carbon dioxide (mmol/mmHg * s)

    // -----------------------------------------------
    // initialize dependent parameters

    // -----------------------------------------------
    // local parameters
    this._update_interval = 0.015; // update interval of the placenta model (s)
    this._update_counter = 0.0; // counter of the update interval (s)

    this._aw_drainage = null; // reference to the drainage model instance
    this._aw_tubing_in = null; // reference to the tubing in model instance
    this._aw_pump = null; // reference to the pump model instance
    this._aw_oxy = null; // reference to the oxygenator model instance
    this._aw_tubing_out = null; // reference to the tubing out model instance
    this._aw_return = null; // reference to the return model instance
  }

  calc_model() {
    this._update_counter += this._t;
    if (this._update_counter > this._update_interval && this.aw_running) {
        this._update_counter = 0.0;

        // get a reference to the associated models
        this._aw_drainage = this._model_engine.models["AW_DRAINAGE"];
        this._aw_tubing_in = this._model_engine.models["AW_TUBING_IN"];
        this._aw_pump = this._model_engine.models["AW_PUMP"];
        this._aw_oxy = this._model_engine.models["AW_OXY"];
        this._aw_tubing_out = this._model_engine.models["AW_TUBING_OUT"];
        this._aw_return = this._model_engine.models["AW_RETURN"];

        // make sure all the associated models are in the same enabled/disabled state as the placenta model
        this._aw_drainage.is_enabled = this.aw_running;
        this._aw_tubing_in.is_enabled = this.aw_running;
        this._aw_pump.is_enabled = this.aw_running;
        this._aw_oxy.is_enabled = this.aw_running;
        this._aw_tubing_out.is_enabled = this.aw_running;
        this._aw_return.enabled = this.aw_running;

        // clamp umbilical vessels if set to clamped
        this._aw_drainage.no_flow = this.aw_clamped;
        this._aw_tubing_in.no_flow = this.aw_clamped;
        this._aw_pump.no_flow = this.aw_clamped;
        this._aw_oxy.no_flow = this.aw_clamped;
        this._aw_tubing_out.no_flow = this.aw_clamped;
        this._aw_return.no_flow = this.aw_clamped;


        // set the resistances of the associated models
        this._aw_drainage.r_for = this.drainage_res * this.drainage_res_factor; // set the drainage resistance to a high value to simulate the umbilical artery resistance
        this._aw_drainage.r_back = this.drainage_res * this.drainage_res_factor; // set the drainage resistance to a high value to simulate the umbilical artery resistance
        this._aw_tubing_in.r_for = this.tubing_in_res * this.tubing_res_factor; // set the tubing resistance to a low value to simulate the tubing resistance
        this._aw_tubing_in.r_back = this.tubing_in_res * this.tubing_res_factor; // set the tubing resistance to a low value to simulate the tubing resistance
        this._aw_pump.r_for = this.pump_res_for * this.pump_res_factor; // set the pump resistance to a low value to simulate the pump resistance
        this._aw_pump.r_back = this.pump_res_back * this.pump_res_factor; // set the pump resistance to a low value to simulate the pump resistance
        this._aw_oxy.r_for = this.oxy_res_for * this.oxy_res_factor; // set the oxygenator resistance to a medium value to simulate the oxygenator resistance
        this._aw_oxy.r_back = this.oxy_res_back * this.oxy_res_factor; // set the oxygenator resistance to a medium value to simulate the oxygenator resistance
        this._aw_tubing_out.r_for = this.tubing_out_res * this.tubing_res_factor; // set the tubing resistance to a low value to simulate the tubing resistance
        this._aw_tubing_out.r_back = this.tubing_out_res * this.tubing_res_factor; // set the tubing resistance to a low value to simulate the tubing resistance
        this._aw_return.r_for = this.return_res * this.return_res_factor; // set the return resistance to a high value to simulate the umbilical vein resistance
        this._aw_return.r_back = this.return_res * this.return_res_factor; // set the return resistance to a high value to simulate the umbilical vein resistance
    }
  }
}
