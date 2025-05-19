import { BloodVessel } from "./BloodVessel";

export class Capillaries extends BloodVessel {
  // static properties
  static model_type = "Capillaries";

  constructor(model_ref, name = "") {
    super(model_ref, name);
    // initialize independent properties
    this.alpha = 0.0;       // alpha value for the arteries
    this.ans_sens = 0.0;    // sensitivity of the arteries to the ANS
    this.no_back_flow = false;  
  }
}
