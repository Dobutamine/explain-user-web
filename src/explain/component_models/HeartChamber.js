import { BloodTimeVaryingElastance } from "../base_models/BloodTimeVaryingElastance";
import { Valve } from "../base_models/Valve";

export class HeartChamber extends BloodTimeVaryingElastance {
  // static properties
  static model_type = "HeartChamber";
  model_interface = [
    {
      caption: "model is enabled",
      target: "is_enabled",
      type: "boolean"
    },
    {
      caption: "unstressed volume (mL)",
      target: "u_vol",
      type: "number",
      factor: 1000.0,
      delta: 0.1,
      rounding: 1,
    },
    {
      caption: "elastance minimum (mmHg/mL)",
      target: "el_min",
      type: "number",
      factor: 0.001,
      delta: 0.1,
      rounding: 1,
    },
    {
      caption: "elastance maximum (mmHg/mL)",
      target: "el_max",
      type: "number",
      factor: 0.001,
      delta: 0.1,
      rounding: 1,
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
      caption: "unstressed volume factor",
      target: "u_vol_factor",
      type: "factor"
    },
    {
      caption: "elastance minimum baseline factor",
      target: "el_min_factor",
      type: "factor"
    },
    {
      caption: "elastance maximum baseline factor",
      target: "el_max_factor",
      type: "factor"
    },
    {
      caption: "elastance non linear  factor",
      target: "el_k_factor",
      type: "factor"
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
    this.flow_forward = 0.0;                  // forward flow from the input blood vessels
    this.flow_backward = 0.0;                 // backward flow to the input blood vessels
    this.r_for_calc = 0.0;                    // calculated forward resistance
    this.r_back_calc = 0.0;                   // calculated backward resistance
    

    // initialize independent properties
    this.pres_cc = 0.0; // external pressure from chest compressions (mmHg)
    this.pres_mus = 0.0; // external pressure from outside muscles (mmHg)

    // general factors
    this.ans_activity_factor = 1.0;

    // elastance factors
    this.el_min_ans_factor = 1.0;
    this.el_min_mob_factor = 1.0;
    this.el_max_ans_factor = 1.0;
    this.el_max_mob_factor = 1.0;
    this.el_k_factor = 1.0;                   // elastance change factor
    this.u_vol_factor = 1.0;                  // unstressed volume change factor
    this.r_factor = 1.0;                      // resistance change factor
    this.r_for_factor = 1.0;                  // forward resistance change factor
    this.r_back_factor = 1.0;                 // backward resistance change factor
    this.r_k_factor = 1.0;                    // resistance non linear k change factor
    this.ans_res_factor = 1.0;                // ans vaso-active control factor coming from the autonomic nervous system model
    this.circ_res_factor = 1.0;               // vaso-active control factor coming from the circulation model
    this.circ_el_factor = 1.0;                // elastance change factor coming from the circulation model

    // local properties
    this._resistors = {};                     // list of connectors for this blood vessel
  }
  init_model(args={}) {
    // call parent class method
    super.init_model(args);

    // initialize the resistor with the inputs
    this.inputs.forEach((inputName) => { 
      let res = new Valve(this._model_engine, inputName + "_" + this.name);
      let args = [
        { key: "name", value: inputName + "_" + this.name},
        { key: "description", value: "input connector for " + this.name },
        { key: "is_enabled", value: this.is_enabled },
        { key: "model_type", value: "Resistor" },
        { key: "r_for", value: this.r_for },
        { key: "r_back", value: this.r_back },
        { key: "r_k", value: this.r_k },
        { key: "no_flow", value: this.no_flow },
        { key: "no_back_flow", value: this.no_back_flow },
        { key: "comp_from", value: inputName },
        { key: "comp_to", value: this.name }
      ]
      // initialize the resistor with the arguments
      res.init_model(args);

      // add the resistor to the list of models
      this._model_engine.models[inputName + "_" + this.name] = res;

      // add the resistor to the dictionary of connectors
      this._resistors[inputName + "_" + this.name] = res;
    });
  }

   calc_model() {
    // call this class specific calculation methods
    this.calc_resistances();
    this.calc_elastances();

    // call parent class methods
    this.calc_volumes();  
    this.calc_pressure();

    this.get_flows();
  }


  get_flows() {
    this.flow = 0.0;
    this.flow_forward = 0.0;
    this.flow_backward = 0.0;

    Object.values(this._resistors).forEach((resistor) => {
      if (resistor.is_enabled) {
        if (resistor.flow > 0) {
          this.flow_forward += resistor.flow;
        } else {
          this.flow_backward += -resistor.flow;
        }
      }
    });
    // calculate the net flow through this blood vessel
    this.flow_net_in = this.flow_forward - this.flow_backward;
  }

  // override the elastance calculation
  calc_elastances() {    
        // Incorporate the other factors
        this._el_min = this.el_min +
          (this.el_min_factor - 1) * this.el_min +
          (this.el_min_ans_factor - 1) * this.el_min * this.ans_activity_factor +
          (this.el_min_mob_factor - 1) * this.el_min
    
          this._el_max = this.el_max +
          (this.el_max_factor - 1) * this.el_max +
          (this.el_max_ans_factor - 1) * this.el_max * this.ans_activity_factor +
          (this.el_max_mob_factor - 1) * this.el_max
    
          this._el_k = this.el_k +
          (this.el_k_factor - 1) * this.el_k
  }

  calc_resistances() {
  }


  // override the pressure calculation
  calc_pressure() {
    // calculate the recoil pressure of the time-varying elastance
    let p_ms = (this.vol - this._u_vol) * this._el_max;
    let p_ed = this._el_k * Math.pow(this.vol - this._u_vol, 2) + this._el_min * (this.vol - this._u_vol);

    // calculate the current recoil pressure
    this.pres_in = (p_ms - p_ed) * this.act_factor + p_ed;

    // calculate the total pressure by incorporating the external pressures
    this.pres = this.pres_in + this.pres_ext + this.pres_cc + this.pres_mus;

    // reset the external pressure
    this.pres_ext = 0.0;
    this.pres_cc = 0.0;
    this.pres_mus = 0.0;
  }
}

