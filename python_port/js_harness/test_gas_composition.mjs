// Parity driver for the JS calc_gas_composition. Mirrors
// python_port/test_gas_composition.py so the CSVs can be diffed byte-for-byte.
//
// Run with:
//   cd python_port/js_harness
//   node --loader ./loader.mjs test_gas_composition.mjs

import { calc_gas_composition } from "../../src/explain/component_models/GasComposition.js";
import { GasCapacitance } from "../../src/explain/component_models/GasCapacitance.js";

import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Stand-in engine with the single field calc_model reads.
function makeEngine() {
  return { modeling_stepsize: 0.0005, model_time_total: 0.0, models: {} };
}

// Fresh GasCapacitance with identical init to the Python test.
function makeGc(name) {
  const eng = makeEngine();
  const gc = new GasCapacitance(eng, name);
  gc.is_enabled = true;
  gc._is_initialized = true;
  gc.u_vol = 0.45;
  gc.el_base = 100.0;
  gc.el_k = 0.0;
  gc.vol = 0.5;
  gc.pres_atm = 760.0;
  gc.target_temp = 37.0;
  gc.temp = 37.0;
  return gc;
}

const CASES = [
  ["room_air_37C",      0.205, 37, 1.0, 0.000392],
  ["room_air_dry_37C",  0.205, 37, 0.0, 0.000392],
  ["room_air_25C",      0.205, 25, 1.0, 0.000392],
  ["fio2_80_37C",       0.80,  37, 1.0, 0.000392],
  ["fio2_21_hypercap",  0.21,  37, 1.0, 0.05],
];

const OUTPUT_KEYS = [
  "ctotal", "ph2o", "fh2o", "ch2o",
  "po2", "fo2", "co2",
  "pco2", "fco2", "cco2",
  "pn2", "fn2", "cn2",
  "pother", "fother", "cother",
];

function pyFloatString(v) {
  if (typeof v === "number" && Number.isFinite(v) && Number.isInteger(v)) {
    return `${v}.0`;
  }
  return String(v);
}

function csvField(v) {
  const s = typeof v === "number" ? pyFloatString(v) : String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const fieldnames = ["case", "fio2", "temp", "humidity", "fico2", ...OUTPUT_KEYS.map((k) => `out_${k}`)];
const rows = [];

console.log("=".repeat(78));
console.log("calc_gas_composition (JS) — representative inputs");
console.log("=".repeat(78));

for (const [name, fio2, temp, humidity, fico2] of CASES) {
  const gc = makeGc(name);
  calc_gas_composition(gc, fio2, temp, humidity, fico2);

  console.log();
  console.log(`[${name}]  fio2=${fio2}  temp=${temp}  humidity=${humidity}  fico2=${fico2}`);
  console.log(
    `  po2=${gc.po2.toFixed(3)}  pco2=${gc.pco2.toFixed(3)}  pn2=${gc.pn2.toFixed(3)}  ph2o=${gc.ph2o.toFixed(3)}`
  );
  console.log(
    `  fo2=${gc.fo2.toFixed(5)}  fco2=${gc.fco2.toFixed(6)}  fh2o=${gc.fh2o.toFixed(5)}  ctotal=${gc.ctotal.toFixed(4)}`
  );

  const row = { case: name, fio2, temp, humidity, fico2 };
  for (const k of OUTPUT_KEYS) row[`out_${k}`] = gc[k];
  rows.push(row);
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const csvOut = path.resolve(HERE, "../output/gas_composition_js.csv");

const lines = [fieldnames.join(",")];
for (const r of rows) lines.push(fieldnames.map((h) => csvField(r[h])).join(","));

mkdirSync(path.dirname(csvOut), { recursive: true });
writeFileSync(csvOut, lines.join("\r\n") + "\r\n");

console.log();
console.log("=".repeat(78));
console.log(`CSV written: ${path.relative(HERE, csvOut)}  (${rows.length} cases)`);
console.log("=".repeat(78));
