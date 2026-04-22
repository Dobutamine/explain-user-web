// JS-side harness: load a scenario by name and write CSV output that
// compare.py can diff against the Python run.
//
// Usage:  node --loader ./loader.mjs run.mjs <scenario_name> <watch_spec>
//
//   <scenario_name>  basename of the file in ../scenarios/<name>.json
//   <watch_spec>     comma-separated list of "INSTANCE.property" pairs
//
// Example:
//   node --loader ./loader.mjs run.mjs two_compartment \
//     COMP_A.vol,COMP_A.pres,COMP_B.vol,COMP_B.pres,R_AB.flow

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { BloodDiffusor } from "../../src/explain/base_models/BloodDiffusor.js";
import { Capacitance } from "../../src/explain/base_models/Capacitance.js";
import { Container } from "../../src/explain/base_models/Container.js";
import { GasDiffusor } from "../../src/explain/base_models/GasDiffusor.js";
import { GasExchanger } from "../../src/explain/base_models/GasExchanger.js";
import { Resistor } from "../../src/explain/base_models/Resistor.js";
import { TimeVaryingElastance } from "../../src/explain/base_models/TimeVaryingElastance.js";
import { Ans } from "../../src/explain/component_models/Ans.js";
import { AnsAfferent } from "../../src/explain/component_models/AnsAfferent.js";
import { AnsEfferent } from "../../src/explain/component_models/AnsEfferent.js";
import { Blood } from "../../src/explain/component_models/Blood.js";
import { BloodCapacitance } from "../../src/explain/component_models/BloodCapacitance.js";
import { BloodPump } from "../../src/explain/component_models/BloodPump.js";
import { BloodTimeVaryingElastance } from "../../src/explain/component_models/BloodTimeVaryingElastance.js";
import { BloodVessel } from "../../src/explain/component_models/BloodVessel.js";
import { Breathing } from "../../src/explain/component_models/Breathing.js";
import { Circulation } from "../../src/explain/component_models/Circulation.js";
import { Fluids } from "../../src/explain/component_models/Fluids.js";
import { Gas } from "../../src/explain/component_models/Gas.js";
import { GasCapacitance } from "../../src/explain/component_models/GasCapacitance.js";
import { Heart } from "../../src/explain/component_models/Heart.js";
import { HeartChamber } from "../../src/explain/component_models/HeartChamber.js";
import { HeartValve } from "../../src/explain/component_models/HeartValve.js";
import { Metabolism } from "../../src/explain/component_models/Metabolism.js";
import { Mob2 } from "../../src/explain/component_models/Mob2.js";
import { Pda } from "../../src/explain/component_models/Pda.js";
import { Placenta } from "../../src/explain/component_models/Placenta.js";
import { Respiration } from "../../src/explain/component_models/Respiration.js";
import { Shunts } from "../../src/explain/component_models/Shunts.js";
import { Ecls } from "../../src/explain/device_models/Ecls.js";
import { Monitor } from "../../src/explain/device_models/Monitor.js";
import { Resuscitation } from "../../src/explain/device_models/Resuscitation.js";
import { Ventilator } from "../../src/explain/device_models/Ventilator.js";

const MODEL_INDEX = {
  BloodDiffusor, Capacitance, Container, GasDiffusor, GasExchanger,
  Resistor, TimeVaryingElastance,
  Ans, AnsAfferent, AnsEfferent, Blood, BloodCapacitance, BloodPump,
  BloodTimeVaryingElastance, BloodVessel, Breathing, Circulation, Fluids,
  Gas, GasCapacitance, Heart, HeartChamber, HeartValve, Metabolism, Mob2,
  Pda, Placenta, Respiration, Shunts,
  Ecls, Monitor, Resuscitation, Ventilator,
};

class Engine {
  constructor() {
    this.models = {};
    this.modeling_stepsize = 0.0005;
    this.model_time_total = 0.0;
  }

  load(definition) {
    const md = definition.model_definition ?? definition;
    this.modeling_stepsize = md.modeling_stepsize ?? this.modeling_stepsize;
    this.model_time_total = md.model_time_total ?? 0.0;

    for (const [name, body] of Object.entries(md.models)) {
      const cls = MODEL_INDEX[body.model_type];
      if (!cls) throw new Error(`Unknown model_type: ${body.model_type}`);
      this.models[name] = new cls(this, name);
    }

    for (const [name, body] of Object.entries(md.models)) {
      const args = Object.entries(body).map(([key, value]) => ({ key, value }));
      this.models[name].init_model(args);
    }
  }

  step() {
    for (const model of Object.values(this.models)) {
      model.step_model();
    }
    this.model_time_total += this.modeling_stepsize;
  }

  run(duration_s, watch, sample_every_s = 0.01) {
    const n_steps = Math.round(duration_s / this.modeling_stepsize);
    const sample_every_n = Math.max(
      1,
      Math.round(sample_every_s / this.modeling_stepsize)
    );
    const rows = [];
    for (let i = 0; i < n_steps; i++) {
      this.step();
      if (i % sample_every_n === 0) {
        const row = { t: this.model_time_total };
        for (const [inst, prop] of watch) {
          row[`${inst}.${prop}`] = this.models[inst][prop];
        }
        rows.push(row);
      }
    }
    return rows;
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const HERE = path.dirname(fileURLToPath(import.meta.url));
const scenarioName = process.argv[2] || "two_compartment";
const watchSpec =
  process.argv[3] ||
  "COMP_A.vol,COMP_A.pres,COMP_B.vol,COMP_B.pres,R_AB.flow";

const watch = watchSpec.split(",").map((s) => {
  const [inst, prop] = s.split(".");
  return [inst, prop];
});

const scenario = path.resolve(HERE, `../scenarios/${scenarioName}.json`);
const output = path.resolve(HERE, `../output/${scenarioName}_js.csv`);

const definition = JSON.parse(readFileSync(scenario, "utf8"));
const eng = new Engine();
eng.load(definition);
const rows = eng.run(10.0, watch, 0.01);

mkdirSync(path.dirname(output), { recursive: true });
const headers = Object.keys(rows[0]);
const lines = [headers.join(",")];
for (const r of rows) {
  lines.push(headers.map((h) => String(r[h])).join(","));
}
writeFileSync(output, lines.join("\n") + "\n");
console.log(`JS harness: scenario="${scenarioName}" -> ${path.relative(HERE, output)} (${rows.length} rows)`);
