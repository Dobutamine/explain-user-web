import { BaseModelClass } from "../base_models/BaseModelClass";

export class Scaler extends BaseModelClass {
  // static properties
  static model_type = "Scaler";
  static model_interface = []

  constructor(model_ref, name = "") {
    // call the constructor of the parent class
    super(model_ref, name);

    // initialize independent properties
    this.gestational_age = 40;          // gestational age in weeks
    this.blood_volume_kg = 0.08;        // blood volume per kg in L/kg
    this.gas_volume_kg = 0.0;           // gas volume per kg in L/kg
    this.blood_containing_models = [];  // blood containing models which need to be scaled
    this.gas_containing_models = [];    // gas containing models which need to be scaled

    // non-persistent property factors. These factors reset to 1.0 after each model step

    // persistent property factors. These factors are persistent and do not reset

    // initialize dependent properties

    // local variables
  }

  calc_model() {}

  scale_by_gestational_age(new_gestational_age = 40) {}

  scale_by_weight(new_weight, blood_volume_kg = 0.08) {}

  scale_blood_volumes(new_blood_volume) {
    // get current blood volume
    const current_blood_volume = this._model_engine.models["Circulation"].total_blood_volume;
    // calculate the scaling factor
    const scaling_factor = new_blood_volume / current_blood_volume;

  }

  scale_gas_volumes(new_gas_volume) {}

}
