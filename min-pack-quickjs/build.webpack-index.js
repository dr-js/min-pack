import variant from '@jitl/quickjs-singlefile-cjs-release-sync'
import { newQuickJSWASMModuleFromVariant, shouldInterruptAfterDeadline } from 'quickjs-emscripten-core'

const getQuickJS = async () => newQuickJSWASMModuleFromVariant(variant)

export { getQuickJS, shouldInterruptAfterDeadline }
