import { BloodVessel } from "../BloodVessel";

export class Artery extends BloodVessel {
  // static properties
  static model_type = "Artery";
  model_interface = []

  constructor(model_ref, name = "") {
    super(model_ref, name);
    // initialize independent properties
    this.alpha = 0.5;       // alpha value for the arteries
    this.ans_sens = 0.5;    // sensitivity of the arteries to the ANS
    this.no_back_flow = false;  
  }
}
