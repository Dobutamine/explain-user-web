# Explain — Python port (spike + regression harness)

A working Python port of a subset of the Explain simulation engine, with a
regression harness that proves bit-identical numerical agreement against the
JavaScript source.

## What's here

```
python_port/
├── explain/                              — the Python port
│   ├── __init__.py
│   ├── base_model.py                     — BaseModelClass
│   ├── model_index.py                    — class registry
│   ├── engine.py                         — load / step / run / write_csv
│   ├── base_models/
│   │   ├── __init__.py
│   │   ├── capacitance.py
│   │   ├── resistor.py
│   │   └── time_varying_elastance.py
│   └── component_models/
│       ├── __init__.py
│       └── blood_capacitance.py
├── scenarios/
│   ├── two_compartment.json              — Capacitance × 2 + Resistor
│   └── extended.json                     — BloodCapacitance × 2 + Resistor + TimeVaryingElastance
├── js_harness/                           — runs the real JS source headlessly
│   ├── loader.mjs                        — Node ESM hook: fixes extensionless imports + ModelIndex cycle
│   ├── model_index_shim.mjs              — empty shim (breaks a circular import)
│   └── run.mjs                           — mini engine that uses src/explain/*.js
├── output/                               — CSVs produced by runs
├── run_spike.py                          — two-compartment driver
├── run_extended.py                       — extended-scenario driver
├── compare.py                            — Python-vs-JS CSV diff
└── README.md
```

## Classes ported

| Class                 | Source                                                      | Python |
|-----------------------|-------------------------------------------------------------|--------|
| BaseModelClass        | src/explain/base_models/BaseModelClass.js                   | explain/base_model.py |
| Capacitance           | src/explain/base_models/Capacitance.js                      | explain/base_models/capacitance.py |
| Resistor              | src/explain/base_models/Resistor.js                         | explain/base_models/resistor.py |
| TimeVaryingElastance  | src/explain/base_models/TimeVaryingElastance.js             | explain/base_models/time_varying_elastance.py |
| BloodCapacitance      | src/explain/component_models/BloodCapacitance.js            | explain/component_models/blood_capacitance.py |

All four model classes preserve the full JS behavior: factor tiers
(non-persistent, `_ps`, `_scaling_ps`), effective-value formulas, the
`volume_out` "vol not removed" contract, and the `BaseModelClass.init_model`
recursion. The `TimeVaryingElastance.volume_out` quirk (`vol < u_vol` guard)
and `BloodCapacitance`'s one-way composition mixing are ported verbatim.

## Running it

```bash
cd python_port

# two-compartment scenario (Capacitance + Resistor)
python3 run_spike.py
cd js_harness && node --loader ./loader.mjs run.mjs two_compartment \
    "COMP_A.vol,COMP_A.pres,COMP_B.vol,COMP_B.pres,R_AB.flow"
cd ..
python3 compare.py two_compartment

# extended scenario (BloodCapacitance + Resistor + TimeVaryingElastance)
python3 run_extended.py
cd js_harness && node --loader ./loader.mjs run.mjs extended \
    "BLOOD_A.vol,BLOOD_A.pres,BLOOD_A.to2,BLOOD_A.tco2,BLOOD_A.temp,BLOOD_B.vol,BLOOD_B.pres,BLOOD_B.to2,BLOOD_B.tco2,BLOOD_B.temp,R_AB.flow,TVE_ISOLATED.vol,TVE_ISOLATED.pres,TVE_ISOLATED.el_min_eff,TVE_ISOLATED.el_max_eff"
cd ..
python3 compare.py extended
```

Python 3.9+ and Node 20+ are the only prerequisites. No external dependencies
on either side.

## What the regression harness proves

The `compare.py` diff between the Python run and the JS run reports
**max |Δ| = 0.000e+00** for every column, every row, across both scenarios
(1,000 samples each):

```
two_compartment:
  COMP_A.vol       0.000e+00
  COMP_A.pres      0.000e+00
  COMP_B.vol       0.000e+00
  COMP_B.pres      0.000e+00
  R_AB.flow        0.000e+00

extended (15 watched columns):
  BLOOD_A.vol, BLOOD_A.pres, BLOOD_A.to2, BLOOD_A.tco2, BLOOD_A.temp,
  BLOOD_B.vol, BLOOD_B.pres, BLOOD_B.to2, BLOOD_B.tco2, BLOOD_B.temp,
  R_AB.flow, TVE_ISOLATED.vol, TVE_ISOLATED.pres,
  TVE_ISOLATED.el_min_eff, TVE_ISOLATED.el_max_eff
  all columns: max |Δ| = 0.000e+00
```

