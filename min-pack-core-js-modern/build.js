const { runKit } = require('@dr-js/core/library/node/kit.js')
const { modifyCopy } = require('@dr-js/core/library/node/fs/Modify.js')
const { editPackageJSON } = require('@dr-js/core/library/node/module/PackageJSON.js')

const { initOutput } = require('@dr-js/dev/library/output.js')

runKit(async (kit) => {
  await initOutput({ kit })
  await modifyCopy(kit.fromRoot('node_modules/core-js-compat/LICENSE'), kit.fromOutput('LICENSE'))
  await editPackageJSON((packageJSON) => {
    // packageJSON[ 'version' ] = require('core-js-builder/package.json').version
    packageJSON[ 'config' ][ 'CORE_JS_VERSION' ] = [
      `core-js-builder@${require('core-js-builder/package.json').version}`,
      `core-js-compat@${require('core-js-compat/package.json').version}`
    ].join(' ')
    return packageJSON
  }, kit.fromOutput('package.json'))

  kit.RUN('npm install')
  kit.RUN('npm run bundle-core-js-modern')
}, { title: 'fetch-latest-ssh2' })
