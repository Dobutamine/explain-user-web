import { BaseModelClass } from "../base_models/BaseModelClass";
import { Arteriole } from "./Arteriole";
import { Capillaries } from "./Capillaries";
import { Venule } from "./Venule";

/*
A MicroVascularUnit class (sometimes called a functional capillary unit) denotes the terminal arteriole, 
the capillary network branching from it, and the collecting venule into which those capillaries drain.
Together, these units make up the capillary beds that permeate tissues and are the fundamental exchange sites in 
the circulatory system.
*/
export class MicroVascularUnit extends BaseModelClass {
  // static properties
  static model_type = "MicroVascularUnit";
  model_interface = []

  constructor(model_ref, name = "") {
    // call the constructor of the parent class
    super(model_ref, name);
    
    // initialize independent properties
    this.inputs = []; // list of inputs
    this.vol = 0.0055; // total volume (L)
    this.u_vol = 0.005; // total unstressed volume (L)
    this.el_base = 25000.0; // total elastance (mmHg/L)
    this.el_k = 0.0; // non linear elastance (mmHg/L)
    this.temp = 37.0; // blood temperature (dgs C)
    this.viscosity = 6.0; // blood viscosity (centiPoise = Pa * s)
    this.solutes = {}; // solutes in the capillary
    this.drugs = {}; // drugs in the capillary
    this.to2 = 0.0; // total oxygen concentration (mmol/l)
    this.tco2 = 0.0; // total carbon dioxide concentration (mmol/l)
    this.ph = -1.0; // ph (unitless)
    this.pco2 = -1.0; // pco2 (mmHg)
    this.po2 = -1.0; // po2 (mmHg)
    this.so2 = -1.0; // o2 saturation
    this.hco3 = -1.0; // bicarbonate concentration (mmol/l)
    this.be = -1.0; // base excess (mmol/l)
    this.r_for = 25000; // baseline forward resistance (mmHg*s/l )
    this.r_back = 25000; // baseline backward resistance (mmHg*s/l )
    this.r_k = 0.0; // non linear flow resistance (unitless)
    this.l = 0.0; // intertance L (mmHg*s^2/L)
    this.no_flow = false; // no flow condition
    this.ans_sens = 0.0; // sensitivity of this MVU for autonomic control. 0.0 is no effect, 1.0 is full effect
    this.ans_activity = 1.0; // ans activity factor (unitless)
    this.el_distr = { art: 0.75, cap: 0.15, ven: 0.10 };  // elastance distribution
    this.vol_dist = { art: 0.10, cap: 0.15, ven: 0.75 };  // volume distribution
    this.res_dist = { art: 0.75, cap: 0.15, ven: 0.10 };  // resistance distribution

    // non-persistent property factors. These factors reset to 1.0 after each model step
    this.r_factor = 1.0; // non-persistent resistance factor
    this.r_k_factor = 1.0; // non-persistent non-linear coefficient factor
    this.l_factor = 1.0; // non-persistent inertance factor

    this.u_vol_factor = 1.0; // non-persistent unstressed volume factor step (unitless)
    this.el_base_factor = 1.0; // non-persistent elastance factor step (unitless)
    this.el_k_factor = 1.0; // non-persistent elastance factor step (unitless)

    // persistent property factors. These factors are persistent and do not reset
    this.r_factor_ps = 1.0; //  persistent resistance factor
    this.r_k_factor_ps = 1.0; // persistent non-linear coefficient factor
    this.l_factor_ps = 1.0; // persistent inertance factor

    this.u_vol_factor_ps = 1.0;  // persistent unstressed volume factor (unitless)
    this.el_base_factor_ps = 1.0; // persistent elastance factor (unitless)
    this.el_k_factor_ps = 1.0; // persistent elastance factor (unitless)

    // initialize dependent properties
    this.flow = 0.0; // total flow (L/s)
    this.flow_in = 0.0; // in flow (L/s)
    this.flow_out = 0.0; // out flow (L/s)
    this.vol = 0.0; // volume v(t) (L)
    this.pres = 0.0; // pressure in the capillary (mmHg)
    this.pres_in = 0.0; // pressure in the arterioles (mmHg)
    this.pres_out = 0.0; // pressure in the venules (mmHg)

    // local properties
    this._el = 0.0; // calculated elastance (mmHg/L)
    this._el_art = 0.0; // calculated elastance in the arterioles (mmHg/L)
    this._el_cap = 0.0; // calculated elastance in the capillaries (mmHg/L)
    this._el_ven = 0.0; // calculated elastance in the venules (mmHg/L)
    this._r_for = 0.0; // calculated forward resistance (mmHg/L*s)
    this._r_back = 0.0; // calculated backward resistance (mmHg/L*s)
    this._r_k = 0.0; // calculated non-linear resistance factor (unitless)
    this._r_for_art = 0.0; // calculated resistance in the arterioles (mmHg/L*s)
    this._r_back_art = 0.0; // calculated resistance in the arterioles (mmHg/L*s)
    this._r_for_cap = 0.0; // calculated resistance in the capillaries (mmHg/L*s)
    this._r_back_cap = 0.0; // calculated resistance in the capillaries (mmHg/L*s)
    this._r_for_ven = 0.0; // calculated resistance in the venules (mmHg/L*s)
    this._r_back_ven = 0.0; // calculated resistance in the venules (mmHg/L*s)
    this._l = 0.0; // calculated intertance (mmHg*s^2/L)
    this._u_vol = 0.0; // calculated unstressed volume (L)
    this._u_vol_art = 0.0; // calculated unstressed volume in the arterioles (L)
    this._u_vol_cap = 0.0; // calculated unstressed volume in the capillaries (L)
    this._u_vol_ven = 0.0; // calculated unstressed volume in the venules (L)
    this._el_k = 0.0; // calculated elastance non-linear k (unitless)
    this._el_k_art = 0.0; // calculated elastance non-linear k in the arterioles (unitless)
    this._el_k_cap = 0.0; // calculated elastance non-linear k in the capillaries (unitless)
    this._el_k_ven = 0.0; // calculated elastance non-linear k in the venules (unitless)
    this._r_for = 1000;  // calculated forward resistance (mmHg/L*s)
    this._r_back = 1000; // calculated backward resistance (mmHg/L*s)
    this._r_k = 0; // calculated non-linear resistance factor (unitless)
    this._l = 0.0; // calculated intertance (mmHg*s^2/L)

  }
  init_model(args={}) {
    // call the parent initializer method
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
        { key: "el_k", value: this.el_k * this.el_distr.art },
        { key: "inputs", value: this.inputs },
        { key: "r_for", value: this.r_for * this.res_dist.art },
        { key: "r_back", value: this.r_back * this.res_dist.art},
        { key: "r_k", value: this.r_k * this.res_dist.art },
        { key: "no_flow", value: this.no_flow }
    ]
    this.components.art.init_model(args_art);
    // add the arteriole to the model engine
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
        { key: "el_k", value: this.el_k * this.el_distr.cap },
        { key: "inputs", value: [this.name + "_IN"] },
        { key: "r_for", value: this.r_for * this.res_dist.cap },
        { key: "r_back", value: this.r_back * this.res_dist.cap},
        { key: "r_k", value: this.r_k * this.res_dist.cap },
        { key: "no_flow", value: this.no_flow }
    ]
    this.components.cap.init_model(args_cap);
    // add the capillary to the model engine
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
        { key: "el_k", value: this.el_k * this.el_distr.ven },
        { key: "inputs", value: [this.name + "_CAP"] },
        { key: "r_for", value: this.r_for * this.res_dist.ven },
        { key: "r_back", value: this.r_back * this.res_dist.ven },
        { key: "r_k", value: this.r_k * this.res_dist.ven },
        { key: "no_flow", value: this.no_flow }
    ]
    this.components.ven.init_model(args_ven);
    // add the venule to the model engine
    this._model_engine.models[this.name + "_OUT"] = this.components.ven;
  }

  calc_model() {
    // update the ans activity according the sensitivity of the whole MVU
    // so a ans sens of 1.0 that ans_activity is transferred to the components
    // and an ans sens of 0.0 that none of the ans activity is transferred
    let _ans_activity = this.ans_sens * this.ans_activity; // THIS IS WRONG!!!

    // update the ans activity according the sensitivity of the components
    this.components.art.ans_activity = _ans_activity;
    this.components.cap.ans_activity = _ans_activity;
    this.components.ven.ans_activity = _ans_activity;

    // update the property factors and ans activity
    this.components.art.r_factor = this.r_factor
    this.components.art.r_factor_ps = this.r_factor_ps
    this.components.art.r_k_factor = this.r_k_factor
    this.components.art.r_k_factor_ps = this.r_k_factor_ps
    this.components.art.l_factor = this.l_factor
    this.components.art.l_factor_ps = this.l_factor_ps
    this.components.art.u_vol_factor = this.u_vol_factor
    this.components.art.u_vol_factor_ps = this.u_vol_factor_ps
    this.components.art.el_base_factor = this.el_base_factor
    this.components.art.el_base_factor_ps = this.el_base_factor_ps
    this.components.art.el_k_factor = this.el_k_factor
    this.components.art.el_k_factor_ps = this.el_k_factor_ps
    this.components.art.ans_activity = this.ans_activity

    this.components.cap.r_factor = this.r_factor
    this.components.cap.r_factor_ps = this.r_factor_ps
    this.components.cap.r_k_factor = this.r_k_factor
    this.components.cap.r_k_factor_ps = this.r_k_factor_ps
    this.components.cap.l_factor = this.l_factor
    this.components.cap.l_factor_ps = this.l_factor_ps
    this.components.cap.u_vol_factor = this.u_vol_factor
    this.components.cap.u_vol_factor_ps = this.u_vol_factor_ps
    this.components.cap.el_base_factor = this.el_base_factor
    this.components.cap.el_base_factor_ps = this.el_base_factor_ps
    this.components.cap.el_k_factor = this.el_k_factor
    this.components.cap.el_k_factor_ps = this.el_k_factor_ps
    this.components.cap.ans_activity = this.ans_activity

    this.components.ven.r_factor = this.r_factor
    this.components.ven.r_factor_ps = this.r_factor_ps
    this.components.ven.r_k_factor = this.r_k_factor
    this.components.ven.r_k_factor_ps = this.r_k_factor_ps
    this.components.ven.l_factor = this.l_factor
    this.components.ven.l_factor_ps = this.l_factor_ps
    this.components.ven.u_vol_factor = this.u_vol_factor
    this.components.ven.u_vol_factor_ps = this.u_vol_factor_ps
    this.components.ven.el_base_factor = this.el_base_factor
    this.components.ven.el_base_factor_ps = this.el_base_factor_ps
    this.components.ven.el_k_factor = this.el_k_factor
    this.components.ven.el_k_factor_ps = this.el_k_factor_ps
    this.components.ven.ans_activity = this.ans_activity

    // get the pressures and flows from the components
    this.pres = this.components.cap.pres;
    this.pres_in = this.components.art.pres;
    this.pres_out = this.components.cap.pres;

    this.flow = this.components.cap.flow;
    this.flow_in = this.components.art.flow;
    this.flow_out = this.components.ven.flow;

    // get the solutes and drugs from the components
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