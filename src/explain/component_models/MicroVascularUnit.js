import { BaseModelClass } from "../base_models/BaseModelClass";
import { BloodVessel  } from "./BloodVessel"; 

/*
A MicroVascularUnit class (MVU) (sometimes called a functional capillary unit) denotes the terminal arteriole, 
the capillary network branching from it, and the collecting venule into which those capillaries drain.
Together, these units make up the capillary beds that permeate tissues and are the fundamental exchange sites in 
the circulatory system.

So this MVU consists of three Explain BloodVessel components (which have a BloodCapacitance and a BloodResistor component)
A MVU has a unstressed volume, an elastance and a resistance which are distributed across the three components according to
distribution objects called el_dist, vol_dist and res_dist. The MVU automatically builds the three components at initialization
and distributes the properties across the three components.

As the components are BloodVessels they are also under autonomic control (see BloodVessel model). 
The input BloodVessel is configures as an arteriole and the output BloodVessel as a venule. They are configured by the MVU
and exhibit autonomic sensitivity where the arteriole will be the main contributor to the resistance and the venule to 
the volume. The capillary bed is a BloodVessel without any autonomic sensitivity.
*/

export class MicroVascularUnit extends BaseModelClass {
  // static properties
  static model_type = "MicroVascularUnit";
  static model_interface = [
    {
      caption: "model type",
      target: "model_type",
      type: "string",
      readonly: true
    },
    {
      caption: "description",
      target: "description",
      type: "string",
      readonly: true
    },
    {
      caption: "enabled",
      target: "is_enabled",
      type: "boolean"
    },
    {
      caption: "no flow allowed",
      target: "no_flow",
      type: "boolean"
    },
    {
      caption: "no back flow allowed",
      target: "no_back_flow",
      type: "boolean"
    },
    {
      caption: "volume (L)",
      target: "vol",
      type: "number",
      factor: 1.0,
      delta: 0.001,
      rounding: 3
    },
    {
      caption: "unstressed volume (L)",
      target: "u_vol",
      type: "number",
      factor: 1.0,
      delta: 0.001,
      rounding: 3,
    },
    {
      caption: "elastance baseline (mmHg/L)",
      target: "el_base",
      type: "number",
      factor: 1,
      delta: 1,
      rounding: 0,
    },
    {
      caption: "elastance non linear k",
      target: "el_k",
      type: "number",
      factor: 1,
      delta: 1,
      rounding: 0,
    },
    {
      caption: "r_for (mmHg/L/s)",
      target: "r_for",
      type: "number",
      factor: 1.0,
      delta: 1,
      rounding: 0
    },
    {
      caption: "r_back (mmHg/L/s)",
      target: "r_back",
      type: "number",
      factor: 1.0,
      delta: 1,
      rounding: 0
    },
    {
      caption: "ans sensitivity (0-1)",
      target: "ans_sens",
      type: "number",
      factor: 1,
      delta: 0.01,
      rounding: 2,
    },
    {
      caption: "unstressed volume factor",
      target: "u_vol_factor_ps",
      type: "factor",
    },
    {
      caption: "elastance baseline factor",
      target: "el_base_factor_ps",
      type: "factor",
    },
    {
      caption: "elastance non linear factor",
      target: "el_k_factor_ps",
      type: "factor",

    },
    {
      caption: "resistance factor",
      target: "r_factor_ps",
      type: "factor",
    },
    {
      caption: "non-linear resistance factor",
      target: "r_k_factor_ps",
      type: "factor",
    },
    {
      caption: "inertance factor",
      target: "l_factor_ps",
      type: "factor",
    }
  ];

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
    this.no_back_flow = false; // no back flow condition
    
