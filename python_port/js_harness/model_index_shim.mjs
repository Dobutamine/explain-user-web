// Empty stub for src/explain/ModelIndex.js, used by the headless Node harness
// to break a circular-import deadlock.
//
// Why empty? BaseModelClass.js imports ModelIndex.js at module level as
// `import * as Models from "../ModelIndex.js"`. It only DEREFERENCES `Models`
// inside `init_model()`, which runs after all classes have finished loading.
// For any scenario that has no nested `components` (like two_compartment.json),
// that dereference never executes, so the shim doesn't need any exports.
//
// When porting a scenario with nested components, add `export { X } from "..."`
// lines for each required class. Import them LAZILY — i.e., make sure the
// shim's top-level imports don't themselves trigger BaseModelClass to re-enter.
// A safe pattern is to use dynamic `import()` inside getters when needed, but
// for small harnesses, just adding static exports usually works because the
// cycle resolves once BaseModelClass's own module evaluation completes.

export {};
