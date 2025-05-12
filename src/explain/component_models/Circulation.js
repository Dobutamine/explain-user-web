import { BaseModelClass } from "../base_models/BaseModelClass";

/*
  The ANS—chiefly via sympathetic adrenergic fibers—regulates vasotone across the arterial–venous tree by tuning 
  smooth‐muscle contraction through α₁, α₂ and β₂ receptors, under the guidance of central vasomotor centers and reflexes 
  (baroreceptors, chemoreceptors). Parasympathetic/cholinergic control of vascular tone is limited to specialized beds 
*/

export class Circulation extends BaseModelClass {
  // static properties
  static model_type = "Circulation";
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
      caption : "systemic arteries",
      target : "systemic_arteries",
      type : "multiple-list",
      options : [
        "BloodVessel",
      ] 
    },
    {
      caption : "systemic arterioles",
      target : "systemic_arterioles",
      type : "multiple-list",
      options : [
        "BloodVessel",
      ] 
    },
    {
      caption : "systemic veins",
      target : "systemic_veins",
      type : "multiple-list",
      options : [
        "BloodVessel",
      ] 
    },
    {
      caption : "systemic venules",
      target : "systemic_venules",
      type : "multiple-list",
      options : [
        "BloodVessel",
      ] 
    },
    {
      caption : "systemic capillaries",
      target : "systemic_capillaries",
      type : "multiple-list",
      options : [
        "CapillaryBed",
      ] 
    },
    {
      caption : "pulmonary arteries",
      target : "pulmonary_arteries",
      type : "multiple-list",
      options : [
        "BloodVessel",
      ] 
    },
    {
      caption : "pulmonary arterioles",
      target : "pulmonary_arterioles",
      type : "multiple-list",
      options : [
        "BloodVessel",
      ] 
    },
    {
      caption : "pulmonary veins",
      target : "pulmonary_veins",
      type : "multiple-list",
      options : [
        "BloodVessel"
       ] 
    },
    {
       caption: "pulmonary venules", 
       target: "pulmonary_venules", 
       type: "multiple-list", 
       options: [ 
         "BloodVessel" 
       ]
     },
     {
       caption: "pulmonary capillaries", 
       target: "pulmonary_capillaries", 
       type: "multiple-list", 
       options: [ 
         "CapillaryBed" 
       ]
    },
    {
      caption: "syst art resistance factor",
      target: "savr_factor",
      type: "number",
      factor: 1.0,
      delta: 0.1,
      rounding: 1
    },
    {
      caption: "pulm art resistance factor",
      target: "pavr_factor",
      type: "number",
      factor: 1.0,
      delta: 0.1,
      rounding: 1
    },
    {
      caption: "syst ven resistance factor",
      target: "svvr_factor",
      type: "number",
      factor: 1.0,
      delta: 0.1,
      rounding: 1
    },
    {
      caption: "pulm ven resistance factor",
      target: "pvvr_factor",
      type: "number",
      factor: 1.0,
      delta: 0.1,
      rounding: 1
    },
    {
      caption: "syst cap resistance  factor",
      target: "scr_factor",
      type: "number",
      factor: 1.0,
      delta: 0.1,
      rounding: 1
    },
    {
      caption: "pulm cap resistance factor",
      target: "pcr_factor",
      type: "number",
      factor: 1.0,
      delta: 0.1,
      rounding: 1
    },
    {
      caption: "arterial elas-res coupling",
      target: "alpha_arteries",
      type: "number",
      factor: 1.0,
      delta: 0.01,
      rounding: 2
    },
    {
      caption: "arteriolar elas-res coupling",
      target: "alpha_arterioles",
      type: "number",
      factor: 1.0,
      delta: 0.01,
      rounding: 2
    },
    {
      caption: "venous elas-res coupling",
      target: "alpha_veins",
      type: "number",
      factor: 1.0,
      delta: 0.01,
      rounding: 2
    },
    {
      caption: "venular elas-res coupling",
      target: "alpha_venules",
      type: "number",
      factor: 1.0,
      delta: 0.01,
      rounding: 2
    },
    {
      caption: "capillary elas-res coupling",
      target: "alpha_capillaries",
      type: "number",
      factor: 1.0,
      delta: 0.01,
      rounding: 2
    },
    { caption: "ANS sensitivity arteries (0-1)",
      target: "ans_sens_arteries",
      type: "number",
      factor: 1.0,
      delta: 0.01,
      rounding: 2
    },
    {
      caption: "ANS sensitivity arterioles (0-1)",
      target: "ans_sens_arterioles",
      type: "number",
      factor: 1.0,
      delta: 0.01,
      rounding: 2
    },
    {
      caption: "ANS sensitivity veins (0-1)",
      target: "ans_sens_veins",
      type: "number",
      factor: 1.0,
      delta: 0.01,
      rounding: 2
    },
    {
      caption: "ANS sensitivity venules (0-1)",
      target: "ans_sens_venules",
      type: "number",
      factor: 1.0,
      delta: 0.01,
      rounding: 2
    },
    {
      caption: "ANS sensitivity capillaries (0-1)",
      target: "ans_sens_capillaries",
      type: "number",
      factor: 1.0,
      delta: 0.01,
      rounding: 2
    }
  ]

  /*
    The Circulation class is not a model but houses methods that influence groups of models. In case
    of the circulation class, these groups contain models related to blood circulation.
    */
  constructor(model_ref, name = "") {
    super(model_ref, name);

    // -----------------------------------------------
    // independent properties
    // -----------------------------------------------
    this.alpha_arteries = 0.5;          // elastance-resistance dependency alpha for arteries
    this.alpha_arterioles = 0.63;       // elastance-resistance dependency alpha for arterioles
    this.alpha_veins = 0.75;            // elastance-resistance dependency alpha for veins
    this.alpha_venules = 0.75;          // elastance-resistance dependency alpha for venules
    this.alpha_capillaries = 0.5;       // elastance-resistance dependency alpha for capillaries

    this.ans_res_factor = 1.0;          // adrenergic factor for ANS. Lumps activit of all adrenergic receptors together
    this.ans_sens_arteries = 0.5;       // autonomic nervous system sensitivity for arteries
    this.ans_sens_arterioles = 1.0;     // autonomic nervous system sensitivity for arterioles
    this.ans_sens_veins = 0.5;          // autonomic nervous system sensitivity for veins
    this.ans_sens_venules = 1.0;        // autonomic nervous system sensitivity for venules
    this.ans_sens_capillaries = 0.0;    // autonomic nervous system sensitivity for capillaries

    this.systemic_arteries = [];        // list of systemic arteries
    this.systemic_arterioles = [];      // list of systemic arterioles
    this.systemic_veins = [];           // list of systemic veins
    this.systemic_venules = [];         // list of systemic venules
    this.systemic_capillaries = [];     // list of systemic capillaries 

    this.pulmonary_arteries = [];       // list of pulmonary arteries
    this.pulmonary_arterioles = [];     // list of pulmonary arterioles
    this.pulmonary_veins = [];          // list of pulmonary veins 
    this.pulmonary_venules = [];        // list of pulmonary venules
    this.pulmonary_capillaries = [];    // list of pulmonary capillaries

    this.savr_factor = 1.0;             // systemic arterial vascular resistance factor
    this.pavr_factor = 1.0;             // pulmonary arterial vascular resistance factor
    this.svvr_factor = 1.0;             // systemic venous vascular resistance factor
    this.pvvr_factor = 1.0;             // pulmonary venous vascular resistance factor
    this.scr_factor = 1.0;              // systemic capillary resistance factor
    this.pcr_factor = 1.0;              // pulmonary capillary resistance factor

    this.save_factor = 1.0;             // systemic arterial elastance factor
    this.pave_factor = 1.0;             // pulmonary arterial elastance factor
    this.svve_factor = 1.0;             // systemic venous elastance factor
    this.pvve_factor = 1.0;             // pulmonary venous elastance factor
    this.sce_factor = 1.0;              // systemic capillary elastance factor
    this.pce_factor = 1.0;              // pulmonary capillary elastance factor

    // -----------------------------------------------
    // dependent properties
    // -----------------------------------------------
    // local properties
    this._update_interval = 0.015;      // update interval (s)
    this._update_counter = 0.0;         // update interval counter (s)

    this._prev_savr_factor = 1.0;       // previous systemic arterial vascular resistance factor
    this._prev_pavr_factor = 1.0;       // previous pulmonary arterial vascular resistance factor
    this._prev_svvr_factor = 1.0;       // previous systemic venous vascular resistance factor
    this._prev_pvvr_factor = 1.0;       // previous pulmonary venous vascular resistance factor
    this._prev_scr_factor = 1.0;        // previous systemic capillary resistance factor
    this._prev_pcr_factor = 1.0;        // previous pulmonary capillary resistance factor
    this._prev_save_factor = 1.0;       // previous systemic arterial elastance factor
    this._prev_pave_factor = 1.0;       // previous pulmonary arterial elastance factor
    this._prev_svve_factor = 1.0;       // previous systemic venous elastance factor
    this._prev_pvve_factor = 1.0;       // previous pulmonary venous elastance factor
    this._prev_svce_factor = 1.0;       // previous systemic capillary elastance factor
    this._prev_pvce_factor = 1.0;       // previous pulmonary capillary elastance factor
    this._prev_ans_res_factor = 1.0;    // previous adrenergic factor for ANS
    this._ans_res_update = false;       // flag to indicate if the ANS resistance update is needed
  }

  calc_model() {
    this._update_counter += this._t;
    if (this._update_counter > this._update_interval) {
      this._update_counter = 0.0;

      // ans control of the systemic and pulmonary circulation
      this.ans_control();

      // update systemic arterial vascular resistance
      if (this.savr_factor != this._prev_savr_factor || this._ans_res_update) {
        this.systemic_arterial_vascular_resistance();
        this._prev_savr_factor = this.savr_factor;
      }

      // update pulmonary arterial vascular resistance
      if (this.pavr_factor != this._prev_pavr_factor || this._ans_res_update) {
        this.pulmonary_arterial_vascular_resistance();
        this._prev_pavr_factor = this.pavr_factor;
      }

      // update systemic venous vascular resistance
      if (this.svvr_factor != this._prev_svvr_factor || this._ans_res_update) {
        this.systemic_venous_vascular_resistance();
        this._prev_svvr_factor = this.svvr_factor;
      }
      // update pulmonary venous vascular resistance
      if (this.pvvr_factor != this._prev_pvvr_factor || this._ans_res_update) {
        this.pulmonary_venous_vascular_resistance();
        this._prev_pvvr_factor = this.pvvr_factor;
      }

      // update systemic capillary resistance
      if (this.scr_factor != this._prev_scr_factor || this._ans_res_update) {
        this.systemic_capillary_vascular_resistance();
        this._prev_scr_factor = this.scr_factor;
      }

      // update pulmonary capillary resistance
      if (this.pcr_factor != this._prev_pcr_factor || this._ans_res_update) {
        this.pulmonary_capillary_vascular_resistance();
        this._prev_pcr_factor = this.pcr_factor;
      }
    }
  }

  ans_control() {
    // update the ANS resistance factor
    this._ans_res_update = false;
    if (this.ans_res_factor != this._prev_ans_res_factor) {
      this._ans_res_update = true;
      this._prev_ans_res_factor = this.ans_res_factor;
    }
  }

  systemic_arterial_vascular_resistance() {
    this.systemic_arteries.forEach((model) => {
      this._model_engine.models[model].ans_sens = this.ans_sens_arteries;
      this._model_engine.models[model].ans_factor = this.ans_res_factor;
      this._model_engine.models[model].alpha_arteries = this.alpha_arteries;
      this._model_engine.models[model].circ_factor = this.savr_factor;
    });

    this.systemic_arterioles.forEach((model) => {
        this._model_engine.models[model].ans_sens = this.ans_sens_arterioles;
        this._model_engine.models[model].ans_factor = this.ans_res_factor;
      this._model_engine.models[model].alpha_arterioles = this.alpha_arterioles;
      this._model_engine.models[model].circ_factor = this.savr_factor;
    });

  }

  systemic_venous_vascular_resistance() {
    this.systemic_veins.forEach((model) => {
        this._model_engine.models[model].ans_sens = this.ans_sens_veins
        this._model_engine.models[model].ans_factor = this.ans_res_factor;
        this._model_engine.models[model].alpha_veins = this.alpha_veins;
        this._model_engine.models[model].circ_factor = this.svvr_factor;
      });
    this.systemic_venules.forEach((model) => {
        this._model_engine.models[model].ans_sens = this.ans_sens_venules;
        this._model_engine.models[model].ans_factor = this.ans_res_factor;
        this._model_engine.models[model].alpha_venules = this.alpha_venules;
        this._model_engine.models[model].circ_factor = this.svvr_factor;
    });
  }

  systemic_capillary_vascular_resistance() {
    this.systemic_capillaries.forEach((model) => {
        this._model_engine.models[model].ans_sens = this.ans_sens_capillaries;
        this._model_engine.models[model].ans_factor = this.ans_res_factor;
        this._model_engine.models[model].alpha_capillaries = this.alpha_capillaries;
        this._model_engine.models[model].circ_factor = this.scr_factor;
    });
  }

  pulmonary_arterial_vascular_resistance() {
    this.pulmonary_arteries.forEach((model) => {
        this._model_engine.models[model].ans_sens = this.ans_sens_arteries;
        this._model_engine.models[model].ans_factor = this.ans_res_factor;
        this._model_engine.models[model].alpha_arteries = this.alpha_arteries;
        this._model_engine.models[model].circ_factor = this.pavr_factor;
      });
    this.pulmonary_arterioles.forEach((model) => {
         this._model_engine.models[model].ans_sens = this.ans_sens_arterioles;
         this._model_engine.models[model].ans_factor = this.ans_res_factor;
        this._model_engine.models[model].alpha_arterioles = this.alpha_arterioles;
        this._model_engine.models[model].circ_factor = this.pavr_factor;
    });
  }

  pulmonary_venous_vascular_resistance() {
    this.pulmonary_veins.forEach((model) => {
      this._model_engine.models[model].ans_sens = this.ans_sens_veins
      this._model_engine.models[model].ans_factor = this.ans_res_factor;
      this._model_engine.models[model].alpha_veins = this.alpha_veins;
      this._model_engine.models[model].circ_factor = this.pvvr_factor;
    });
    this.pulmonary_venules.forEach((model) => {
      this._model_engine.models[model].ans_sens = this.ans_sens_venules;
      this._model_engine.models[model].ans_factor = this.ans_res_factor;
      this._model_engine.models[model].alpha_venules = this.alpha_venules;
      this._model_engine.models[model].circ_factor = this.pvvr_factor;
    });
  }

  pulmonary_capillary_vascular_resistance() {
    this.pulmonary_capillaries.forEach((model) => {
      this._model_engine.models[model].ans_sens = this.ans_sens_capillaries;
      this._model_engine.models[model].ans_factor = this.ans_res_factor;
      this._model_engine.models[model].alpha_capillaries = this.alpha_capillaries;
      this._model_engine.models[model].circ_factor = this.pcr_factor;
    });
  }

}
