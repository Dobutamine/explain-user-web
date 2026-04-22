// Node ESM loader that (1) adds `.js` to extensionless relative imports,
// and (2) redirects any import of `src/explain/ModelIndex.js` to a local
// shim that only exports the classes the harness needs. Together these let
// us run the real engine source headlessly in Node without touching
// src/explain/ or pulling in the full model registry.

import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

// Path to the shim, resolved relative to this loader file
const SHIM_URL = new URL("./model_index_shim.mjs", import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
  // Resolve through default first so we get the fully-qualified URL.
  const isRelative = specifier.startsWith("./") || specifier.startsWith("../");
  const hasExt = /\.[a-zA-Z0-9]+$/.test(specifier);

  // Phase 1: fix extensionless relative imports
  if (isRelative && !hasExt && context.parentURL) {
    const parentPath = fileURLToPath(context.parentURL);
    const parentDir = path.dirname(parentPath);
    const candidate = path.resolve(parentDir, specifier + ".js");
    if (existsSync(candidate)) {
      specifier = specifier + ".js";
    }
  }

  // Phase 2: if this resolves to src/explain/ModelIndex.js, redirect to shim
  const resolved = await nextResolve(specifier, context);
  if (resolved.url.endsWith("/src/explain/ModelIndex.js")) {
    return { url: SHIM_URL, shortCircuit: true, format: "module" };
  }
  return resolved;
}
