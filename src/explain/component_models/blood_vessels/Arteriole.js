import { BloodVessel } from "../../base_models/BloodVessel";

export class Arteriole extends BloodVessel {
  // static properties
  static model_type = "Arteriole";



  constructor(model_ref, name = "") {
  super(model_ref, name);
  // initialize independent properties
  this.alpha = 0.63;      // alpha value for the arterioles
  this.ans_sens = 1.0;    // sensitivity of the arterioles to the ANS
  this.no_back_flow = false;  
  }
}
