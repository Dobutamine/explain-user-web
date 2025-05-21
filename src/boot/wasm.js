// src/boot/wasm.js
import { boot } from 'quasar/wrappers'
import initOxy from 'src/explain/wasm/oxy.js'
// ‘?url’ tells Vite to emit the .wasm as a static asset and give you back its URL
import wasmURL from 'src/explain/wasm/oxy.wasm?url'

export default boot(async ({ app }) => {
  // Point Emscripten’s loader at the Vite-processed URL
  const Module = await initOxy({
    locateFile: () => wasmURL
  })
  // make it available everywhere as $oxy
  app.config.globalProperties.$oxy = Module

  console.log('WASM modules loaded succesfully.')
})
