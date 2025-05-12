import { Resistor } from "../base_models/Resistor";

export class BloodVesselResistor extends Resistor {
  // static properties
  static model_type = "BloodVesselResistor";
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
      caption: "no flow allowed",
      target: "no_flow",
      type: "boolean",
      delta: 1,
      factor: 1.0,
      rounding: 0
    },
    {
      caption: "no back flow allowed",
      target: "no_back_flow",
      type: "boolean",
      delta: 1,
      factor: 1.0,
      rounding: 0
    },
    {
      caption: "forward resistance",
      target: "r_for",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0
    },
    {
      caption: "backward resistance",
      target: "r_back",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0
    },
    {
      caption: "non linear resistance factor",
      target: "r_k",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0
    },
    {
      caption: "forward resistance factor",
      target: "r_for_factor",
      type: "factor"
    },
    {
      caption: "backward resistance factor",
      target: "r_back_factor",
      type: "factor"
    },
    {
      type: "list",
      caption: "comp from",
      target: "comp_from",
      options: [
        "BloodCapacitance", 
        "BloodTimeVaryingElastance", 
        "BloodPump", 
        "BloodVessel", 
        "CapillaryBed", 
        "CoronaryVessel", 
        "HeartChamber",
        "BloodPump"
      ]
    },
    {
      type: "list",
      caption: "comp to",
      target: "comp_to",
      options: [
        "BloodCapacitance", 
        "BloodTimeVaryingElastance", 
        "BloodPump", 
        "BloodVessel", 
        "CapillaryBed", 
        "CoronaryVessel", 
        "HeartChamber",
        "BloodPump"
      ]
    }
    
  ]

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // 
    // property factors set by the BloodVessel which owns this resistor
    this.ans_sens = 0.0;
    this.ans_factor = 1.0;
    this.circ_factor = 1.0;
  }

    // calculate resistance
    calc_resistance() {
      // incorporate all factors influencing this resistor
      this._r_for = this.r_for + 
        (this.r_factor - 1) * this.r_for + 
        (this.ans_factor - 1) * this.r_for * this.ans_sens +
        (this.circ_factor - 1) * this.r_for

      this._r_back = this.r_back + 
        (this.r_factor - 1) * this.r_back +
        (this.ans_factor - 1) * this.r_back * this.ans_sens +
        (this.circ_factor - 1) * this.r_back

      this._r_k = this.r_k + (this.r_k_factor - 1) * this.r_k
  
      // make the resistances flow dependent
      this._r_for += this._r_k * this.flow * this.flow;
      this._r_back += this._r_k * this.flow * this.flow;
 }
}
