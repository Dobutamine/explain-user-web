# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Explain is a physiological simulation web app for neonatology. It models cardiac and respiratory systems with real-time interactive visualization. The simulation engine runs in a Web Worker to keep the UI responsive.

## Commands

- **Install**: `yarn` (uses Yarn berry with shamefully-hoist)
- **Dev server**: `quasar dev`
- **Production build**: `quasar build`
- **Electron dev**: `quasar dev -m electron`

No test suite is configured.

## Architecture

### Stack

Vue 3 (Options API) + Quasar Framework v2 + Vite. State management via Pinia. Routing uses hash mode (`/#/`).

### Worker-based Simulation Engine (`src/explain/`)

The core simulation runs in a dedicated Web Worker, separated from the UI thread:

- **`Model.js`** (main thread) — extends `ModelEmitter` (pub/sub). Wraps the worker, sends commands, and emits events via `this.emit()` for consumers to subscribe to with `explain.on(event, handler)` / `explain.off(event, handler)`.
- **`ModelEmitter.js`** — minimal pub/sub mixin using `Map<string, Set<Function>>` for O(1) add/remove. Provides `on()`, `off()`, `emit()`.
- **`ModelEngine.js`** (worker) — runs the simulation loop, instantiates model components, manages `DataCollector` and `TaskScheduler`. Has error handling: try-catch around the message handler, realtime loop, and model stepping. Errors are reported back to the main thread via `_send_error()`.
- Communication uses a REST-style message protocol: `{ type: "GET"|"PUT"|"POST"|"DELETE", message, payload }`.

The global `explain` instance is created in `src/boot/explain.js` and available throughout the app.

### Two-Tier Event System

The app uses a two-tier approach for getting data from the simulation engine to the UI:

**Tier 1: Fast data — `explain.on()` / `explain.off()` (no Vue reactivity)**
- Events: `rtf`, `rts`, `data`, `data_slow`
- These fire at ~66Hz and feed canvas-based rendering (Chart.js, Pixi.js) that bypasses Vue's VDOM.
- Components subscribe directly: `explain.on("rtf", this.handleRtf)` in `mounted()`, `explain.off("rtf", this.handleRtf)` in `beforeUnmount()`.
- Data is read from `explain.modelData` / `explain.modelDataSlow` (no payload in the callback).

**Tier 2: Slow/state data — Pinia store (`src/stores/model.js`)**
- Events: `model_ready`, `rt_start`, `rt_stop`, `state`, `status`, `error`, `state_saved`, `prop_value`, `model_props`, `model_interface`, `modeltype_interface`, `model_types`
- The `useModelStore` Pinia store subscribes to these via `explain.on()` in its `init()` action and exposes reactive state: `isReady`, `isRunning`, `modelState`, `statusMessage`, `error`, `modelInterface`, `modelTypeInterface`, `modelTypes`, `modelProps`, `propValue`.
- Components use `this.$watch(() => this.modelStore.modelState, handler)` for imperative reactions, or access store properties directly in templates.

**Tier 3: UI-to-UI events — Quasar EventBus (`$bus`)**
- Events: `reset`, `rebuild_diagram`, `rebuild_animation`, `sprite_tapped`, `select_diagram`, `select_model`, `ecls_display_on/off`, `redraw_monitors`, `upload_state`, `stop_rt`, etc.
- These are component coordination events, not from the simulation engine. They use `this.$bus.on()` / `this.$bus.off()`.

**Important:** Do NOT use `document.addEventListener` for engine events or relay engine events through `$bus`. Those patterns have been removed.

### Model Hierarchy

All models extend `BaseModelClass` with a consistent contract: static `model_type`, `model_interface` schema, `init_model(args)`, `step_model()`, `calc_model()`.

- **`base_models/`** — low-level physiological primitives (Capacitance, Resistor, TimeVaryingElastance, diffusors, etc.)
- **`component_models/`** — higher-level systems composed from base models (Heart, Circulation, Respiration, Gas, Ans, Metabolism, etc.)
- **`device_models/`** — external hardware (Ventilator, ECLS, Monitor, Resuscitation)
- **`helpers/`** — DataCollector (fast/slow data streams), TaskScheduler (timed interventions), RealTimeMovingAverage

New model types must be exported from `ModelIndex.js` and referenced by `model_type` in definition JSON files under `public/model_definitions/`.

### Data Flow

1. UI interacts via controllers/buttons → calls `explain` methods
2. `Model.js` posts messages to the Web Worker
3. `ModelEngine` performs calculations and emits events
4. `Model.js` receives via `onmessage`, updates local properties, calls `this.emit(eventName)`
5. **Fast events** → components listening via `explain.on()` get called directly
6. **Slow events** → Pinia model store updates reactive state → components react via `$watch` or template bindings

### Error Handling

- `ModelEngine.js` wraps the `onmessage` handler, the realtime loop (`_model_step_rt`), and individual `step_model()` calls in try-catch blocks.
- Errors are sent to the main thread via `_send_error()` as `{ type: "error", message, payload: { error, stack } }`.
- `Model.js` handles the `"error"` message type and emits an `"error"` event. It also has a `worker.onerror` handler for worker-level failures.
- The Pinia model store exposes `error` reactively. Use `modelStore.clearError()` to dismiss.
- If the realtime loop crashes, it auto-stops and sends `rt_stop` so the UI stays in sync.

### Stores (`src/stores/`)

- `model.js` — reactive engine state (isReady, isRunning, modelState, error, etc.), initialized via boot file
- `user.js` — authentication, profile, subscription
- `state.js` — model state persistence, save/load operations
- `general.js` — API URL config (backend: https://explain-user.com)
- `animation.js`, `diagram.js`, `event.js` — UI definitions

### Boot Files (`src/boot/`)

Quasar boot files run at app startup (order matters):
1. `explain.js` — creates the global `explain` Model instance
2. `pixi.js` — exports PIXI.js library
3. `bus.js` — creates global Quasar EventBus
4. `model-store.js` — initializes the Pinia model store (must come after `explain`)

### Routing (`src/router/routes.js`)

- `/` and `/login` → LogInPage
- `/explain` → MainPage (main simulation interface)

### Visualization

Charts use both Chart.js (via vue-chartjs) and Pixi.js for real-time rendering. Diagrams and animations are defined in stores and rendered by dedicated components.