This is bit-identical output at the IEEE-754 level. Floating-point arithmetic
ordering, library math, and step sequence produce byte-for-byte the same
values in V8 and CPython. Every subsequent model ported can be validated
against this harness — if a port passes, it's trusted; if it diverges, the
first divergent column and timestamp pinpoints where.

## What was NOT ported

- The Web Worker message protocol (GET/POST/PUT/DELETE dispatch,
  `self.onmessage`, `postMessage`). There is no UI to notify; direct Python
  calls replace it. ~1000 lines of JS becomes ~100 lines of Python.
- `ModelEmitter` (pub/sub) — not needed for batch research.
- `DataCollector` / watchlist streaming — replaced by the `watch` argument to
  `Engine.run`.
- `TaskScheduler`, `ModelScaler` — out of spike scope.

## The JS harness — how it works

Running `src/explain/*.js` directly in plain Node is nontrivial because:

1. The source uses extension-less imports (Vite resolves them; strict Node
   ESM rejects them).
2. `BaseModelClass.js` imports `ModelIndex.js` at module level, and
   `ModelIndex.js` re-exports every model class. This creates a circular
   import that Vite handles but Node's strict live-binding model refuses.

`js_harness/loader.mjs` is a Node ESM loader that:

- Adds `.js` to extensionless relative imports (fixing problem 1).
- Redirects any import of `src/explain/ModelIndex.js` to
  `model_index_shim.mjs` (fixing problem 2).

The shim is deliberately empty — for scenarios without nested
`components`, the `Models[...]` lookup inside `BaseModelClass.init_model`
never fires, so the empty shim is enough to break the cycle. When porting
a scenario that uses nested components, add static exports to the shim for
the required classes.

## Finding: BloodCapacitance uses one-way composition mixing

This surfaced in the extended scenario. BloodCapacitance's `volume_in`
overrides the base to mix the inflowing composition into the receiving
compartment, using:

    this.to2 += (comp_from.to2 - this.to2) * dvol / this.vol

When fluid flows A → B, B mixes in A's composition. But the source
compartment A is unchanged — its `volume_out` does not update composition.
This is a "perfect well-mixed compartment" model (CSTR-style); there is no
back-diffusion from B into A.

Consequence in the extended scenario: with flow always A → B, A.to2
stays exactly at its initial 8.0 mmol/L while B.to2 rises to a mass-weighted
average (5.333 mmol/L). Total O2 mass is conserved to machine precision
(delta = 4.4e-16 mmol on 1.0 mmol total). Bulk concentrations do NOT
equilibrate, which is correct under this mixing model.

This is a real physiology detail worth documenting; the
`physiology-documentation-extractor` agent should call it out when
generating the BloodCapacitance doc.

## What comes next

Everything below is incremental — each port adds to the regression harness
and is judged by whether it maintains bit-identical agreement.

1. **Port the remaining base_models/**: `Container`, `GasDiffusor`,
   `GasExchanger`, `BloodDiffusor`. 2-3 days.
2. **Port `GasCapacitance` and `GasComposition`** from component_models —
   these are dependencies of the respiratory models.
3. **Port the circulation stack**: `BloodTimeVaryingElastance`, `BloodVessel`,
   `BloodPump`, `HeartChamber`, `HeartValve`, `Heart`, `Circulation`.
   This is the bulk of the work, ~1 week.
4. **Port the respiratory stack**: `Breathing`, `Respiration`, `Gas`.
   Requires the gas_composition helper.
5. **Port the regulatory stack**: `Ans`, `AnsAfferent`, `AnsEfferent`,
   `Metabolism`, `Mob2`, `Fluids`.
6. **Port the device models**: `Ventilator`, `Ecls`, `Monitor`,
   `Resuscitation`. 3-5 days.
7. **Port helpers**: `DataCollector`, `TaskScheduler`, `ModelScaler`. Mostly
   mechanical.
8. **Run a real scenario**: `term_neonate_timothy.json` end-to-end,
   regression-diff against the JS engine for 60 s of simulated time. This is
   the final trust milestone.
9. **Package it**: pytest regression tests, `pyproject.toml`, optional
   pandas / numpy output adapters, Jupyter notebook examples.

## Non-goals

- Real-time performance. Python at batch-run speed is sufficient; tight
  real-time simulation is out of scope.
- UI layer. This is headless, for code and notebooks.
- Full feature parity with the UI editor (`model_interface` metadata is
  preserved but no editor is built here).
