import variant from '@jitl/quickjs-singlefile-cjs-release-sync'
import { Scope, newQuickJSWASMModuleFromVariant, shouldInterruptAfterDeadline } from 'quickjs-emscripten-core'

const getQuickJS = async () => newQuickJSWASMModuleFromVariant(variant)

export { Scope, getQuickJS, shouldInterruptAfterDeadline }
