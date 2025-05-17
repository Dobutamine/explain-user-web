import { BaseModelClass } from "../../base_models/BaseModelClass";
import { Arteriole } from "./Arteriole";
import { Capillaries } from "./Capillaries";
import { Venule } from "./Venule";

/*
A capillary network class (sometimes called a functional capillary unit) denotes the terminal arteriole, 
the capillary network branching from it, and the collecting venule into which those capillaries drain.

Together, these units make up the capillary beds that permeate tissues and are the fundamental exchange sites in the circulatory system.
*/
export class CapillaryNetwork extends BaseModelClass {

  // static properties
  static model_type = "CapillaryNetwork";
  static model_interface = []

  constructor(model_ref, name = "") {
    super(model_ref, name);
    
    // set the independent variables
    this.inputs = [];                                     // list of inputs for this capillary network
    this.vol = 0.0055;                                    // total volume of the network (L)
    this.u_vol = 0.005;                                   // total unstressed volume of the network (L)
    this.el_base = 25000.0;                               // total elastance of the network
    this.el_k = 0.0;                                      // non linear elastance of the network (mmHg/L)
    this.r_for = 25000;                                   // baseline resistance of the network
    this.r_k = 0.0;                                       // non linear flow resistance of the network (mmHg/L/s)
    this.no_flow = false;                                 // no flow condition of the network
    this.ans_sens = 1.0;                                  // ans sensitivity of the network (0-1) unitless
    this.el_distr = { art: 0.75, cap: 0.15, ven: 0.10 };  // elastance distribution of the network
    this.vol_dist = { art: 0.10, cap: 0.15, ven: 0.75 };  // volume distribution of the network
    this.res_dist = { art: 0.75, cap: 0.15, ven: 0.10 };  // resistance distribution of the network

    // dependent variables
    this.flow = 0.0;                                      // total flow through the network (L/s)
    this.flow_art = 0.0;                                  // in flow through the network (L/s)
    this.flow_ven = 0.0;                                  // out flow through the network (L/s)

    this.pres = 0.0;                                      // pressure in the capillary part of the network (mmHg)
    this.pres_art = 0.0;                                  // pressure in the arterioles (mmHg)
    this.pres_ven = 0.0;                                  // pressure in the venules (mmHg)
  }
  init_model(args={}) {
    super.init_model(args);

    // we need to build the individual components of the network
    this.components = {
      art: new Arteriole(this._model_engine, "art"),
      cap: new Capillaries(this._model_engine, "cap"),
      ven: new Venule(this._model_engine, "ven")
    }
    
    // initialize the arteriole part of the network
    let args_art = [
        { key: "name", value: this.name + "_IN" },
        { key: "description", value: "arteriole of " + this.name },
        { key: "is_enabled", value: this.is_enabled },
        { key: "model_type", value: "Arteriole" },
        { key: "vol", value: this.vol * this.vol_dist.art},
        { key: "u_vol", value: this.u_vol * this.vol_dist.art},
        { key: "el_base", value: this.el_base * this.el_distr.art },
        { key: "el_k", value: this.el_distr.art },
        { key: "inputs", value: this.inputs },
        { key: "r_for", value: this.r_for * this.res_dist.art },
        { key: "r_back", value: this.r_for * this.res_dist.art},
        { key: "r_k", value: this.r_k * this.res_dist.art },
        { key: "no_flow", value: this.no_flow }
    ]
    this.components.art.init_model(args_art);
    this._model_engine.models[this.name + "_IN"] = this.components.art;

    // initialize the capillary part of the network
    let args_cap = [
        { key: "name", value: this.name + "_CAP" },
        { key: "description", value: "capillaries of " + this.name },
        { key: "is_enabled", value: this.is_enabled },
        { key: "model_type", value: "Capillaries" },
        { key: "vol", value: this.vol * this.vol_dist.cap},
        { key: "u_vol", value: this.u_vol * this.vol_dist.cap},
        { key: "el_base", value: this.el_base * this.el_distr.cap },
        { key: "el_k", value: this.el_distr.cap },
        { key: "inputs", value: [this.name + "_IN"] },
        { key: "r_for", value: this.r_for * this.res_dist.cap },
        { key: "r_back", value: this.r_for * this.res_dist.cap},
        { key: "r_k", value: this.r_k * this.res_dist.cap },
        { key: "no_flow", value: this.no_flow }
    ]
    this.components.cap.init_model(args_cap);
    this._model_engine.models[this.name + "_CAP"] = this.components.cap;

    // initialize the venule part of the network
    let args_ven = [
        { key: "name", value: this.name + "_OUT" },
        { key: "description", value: "venules of " + this.name },
        { key: "is_enabled", value: this.is_enabled },
        { key: "model_type", value: "Venule" },
        { key: "vol", value: this.vol * this.vol_dist.ven},
        { key: "u_vol", value: this.u_vol * this.vol_dist.ven},
        { key: "el_base", value: this.el_base * this.el_distr.ven },
        { key: "el_k", value: this.el_distr.ven },
        { key: "inputs", value: [this.name + "_CAP"] },
        { key: "r_for", value: this.r_for * this.res_dist.ven },
        { key: "r_back", value: this.r_for * this.res_dist.ven },
        { key: "r_k", value: this.r_k * this.res_dist.ven },
        { key: "no_flow", value: this.no_flow }
    ]
    this.components.ven.init_model(args_ven);
    this._model_engine.models[this.name + "_OUT"] = this.components.ven;
  }

  calc_model() {
    this.pres = this.components.cap.pres;
    this.pres_art = this.components.art.pres;
    this.pres_cap = this.components.cap.pres;
    this.pres_ven = this.components.ven.pres;

    this.flow = this.components.cap.flow;
    this.flow_art = this.components.art.flow;
    this.flow_ven = this.components.ven.flow;

    this.solutes = this.components.cap.solutes;
    this.drugs = this.components.cap.drugs;
    this.to2 = this.components.cap.to2;
    this.tco2 = this.components.cap.tco2;
    this.ph = this.components.cap.ph;
    this.pco2 = this.components.cap.pco2;
    this.po2 = this.components.cap.po2;
    this.so2 = this.components.cap.so2;
    this.hco3 = this.components.cap.hco3;
    this.be = this.components.cap.be;
    this.temp = this.components.cap.temp;
    this.viscosity = this.components.cap.viscosity;

  }

}