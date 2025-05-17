import { BloodVessel } from "../../base_models/BloodVessel";

export class Arteriole extends BloodVessel {
  // static properties
  static model_type = "Arteriole";

  constructor(model_ref, name = "") {
    super(model_ref, name);
    
    // initialize the unique independent properties
    this.alpha = 0.63;                      // alpha value for the arterioles
    this.ans_sens = 1.0;                    // ans sensitivity of the arteriole
    this.ans_sens_factor = 1.0              // ans sensitivity factor (0-1) untiless
    this.no_back_flow = false;              // arterioles can have backflow
  }
}
