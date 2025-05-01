import { BaseModelClass } from "../base_models/BaseModelClass.js";
import * as Models from "../ModelIndex.js"
import { calc_blood_composition } from "../helpers/BloodComposition.js"
import { calc_gas_composition } from "../helpers/GasComposition.js"

export class Ecls extends BaseModelClass {
  // static properties
  static model_type = "Ecls";
  static model_interface = [
    {
      caption: "ecls clamped",
      target: "tubing_clamped",
      type: "boolean"
    }
  ];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // independent properties
    this.ecls_running = true              // flag whether the ecls is running
    this.ecls_mode = "VA"                 // ecls mode (VA/VV)
    this.pres_atm = 760;                  // atmospheric pressure (mmHg)
    this.tubing_clamped = true;           // tubing clamped
    this.tubing_diameter = 0.25           // tubing diameter (inch)
    this.tubing_elastance = 11600         // tubing elastance (mmHg/L)
    this.tubing_in_length = 1.0           // tubing in length (m)
    this.tubing_out_length = 1.0          // tubing out length (m)
    this.drainage_cannula_diameter = 12   // drainage cannula diameter (Fr)
    this.drainage_cannula_length = 0.11   // drainage cannula length (m)
    this.return_cannula_diameter = 12     // return cannula diameter (Fr)
    this.return_cannula_length = 0.11     // return cannula length (m)
    this.pump_volume = 0.014              // volume of the pump (l)
    this.pump_resistance = 50;            // resistance of the pump (mmHg/l*s)
    this.pump_elastance = 15000;          // elastance of the pump (mmHg/L)
    this.oxy_volume = 0.031               // volume of the oxygenator (l)
    this.oxy_resistance = 50;             // resistance of the oxygenator (mmHg/l*s)
    this.oxy_elastance = 15000;           // elastance of the oxygenator (mmHg/L)
    this.oxy_dif_o2 = 0.001;              // oxygenator oxygen diffusion constant (mmol/mmHg)
    this.oxy_dif_co2 = 0.001;             // oxygenator carbon dioxide diffusion constant (mmol/mmHg)
    this.gas_flow = 0.5;                  // gas flowing through the gas part of the oxygenator (L/min)
    this.fio2_gas = 0.3;                  // fractional oxygen content of the oxygenator gas
    this.co2_gas_flow = 0.4;              // added carbon dioxide gas flow (L/min)
    this.temp_gas = 37.0;                 // temperature of the oxygenator gas (°C)
    this.humidity_gas = 0.5;              // humidity of the oxygenator gas (0-1)
    this.pump_rpm = 1500;                 // rotations of the centrifugal pump (rpm)
    this.pump_flow = 0.8                  // set pump flow on a roller pump (l/min)

    // dependent properties
    this.blood_flow = 0.0;                // ECLS blood flow (L/min)
    this.p_ven = 0.0;                     // pressure on the drainage side of the ECLS system (mmHg)
    this.p_int = 0.0;                     // pressure between the pump and oxygenator (mmHg)
    this.p_art = 0.0;                     // pressure after the oxygenator on the return side of the ECLS system (mmHg)
    this.pre_oxy_bloodgas = {};           // object holding the blood gas pre-oxygenator
    this.post_oxy_bloodgas = {};          // object holding the blood gas post-oxygenator
    this.drainage_resistance = 20;        // resistance of the drainage cannula (depending on length and diameter) mmHg/l*s
    this.return_resistance = 20;          // resistance of the return cannula (depending on length and diameter) mmHg/l*s
    this.tubin_resistance = 20;           // resistance of the tubing in (depending on length and diameter) mmHg/l*s
    this.tubout_resistance = 20;          // resistance of the tubing out (depending on length and diameter) mmHg/l*s

    // local properties - components
    this._drainage = null                 // reference to the drainage cannula (Resistor)
    this._tubing_in = null                // reference to the tubing in (BloodCapacitance)
    this._tubin_pump = null               // reference to the connector between tubing in and pump (Resistor)
    this._pump = null                     // reference to the blood pump (BloodPump)
    this._pump_oxy = null                 // reference to the connector between the pump and the oxygenator (Resistor)
    this._oxy = null                      // reference to the oxygenator (BloodCapacitance)
    this._oxy_tubout = null               // reference to the connector between the oxygenator and the tubing out (Resistor)
    this._tubing_out = null               // reference to the tubing out (BloodCapacitance)
    this._return = null                   // reference to the return cannula (Resistor)
    this._gasin = null                    // reference to the gas source (GasCapacitance)
    this._gasin_oxy = null                // reference to the connector between the gas source and the oxygenator (Resistor)
    this._gasoxy = null                   // reference to the oxygenator (GasCapacitance)
    this._gasoxy_out = null               // reference to the connector between the oxygenator and the outside gas compartment (Resistor)
    this._gasout = null                   // reference to the outside air compartment

