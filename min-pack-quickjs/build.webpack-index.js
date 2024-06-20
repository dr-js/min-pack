import variant from '@jitl/quickjs-singlefile-cjs-release-sync'
import { newQuickJSWASMModuleFromVariant } from 'quickjs-emscripten-core'

const initQuickJS = () => newQuickJSWASMModuleFromVariant(variant)

export { initQuickJS }
