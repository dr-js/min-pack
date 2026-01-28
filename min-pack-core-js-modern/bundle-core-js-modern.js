const { runKit } = require('@dr-js/core/library/node/kit.js')
const { writeJSONPrettySync } = require('@dr-js/core/library/node/fs/File.js')
const { minifyFileListWithTerser, getTerserOption } = require('@dr-js/dev/library/minify.js')

const builder = require('core-js-builder')
const compat = require('core-js-compat')

const { config: { CORE_JS_TARGET } } = require('./package.json')

runKit(async (kit) => {
  const CORE_JS_CONFIG = {
    targets: CORE_JS_TARGET,
    exclude: [
      /^esnext\./,
      /^web\./
    ]
  }

  const {
    list, // array of required modules
    targets // object with targets for each module
  } = compat(CORE_JS_CONFIG)
  // console.log(`list[${list.length}]:`, list)
  console.log(`targets[${Object.keys(targets).length}]:`, targets)
  writeJSONPrettySync(kit.fromOutput('compat.json'), { list })

  const filename = kit.fromOutput('bundle.js')
  await builder({
    filename, ...CORE_JS_CONFIG,
    summary: { // shows summary for the bundle, disabled by default:
      console: { size: true, modules: true }, // in the console, you could specify required parts or set `true` for enable all of them
      comment: false // in the comment in the target file, similarly to `summary.console`
    }
  })
  await minifyFileListWithTerser({
    kit, fileList: [ filename ],
    option: getTerserOption({ ecma: 8, comments: /license/ })
  })
}, { title: 'bundle-core-js-modern' })
