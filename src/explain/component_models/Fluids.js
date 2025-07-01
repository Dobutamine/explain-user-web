import { BaseModelClass } from "../base_models/BaseModelClass";
// ----------------------------------------------------------------------------
export class Fluids extends BaseModelClass {
  // static properties
  static model_type = "Fluids";
  static model_interface = [
    {    
      target: "model_type",  
      type: "string",
      build_prop: false,
      edit_mode: "basic",
      readonly: true,
      caption: "model type",
    },
    {
      target: "description",
      type: "string",
      build_prop: true,
      edit_mode: "basic",
      readonly: true,
      caption: "description",
    },
    {
      target: "is_enabled",
      type: "boolean",
      build_prop: true,
      edit_mode: "basic",
      readonly: false,
      caption: "enabled",
    },
    {
      caption: "Adminster fluid",
      type: "function",
      target: "add_volume",
      args: [
        {
          caption: "volume (ml)",
          target: "",
          type: "number",
          factor: 1.0,
          delta: 0.1,
          rounding: 1
        },
        {
          caption: "in time (s)",
          target: "_default_time",
          type: "number",
          factor: 1.0,
          delta: 0.1,
          rounding: 1
        },
        {
          caption: "fluid type",
          target: "fluid type",
          type: "list",
          default: "normal_saline",
          choices: ['normal_saline', 'ringers_lactate','packed_cells', 'albumin_20%']
        },

      ]
    }
  ]

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.fluids_temp = 37.0
    this.fluids = {}
    this.default_volume = 10;

    // initialize dependent properties
    
    // initialize local properties (preceded with _)
    this._default_time = 10;
    this._default_type = "normal_saline"
    this._running_fluid_list = []
    this._update_interval = 0.015;      // update interval (s)
    this._update_counter = 0.0;         // update interval counter (s)
  }
  
  init_model(args = {}) {
    super.init_model(args)
  }

  calc_model() {
    this._update_counter += this._t
    if (this._update_counter > this._update_interval) {
        this._update_counter = 0;
        this.process_fluid_list();
    }
  }

   add_volume(volume, in_time = 10, fluid_in = "normal_saline", site = "VLB") {
    // build a fluid object which can be fed to a BloodVessel, BloodCapacitance or BloodTimeVaryingElastance
    let fluid = {
      vol: volume / 1000.0,
      time_left: in_time,
      delta: (volume / 1000.0) / (in_time / this._update_interval),
      site: site,
      to2 : 0.0,
      tco2 : 0.0,
      temp: this.fluids_temp,
      viscosity: 1,
      solutes: {...this.fluids[fluid_in]},
      drugs: {}
    }
    this._running_fluid_list.push(fluid)
  }

  process_fluid_list() {
    if (this._running_fluid_list.length > 0) {
      // remove the fluids which are done
      let filtered_list = this.removeByProperty(this._running_fluid_list, "time_left", 0.0)
      this._running_fluid_list = [...filtered_list]

      this._running_fluid_list.forEach(f => {
        f.vol -= f.delta
        f.time_left -= this._update_interval
        if (f.time_left <= 0) {
          f.delta = 0.0;
          f.time_left = 0.0
        }

        this._model_engine.models[f.site].volume_in(f.delta, f)
      })
    }
  }
  removeByProperty(arr, propName, valueToRemove) {
    return arr.filter(item => item[propName] > valueToRemove);
  }

}
