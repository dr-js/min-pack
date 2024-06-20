globalThis.runTest = async (
  /** @type { {
   *   Scope: import('quickjs-emscripten-core').Scope
   *   getQuickJS: () => Promise<import('quickjs-emscripten-core').QuickJSWASMModule>
   *   shouldInterruptAfterDeadline: import('quickjs-emscripten-core').shouldInterruptAfterDeadline
   * } } */
  QuickJS
) => {
  // init
  const qjs = await QuickJS.getQuickJS()

  // basic test
  console.log(qjs.evalCode('1 + 2'))
  console.log(qjs.evalCode('new Date()', {
    memoryLimitBytes: 32 * 1024 * 1024, // 32MiB
    shouldInterrupt: QuickJS.shouldInterruptAfterDeadline(Date.now() + 5 * 1000) // 5sec
  }))

  // edited from: https://github.com/justjake/quickjs-emscripten/tree/v0.29.2?tab=readme-ov-file#exposing-apis
  const evalCodeWithLog = (
    code,
    log = (...args) => console.log('[QuickJS]:', ...args)
  ) => {
    const vm = qjs.newContext()
    const logH = vm.newFunction('_log', (...args) => { log(...args.map(vm.getString)) })
    vm.setProp(vm.global, '_log', logH)
    logH.dispose()
    vm.unwrapResult(vm.evalCode('console = { log: (...args) => _log(...args) }')).dispose()
    vm.unwrapResult(vm.evalCode(code)).dispose()
    vm.dispose()
  }
  evalCodeWithLog(`
    console.log(Date)
    console.log(1 + 2)
    console.log({ a: 1 })
  `)

  // added scope from: https://github.com/justjake/quickjs-emscripten/tree/v0.29.2?tab=readme-ov-file#scope
  const evalCodeWithLog2 = (
    code,
    log = (...args) => console.log('[QuickJS2]:', ...args)
  ) => QuickJS.Scope.withScope((scope) => {
    const vm = scope.manage(qjs.newContext())
    const consoleH = vm.newObject()
    vm.setProp(consoleH, 'log', scope.manage(vm.newFunction('log', (...args) => { log(...args.map(vm.getString)) })))
    vm.setProp(vm.global, 'console', scope.manage(consoleH))
    scope.manage(vm.unwrapResult(vm.evalCode(code)))
  })
  evalCodeWithLog2(`
    console.log(Date)
    console.log(1 + 2)
    console.log({ a: 1 })
  `)
}
