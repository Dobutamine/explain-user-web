import { BaseModelClass } from "../base_models/BaseModelClass";
import * as Models from "../ModelIndex.js"

export class Shunts extends BaseModelClass {
  // static properties
  static model_type = "Shunts";
  static model_interface = [
    {    
      target: "model_type",  
      type: "string",
      build_prop: false,
      edit_mode: "basic",
      readonly: true,
      caption: "model type",
    },
    {
      target: "description",
      type: "string",
      build_prop: true,
      edit_mode: "basic",
      readonly: true,
      caption: "description",
    },
    {
      target: "is_enabled",
      type: "boolean",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "enabled",
    },
    {
      caption: "foramen ovale diameter (mm)",
      target: "diameter_fo",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "ventricular septal defect diameter (mm)",
      target: "diameter_vsd",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "atrial septum width (mm)",
      target: "atrial_septal_width",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "ventricular septum width (mm)",
      target: "ventricular_septal_width",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "foramen ovale L-R resistance factor",
      target: "fo_lr_factor",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },

  ];

  /*
    The Shunts class calculates the resistances of the shunts (ductus arteriosus, foramen ovale, and ventricular septal defect) from the diameter and length.
    It sets the resistances on the correct models representing the shunts.
    */
  constructor(model_ref, name = "") {
    super(model_ref, name);

    // -----------------------------------------------
    // initialize independent properties
    // -----------------------------------------------
    this.diameter_fo = 2.0; // diameter of the foramen ovale in mm
    this.diameter_fo_max = 10.0; 
    this.diameter_vsd = 2.0;
    this.diameter_vsd_max = 10.0;

    this.atrial_septal_width = 3.0; // width of the atrial septum in mm
    this.ventricular_septal_width = 5.0; // width of the ventricular septum in mm
    this.fo_lr_factor = 10.0;
    this.viscosity = 6.0; 

    // -----------------------------------------------
    // initialize dependent properties
    // -----------------------------------------------
    this.flow_fo = 0.0; // flow through the foramen ovale in mL/s
    this.flow_vsd = 0.0; // flow through the muscular ventricular septal defect in mL/s

    this.velocity_fo = 0.0; // velocity of flow through the foramen ovale in m/s
    this.velocity_vsd = 0.0; // velocity of flow through the perimembranous ventricular septal defect in m/s
    
    this.res_fo = 500;
    this.res_vsd = 500;

    // -----------------------------------------------
    // initialize local properties (preceded with _)
    // -----------------------------------------------
    this._fo = {};  
    this._vsd = {}; // muscular ventricular septal defect

  }

  calc_model() {
    // get a reference to the models
    this._fo = this._model_engine.models["FO"];
    this._vsd = this._model_engine.models["VSD"];

    // get the viscosity from the model engine
    this.viscosity = this._model_engine.models["LV"].viscosity

    // guard for a too large diameters
    this.diameter_fo = Math.min(this.diameter_fo, this.diameter_fo_max);
    this.diameter_vsd = Math.min(this.diameter_vsd, this.diameter_vsd_max);

    // if the diameter is zero, set the resistance to a very high value to represent no flow
    this._fo.no_flow = this.diameter_fo === 0;
    this._vsd.no_flow = this.diameter_vsd === 0;

    // calculate the resistance across the FO and VSD
    this.res_fo = this.calc_resistance(this.diameter_fo, this.atrial_septal_width, this.viscosity);
    this.res_vsd = this.calc_resistance(this.diameter_vsd, this.ventricular_septal_width, this.viscosity);

    // transfer the resistances to the models
    this._fo.r_for = this.res_fo * this.fo_lr_factor;
    this._fo.r_back = this.res_fo;

    this._vsd.r_for = this.res_vsd;
    this._vsd.r_back = this.res_vsd;

    // get the flows
    this.flow_fo = this._fo.flow;
    this.flow_vsd = this._vsd.flow;

    // calculate the area of the fo and vsd
    let area_fo = Math.pow((this.diameter_fo * 0.001) / 2.0, 2.0) * Math.PI;
    let area_vsd = Math.pow((this.diameter_vsd * 0.001) / 2.0, 2.0) * Math.PI;

    // calculate the velocities over the fo and vsd
    this.velocity_fo = area_fo > 0 ? (this.flow_fo * 0.001) / area_fo: 0.0;
    this.velocity_vsd = area_vsd > 0 ? (this.flow_vsd * 0.001) / area_vsd: 0.0;

  }

  calc_resistance(diameter, length = 2.0, viscosity = 6.0) {
    if (diameter > 0.0 && length > 0.0) {
      // resistance is calculated using Poiseuille's Law: R = (8 * n * L) / (PI * r^4)
      // diameter (mm), length (mm), viscosity (cP)

      // convert viscosity from centiPoise to Pa * s
      const n_pas = viscosity / 1000.0;

      // convert the length to meters
      const length_meters = length / 1000.0;

      // calculate radius in meters
      const radius_meters = diameter / 2 / 1000.0;

      // calculate the resistance Pa * s / m^3
      let res =
        (8.0 * n_pas * length_meters) / (Math.PI * Math.pow(radius_meters, 4));

      // convert resistance from Pa * s / m^3 to mmHg * s / L
      res = res * 0.00000750062;
      return res;
    } else {
      return 100000000; // a very high resistance to represent no flow
    }
  }
}
