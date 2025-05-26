import { Resistor } from "../base_models/Resistor";

export class Valve extends Resistor {
  // static properties
  static model_type = "Valve";
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
      caption: "non linear resistance coefficient",
      target: "r_k",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0
    },
    {
      caption: "inertance",
      unit: "mmHg*s^2/L",
      target: "l",
      type: "number",
      delta: 0.001,
      factor: 1.0,
      rounding: 3
    },
    {
      caption: "resistance factor",
      target: "r_factor",
      type: "factor"
    },
    {
      caption: "non linear resistance coefficient factor",
      target: "r_k_factor",
      type: "factor"
    },
    {
      caption: "inertance factor",
      target: "l_factor",
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
        "Artery",
        "Arteriole",
        "Vein",
        "Venule",
        "Capillaries",
        "CoronaryVessel", 
        "HeartChamber",
        "Airway",
        "AlveolarSpace",
        "GasCapacitance"
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
        "Artery",
        "Arteriole",
        "Vein",
        "Venule",
        "Capillaries",
        "CoronaryVessel", 
        "HeartChamber",
        "Airway",
        "AlveolarSpace",
        "GasCapacitance"
      ]
    }
    
  ]
}