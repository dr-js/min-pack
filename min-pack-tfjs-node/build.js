const { runKit } = require('@dr-js/core/library/node/kit.js')
const { modifyCopy, modifyDeleteForce } = require('@dr-js/core/library/node/fs/Modify.js')
const { editPackageJSON } = require('@dr-js/core/library/node/module/PackageJSON.js')
const { initOutput } = require('@dr-js/dev/library/output.js')

runKit(async (kit) => {
  kit.padLog('run npm install')
  await modifyDeleteForce(kit.fromRoot('node_modules/'))
  await modifyDeleteForce(kit.fromRoot('package-lock.json'))
  kit.RUN('npm install --lockfile-version 3 --no-audit --no-fund --no-update-notifier')

  await initOutput({ kit })
  await modifyCopy(kit.fromRoot('node_modules/@xenova/transformers/LICENSE'), kit.fromOutput('LICENSE'))

  await editPackageJSON((packageJSON) => {
    packageJSON[ 'overrides' ] = undefined
    const pkgPackageJSON = require('@xenova/transformers/package.json')
    packageJSON[ 'version' ] ||= pkgPackageJSON.version
    packageJSON[ 'license' ] = pkgPackageJSON.license
    packageJSON[ 'config' ][ 'TRANSFORMERS_JS_VERSION' ] = pkgPackageJSON.version
    return packageJSON
  }, kit.fromOutput('package.json'))

  kit.RUN('npm run build-webpack')
}, { title: 'build-tfjs-node' })
