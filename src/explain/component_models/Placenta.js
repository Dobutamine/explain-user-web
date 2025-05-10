

import { BaseModelClass } from "../base_models/BaseModelClass.js";


export class Placenta extends BaseModelClass {
  // static properties
  static model_type = "Placenta";
  static model_interface = [
    {
      caption: "switch placenta on/off",
      target: "switch_placenta",
      type: "function",
      args:[
        {
          caption: "state",
          target: "is_enabled",
          type: "boolean",
        },
      ]
    },
    {
      caption: "umbilical cord clamping",
      target: "clamp_umbilical_cord",
      type: "function",
      args:[
        {
          caption: "clamped",
          target: "umb_clamped",
          type: "boolean",
        },
      ]
    },
    {
      caption: "umbilical arteries diameter",
      target: "set_umb_art_diameter",
      type: "function",
      args:[
        {
          caption: "new diameter (mm)",
          target: "umb_art_diameter",
          type: "number",
          factor: 1000,
          delta: 0.1,
          rounding: 1,
        },
      ]
    },
    {
      caption: "umbilical arteries length",
      target: "set_umb_art_length",
      type: "function",
      args:[
        {
          caption: "new length (mm)",
          target: "umb_art_length",
          type: "number",
          factor: 1000,
          delta: 0.1,
          rounding: 1,
        },
      ]
    },
    {
      caption: "umbilical arteries resistance",
      target: "set_umb_art_resistance",
      type: "function",
      args:[
        {
          caption: "new resistance (mmHg/L*sec)",
          target: "umb_art_res",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 1,
        },
      ]
    },
    {
      caption: "umbilical vein diameter",
      target: "set_umb_ven_diameter",
      type: "function",
      args:[
        {
          caption: "new diameter (mm)",
          target: "umb_ven_diameter",
          type: "number",
          factor: 1000,
          delta: 0.1,
          rounding: 1,
        },
      ]
    },
    {
      caption: "umbilical vein length",
      target: "set_umb_ven_length",
      type: "function",
      args:[
        {
          caption: "new length (mm)",
          target: "umb_ven_length",
          type: "number",
          factor: 1000,
          delta: 0.1,
          rounding: 1,
        },
      ]
    },
    {
      caption: "umbilical vein resistance",
      target: "set_umb_ven_resistance",
      type: "function",
      args:[
        {
          caption: "new resistance (mmHg/L*sec)",
          target: "umb_ven_res",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 1,
        },
      ]
    },
    {
      caption: "fetal placenta volume (L)",
      target: "set_fetal_placenta_volume",
      type: "function",
      args:[
        {
          caption: "new volume (L)",
          target: "plf_u_vol",
          type: "number",
          factor: 1,
          delta: 0.001,
          rounding: 3,
        },
      ]
    },
    {
      caption: "fetal placenta elastance (L)",
      target: "set_fetal_placenta_elastance",
      type: "function",
      args:[
        {
          caption: "new elastance (mmHg/L)",
          target: "plf_el_base",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
        },
      ]
    },
    {
      caption: "maternal placenta volume (L)",
      target: "set_maternal_placenta_volume",
      type: "function",
      args:[
        {
          caption: "new volume (L)",
          target: "plm_u_vol",
          type: "number",
          factor: 1,
          delta: 0.001,
          rounding: 3,
        },
      ]
    },
    {
      caption: "maternal placenta elastance (L)",
      target: "set_maternal_placenta_elastance",
      type: "function",
      args:[
        {
          caption: "new elastance (mmHg/L)",
          target: "plm_el_base",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
        },
      ]
    },
    {
      caption: "maternal to2 (mmol/l)",
      target: "set_maternal_to2",
      type: "function",
      args:[
        {
          caption: "new to2 (mmol/l)",
          target: "mat_to2",
          type: "number",
          factor: 1,
          delta: 0.01,
          rounding: 2,
        },
      ]
    },
    {
      caption: "maternal tco2 (mmol/l)",
      target: "set_maternal_tco2",
      type: "function",
      args:[
        {
          caption: "new tco2 (mmol/l)",
          target: "mat_tco2",
          type: "number",
          factor: 1,
          delta: 0.01,
          rounding: 2,
        },
      ]
    },
    {
      caption: "o2 diffusion constant",
      target: "set_dif_o2",
      type: "function",
      args:[
        {
          caption: "new diff o2 (mmol/mmHg)",
          target: "dif_o2",
          type: "number",
          factor: 1,
          delta: 0.01,
          rounding: 2,
        },
      ]
    },
    {
      caption: "co2 diffusion constant",
      target: "set_dif_co2",
      type: "function",
      args:[
        {
          caption: "new diff co2 (mmol/mmHg)",
          target: "dif_co2",
          type: "number",
          factor: 1,
          delta: 0.01,
          rounding: 2,
        },
      ]
    },
    {
      caption: "set maternal solute concentration",
      target: "set_maternal_solute",
      type: "function",
      args:[
        {
          target: "solute_name",
          caption: "solute name",
          type: "list",
          custom_options: true,
          options: ["na", "k"]
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
        }
      ]
    },
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
    this.umb_art_vol = 0.0162; // volume of two umbilical arteries (l)
    this.umb_art_el_base = 20000.0; // elastance of the umbilical arteries (mmHg/L)
    this.umb_art_res = 7200; // resistance of the umbilical arter (mmHg*s/L)
    this.umb_ven_vol = 0.0319; // volume of the umbilical vein (l)
    this.umb_ven_el_base = 1000.0; // elastance of the umbilical vein (mmHg/L)
    this.umb_ven_res = 1000; // resistance of the umbilical vein (mmHg*s/L)
    this.umb_length = 0.55; // umbilical cord length (m)
    this.umb_art_diameter = 0.0043; // diameter of a single umbilical artery (m)
    this.umb_ven_diameter = 0.0086; // diameter of the umbilical vein (m)
    this.plf_res = 50.0; // resistance of the fetal placenta (mmHg*s/L)
    this.plf_vol = 0.427; // unstressed volume of the fetal placenta (L)
    this.plf_el_base = 25000.0; // elastance of the fetal placenta (mmHg/L)
    this.plm_vol = 0.5; // unstressed volume of the maternal placenta (L)
    this.plm_el_base = 5000.0; // elastance of the maternal placenta (mmHg/L)
    this.dif_o2 = 0.01; // diffusion constant of oxygen (mmol/mmHg)
    this.dif_co2 = 0.01; // diffusion constant of carbon dioxide (mmol/mmHg)
    this.mat_to2 = 6.85; // maternal total oxygen concentration (mmol/L)
    this.mat_tco2 = 23.0; // maternal total carbon dioxide concentration (mmol/L)
    this.umb_clamped = true; // flags whether the umbilical vessels are clamped or not

    // -----------------------------------------------
    // initialize dependent parameters
    this.umb_art_flow = 0.0; // flow in the umbilical artery (L/s)
    this.umb_art_velocity = 0.0; // velocity in the umbilical artery (m/s)
    this.umb_ven_flow = 0.0; // flow in the umbilical vein (L/s)
    this.umb_ven_velocity = 0.0; // velocity in the umbilical vein (m/s)
    this.mat_po2 = 0.0; // maternal placenta oxygen partial pressure (mmHg)
    this.mat_pco2 = 0.0; // maternal placenta carbon dioxide partial pressure (mmHg)

    // -----------------------------------------------
    // local parameters
    this._update_interval = 0.015; // update interval of the placenta model (s)
    this._update_counter = 0.0; // counter of the update interval (s)
  }
  init_model(args = {}) {
    super.init_model(args);

    // build the placenta model
    this.build_placenta();

    // switch the placenta state
    this.switch_placenta(this.placenta_running);
  }
  calc_model() {
      // get data
      this.umb_art_flow = this._model_engine.models["AD_UMB_ART"].flow * 60.0

    this._update_counter += this._t;
    if (this._update_counter > this._update_interval && this.placenta_running) {
      this._update_counter = 0.0;

      // update the resistances
      this._model_engine.models["AD_UMB_ART"].no_flow = this.umb_clamped
      this._model_engine.models["UMB_VEN_IVCI"].no_flow = this.umb_clamped

      this._model_engine.models["AD_UMB_ART"].r_for = this.umb_art_res;
      this._model_engine.models["AD_UMB_ART"].r_back = this.umb_art_res;

      this._model_engine.models["UMB_ART_PLF"].r_for = this.plf_res;
      this._model_engine.models["UMB_ART_PLF"].r_back = this.plf_res;

      this._model_engine.models["PLF_UMB_VEN"].r_for = this.umb_ven_res;
      this._model_engine.models["PLF_UMB_VEN"].r_back = this.umb_ven_res;

      // update the elastances
      this._model_engine.models["UMB_ART"].el_base = this.umb_art_el_base;
      this._model_engine.models["UMB_VEN"].el_base = this.umb_ven_el_base;
      this._model_engine.models["PLF"].el_base = this.plf_el_base;

      // update the unstressed volumes
      this._model_engine.models["UMB_ART"].u_vol = this.umb_art_vol;
      this._model_engine.models["UMB_VEN"].u_vol = this.umb_ven_vol;
      this._model_engine.models["PLF"].u_vol = this.plf_vol;


      // update the diffusion of oxygen and carbon dioxide
      this._model_engine.models["PL_GASEX"].dif_o2 = this.dif_o2;
      this._model_engine.models["PL_GASEX"].dif_co2 = this.dif_co2;

      // update the maternal to2 and tco2
      this._model_engine.models["PLM"].to2 = this.mat_to2;
      this._model_engine.models["PLM"].tco2 = this.mat_tco2;


      
    }
  }

