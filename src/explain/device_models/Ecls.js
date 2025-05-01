import { BaseModelClass } from "../base_models/BaseModelClass.js";
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
    this.tubing_clamped = true;           // tubing clamped
    this.tubing_diameter = 0.25           // tubing diameter (inch)
    this.tubing_elastance = 11600         // tubing elastance (mmHg/L)
    this.tubing_in_length = 1.0           // tubing in length (m)
    this.tubing_out_length = 1.0          // tubing out length (m)
    this.drainage_cannula_diameter = 12   // drainage cannula diameter (Fr)
    this.drainage_cannula_length = 0.11   // drainage cannula length (m)
    this.return_cannula_diameter = 12     // return cannula diameter (Fr)
    this.return_cannula_length = 0.11     // return cannula length (m)
    this.pump_head_volume = 0.8           // volume of the pupm head (l)
    this.oxy_volume = 0.8                 // volume of the oxygenator (l)
    this.oxy_resistance = 100;            // resistance of the oxygenator (mmHg/l*s)
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

    // local properties
    this._fico2_gas = 0.0004;             // fractional carbon dioxide content of the ECLS gas
    this._update_interval = 0.015;        // update interval of the model (s)
    this._update_counter = 0.0;           // update counter (s)
    this._bloodgas_interval = 1.0;        // interval at which the blood gases are calculated (s)
    this._bloodgas_counter = 0.0;         // counter of the blood gas interval (s)
  }

  calc_model() {

  }
}
