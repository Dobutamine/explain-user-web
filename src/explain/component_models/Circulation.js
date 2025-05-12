import { BaseModelClass } from "../base_models/BaseModelClass";

export class Circulation extends BaseModelClass {
  // static properties
  static model_type = "Circulation";
  static model_interface = []

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
    this.svcr_factor = 1.0;             // systemic capillary resistance factor
    this.pvcr_factor = 1.0;             // pulmonary capillary resistance factor
    
    this.save_factor = 1.0;             // systemic arterial elastance factor
    this.pave_factor = 1.0;             // pulmonary arterial elastance factor
    this.svve_factor = 1.0;             // systemic venous elastance factor
    this.pvve_factor = 1.0;             // pulmonary venous elastance factor
    this.svce_factor = 1.0;             // systemic capillary elastance factor
    this.pvce_factor = 1.0;             // pulmonary capillary elastance factor

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
    this._prev_svcr_factor = 1.0;       // previous systemic capillary resistance factor
    this._prev_pvcr_factor = 1.0;       // previous pulmonary capillary resistance factor
    this._prev_save_factor = 1.0;       // previous systemic arterial elastance factor
    this._prev_pave_factor = 1.0;       // previous pulmonary arterial elastance factor
    this._prev_svve_factor = 1.0;       // previous systemic venous elastance factor
    this._prev_pvve_factor = 1.0;       // previous pulmonary venous elastance factor
    this._prev_svce_factor = 1.0;       // previous systemic capillary elastance factor
    this._prev_pvce_factor = 1.0;       // previous pulmonary capillary elastance factor
  }

  calc_model() {
    this._update_counter += this._t;
    if (this._update_counter > this._update_interval) {
      this._update_counter = 0.0;
    }
  }
}
