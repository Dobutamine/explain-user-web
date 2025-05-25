import { TimeVaryingElastance } from "../base_models/TimeVaryingElastance";

// This class represents a blood time-varying elastance model, which is a subclass of the TimeVaryingElastance class.
// This class adds functionality to handle blood-specific properties such as temperature, viscosity, solute and drug concentrations.
export class BloodTimeVaryingElastance extends TimeVaryingElastance {
  // static properties
  static model_type = "BloodTimeVaryingElastance";
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
      caption: "unstressed volume (L)",
      target: "u_vol",
      type: "number",
      factor: 1.0,
      delta: 0.001,
      rounding: 3,
    },
    {
      caption: "elastance minimum (mmHg/L)",
      target: "el_min",
      type: "number",
      factor: 1,
      delta: 1,
      rounding: 0,
    },
    {
      caption: "elastance maximum (mmHg/L)",
      target: "el_max",
      type: "number",
      factor: 1,
      delta: 1,
      rounding: 0,
    },
    {
      caption: "elastance non linear k",
      target: "el_k",
      type: "number",
      factor: 1,
      delta: 1,
      rounding: 0,
    },
    {
      caption: "temperature (C)",
      target: "temp",
      type: "number",
      factor: 1,
      delta: 0.1,
      rounding: 0.1,
    },
    {
      caption: "viscosity (cP)",
      target: "viscosity",
      type: "number",
      factor: 1,
      delta: 0.1,
      rounding: 1,
    },
    {
      caption: "unstressed volume factor",
      target: "u_vol_factor",
      type: "factor"
    },
    {
      caption: "elastance minimum baseline factor",
      target: "el_min_factor_ps",
      type: "factor"
    },
    {
      caption: "elastance maximum baseline factor",
      target: "el_max_factor_ps",
      type: "factor"
    },
    {
      caption: "elastance non linear factor",
      target: "el_k_factor",
      type: "factor"
    },
  ];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties unique to a BloodTimeVaryingElastance
    this.temp = 37.0; // blood temperature (dgs C)
    this.viscosity = 6.0; // blood viscosity (centiPoise = Pa * s)
    this.solutes = {}; // dictionary holding all solutes
    this.drugs = {}; // dictionary holding all drug concentrations

    // initialize dependent properties unique to a BloodTimeVaryingElastance
    this.to2 = 0.0; // total oxygen concentration (mmol/l)
    this.tco2 = 0.0; // total carbon dioxide concentration (mmol/l)
    this.ph = -1.0; // ph (unitless)
    this.pco2 = -1.0; // pco2 (mmHg)
    this.po2 = -1.0; // po2 (mmHg)
    this.so2 = -1.0; // o2 saturation
    this.hco3 = -1.0; // bicarbonate concentration (mmol/l)
    this.be = -1.0; // base excess (mmol/l)
  }

  // the method overrides the 'volume_in' method of the TimeVaryingElastance class and 
  // adds functionality to update the viscosity, temperature and to2, tco2, solutes and drug concentrations
  volume_in(dvol, comp_from) {
    // call the parent method from the TimeVaryingElastance class to update the volume
    super.volume_in(dvol, comp_from);

    // process the gases o2 and co2
    this.to2 += ((comp_from.to2 - this.to2) * dvol) / this.vol;
    this.tco2 += ((comp_from.tco2 - this.tco2) * dvol) / this.vol;

    // process the solutes
    Object.keys(this.solutes).forEach((solute) => {
      this.solutes[solute] +=
        ((comp_from.solutes[solute] - this.solutes[solute]) * dvol) / this.vol;
    });

    // process the temperature (treat it as a solute)
    this.temp += ((comp_from.temp - this.temp) * dvol) / this.vol;

    // process the viscosity (treat it as a solute)
    this.viscosity += ((comp_from.viscosity - this.viscosity) * dvol) / this.vol;

    // process the drug concentrations
    Object.keys(this.drugs).forEach((drug) => {
      this.drugs[drug] +=
        ((comp_from.drugs[drug] - this.drugs[drug]) * dvol) / this.vol;
    });
  }
}
