import { BaseModelClass } from "./BaseModelClass";
import { calc_gas_composition } from "../component_models/GasComposition"

export class GasDiffusor extends BaseModelClass {
  // static properties
  static model_type = "GasDiffusor";
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
      caption: "oxygen diffusion constant",
      target: "dif_o2",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      factor: 1.0,
      delta: 0.001,
      rounding: 3,
    },
    {
      caption: "carbon dioxide diffusion constant",
      target: "dif_co2",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      factor: 1.0,
      delta: 0.001,
      rounding: 3,
    },
    {
      caption: "nitric oxide diffusion constant",
      target: "dif_n2",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      factor: 1.0,
      delta: 0.001,
      rounding: 3,
    },
    {
      caption: "other gasses diffusion constant",
      target: "dif_other",
      type: "number",
      build_prop: true,
      edit_mode: "basic",
      factor: 1.0,
      delta: 0.001,
      rounding: 3,
    },
    {
      caption: "gas component 1",
      target: "comp_gas1",
      build_prop: true,
      edit_mode: "basic",
      type: "list",
      options: [
        "GasCapacitance",
      ]
    },
    {
      caption: "gas component 2",
      target: "comp_gas2",
      type: "list",
      build_prop: true,
      edit_mode: "basic",
      options: [
        "GasCapacitance"
      ]
    },
    {
      caption: "oxygen diffusion factor",
      target: "dif_o2_factor_ps",
      type: "factor"
    },
    {
      caption: "carbon dioxide diffusion factor",
      target: "dif_co2_factor_ps",
      type: "factor"
    },
    {
      caption: "nitric oxide diffusion factor",
      target: "dif_n2_factor_ps",
      type: "factor"
    },
    {
      caption: "other gasses diffusion factor",
      target: "dif_other_factor_ps",
      type: "factor"
    }
  ];

  constructor(model_ref, name = "") {
    // call the parent constructor
    super(model_ref, name);

    // initialize independent properties
    this.comp_gas1 = ""; // name of the first gas-containing model
    this.comp_gas2 = ""; // name of the second gas-containing model
    this.dif_o2 = 0.01; // diffusion constant for o2 (mmol/mmHg * s)
    this.dif_co2 = 0.01; // diffusion constant for co2 (mmol/mmHg * s)
    this.dif_n2 = 0.01; // diffusion constant for n2 (mmol/mmHg * s)
    this.dif_other = 0.01; // diffusion constant for n2 (mmol/mmHg * s)

    // non-persistent property factors. These factors reset to 1.0 after each model step
    this.dif_o2_factor = 1.0; // non-persistent diffusion factor for o2 (unitless)
    this.dif_co2_factor = 1.0; // non-persistent diffusion factor for co2 (unitless)
    this.dif_n2_factor = 1.0; // non-persistent diffusion factor for n2 (unitless)
    this.dif_other_factor = 1.0; // non-persistent diffusion factor for other gasses (unitless)

    // persistent property factors. These factors are persistent and do not reset
    this.dif_o2_factor_ps = 1.0; // persistent diffusion factor for o2 (unitless)
    this.dif_co2_factor_ps = 1.0; // persistent diffusion factor for co2 (unitless)
    this.dif_n2_factor_ps = 1.0; // persistent diffusion factor for n2 (unitless)

    // local variables
    this._comp_gas1 = null; // reference to the first gas-containing model
    this._comp_gas2 = null; // reference to the second gas-containing model
  }

  calc_model() {
    // find the two gas-containing models and store references
    this._comp_gas1 = this._model_engine.models[this.comp_gas1];
    this._comp_gas2 = this._model_engine.models[this.comp_gas2];

    // calculate the gas composition of the gas components in this diffusor as we need the partial pressures for the gas diffusion
    calc_gas_composition(this._comp_gas1);
    calc_gas_composition(this._comp_gas2);

    // incorporate the factors
    const _dif_o2 = this.dif_o2 
        + (this.dif_o2_factor - 1) * this.dif_o2
        + (this.dif_o2_factor_ps - 1) * this.dif_o2;

    const _dif_co2 = this.dif_co2
        + (this.dif_co2_factor - 1) * this.dif_co2
        + (this.dif_co2_factor_ps - 1) * this.dif_co2;

    const _dif_n2 = this.dif_n2
        + (this.dif_n2_factor - 1) * this.dif_n2
        + (this.dif_n2_factor_ps - 1) * this.dif_n2;
    
    const _dif_other = this.dif_other
        + (this.dif_other_factor - 1) * this.dif_other
        + (this.dif_other_factor_ps - 1) * this.dif_other;

    // diffuse the gases, where diffusion is partial pressure-driven
    let do2 = (this._comp_gas1.po2 - this._comp_gas2.po2) * _dif_o2 * this._t;

    // update the concentrations
    this._comp_gas1.co2 = (this._comp_gas1.co2 * this._comp_gas1.vol - do2) / this._comp_gas1.vol;
    this._comp_gas2.co2 = (this._comp_gas2.co2 * this._comp_gas2.vol + do2) / this._comp_gas2.vol;

    let dco2 = (this._comp_gas1.pco2 - this._comp_gas2.pco2) * _dif_co2 * this._t;
    // update the concentrations
    this._comp_gas1.cco2 = (this._comp_gas1.cco2 * this._comp_gas1.vol - dco2) / this._comp_gas1.vol;
    this._comp_gas2.cco2 = (this._comp_gas2.cco2 * this._comp_gas2.vol + dco2) / this._comp_gas2.vol;

    let dn2 = (this._comp_gas1.pn2 - this._comp_gas2.pn2) * _dif_n2 * this._t;
    // update the concentrations
    this._comp_gas1.cn2 = (this._comp_gas1.cn2 * this._comp_gas1.vol - dn2) / this._comp_gas1.vol;
    this._comp_gas2.cn2 = (this._comp_gas2.cn2 * this._comp_gas2.vol + dn2) / this._comp_gas2.vol;

    let dother = (this._comp_gas1.pother - this._comp_gas2.pother) * _dif_other * this._t;
    // update the concentrations
    this._comp_gas1.cother = (this._comp_gas1.cother * this._comp_gas1.vol - dother) / this._comp_gas1.vol;
    this._comp_gas2.cother = (this._comp_gas2.cother * this._comp_gas2.vol + dother) / this._comp_gas2.vol;

    // reset the non-persistent factors
    this.dif_o2_factor = 1.0;
    this.dif_co2_factor = 1.0;
    this.dif_n2_factor = 1.0;
    this.dif_other_factor = 1.0;

  }
}