  switch_placenta(state) {
    this.is_enabled = state
    this.placenta_running = state
    // umbilical arteries
    this._model_engine.models["AD_UMB_ART"].is_enabled = state
    this._model_engine.models["AD_UMB_ART"].no_flow = this.umb_clamped
    this._model_engine.models["UMB_ART"].is_enabled = state
    this._model_engine.models["UMB_ART_PLF"].is_enabled = state
    this._model_engine.models["UMB_ART_PLF"].no_flow  = !state
    // fetal and maternal part of the placenta
    this._model_engine.models["PLF"].is_enabled = state
    this._model_engine.models["PLF_UMB_VEN"].is_enabled = state
    this._model_engine.models["PLF_UMB_VEN"].no_flow = !state
    this._model_engine.models["PLM"].is_enabled = state
    this._model_engine.models["PL_GASEX"].is_enabled = state
    // umbilical vein
    this._model_engine.models["UMB_VEN"].is_enabled = state
    this._model_engine.models["UMB_VEN_IVCI"].is_enabled = state
    this._model_engine.models["UMB_VEN_IVCI"].no_flow = this.umb_clamped
  }

  build_placenta() {
    // resistor between descdending aorta and umbilical arteries
    this._model_engine.models["AD_UMB_ART"].no_flow = this.umb_clamped
    this._model_engine.models["AD_UMB_ART"].no_back_flow = false
    this._model_engine.models["AD_UMB_ART"].r_for = this.umb_art_res;
    this._model_engine.models["AD_UMB_ART"].r_back = this.umb_art_res;
    // bloodvessel model of the umbilical arteries
    this._model_engine.models["UMB_ART"].vol = this.umb_art_vol;
    this._model_engine.models["UMB_ART"].u_vol = this.umb_art_vol;
    this._model_engine.models["UMB_ART"].el_base = this.umb_art_el_base;
    // resistor between umbilical arteries and fetal placenta
    this._model_engine.models["UMB_ART_PLF"].no_flow = !this.placenta_running
    this._model_engine.models["UMB_ART_PLF"].no_back_flow = false
    this._model_engine.models["UMB_ART_PLF"].r_for = this.plf_res;
    this._model_engine.models["UMB_ART_PLF"].r_back = this.plf_res;
    // fetal placenta
    this._model_engine.models["PLF"].vol = this.plf_vol;
    this._model_engine.models["PLF"].u_vol = this.plf_vol;
    this._model_engine.models["PLF"].el_base = this.plf_el_base;
    this._model_engine.models["PL_GASEX"].dif_o2 = this.dif_o2;
    this._model_engine.models["PL_GASEX"].dif_co2 = this.dif_co2;
    // maternal placenta
    this._model_engine.models["PLM"].vol = this.plm_vol;
    this._model_engine.models["PLM"].u_vol = this.plm_vol;
    this._model_engine.models["PLM"].el_base = this.plm_el_base;
    // resistor between fetal placenta and umbilical vein
    this._model_engine.models["PLF_UMB_VEN"].no_flow = !this.placenta_running
    this._model_engine.models["PLF_UMB_VEN"].no_back_flow = false
    this._model_engine.models["PLF_UMB_VEN"].r_for = this.umb_ven_res;
    this._model_engine.models["PLF_UMB_VEN"].r_back = this.umb_ven_res;
    // bloodvessel model of the umbilical vein
    this._model_engine.models["UMB_VEN"].vol = this.umb_ven_vol;
    this._model_engine.models["UMB_VEN"].u_vol = this.umb_ven_vol;
    this._model_engine.models["UMB_VEN"].el_base = this.umb_ven_el_base;
    // resistor between umbilical vein and inferior vena cava
    this._model_engine.models["UMB_VEN_IVCI"].no_flow = this.umb_clamped
    this._model_engine.models["UMB_VEN_IVCI"].no_back_flow = false
    this._model_engine.models["UMB_VEN_IVCI"].r_for = 50;
    this._model_engine.models["UMB_VEN_IVCI"].r_back = 50;
  }
  clamp_umbilical_cord(state) {
    // determines whether or not the umbilical vessels are clamped by setting the no_flow property
    this.umb_clamped = state;
  }
  set_umbilical_arteries_resistance(new_res) {
    // reset the umbilical arteries resistance
    this.umb_art_res = new_res;
  }
  set_umbilical_vein_resistance(new_res) {
    // reset the umbilical vein resistance
    this.umb_ven_res = new_res;
  }
  set_fetal_placenta_resistance(new_res) {  
    // reset the fetal placenta resistance
    this.plf_res = new_res;
  }
  set_dif_o2(new_dif_o2) {
    this.dif_o2 = new_dif_o2;
  }
  set_dif_co2(new_dif_co2) {
    this.dif_co2 = new_dif_co2;
  }
  set_mat_to2(new_to2) {
    this.mat_to2 = new_to2;
  }
  set_mat_tco2(new_tco2) {
    this.mat_tco2 = new_tco2;
  }
}
