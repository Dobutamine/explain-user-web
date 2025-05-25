import { BloodCapacitance } from "./BloodCapacitance";
import { Resistor } from "../base_models/Resistor";

/*
The BloodVessel class extends the BloodCapacitance class and adds a Resistor to represent a blood vessel in the model.
So a BloodVessel has a resistance and has flow properties and can react to the autonomic nervous system (ANS).
*/

export class BloodVessel extends BloodCapacitance {
  // static properties
  static model_type = "BloodVessel";
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
    // call the parent constructor
    super(model_ref, name);

    // initialize independent properties unique to a BloodVessel
    this.inputs = []; // list of inputs for this blood vessel
    this.connector_type = "resistor"; // connector type of the inputs
    this.r_for = 1.0; // forward flow resistance Rf (mmHg*s/l)
    this.r_back = 1.0; // backward flow resistance Rb (mmHg*s/l )
    this.r_k = 0.0; // non-linear resistance coefficient K1 (unitless)
    this.l = 0.0; // intertance L (mmHg*s^2/L)
    this.comp_from = ""; // holds the name of the upstream component
    this.comp_to = ""; // holds the name of the downstream component
    this.no_flow = false; // flags whether flow is allowed across this resistor
    this.no_back_flow = false; // flags whether backflow is allowed across this resistor
    this.p1_ext = 0.0; // external pressure on the inlet (mmHg)
    this.p2_ext = 0.0; // external pressure on the outlet (mmHg)
    this.alpha = 0.0; // determines relation between resistance change and elastance change. Veins/venules: 0.75, arterioles: 0.63, large arteries: 0.5
    this.ans_sens = 0.0; // sensitivity of this blood vessel for autonomic control. 0.0 is no effect, 1.0 is full effect
    this.ans_activity = 1.0; // ans activity factor (unitless)

    // non-persistent property factors. These factors reset to 1.0 after each model step
    this.r_factor = 1.0; // non-persistent resistance factor
    this.r_k_factor = 1.0; // non-persistent non-linear coefficient factor
    this.l_factor = 1.0; // non-persistent inertance factor

    // persistent property factors. These factors are persistent and do not reset
    this.r_factor_ps = 1.0; // persistent resistance factor
    this.r_k_factor_ps = 1.0; // persistent non-linear coefficient factor
    this.l_factor_ps = 1.0; // persistent inertance factor

    // initialize dependent properties
    this.flow = 0.0; // flow f(t) (L/s)
    this.flow_forward = 0.0; // forward flow from the input blood vessels (L/s)
    this.flow_backward = 0.0; // backward flow to the input blood vessels (L/s)

    // local properties
    this._resistors = {}; // list of connectors for this blood vessel
    this._r_for = 1000;  // calculated forward resistance (mmHg/L*s)
    this._r_back = 1000; // calculated backward resistance (mmHg/L*s)
    this._r_k = 0; // calculated non-linear resistance factor (unitless)
    this._l = 0.0; // calculated intertance (mmHg*s^2/L)
  }

  // override the parent class method
  init_model(args={}) {
    // call parent class method
    super.init_model(args);

    // initialize a resistor with the inputs
    this.inputs.forEach((inputName) => { 
      // check whether the resistor already exists (in case of a saved state)
      if (this._model_engine.models.hasOwnProperty(inputName + "_" + this.name)) {
        this._resistors[inputName + "_" + this.name] = this._model_engine.models[inputName + "_" + this.name];
        return; // if so, do not create a new resistor
      }

      // create a new resistor for each input
      let res = new Resistor(this._model_engine, inputName + "_" + this.name);

      // set the properties of the resistor
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
    this.calc_inertances();

    // update the associated resistors 
    Object.values(this._resistors).forEach((resistor) => {
      resistor.r_for = this._r_for
      resistor.r_back = this._r_back
      resistor.r_k = this._r_k

      resistor.no_back_flow = this.no_back_flow
      resistor.no_flow = this.no_flow
      resistor.p1_ext = this.p1_ext
      resistor.p2_ext = this.p2_ext

      resistor.l = this._l
      resistor.r_factor = this.r_factor
      resistor.r_factor_ps = this.r_factor_ps
      resistor.r_k_factor = this.r_k_factor
      resistor.l_factor = this.l_factor
      resistor.l_factor_ps = this.l_factor_ps
    })

    // call parent class methods
    this.calc_volumes();  
    this.calc_pressure();

    // get the flows from the resistor
    this.get_flows();
  }

  get_flows() {
    //reset the flow values
    this.flow = 0.0;
    this.flow_forward = 0.0;
    this.flow_backward = 0.0;

    // get the flow values from the resistors
    Object.values(this._resistors).forEach((resistor) => {
      if (resistor.is_enabled) {
        if (resistor.flow > 0) {
          // get the forward flow across the input
          this.flow_forward += resistor.flow;
        } else {
          // get the backward flow across the input
          this.flow_backward += -resistor.flow;
        }
      }
    });
    
    // calculate the net flow through this blood vessel
    this.flow = this.flow_forward - this.flow_backward;
  }

  calc_inertances() {
    // calulate the inertance depending on the ans activity and the elastance-resistance coupling factor
    this._l = this.l
      + (this.l_factor - 1) * this.l
      + (this.l_factor_ps - 1) * this.l

    // reset the non persistent factors
    this.l_factor = 1.0;
  }

  calc_resistances() {
    // calculate the resistances depending on the ans acitvity and resistance property factors
    this._r_for = this.r_for 
      + (this.r_factor - 1) * this.r_for
      + (this.r_factor_ps - 1) * this.r_for
      + (this.ans_activity - 1) * this.r_for * this.ans_sens

    this._r_back = this.r_back
      + (this.r_factor - 1) * this.r_back
      + (this.r_factor_ps - 1) * this.r_back
      + (this.ans_activity - 1) * this.r_back * this.ans_sens

    this._r_k = this.r_k 
      + (this.r_k_factor - 1) * this.r_k
      + (this.r_k_factor_ps - 1) * this.r_k

     // reset the non persistent factors
    this.r_factor = 1.0;
    this.r_k_factor = 1.0;
  }

  calc_elastances() {
    // calculate the change in elastance depending on the ans activity and the elastance-resistance coupling factor
    let _ans_elas_factor = Math.pow(this.ans_activity, this.alpha)

    // calculate the elastance factors depending on the ans activity and the elastance factors
    this._el = this.el_base 
        + (this.el_base_factor - 1) * this.el_base
        + (this.el_base_factor_ps - 1) * this.el_base
        + (_ans_elas_factor - 1) * this.el_base * this.ans_sens

    // calculate the elastance factors depending on the ans activity and the elastance factors
    this._el_k = this.el_k 
        + (this.el_k_factor - 1) * this.el_k
        + (this.el_k_factor_ps - 1) * this.el_k

    // reset the non persistent factors
    this.el_base_factor = 1.0;
    this.el_k_factor = 1.0;
  }
}
