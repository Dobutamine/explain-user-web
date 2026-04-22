// Parity driver for the JS source of calc_blood_composition. Mirrors
// python_port/test_blood_composition.py: same five input sets, same
// column layout in the CSV, same row order.
//
// Run with:
//   cd python_port/js_harness
//   node --loader ./loader.mjs test_blood_composition.mjs

import { calc_blood_composition } from "../../src/explain/component_models/BloodComposition.js";

import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// ---------------------------------------------------------------------------
// Input sets — MUST match python_port/test_blood_composition.py byte-for-byte
// in the field values. Notes are copied verbatim, em-dash and arrow included.
// ---------------------------------------------------------------------------

const NEONATE_SOLUTES = {
  na: 138.0,
  k: 3.5,
  ca: 1.0,
  mg: 0.75,
  cl: 106.00344270397578,
  lact: 1.0,
  albumin: 25.0,
  phosphates: 1.64,
  uma: 3.8,
  hemoglobin: 8.0,
};

const ADULT_SOLUTES = {
  na: 140.0,
  k: 4.0,
  ca: 1.2,
  mg: 0.8,
  cl: 104.0,
  lact: 1.0,
  albumin: 40.0,
  phosphates: 1.2,
  uma: 4.0,
  hemoglobin: 9.0,
};

const CASES = [
  ["normal_adult", ADULT_SOLUTES, 26.0, 8.0, 37.0,
   "adult baseline: Hb=9, albumin=40, tco2=26, to2=8.0"],
  ["normal_neonate", NEONATE_SOLUTES, 26.0, 7.0, 37.0,
   "neonate baseline: Hb=8, albumin=25, tco2=26, to2=7.0"],
  ["acidotic", NEONATE_SOLUTES, 29.0, 7.0, 37.0,
   "neonate baseline with tco2 raised to 29 — higher A_tot_CO2 → more acidic"],
  ["alkalotic", NEONATE_SOLUTES, 23.0, 7.0, 37.0,
   "neonate baseline with tco2 dropped to 23 — less A_tot_CO2 → more alkaline"],
  ["hypoxic", NEONATE_SOLUTES, 26.0, 4.0, 37.0,
   "neonate baseline with to2 reduced to 4.0 mmol/L — lower saturation, lower pO2"],
];

// Solute key order MUST match the Python column order.
const SOLUTE_KEYS = [
  "na", "k", "ca", "mg", "cl", "lact",
  "albumin", "phosphates", "uma", "hemoglobin",
];
const OUTPUT_KEYS = ["ph", "pco2", "hco3", "be", "po2", "so2"];

// ---------------------------------------------------------------------------
// Minimal blood-compartment stand-in. Only declares the fields
// calc_blood_composition reads or writes; mirrors the Python
// BloodCompartment class.
// ---------------------------------------------------------------------------
function makeBc(name, solutes, tco2, to2, temp) {
  return {
    name,
    solutes: { ...solutes }, // defensive copy so cases don't alias
    tco2,
    to2,
    temp,
    // output sentinels, mirroring the Python pre-init
    ph: -1.0,
    pco2: -1.0,
    hco3: -1.0,
    be: -1.0,
    po2: -1.0,
    so2: -1.0,
  };
}

// ---------------------------------------------------------------------------
// CSV helpers — match Python csv.DictWriter (QUOTE_MINIMAL default).
// Numbers are rendered with a Python-style stringifier: integer-valued floats
// get a trailing ".0" so `140.0` serializes as "140.0" (matching Python
// `str(140.0)`) rather than JS's default `String(140.0) === "140"`.
// ---------------------------------------------------------------------------
function pyFloatString(v) {
  // Match Python's str(float) for integer-valued floats; otherwise defer to
  // JS's canonical shortest representation (agrees with Python on non-integer
  // floats via IEEE-754 + Grisu/Ryu).
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

function buildFieldNames() {
  const fields = ["case", "note"];
  for (const k of SOLUTE_KEYS) fields.push(`in_${k}`);
  fields.push("in_tco2", "in_to2", "in_temp");
  for (const k of OUTPUT_KEYS) fields.push(`out_${k}`);
  return fields;
}

function buildRow(caseName, note, bc) {
  const row = { case: caseName, note };
  for (const k of SOLUTE_KEYS) row[`in_${k}`] = bc.solutes[k];
  row.in_tco2 = bc.tco2;
  row.in_to2 = bc.to2;
  row.in_temp = bc.temp;
  for (const k of OUTPUT_KEYS) row[`out_${k}`] = bc[k];
  return row;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const HERE = path.dirname(fileURLToPath(import.meta.url));
const csvOut = path.resolve(HERE, "../output/blood_composition_js.csv");

console.log("=".repeat(78));
console.log("calc_blood_composition (JS) — representative inputs");
console.log("=".repeat(78));

const rows = [];
for (const [name, solutes, tco2, to2, temp, note] of CASES) {
  const bc = makeBc(name, solutes, tco2, to2, temp);
  calc_blood_composition(bc);

  console.log();
  console.log(`[${name}]  ${note}`);
  console.log(
    `  IN : tco2=${tco2}  to2=${to2}  temp=${temp}  ` +
    `Hb=${solutes.hemoglobin}  albumin=${solutes.albumin}  ` +
    `Na=${solutes.na}  Cl=${solutes.cl.toFixed(3)}  lact=${solutes.lact}`
  );
  console.log(
    `  OUT: ph=${bc.ph.toFixed(4)}  pco2=${bc.pco2.toFixed(3)} mmHg  ` +
    `hco3=${bc.hco3.toFixed(3)} mmol/L  be=${(bc.be >= 0 ? "+" : "") + bc.be.toFixed(3)} mmol/L`
  );
  console.log(`       po2=${bc.po2.toFixed(3)} mmHg  so2=${bc.so2.toFixed(3)} %`);

  rows.push(buildRow(name, note, bc));
}

const fieldnames = buildFieldNames();
const lines = [fieldnames.join(",")];
for (const r of rows) {
  lines.push(fieldnames.map((h) => csvField(r[h])).join(","));
}

// Match Python's csv.DictWriter default line terminator (\r\n) so the file
// byte-matches python_port/output/blood_composition_python.csv exactly.
mkdirSync(path.dirname(csvOut), { recursive: true });
writeFileSync(csvOut, lines.join("\r\n") + "\r\n");

console.log();
console.log("=".repeat(78));
console.log(
  `CSV written: ${path.relative(HERE, csvOut)}  (${rows.length} cases)`
);
console.log("=".repeat(78));