    this.ans_sens = 0.0; // sensitivity of this MVU for autonomic control for this full MVU. 0.0 is no effect, 1.0 is full effect
    this.ans_sens_settings = { art: 1.0, cap: 0.0, ven: 0.75 }; // ans sensivity settings of the components
    this.alpha_settings = { art: 0.63, cap: 0.0, ven: 0.75 }; // resistance-elastance relation of the components
    this.ans_activity = 1.0; // ans activity factor (unitless)

    this.el_dist = { art: 0.10, cap: 0.15, ven: 0.75 };  // elastance distribution (inverse making the artery less compiant then the vein)
    this.vol_dist = { art: 0.10, cap: 0.55, ven: 0.35 };  // volume distribution
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

    this._r_for = 1000; // calculated forward resistance (mmHg/L*s)
    this._r_back = 1000; // calculated backward resistance (mmHg/L*s)
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
  }

  init_model(args={}) {
    // call the parent initializer method
    super.init_model(args);

    // we need to build the individual components of the network
    this.components = {
      art: new BloodVessel(this._model_engine, "art"),
      cap: new BloodVessel(this._model_engine, "cap"),
      ven: new BloodVessel(this._model_engine, "ven")
    }
    
    // calculate the elastance distribution across the art, ven and cap
    this.calc_elastance_dist(this.el_base, this.el_dist);
    
    // initialize the arteriole part of the network
    let args_art = [
        { key: "name", value: this.name + "_ART" },
        { key: "description", value: "arteriole of " + this.name },
        { key: "is_enabled", value: this.is_enabled },
        { key: "model_type", value: "BloodVessel" },
        { key: "vol", value: this.vol * this.vol_dist.art},
        { key: "u_vol", value: this.u_vol * this.vol_dist.art},
        { key: "el_base", value: this._el_art },
        { key: "el_k", value: this.el_k * this.el_dist.art },
        { key: "inputs", value: this.inputs },
        { key: "r_for", value: this.r_for * this.res_dist.art },
        { key: "r_back", value: this.r_back * this.res_dist.art},
        { key: "r_k", value: this.r_k * this.res_dist.art },
        { key: "no_flow", value: this.no_flow },
        { key: "no_back_flow", value: this.no_back_flow },
        { key: "ans_activity", value: this.ans_activity },
        { key: "ans_sens", value: this.ans_sens },
        { key: "alpha", value: 0.63 } // this is an arteriole
    ]
    // check whether this arteriole already exists (in case of a saved state)
    if (this._model_engine.models[this.name + "_ART"]) {
      this.components.art = this._model_engine.models[this.name + "_ART"];
    } else {
      this.components.art.init_model(args_art);
      // add the arteriole to the model engine
      this._model_engine.models[this.name + "_ART"] = this.components.art;
    }

    // initialize the capillary part of the network
    let args_cap = [
        { key: "name", value: this.name + "_CAP" },
        { key: "description", value: "capillaries of " + this.name },
        { key: "is_enabled", value: this.is_enabled },
        { key: "model_type", value: "BloodVessel" },
        { key: "vol", value: this.vol * this.vol_dist.cap},
        { key: "u_vol", value: this.u_vol * this.vol_dist.cap},
        { key: "el_base", value: this._el_cap },
        { key: "el_k", value: this.el_k * this.el_dist.cap },
        { key: "inputs", value: [this.name + "_ART"] },
        { key: "r_for", value: this.r_for * this.res_dist.cap },
        { key: "r_back", value: this.r_back * this.res_dist.cap},
        { key: "r_k", value: this.r_k * this.res_dist.cap },
        { key: "no_flow", value: this.no_flow },
        { key: "no_back_flow", value: this.no_back_flow },
        { key: "ans_activity", value: this.ans_activity },
        { key: "ans_sens", value: 0.0},
        { key: "alpha", value: 0.0 }
    ]
    // check whether this capillary already exists (in case of a saved state)
    if (this._model_engine.models[this.name + "_CAP"]) {
      this.components.cap = this._model_engine.models[this.name + "_CAP"];
    } else {
      this.components.cap.init_model(args_cap);
      // add the capillary to the model engine
      this._model_engine.models[this.name + "_CAP"] = this.components.cap;
  }

    // initialize the venule part of the network
    let args_ven = [
        { key: "name", value: this.name + "_VEN" },
        { key: "description", value: "venules of " + this.name },
        { key: "is_enabled", value: this.is_enabled },
        { key: "model_type", value: "BloodVessel" },
        { key: "vol", value: this.vol * this.vol_dist.ven},
        { key: "u_vol", value: this.u_vol * this.vol_dist.ven},
        { key: "el_base", value: this._el_ven},
        { key: "el_k", value: this.el_k * this.el_dist.ven },
        { key: "inputs", value: [this.name + "_CAP"] },
        { key: "r_for", value: this.r_for * this.res_dist.ven },
        { key: "r_back", value: this.r_back * this.res_dist.ven },
        { key: "r_k", value: this.r_k * this.res_dist.ven },
        { key: "no_flow", value: this.no_flow },
        { key: "no_back_flow", value: this.no_back_flow },
        { key: "ans_activity", value: this.ans_activity },
        { key: "ans_sens", value: this.ans_sens },
        { key: "alpha", value: 0.75 }
    ]
    // check whether this venous already exists (in case of a saved state)
    if (this._model_engine.models[this.name + "_VEN"]) {
      this.components.ven = this._model_engine.models[this.name + "_VEN"];
    } else {
      // initialize the venule part of the network
      this.components.ven.init_model(args_ven);
      // add the venule to the model engine
      this._model_engine.models[this.name + "_VEN"] = this.components.ven;
    }
  }

  calc_model() {
    // update the ans activity according the sensitivity of the whole MVU
    let _ans_activity = 1.0 + (this.ans_activity - 1.0) * this.ans_sens;

    // send the ans activity to the components
    this.components.art.ans_activity = _ans_activity;
    this.components.cap.ans_activity = _ans_activity;
    this.components.ven.ans_activity = _ans_activity;

    // calculate the resistance, elastance and inertance
    this.calc_resistance();
    this.calc_elastance();
    this.calc_inertance();
    this.calc_volume();

    // update the components with the calculated properties
    this.components.art.el_base = this._el_art;
    this.components.cap.el_base = this._el_cap;
    this.components.ven.el_base = this._el_ven;

    this.components.art.el_k = this._el_k_art;
    this.components.cap.el_k = this._el_k_cap;
    this.components.ven.el_k = this._el_k_ven;

    this.components.art.r_for = this._r_for_art;
    this.components.art.r_back = this._r_back_art;
    this.components.art.r_k = this._r_k;
 
    this.components.cap.r_for = this._r_for_cap;
    this.components.cap.r_back = this._r_back_cap;
    this.components.cap.r_k = this._r_k;

    this.components.ven.r_for = this._r_for_ven;
    this.components.ven.r_back = this._r_back_ven;
    this.components.ven.r_k = this._r_k;

    this.components.art.u_vol = this._u_vol_art;
    this.components.art.l = this._l;
    this.components.art.no_flow = this.no_flow;

    this.components.cap.u_vol = this._u_vol_cap;
    this.components.cap.l = this._l;
    this.components.cap.no_flow = this.no_flow;

    this.components.ven.u_vol = this._u_vol_ven;
    this.components.ven.l = this._l;
    this.components.ven.no_flow = this.no_flow;

    // get the pressures and flows from the components
    this.pres = this.components.cap.pres;
    this.pres_in = this.components.art.pres;
    this.pres_out = this.components.cap.pres;

    this.flow = this.components.cap.flow;
    this.flow_in = this.components.art.flow;
    this.flow_out = this.components.ven.flow;

    this.vol = this.components.art.vol + this.components.cap.vol + this.components.ven.vol

    // get the solutes and drugs from the capillary components
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

  calc_resistance() {
    // calculate the resistances depending on the ans acitvity and resistance property factors
    this._r_for = this.r_for 
      + (this.r_factor - 1) * this.r_for
      + (this.r_factor_ps - 1) * this.r_for

    this._r_back = this.r_back
      + (this.r_factor - 1) * this.r_back
      + (this.r_factor_ps - 1) * this.r_back

    this._r_k = this.r_k 
      + (this.r_k_factor - 1) * this.r_k
      + (this.r_k_factor_ps - 1) * this.r_k;

    // distribute the resistance to the different parts of the MVU
    this._r_for_art = this._r_for * this.res_dist.art;
    this._r_back_art = this._r_back * this.res_dist.art;

    this._r_for_cap = this._r_for * this.res_dist.cap;
    this._r_back_cap = this._r_back * this.res_dist.cap;

    this._r_for_ven = this._r_for * this.res_dist.ven;
    this._r_back_ven = this._r_back * this.res_dist.ven;

    // reset the non persistent factors
    this.r_factor = 1.0;
    this.r_k_factor = 1.0;

  }

  calc_elastance() {
    // calculate the elastance factors depending on the ans activity and the elastance factors
    this._el = this.el_base 
        + (this.el_base_factor - 1) * this.el_base
        + (this.el_base_factor_ps - 1) * this.el_base

    // calculate the elastance distribution across the art, ven and cap
    this.calc_elastance_dist(this._el, this.el_dist);

    // calculate the elastance factors depending on the ans activity and the elastance factors
    this._el_k = this.el_k 
        + (this.el_k_factor - 1) * this.el_k
        + (this.el_k_factor_ps - 1) * this.el_k

    // reset the non persistent factors
    this.el_base_factor = 1.0;
    this.el_k_factor = 1.0;
  }

  calc_elastance_dist(el_base, el_dist) {

    // when 1/el_base = 1/el_art + 1/el_cap + 1/el_ven
    // when equally distributed -> el_art = el_cap = el_ven = 3 * el_base
    // so 1/(3 * el_base) = 33% of the sum
    // so 1/(3 * el_base) = 1%
    // so if we want to distribute according to 75%, 15% and 10%
    // term 1: 75 * 1 / (3 * el_base) leads to el_art being 1 / (75 * 1 / (3 * el_base))

    // “Unit” = 1 / (3 * el_base)  corresponds to 1% of 1/el_base
    const unit = 1 / (3 * el_base) / 33.3333;

    // For 75% of the inverse-sum:
    //   1/el_art = 75 * unit  →  el_art = 1 / (75 * unit)
    this._el_art = 1 / (el_dist.art * 100 * unit);

    // For 15% of the inverse-sum:
    //   1/el_cap = 15 * unit →  el_cap = 1 / (15 * unit)
    this._el_cap = 1 / (el_dist.cap * 100 * unit);

    // For 10% of the inverse-sum:
    //   1/el_ven = 10 * unit →  el_ven = 1 / (10 * unit)
    this._el_ven = 1 / (el_dist.ven * 100 * unit);

  }

  calc_inertance() {
    // calulate the inertance depending on the ans activity and the elastance-resistance coupling factor
    this._l = this.l
      + (this.l_factor - 1) * this.l
      + (this.l_factor_ps - 1) * this.l

    // reset the non persistent factors
    this.l_factor = 1.0;
  }

  calc_volume() {
    // calculate the unstressed volume incorporating the factors
    this._u_vol = this.u_vol 
        + (this.u_vol_factor - 1) * this.u_vol
        + (this.u_vol_factor_ps - 1) * this.u_vol

    // distribute the unstressed volume to the different parts of the MVU
    this._u_vol_art = this._u_vol * this.vol_dist.art;
    this._u_vol_cap = this._u_vol * this.vol_dist.cap;
    this._u_vol_ven = this._u_vol * this.vol_dist.ven;

    // reset the non persistent factors
    this.u_vol_factor = 1.0;
  }
}