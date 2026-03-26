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

Vue 3 (Composition API) + Quasar Framework v2 + Vite. State management via Pinia. Routing uses hash mode (`/#/`).

### Worker-based Simulation Engine (`src/explain/`)

The core simulation runs in a dedicated Web Worker, separated from the UI thread:

- **`Model.js`** (main thread) — wrapper that creates the worker, sends commands, and re-emits worker events as `CustomEvent`s on `document`.
- **`ModelEngine.js`** (worker) — runs the simulation loop, instantiates model components, manages `DataCollector` and `TaskScheduler`.
- Communication uses a REST-style message protocol: `{ type: "GET"|"PUT"|"POST"|"DELETE", message, payload }`.

The global `explain` instance is created in `src/boot/explain.js` and available throughout the app.

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
3. `ModelEngine` performs calculations and emits events (`model_ready`, `status`, `data`, `data_slow`, `state`, `error`)
4. `Model.js` dispatches `CustomEvent`s on `document`
5. `MainLayout.vue` and components listen to these events and update stores/UI

### Stores (`src/stores/`)

- `user.js` — authentication, profile, subscription
- `state.js` — model state, save/load operations
- `general.js` — API URL config (backend: https://explain-user.com)
- `animation.js`, `diagram.js`, `event.js` — UI definitions

### Boot Files (`src/boot/`)

Quasar boot files run at app startup: `explain.js` (model init), `bus.js` (global EventBus), `pixi.js` (PIXI.js export).

### Routing (`src/router/routes.js`)

- `/` and `/login` → LogInPage
- `/explain` → MainPage (main simulation interface)

### Visualization

Charts use both Chart.js (via vue-chartjs) and Pixi.js for real-time rendering. Diagrams and animations are defined in stores and rendered by dedicated components.

