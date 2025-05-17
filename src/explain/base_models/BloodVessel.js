import { BloodCapacitance } from "./BloodCapacitance";
import { Resistor } from "./Resistor";
import { Valve } from "./Valve";

/*
The BloodVessel class extends the BloodCapacitance class and adds a Resistor to represent a blood vessel in the model.
So a BloodVessel has a resistance and has flow properties.
*/

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
    this.connector = "resistor";              // connector type of the inputs
    this.r_for = 50;                          // baseline resistance for forward flow
    this.r_back = 50;                         // baseline resistance for backward flow
    this.r_k = 0.0;                           // baseline resistance non linear k
    this.no_flow = false;                     // flag whether this blood vessel is a no flow vessel
    this.no_back_flow = false;                // flag whether this blood vessel is a no back flow vessel  
    this.alpha = 0.0                          // determines relation between resistance change and elastance change. Veins/venules: 0.75, arterioles: 0.63, large arteries: 0.5
    this.ans_sens = 0.0;                      // sensitivity of this blood vessel for autonomic control. 0.0 is no effect, 1.0 is full effect
    this.ans_activity = 1.0;                  // ans activity factor 

    // dependent properties
    this.flow = 0.0;                          // net flow through this blood vessel
    this.flow_forward = 0.0;                  // forward flow from the input blood vessels
    this.flow_backward = 0.0;                 // backward flow to the input blood vessels
    
    // property factors
    this.r_for_factor = 1.0;                  // forward resistance change factor
    this.r_back_factor = 1.0;                 // backward resistance change factor
    this.r_k_factor = 1.0;                    // resistance non linear k change factor

    // local properties
    this._resistors = {};                   // list of connectors for this blood vessel
  }

  // override the parent class method
  init_model(args={}) {
    // call parent class method
    super.init_model(args);

    // initialize a resistor with the inputs
    this.inputs.forEach((inputName) => { 
      let res = new Resistor(this._model_engine, inputName + "_" + this.name);
      if (this.connector == "valve") {
        res = new Valve(this._model_engine, inputName + "_" + this.name);
      }
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

    // get the flows from the resistor
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
    this.flow = this.flow_forward - this.flow_backward;
  }

  calc_resistances() {
    // set the resistance factors of the associated resistors.
    Object.values(this._resistors).forEach((resistor) => {
      resistor.r_for = this.r_for * this.r_for_factor
      resistor.r_back = this.r_back * this.r_back_factor
      resistor.r_k = this.r_k * this.r_k_factor
      resistor.r_factor = 1.0 + (this.ans_activity - 1.0) * this.ans_sens;
    })
  }

  calc_elastances() {
    // calculate the elastance factors depending ans and circulation model factors and the alpha factor
    let _ans_elas_factor = Math.pow(this.ans_activity, this.alpha)

    this._el = this.el_base 
        + (this.el_base_factor - 1) * this.el_base
        + (this.el_base_factor_step - 1) * this.el_base
        + (_ans_elas_factor - 1) * this.el_base * this.ans_sens

    this._el_k = this.el_k 
        + (this.el_k_factor - 1) * this.el_k
        + (this.el_k_factor_step - 1) * this.el_k

    // reset the step factors
    this.el_base_factor_step = 1.0;
    this.el_k_factor_step = 1.0;
  }

}
