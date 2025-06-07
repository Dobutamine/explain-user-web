import { BaseModelClass } from "../base_models/BaseModelClass";
import * as Models from "../ModelIndex.js"

export class Shunts extends BaseModelClass {
  // static properties
  static model_type = "Shunts";
  static model_interface = [
    {
      caption: "ductus arteriosus diameter (mm)",
      target: "da_diameter_in",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "ductus arteriosus diameter (mm)",
      target: "da_diameter_out",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "ductus arteriosus elastance",
      target: "da_el",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "ductus arteriosus length (mm)",
      target: "da_length",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    }
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
    this.da_diameter_in = 2.0; // ductus arteriosus diameter (mm)
    this.da_diameter_out = 4.0; // ductus arteriosus diameter (mm)
    this.da_length = 5; // ductus arteriosus length (mm)
    this.da_res_in = 1500; // resistance across the ductus arteriosus (mmHg*s/L)
    this.da_res_out = 1500; // resistance across the ductus arteriosus (mmHg*s/L)
    this.da_el = 40000; // elasticity of the ductus arteriosus
    
    // -----------------------------------------------
    // initialize dependent properties
    // -----------------------------------------------
    this.da_viscosity = 6; // viscosity in ductus arteriosus (cP)
    this.da_flow_in = 0; // in flow across the ductus arteriosus (L/s)
    this.da_flow_out = 0; // out flow of the ductus arteriosus
    this.da_velocity = 0;
    this.da_velocity_in = 0; // blood flow velocity across the ductus arteriosus (cm/s)
    this.da_velocity_out = 0; // blood flow velocity across the ductus arteriosus (cm/s)

    // -----------------------------------------------
    // initialize local properties (preceded with _)
    // -----------------------------------------------
    this._da = {}
    this._da_in = {}
    this._da_out = {}
    this._prev_da_res = 1500;

  }

  calc_model() {
    // get a reference to the ductus arteriosus blood vessel model
    this._da_in = this._model_engine.models["AAR_DA"];
    this._da = this._model_engine.models["DA"];
    this._da_out = this._model_engine.models["DA_PA"];

    // get the current flows
    this.da_flow_in = this._da_in.flow
    this.da_flow_out = this._da_out.flow

    // calculate the ductus arteriosus resistance
    this.da_viscosity = this._da.viscosity

    // set the elastance of the ductus arteriosus
    this._da.el_base = this.da_el

    // calculate the resistance across the ductus arteriosus
    if (this.da_diameter_in == 0) {
      this._da_in.no_flow = true
    } else {
      this._da_in.no_flow = false
    }
    if (this.da_diameter_out == 0) {
      this._da_out.no_flow = true
    } else {
      this._da_out.no_flow = false
    }

    this.da_res_in = this.calc_resistance(this.da_diameter_in, this.da_length, this.da_viscosity)
    this.da_res_out = this.calc_resistance(this.da_diameter_out, this.da_length, this.da_viscosity)
    
    // transfer the resistance to the ductus arteriosus
    this._da_in.r_for = this.da_res_in;
    this._da_in.r_back = this.da_res_in;

    this._da_out.r_for = this.da_res_out;
    this._da_out.r_back = this.da_res_out;

    // calculate the ductus arteriosus area
    let da_area_in = Math.pow((this.da_diameter_in * 0.001) / 2.0, 2.0) * Math.PI; // in m^2
    let da_area_out = Math.pow((this.da_diameter_out * 0.001) / 2.0, 2.0) * Math.PI; // in m^2
    
    // calculate the velocity across the ductus arteriosus
    // convert flow in L/s to m^3/s => factor 1000 and divide by the area in cm^2
    if (da_area_in > 0) {
      this.da_velocity_in = (this.da_flow_in * 0.001) / da_area_in
    } else {
      this.da_velocity_in = 0.0;
    }
    if (da_area_out > 0) {
      this.da_velocity_out = (this.da_flow_out * 0.001) / da_area_out
    } else {
      this.da_velocity_out = 0.0;
    }

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
