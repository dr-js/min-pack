const { runKit } = require('@dr-js/core/library/node/kit.js')
const QuickJS = require('./output-gitignore/')

runKit(async (kit) => {
  const qjs = await QuickJS.initQuickJS()
  console.log(qjs.evalCode('1 + 2'))
  console.log(qjs.evalCode('new Date()'))
})
