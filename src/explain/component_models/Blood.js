import { BaseModelClass } from "../base_models/BaseModelClass";
import { calc_blood_composition } from "../base_models/BloodComposition"
// ----------------------------------------------------------------------------
export class Blood extends BaseModelClass {
  // static properties
  static model_type = "Blood";
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
      caption: "set temperature (C)",
      target: "set_temperature",
      type: "function",
      args:[
        {
          caption: "new temperature",
          target: "temp",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 45.0,
          ll: 25.0,
        }
      ]
    },
    {
      caption: "set viscosity (cP)",
      target: "set_viscosity",
      type: "function",
      args:[
        {
          caption: "new new viscosity",
          target: "viscosity",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 12,
          ll: 0.1,
        }
      ]
    },
    {
      caption: "set total oxygen concentration (mmol/l)",
      target: "set_to2",
      type: "function",
      args:[
        {
          caption: "new total oxygen concentration",
          target: "to2",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 20.0,
          ll: 0.0,
        },
        {
          target: "site",
          caption: "change in site",
          type: "list",
          options: ["BloodCapacitance", "BloodTimeVaryingElastance", "BloodVessel", "HeartChamber", "CapillaryBed", "CoronaryVessel", "BloodPump"],
        },
      ]
    },  
    {
      caption: "set total carbon dioxide concentration (mmol/l)",
      target: "set_tco2",
      type: "function",
      args:[
        {
          caption: "new total carbon dioxide concentration",
          target: "tco2",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 20.0,
          ll: 0.0,
        },
        {
          target: "site",
          caption: "change in site",
          type: "list",
          options: ["BloodCapacitance", "BloodTimeVaryingElastance", "BloodVessel", "HeartChamber", "CapillaryBed", "CoronaryVessel", "BloodPump"],
        },
      ]
    },
    {
      caption: "set solute concentration",
      target: "set_solute",
      type: "function",
      args:[
        {
          target: "solute_name",
          caption: "solute name",
          type: "list",
          custom_options: true,
          choices: ["na", "k", "ca", "cl", "lact", "mg", "albumin", "phosphates", "uma", "hemoglobin"],
        },
        {
          target: "solute_value",
          caption: "solute value",
          type: "number",
          default: 0.0,
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 1000.0,
          ll: 0.0,
        },
        {
          target: "site",
          caption: "change in site",
          type: "list",
          options: ["BloodCapacitance", "BloodTimeVaryingElastance", "BloodVessel", "HeartChamber", "CapillaryBed", "CoronaryVessel", "BloodPump"],
        },
      ]
    },
  ];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // -----------------------------------------------------------------------------
    // Constants
    // -----------------------------------------------------------------------------
    this.gas_constant = 62.36367; // L·mmHg/(K·mol)
    this.kw = 2.5119e-11; // water dissociation constant
    this.kc = 7.94328235e-4; // carbonic acid dissociation constant
    this.kd = 6.0255959e-8; // bicarbonate dissociation constant
    this.alpha_co2p = 0.03067; // CO2 solubility coefficient
    this.left_hp_wide = 5.848931925e-6; // lower bound for H⁺ concentration
    this.right_hp_wide = 3.16227766017e-4; // upper bound for H⁺ concentration
    this.delta_ph_limits = 0.1; // delta for pH limits
    this.n = 2.7; // Hill coefficient
    this.alpha_o2 = 1.38e-5; // O2 solubility coefficient
    this.left_o2_wide = 0; // lower bound for pO2
    this.right_o2_wide = 800.0; // upper bound for pO2
    this.delta_o2_limits = 10.0; // delta for pO2 limits
    this.brent_accuracy = 1e-8;
    this.max_iterations = 100;

    // initialize independent properties
    this.viscosity = 6.0; // blood viscosity (centiPoise = Pa * s)
    this.temp = 37.0; // temperature (dgs C)
    this.to2 = 0.0; // total oxygen concentration (mmol/l)
    this.tco2 = 0.0; // total carbon dioxide concentration (mmol/l)
    this.solutes = {}; // dictionary holding the initial circulating solutes
    this.P50_0 = 20.0; // PO2 at which 50% of Hgb is saturated by O2 (fetal = 18.8 (high Hb O2 affinity), neonatal = 20.0, adult = 26.7)

    // initialize dependent properties
    this.preductal_art_bloodgas = {}; // dictionary containing the preductal arterial bloodgas
    this.art_bloodgas = {}; // dictionary containing the (postductal) arterial bloodgas
    this.ven_bloodgas = {}; // dictionary containing the venous bloodgas
    this.art_solutes = {}; // dictionary containing the arterial solute concentrations
    

    // initialize local properties (preceded with _)
    this._blood_containing_modeltypes = [
      "BloodCapacitance",
      "BloodTimeVaryingElastance",
      "BloodVessel",
      "HeartChamber",
      "CapillaryBed",
      "CoronaryVessel",
      "BloodPump",
      "Capillaries",
      "CapillaryNetwork",
      "Arteriole",
      "Venule",
      "Artery",
      "Vein",
    ];
    this._update_interval = 1.0; // interval at which the calculations are done
    this._update_counter = 0.0; // update counter intermediate
    this._ascending_aorta = null; // reference to ascending aorta model
    this._descending_aorta = null; // reference to descending aorta model
    this._right_atrium = null; // reference to right atrium
    this._P50 = 0;
    this._log10_p50 = 0;
    this._P50_n = 0;
    this._left_o2 = 0; // lower bound for pO2
    this._right_o2 = 800.0; // upper bound for pO2
    this._left_hp = 5.848931925e-6; // lower bound for H⁺ concentration
    this._right_hp = 3.16227766017e-4; // upper bound for H⁺ concentration

    // initialize local state variables
    this._tco2 =0;
    this._to2 = 0;
    this._sid = 0;
    this._albumin = 0;
    this._phosphates = 0;
    this._uma = 0;
    this._hemoglobin = 0;
    this._temp = 0;
    this._dpg = 0;
    this._ph = 0;
    this._pco2 = 0;
    this._hco3 = 0;
    this._be = 0;
    this._po2 = 0;
    this._so2 = 0;
    this._prev_po2 = 0;
    this._prev_ph = 0;
    this._error = false;
    this._iterations = 0;
    this._error_ab = false;
    this._error_oxy = false;
    this._iterations_ab = 0;
    this._iterations_oxy = 0;
  }

  async init_model(args = {}) {
    // set the values of the independent properties
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // set the solutes and temperature of the blood containing components
    Object.values(this._model_engine.models).forEach((model) => {
      if (this._blood_containing_modeltypes.includes(model.model_type)) {
        if (model.to2 == 0.0 && model.tco2 == 0.0) {
          //console.log('Setting blood parameters on: ', model.name)
          model.to2 = this.to2;
          model.tco2 = this.tco2;
          model.solutes = { ...this.solutes };
          model.temp = this.temp;
          model.viscosity = this.viscosity;
        }
      }
    });

    // get the components where we measure the bloodgases
    this._ascending_aorta = this._model_engine.models["AA"];
    this._descending_aorta = this._model_engine.models["AD"];
    this._right_atrium = this._model_engine.models["RA"];

    // copy the initial arterial solutes
    this.art_solutes = { ...this.solutes };

    // flag that the model is initialized
    this._is_initialized = true;
  }

  calc_model() {
    this._update_counter += this._t;
    if (this._update_counter >= this._update_interval) {
      this._update_counter = 0.0;

      // preductal arterial bloodgas
      calc_blood_composition(this._ascending_aorta);
      this.preductal_art_bloodgas = {
        ph: this._ascending_aorta.ph,
        pco2: this._ascending_aorta.pco2,
        po2: this._ascending_aorta.po2,
        hco3: this._ascending_aorta.hco3,
        be: this._ascending_aorta.be,
        so2: this._ascending_aorta.so2,
      };

      // postductal arterial bloodgas
      calc_blood_composition(this._descending_aorta);
      this.art_bloodgas = {
        ph: this._descending_aorta.ph,
        pco2: this._descending_aorta.pco2,
        po2: this._descending_aorta.po2,
        hco3: this._descending_aorta.hco3,
        be: this._descending_aorta.be,
        so2: this._descending_aorta.so2,
      };

      // venous bloodgas
      calc_blood_composition(this._right_atrium);
      this.ven_bloodgas = {
        ph: this._right_atrium.ph,
        pco2: this._right_atrium.pco2,
        po2: this._right_atrium.po2,
        hco3: this._right_atrium.hco3,
        be: this._right_atrium.be,
        so2: this._right_atrium.so2,
      };

      // arterial solute concentrations
      this.art_solutes = { ...this._descending_aorta.solutes };
    }
  }

  set_temperature(new_temp) {
    this.temp = new_temp;
    Object.values(this._model_engine.models).forEach((model) => {
      if (this._blood_containing_modeltypes.includes(model.model_type)) {
        model.temp = new_temp;
      }
    });
  }

  set_viscosity(new_viscosity) {
    this.viscosity = new_viscosity;
    Object.values(this._model_engine.models).forEach((model) => {
      if (this._blood_containing_modeltypes.includes(model.model_type)) {
        model.viscosity = new_viscosity;
      }
    });
  }

  set_to2(new_to2, bc_site = "") {
    if (bc_site) {
      this._model_engine.models[bc_site].to2 = new_to2;
    } else {
      Object.values(this._model_engine.models).forEach((model) => {
        if (this._blood_containing_modeltypes.includes(model.model_type)) {
          model.to2 = new_to2;
        }
      });
    }
  }

  set_tco2(new_tco2, bc_site = "") {
    if (bc_site) {
      this._model_engine.models[bc_site].tco2 = new_tco2;
    } else {
      Object.values(this._model_engine.models).forEach((model) => {
        if (this._blood_containing_modeltypes.includes(model.model_type)) {
          model.tco2 = new_tco2;
        }
      });
    }
  }

  set_solute(solute, solute_value, bc_site = "") {
    if (bc_site) {
      this._model_engine.models[bc_site].solutes[solute] = solute_value;
    } else {
      Object.values(this._model_engine.models).forEach((model) => {
        if (this._blood_containing_modeltypes.includes(model.model_type)) {
          model.solutes = { ...this.solutes };
        }
      });
    }
  }

}
