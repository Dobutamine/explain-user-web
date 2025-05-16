import { BaseModelClass } from "../../BaseModelClass";
import { BloodVessel } from "../../base_models/BloodVessel";
import { BloodCapacitance } from "../../component_models/blood_vessels/BloodCapacitance";

export class CapillaryNetwork extends BaseModelClass {

    // static properties
    static model_type = "CapillaryNetwork";
    model_interface = []

  constructor(model_ref, name = "") {
    super(model_ref, name);
    
    // set the independent variables
    this.vol = 0.0055;                              // total volume of the network (L)
    this.u_vol = 0.005;                             // total unstressed volume of the network (L)
    this.el_base = 25000.0;                         // total elastance of the network
    this.el_k = 0.0;                                // non linear elastance of the network (mmHg/L)
    this.r_base = 25000;                            // baseline resistance of the network
    this.r_back_factor = 1.0;                       // backflow factor of the network
    this.r_k = 0.0;                                 // non linear flow resistance of the network (mmHg/L/s)
    this.no_flow = false;                           // no flow condition of the network
    this.no_back_flow = true;                       // no backflow condition of the network
    this.inputs = [];                               // inputs of the network

    this.el_distr = { art: 0.75, cap: 0.15, ven: 0.10 };  // elastance distribution of the network
    this.res_dist = { art: 0.75, cap: 0.15, ven: 0.10 };  // resistance distribution of the network
    this.vol_dist = { art: 0.10, cap: 0.15, ven: 0.75 };  // volume distribution of the network

    this.ans_sens = 1.0;                            // sensitivity of the network to the ANS

    this.alpha_art = 0.63;                          // resistance elastance coupling factor for the arterial part of the network
    this.alpha_cap = 0.0;                           // resistance elastance coupling factor for the capillary part of the network
    this.alpha_ven = 0.75;                          // resistance elastance coupling factor for the venous part of the network

    this.u_vol_art = 0.0;                           // unstressed volume of the arterial part of the network
    this.u_vol_cap = 0.0;                           // unstressed volume of the capillary part of the network
    this.u_vol_ven = 0.0;                           // unstressed volume of the venous part of the network
    
    this.el_k_art = 0.0;                            // non linear elastance of the arterial part of the network
    this.el_k_cap = 0.0;                            // non linear elastance of the capillary part of the network
    this.el_k_ven = 0.0;                            // non linear elastance of the venous part of the network
    
    this.el_base_art = 0.0;                         // elastance of the arterial part of the network
    this.el_base_cap = 0.0;                         // elastance of the capillary part of the network
    this.el_base_ven = 0.0;                         // elastance of the venous part of the network

    this.r_base_art = 0.0;                          // resistance across the arterial part of the network  
    this.r_base_cap = 0.0;                          // resistance across the capillary part of the network   
    this.r_base_ven = 0.0;                          // resistance across the venous part of the network
  }
  init_model(args={}) {
    super.init_model(args);

    // calculate the individual elastances of the network depending on the distribution stored in this.el_distr
    // as elestance is the inverse of compliance we can simply add the individual elastances to get the total elastance
    // the elastance of the network is the sum of the elastances of the individual components
    
    this.el_base_art = this.el_base * this.el_distr.art / 100.0;
    this.el_base_cap = this.el_base * this.el_distr.cap / 100.0;
    this.el_base_ven = this.el_base * this.el_distr.ven / 100.0;

    // calculate the individual resistances of the network depending on the distribution stored in this.res_dist
    // as resistance is the inverse of conductance we can simply add the individual resistances to get the total resistance
    // the resistance of the network is the sum of the resistances of the individual components
    this.r_for_base_art = this.r_back_base_art = this.r_for_base * this.res_dist.art / 100.0;
    this.r_for_base_cap = this.r_back_base_cap = this.r_for_base * this.res_dist.cap / 100.0;
    this.r_for_base_ven = this.r_back_base_ven = this.r_for_base * this.res_dist.ven / 100.0;

    // we need to build the individual components of the network
    this.components = {
      art: new BloodVessel(this._model_engine, "art"),
      cap: new BloodCapacitance(this._model_engine, "cap"),
      ven: new BloodVessel(this._model_engine, "ven")
    }
    
  }
}