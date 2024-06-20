const { runKit } = require('@dr-js/core/library/node/kit.js')
const QuickJS = require('./output-gitignore/')

runKit(async (kit) => {
  const qjs = await QuickJS.getQuickJS()
  console.log(qjs.evalCode('1 + 2'))
  console.log(qjs.evalCode('new Date()', {
    memoryLimitBytes: 32 * 1024 * 1024, // 32MiB
    shouldInterrupt: QuickJS.shouldInterruptAfterDeadline(Date.now() + 5 * 1000) // 5sec
  }))
})
