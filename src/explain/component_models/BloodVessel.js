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

    // initialize addtional independent properties making this a blood vessel
    this.inputs = [];                         // list of inputs for this blood vessel
    this.r_for = 50;                          // baseline resistance for forward flow
    this.r_back = 50;                         // baseline resistance for backward flow
    this.r_k = 0.0;                           // baseline resistance non linear k
    this.no_flow = false;                     // flag whether this blood vessel is a no flow vessel
    this.no_back_flow = false;                // flag whether this blood vessel is a no back flow vessel  
    this.alpha = 0.5                          // determines relation between resistance change and elastance change. Veins/venules: 0.75, arterioles: 0.63, large arteries: 0.5
    this.ans_sens = 0.0;                      // sensitivity of this blood vessel for autonomic control. 0.0 is no effect, 1.0 is full effect

    // dependent properties
    this.flow = 0.0;                          // net flow through this blood vessel
    this.flow_in = 0.0;                       // inflow from the input blood vessels
    this.flow_out = 0.0;                      // outflow to the output blood vessels
    this.r_for_calc = 0.0;                    // calculated forward resistance
    this.r_back_calc = 0.0;                   // calculated backward resistance
    
    // property factors
    this.el_base_factor = 1.0;                // elastance change factor
    this.el_k_factor = 1.0;                   // elastance change factor
    this.u_vol_factor = 1.0;                  // unstressed volume change factor
    this.r_factor = 1.0;                      // resistance change factor
    this.r_for_factor = 1.0;                  // forward resistance change factor
    this.r_back_factor = 1.0;                 // backward resistance change factor
    this.r_k_factor = 1.0;                    // resistance non linear k change factor
    this.ans_res_factor = 1.0;                // ans vaso-active control factor coming from the autonomic nervous system model
    this.circ_res_factor = 1.0;               // vaso-active control factor coming from the circulation model
    this.circ_el_factor = 1.0;                // elastance change factor coming from the circulation model
  }

  init_model(args = {}) {
    super.init_model(args);

  }

  calc_model() {
    this.calc_resistances();
    this.calc_elastances();
    this.calc_flows();
    this.calc_volumes();
    this.calc_pressure();
  }

  calc_flows() {
    // reset and early-exit
    if (this.no_flow) {
      this.flow = this.flow_in = this.flow_out = 0;
      return;
    }
    // cache constants
    const {
      inputs,
      pres: thisPres,
      no_back_flow: noBackFlow,
      _t: dt,
      _model_engine: engine,
      r_for, r_back, r_k,
      r_factor,      // multiplier for forward/back resistances
      r_k_factor     // multiplier for flow‐dependent stiffness
    } = this;

    // precompute the static (non‐flow dependent) parts
    const baseRFor  = r_for  * r_factor;
    const baseRBack = r_back * r_factor;
    const baseRk    = r_k    * r_k_factor;

    // local accumulators
    let flow    = 0;
    let flowIn  = 0;
    let flowOut = 0;

    // iterate over each connected vessel
    for (const inputName of inputs) {
      const compFrom = engine.models[inputName];
      const presFrom = compFrom.pres;

      // flow‐dependent term (only needs computing once)
      const sqFlow = flow * flow;

      // dynamic resistances
      const rFor  = baseRFor  + baseRk * sqFlow;
      const rBack = baseRBack + baseRk * sqFlow;

      // compute net in/out for this connection
      let fIn = 0, fOut = 0;
      if (presFrom > thisPres) {
        fIn = (presFrom - thisPres) / rFor;
        this.volume_in(fIn * dt, compFrom);
        compFrom.volume_out(fIn * dt);
      } else if (!noBackFlow) {
        fOut = (thisPres - presFrom) / rBack;
        compFrom.volume_in(fOut * dt, this);
        this.volume_out(fOut * dt);
      }

      // accumulate
      flowIn  += fIn;
      flowOut += fOut;
      flow    += fIn - fOut;
    }

    // write back once
    this.flow     = flow;
    this.flow_in  = flowIn;
    this.flow_out = flowOut;
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
