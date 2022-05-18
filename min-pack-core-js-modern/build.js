const { runKit } = require('@dr-js/core/library/node/kit.js')
const { modifyCopy } = require('@dr-js/core/library/node/fs/Modify.js')
const { editPackageJSON } = require('@dr-js/core/library/node/module/PackageJSON.js')

const { initOutput } = require('@dr-js/dev/library/output.js')

runKit(async (kit) => {
  await initOutput({ kit })
  await modifyCopy(kit.fromRoot('node_modules/core-js-compat/LICENSE'), kit.fromOutput('LICENSE'))
  await editPackageJSON((packageJSON) => {
    const builderPackageJSON = require('core-js-builder/package.json')
    const compatPackageJSON = require('core-js-compat/package.json')

    // packageJSON[ 'version' ] = builderPackageJSON.version
    packageJSON[ 'license' ] = builderPackageJSON.license
    packageJSON[ 'config' ][ 'CORE_JS_VERSION' ] = [
      `core-js-builder@${builderPackageJSON.version}`,
      `core-js-compat@${compatPackageJSON.version}`
    ].join(' ')
    return packageJSON
  }, kit.fromOutput('package.json'))

  kit.RUN('npm install')
  kit.RUN('npm run bundle-core-js-modern')
}, { title: 'fetch-latest-ssh2' })
