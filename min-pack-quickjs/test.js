/** @type { {
 *   Scope: import('quickjs-emscripten-core').Scope
 *   getQuickJS: () => Promise<import('quickjs-emscripten-core').QuickJSWASMModule>
 *   shouldInterruptAfterDeadline: import('quickjs-emscripten-core').shouldInterruptAfterDeadline
 * } } */
const QuickJS = require('./output-gitignore/index.js')
require('./test.common.js')

globalThis.runTest(QuickJS).then(
  () => console.log('test done'),
  (error) => console.error('test error:', error)
)
