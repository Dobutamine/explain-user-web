import { BaseModelClass } from "../base_models/BaseModelClass";
import { calc_blood_composition } from "./BloodComposition"
// ----------------------------------------------------------------------------
export class Fluids extends BaseModelClass {
  // static properties
  static model_type = "Fluids";
  static model_interface = [
    {
      caption: "add fluid",
      type: "function",
      target: "add_volume",
      args: [
        {
          caption: "volume (ml)",
          target: "default_volume",
          type: "number",
          factor: 1.0,
          delta: 0.1,
          rounding: 1
        }
      ]
    }
  ]

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.fluids = {
      "normal_saline": {
        to2: 0.0,
        tco2: 0.0,
        temp: 37.0,
        solutes: {
          na: 154,
          cl: 154
        }
      }
    }

    // initialize dependent properties
    
    // initialize local properties (preceded with _)
    this._default_volume = 10;
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
   add_volume(volume, in_time = 10, site = "VLB", fluid_in = "normal_saline") {
    // build fluid object
    let fluid = {
      vol: volume / 1000.0,
      time_left: in_time,
      delta: (volume / 1000.0) / (in_time / this._update_interval),
      site: site,
      to2 : this.fluids[fluid_in].to2,
      tco2 : this.fluids[fluid_in].tco2,
      solutes: {...this.fluids[fluid_in].solutes}
    }
    this._running_fluid_list.push(fluid)
  }

  process_fluid_list() {
    if (this._running_fluid_list.length > 0) {
      // remove the fluids which are done
      let filtered_list = this.removeByProperty(this._running_fluid_list, "time_left", 0.0)
      this._running_fluid_list = [...filtered_list]

      this._running_fluid_list.forEach(f => {
        if (f.time_left <= 0) {
          f.delta = 0.0;
          f.time_left = 0.0
          console.log('ready')
        }
        f.vol -= f.delta
        f.time_left -= this._update_interval
        this._model_engine.models[f.site].volume_in(f.delta, f)
      })
    }
  }
  removeByProperty(arr, propName, valueToRemove) {
    return arr.filter(item => item[propName] > valueToRemove);
  }

}
