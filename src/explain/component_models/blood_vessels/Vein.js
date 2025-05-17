import { BloodVessel } from "../../base_models/BloodVessel";

export class Vein extends BloodVessel {
  // static properties
  static model_type = "Vein";
  model_interface = []

  constructor(model_ref, name = "") {
    super(model_ref, name);
    // initialize independent properties
    this.alpha = 0.75;          // alpha value for the arteries
    this.ans_sens = 0.2;        // sensitivity of the arteries to the ANS
    this.no_back_flow = true;   // no back flow in veins
  }
}
