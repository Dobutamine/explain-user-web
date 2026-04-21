

import { BaseModelClass } from "../base_models/BaseModelClass.js";


export class Placenta extends BaseModelClass {
  // static properties
  static model_type = "Placenta";
  static model_interface = [
    {
      target: "description",
      type: "string",
      build_prop: true,
      edit_mode: "caption",
      readonly: true,
      caption: "description",
    },
    {
      target: "is_enabled",
      type: "boolean",
      build_prop: true,
      edit_mode: "all",
      readonly: false,
      caption: "enabled",
    },
    {
      target: "placenta_running",
      type: "boolean",
      build_prop: true,
      edit_mode: "caption",
      readonly: false,
      caption: "placenta model running",
    },
    {
      target: "umb_clamped",
      type: "boolean",
      build_prop: true,
      edit_mode: "caption",
      readonly: false,
      caption: "umbilical vessels clamped",
    },
    {
      caption: "umb artery resistance factor",
      target: "umb_art_res_factor",
      type: "factor",
      delta: 0.01,
      rounding: 2,
      ll: 0.0,
      ul: 100
    },
    {
      caption: "umb vein resistance factor",
      target: "umb_ven_res_factor",
      type: "factor",
      delta: 0.01,
      rounding: 2,
      ll: 0.0,
      ul: 100
    },
    {
      caption: "fetal placenta resistance factor",
      target: "plf_res_factor",
      type: "factor",
      delta: 0.01,
      rounding: 2,
      ll: 0.0,
      ul: 10
    },
    {
      target: "umb_art_res",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "umb artery resistance (mmHg*s/L)",
      factor: 1,
      delta: 1,
      rounding: 0,
      ll:100,
      ul:100000
    },
    {
      target: "umb_ven_res",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "umb vein resistance (mmHg*s/L)",
      factor: 1,
      delta: 1,
      rounding: 0,
      ll:100,
      ul:100000
    },
    {
      target: "plf_res",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "fetal plac resistance (mmHg*s/L)",
      factor: 1,
      delta: 1,
      rounding: 0,
      ll:100,
      ul:100000
    },
    {
      caption: "o2 diffusion constant",
      target: "dif_o2",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      factor: 1.0,
      delta: 0.0001,
      rounding: 4,
      ll:0.0,
      ul:0.1
    },
    {
      caption: "co2 dioxide diffusion constant",
      target: "dif_co2",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      factor: 1.0,
      delta: 0.0001,
      rounding: 4,
      ll:0.0,
      ul:0.1
    },
    {
      target: "mat_to2",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "mat plac o2 content (mmol/L)",
      factor: 1,
      delta: 1,
      rounding: 0,
      ll:0.0,
      ul:10.0
    },
    {
      target: "mat_tco2",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "mat plac co2 content (mmol/L)",
      factor: 1,
      delta: 1,
      rounding: 0,
      ll:20.0,
      ul:30.0
    }
  ];

  /*
    The Placenta class models the placental circulation and gas exchange using core models of the Explain model.
    The umbilical arteries and veins are modeled by BloodResistors connected to the descending aorta (DA) and
    inferior vena cava (IVCI). The fetal (PLF) and maternal placenta (PLM) are modeled by two BloodCapacitances.
    A BloodDiffusor model instance takes care of the GasExchange between the PLF and PLM.
    */