    // local properties - others
    this._fico2_gas = 0.0004;             // fractional carbon dioxide content of the ECLS gas
    this._update_interval = 0.015;        // update interval of the model (s)
    this._update_counter = 0.0;           // update counter (s)
    this._bloodgas_interval = 1.0;        // interval at which the blood gases are calculated (s)
    this._bloodgas_counter = 0.0;         // counter of the blood gas interval (s)
  }

  init_model(args = {}) {
    // initialize the super class
    super.init_model(args);

    // store references to the components
    this._drainage = this._model_engine.models['ECLS_DRAINAGE']
    this._tubin = this._model_engine.models["ECLS_TUBIN"]
    this._tubin_pump = this._model_engine.models["ECLS_TUBIN_PUMP"]
    this._pump = this._model_engine.models["ECLS_PUMP"]
    this._pump_oxy = this._model_engine.models["ECLS_PUMP_OXY"]
    this._oxy = this._model_engine.models["ECLS_OXY"]
    this._oxy_tubout = this._model_engine.models["ECLS_OXY_TUBOUT"]
    this._tubout = this._model_engine.models["ECLS_TUBOUT"]
    this._return = this._model_engine.models["ECLS_RETURN"]

    this._gas_in = this._model_engine.models["ECLS_GASIN"]
    this._gasin_oxy = this._model_engine.models["ECLS_GASIN_OXY"]
    this._gasoxy = this._model_engine.models["ECLS_GASOXY"]
    this._gasoxy_gasout = this._model_engine.models["ECLS_OXY_GASOUT"]
    this._gasout = this._model_engine.models["ECLS_GASOUT"]
  }

  calc_model() {
    this._update_counter += this._t
    if (this._update_counter > this._update_interval) {
      this._update_counter = 0;

      // get the flow
      this.blood_flow = this._return.flow;
      
      // get the pressures
      this.p_ven = this._tubin.pres;
      this.p_int = this._pump.pres;
      this.p_art = this._tubout.pres;

      // calculate the bloodgas
      //this.calc_bloodgas()
    }

  }

  calc_bloodgas() {
    this._bloodgas_counter += this._t
    if (this._bloodgas_counter > this._bloodgas_interval) {
      this._bloodgas_interval = 0;

      // calc bloodgas pre oxygenator
      calc_blood_composition(this._tubin)
      this.pre_oxy_bloodgas = {
        'ph': this._tubin.ph,
        'pco2': this._tubin.pco2,
        'po2': this._tubin.po2,
        'hco3': this._tubin.hco3,
        'be': this._tubin.be,
        'so2': this._tubin.so2
      }

      // calc bloodgas post oxygenator
      calc_gas_composition(this._tubout)
      this.post_oxy_bloodgas = {
        'ph': this._tubout.ph,
        'pco2': this._tubout.pco2,
        'po2': this._tubout.po2,
        'hco3': this._tubout.hco3,
        'be': this._tubout.be,
        'so2': this._tubout.so2
      }
    }
  }

  _set_cannula_resistance() {
    // diameter in Fr and length in meters
    let _drainage_res = this._calc_tube_resistance(
      this.drainage_cannula_diameter * 0.00033,
      this.drainage_cannula_length);

    let _return_res = this._calc_tube_resistance(
        this.return_cannula_diameter * 0.00033,
        this.return_cannula_length);

    // set the resistances of the cannulas
    this._drainage.r_for = _drainage_res
    this._drainage.r_back = _drainage_res

    this._return.r_for = _return_res
    this._return.r_back = _return_res
  }
  _set_tubing_resistance() {
    // calculate the resistance of the tubing
    // diameter in inch and length in meters
    let _tubin_res = this._calc_tube_resistance(
      this.tubing_diameter * 0.0254,
      this.tubing_in_length);

    let _tubout_res = this._calc_tube_resistance(
        this.tubing_diameter * 0.0254,
        this.tubing_in_length);

    this._tubin_pump.r_for = _tubin_res
    this._tubin_pump.r_back = _tubin_res

    this._oxy_tubout.r_for = _tubout_res
    this._oxy_tubout.r_back = _tubout_res
  }
  
  _set_tubing_volume() {
    // diameter in inch and length in meters
    let _tubin_vol = this._calc_tube_volume(
      this.tubing_diameter * 0.0254,
      this.tubing_in_length);

    let _tubout_vol = this._calc_tube_volume(
        this.tubing_diameter * 0.0254,
        this.tubing_out_length);
    
    // set the volumes of the tubing
    this._tubin.vol = _tubin_vol
    this._tubin.u_vol = _tubin_vol
    this._tubin.el_base = this.tubing_elastance

    this._tubout.vol = _tubout_vol
    this._tubout.u_vol = _tubout_vol
    this._tubout.el_base = this.tubing_elastance
  }

  _set_pump_volume() {
    this._pump_head.vol = this.pump_head_volume
    this._pump_head.u_vol = this.pump_head_volume
  }

  _set_pump_resistance() {
    this._pump_head.vol = this.pump_head_volume
    this._pump_head.u_vol = this.pump_head_volume
  }

  _set_oxygenator_volume() {
    // oxygenator properties
    this._oxy.vol = this.oxy_volume
    this._oxy.u_vol = this.oxy_volume
  }
  _set_oxygenator_resistance() {

  }

  _set_gas_properties() {

  }

  _calc_tube_volume(diameter, length) {
    // return the volume in liters
    return Math.PI * Math.pow(0.5 * diameter, 2) * length * 1000.0;
  }

  _calc_tube_resistance(diameter, length, viscosity = 6.0) {
    // resistance is calculated using Poiseuille's Law : R = (8 * n * L) / (PI * r^4)
    // resistance is in mmHg * s / l
    // L = length in meters
    // r = radius in meters
    // n = viscosity in centiPoise

    // convert viscosity from centiPoise to Pa * s
    let n_pas = viscosity / 1000.0;

    // calculate radius in meters
    let radius_meters = diameter / 2;

    // calculate the resistance    Pa *  / m3
    let res = (8.0 * n_pas * length) / (Math.PI * Math.pow(radius_meters, 4));

    // convert resistance of Pa/m3 to mmHg/l
    res = res * 0.00000750062;
    return res;
  }
}
