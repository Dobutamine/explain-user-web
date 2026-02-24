# Explain Model (`src/explain`)

This folder contains the in-browser physiological simulation engine used by the web app.
The model runs in a dedicated Web Worker (`ModelEngine.js`) and is controlled from the main thread through the `Model` wrapper (`Model.js`).

## High-level architecture

- **`Model.js` (main thread API):** public class used by the UI to build/start/stop/query/update the model.
- **`ModelEngine.js` (worker):** simulation runtime; receives command messages, performs model steps, sends events/data back.
- **`ModelIndex.js`:** registry/export barrel of all model classes that can be dynamically instantiated.
- **`base_models/`:** low-level primitives and base class (`BaseModelClass`) used by most models.
- **`component_models/`:** physiological subsystems (heart, circulation, respiration, blood, ANS, etc.).
- **`device_models/`:** external support devices (ventilator, ECLS, monitor, resuscitation).
- **`helpers/`:** runtime helpers (`DataCollector`, `TaskScheduler`, moving averages, etc.).

## Runtime lifecycle

1. UI constructs `new Model()` (see `src/boot/explain.js`).
2. `Model` creates a worker from `ModelEngine.js`.
3. UI calls `build()` or `load(<definition_name>)`.
4. Worker `build()`:
   - copies top-level model settings,
   - instantiates each model component by `model_type` via `ModelIndex`,
   - calls `init_model(args)` on each component,
   - creates `DataCollector` and `TaskScheduler`.
5. UI can run:
   - **batch simulation** via `calculate(seconds)`, or
   - **real-time simulation** via `start()` / `stop()`.
6. Worker sends state/data/status events back to main thread.

## Worker message protocol

`Model` and `ModelEngine` communicate with message objects:

```js
{
  type: "GET" | "PUT" | "POST" | "DELETE",
  message: string,
  payload: any
}
```

### Inbound commands to worker (`ModelEngine`)

- **`POST build`**: build model from definition JSON.
- **`POST start` / `POST stop`**: start/stop real-time simulation loop.
- **`POST calc`**: simulate a fixed duration.
- **`POST call`**: schedule model function execution.
- **`POST add` / `DELETE remove`**: add/remove submodels.
- **`POST watch` / `POST watch_slow`**: add properties to fast/slow data watchlists.
- **`GET state` / `GET data` / `GET data_slow`**: retrieve model state or collected data.
- **`GET property_value`**: get a single property by path (`Model.prop` or `Model.prop.subprop`).
- **`PUT property_value`**: schedule property updates through `TaskScheduler`.
- **`PUT sample_interval` / `PUT sample_interval_slow`**: sampling interval changes.
- **`POST save`**: emit a serializable snapshot event.

### Outbound events from worker

Important worker event types handled in `Model.receive()`:

- `model_ready`
- `status`
- `rt_start`, `rt_stop`
- `data`, `data_slow` (on demand / post-calc)
- `rtf`, `rts` (real-time fast/slow streams)
- `state`
- `prop_value`, `model_props`, `model_interface`, `modeltype_interface`, `model_types`
- `state_saved`

These are re-emitted as `CustomEvent`s on `document` by `Model`.

## Public API (`Model.js`)

Core methods used by UI code:

- **Model control:** `build`, `load`, `restart`, `start`, `stop`, `calculate`
- **Data/state:** `getModelData`, `getModelDataSlow`, `getModelState`, `saveModelState`
- **Sampling/watchlists:** `setSampleInterval`, `setSampleIntervalSlow`, `watchModelProps`, `watchModelPropsSlow`, `clearWatchList`, `clearWatchListSlow`
- **Introspection:** `getModelProps`, `getModelTypes`, `getModelTypeInterface`, `getModelInterface`, `getPropValue`
- **Mutation/actions:** `setPropValue`, `callModelFunction`, `addNewModel`, `deleteModel`

## Data collection and scheduling

### `DataCollector`

- Maintains two watchlists:
  - `watch_list` (fast stream)
  - `watch_list_slow` (slow stream)
- Samples properties at configurable intervals and buffers time-series objects.
- Always tracks `Heart.ncc_atrial` and `Heart.ncc_ventricular` in the fast watchlist.

### `TaskScheduler`

- Schedules property changes and function calls with optional delay (`at`) and interpolation duration (`it`).
- Numeric properties can be ramped over time.
- Boolean/string updates are applied as discrete changes.

## Model class contract

Most classes extend `BaseModelClass` and follow this pattern:

- **Static metadata**
  - `model_type` (string identifier used at build time)
  - `model_interface` (UI-editable schema)
- **Initialization**
  - constructor defines independent/dependent/local fields
  - `init_model(args)` applies config and sets `_is_initialized`
- **Simulation step**
  - `step_model()` checks `is_enabled && _is_initialized`
  - `calc_model()` performs actual calculations

## `model_interface` conventions

`model_interface` is a schema used for configuration and UI editing. Typical entries include:

- `target` (property or function name)
- `type` (e.g. `number`, `boolean`, `list`, `multiple-list`, `factor`, `function`)
- `caption`, `readonly`, `build_prop`, `edit_mode`
- numeric editing fields such as `factor`, `delta`, `rounding`, `ll`, `ul`
- for function entries: `args` describing call parameters

## Composite model behavior

Some component models create additional internal models in `init_model`.

Example: `MicroVascularUnit` creates and configures internal `BloodVessel` components (arteriole/capillary/venule), then registers them in the engine model map. This allows a higher-level model to encapsulate a local network while still participating in global stepping.

## Adding a new model type

1. Create a class in `base_models/`, `component_models/`, or `device_models/`.
2. Extend `BaseModelClass` (or match required engine contract).
3. Define static `model_type` and `model_interface`.
4. Implement `init_model` and/or `calc_model` as needed.
5. Export it from `ModelIndex.js`.
6. Reference the new `model_type` in model definition JSON.

## Minimal usage example

```js
import { explain } from "src/boot/explain";

// Build from object (or call explain.load("definition_name"))
explain.build(modelDefinition);

// Observe selected variables
explain.watchModelProps([
  "Heart.heart_rate",
  "Heart.lv_sv",
  "Ventilator.vent_rate"
]);

// Run realtime
explain.start();

// Later...
explain.stop();
```

## Notes and caveats

- `Model.load(name)` fetches from `/model_definitions/<name>.json` relative to app origin.
- Saved state post-processing (`_processModelState`) removes helper objects and private (`_`) fields before emitting `state_saved`.
- Worker-based design avoids blocking UI during simulation but requires all interaction via message protocol.