  constructor(model_ref, name = "") {
    // initialize the base model class setting all the general properties of the model which all models have in common
    
    // Average umbilical cord length at term          : – 55 cm
    // Mean luminal CSA per artery at 37–39 weeks     : – 0.147 cm² (overall mean across 300 normal pregnancies) DOI: http://dx.doi.org/10.18203/2320-1770.ijrcog20183851
    // Mean volume of umbilical artery                : 55 * 0.147 = 8.1 cm3 = 8.1 ml per artery => 16.2 ml for two arteries
    // Mean luminal CSA umbilical vein at 37-39 weeks : - 0.58 cm2
    // Mean volume of umbilical vein                  : 55 * 0.58 = 31.9 cm3 = 31.9 ml  Spurway J, Logan P, Pak S. The development, structure and blood flow within the umbilical cord with particular reference to the venous system. Australas J Ultrasound Med. 2012 Aug;15(3):97-102. doi: 10.1002/j.2205-0140.2012.tb00013.x. Epub 2015 Dec 31. PMID: 28191152; PMCID: PMC5025097.
    // Mean volume of fetal part of placenta          : 427 ml DOI: 10.7863/jum.2008.27.11.1583

    super(model_ref, name);
    // -----------------------------------------------
    // initialize independent parameters
    this.placenta_running = false
    this.umb_clamped = true; // flags whether the umbilical vessels are clamped or not
    this.umb_art_res = 800; // resistance of the umbilical arteries (mmHg*s/L)
    this.umb_art_res_factor = 1.0; // factor for the resistance of the umbilical arteries
    this.umb_ven_res = 100; // resistance of the umbilical vein (mmHg*s/L)
    this.umb_ven_res_factor = 1.0; // factor for the resistance of the umbilical vein
    this.plf_res = 2000; // resistance of the fetal placenta (mmHg*s/L)
    this.plf_res_factor = 1.0; // factor for the resistance of the fetal placenta
    this.mat_to2 = 6.85; // maternal placenta oxygen partial pressure (mmHg)
    this.mat_tco2 = 23; // maternal placenta carbon dioxide partial pressure (mmHg)
    this.dif_o2 = 0.0005; // diffusion constant for oxygen (mmol/mmHg * s)
    this.dif_co2 = 0.001; // diffusion constant for carbon dioxide (mmol/mmHg * s)


    // -----------------------------------------------
    // initialize dependent parameters
    this.umb_art_flow = 0.0; // flow in the umbilical artery (L/s)
    this.umb_art_velocity = 0.0; // velocity in the umbilical artery (m/s)
    this.umb_ven_flow = 0.0; // flow in the umbilical vein (L/s)
    this.umb_ven_velocity = 0.0; // velocity in the umbilical vein (m/s)

    // -----------------------------------------------
    // local parameters
    this._update_interval = 0.015; // update interval of the placenta model (s)
    this._update_counter = 0.0; // counter of the update interval (s)
    this._umb_art = null; // reference to the umbilical artery model instance
    this._umb_ven = null; // reference to the umbilical vein model instance
    this._plf = null; // reference to the fetal placenta model instance
    this._plm = null; // reference to the maternal placenta model instance
    this._gas_exchanger = null; // reference to the gas exchanger model instance
  }

  calc_model() {
    this._update_counter += this._t;
    if (this._update_counter > this._update_interval && this.placenta_running) {
      this._update_counter = 0.0;

      // get a reference to the associated models
      this._umb_art = this._model_engine.models["PL_UMB_ART"];
      this._umb_ven = this._model_engine.models["PL_UMB_VEN"];
      this._plf = this._model_engine.models["PL_FETAL"];
      this._plm = this._model_engine.models["PL_MAT"];
      this._gas_exchanger = this._model_engine.models["PL_GASEX"];

      // make sure all the associated models are in the same enabled/disabled state as the placenta model
      this._umb_art.is_enabled = this.placenta_running;
      this._umb_ven.is_enabled = this.placenta_running;
      this._plf.is_enabled = this.placenta_running;
      this._plm.is_enabled = this.placenta_running;
      this._gas_exchanger.is_enabled = this.placenta_running;

      // clamp umbilical vessels if set to clamped
      this._umb_art.no_flow = this.umb_clamped;
      this._umb_ven.no_flow = this.umb_clamped;
      this._plf.no_flow = this.umb_clamped;

      // set the resistances of the associated models
      this._umb_art.r_for = this.umb_art_res * this.umb_art_res_factor;
      this._umb_art.r_back = this.umb_art_res * this.umb_art_res_factor;
      this._umb_ven.r_for = this.umb_ven_res * this.umb_ven_res_factor;
      this._umb_ven.r_back = this.umb_ven_res * this.umb_ven_res_factor;
      this._plf.r_for = this.plf_res * this.plf_res_factor;
      this._plf.r_back = this.plf_res * this.plf_res_factor;

      // set the maternal placenta oxygen and carbon dioxide partial pressures in the gas exchanger
      this._plm.to2 = this.mat_to2;
      this._plm.tco2 = this.mat_tco2;

      // set the diffusion constants in the gas exchanger
      this._gas_exchanger.dif_o2 = this.dif_o2;
      this._gas_exchanger.dif_co2 = this.dif_co2;
    }
  }


}
