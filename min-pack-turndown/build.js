const { runKit } = require('@dr-js/core/library/node/kit.js')
const { editJSON } = require('@dr-js/core/library/node/fs/File.js')
const { modifyDeleteForce } = require('@dr-js/core/library/node/fs/Modify.js')
const { initOutput } = require('@dr-js/dev/library/output.js')

runKit(async (kit) => {
  kit.padLog('run npm install')
  await modifyDeleteForce(kit.fromRoot('node_modules/'))
  await modifyDeleteForce(kit.fromRoot('package-lock.json'))
  kit.RUN('npm install --lockfile-version 3 --no-audit --no-fund --no-update-notifier')

  // drop "browser" from pkg JSON, else webpack can't bundle as module
  await editJSON((pkgJSON) => {
    pkgJSON[ 'browser' ] = undefined
    return pkgJSON
  }, kit.fromRoot('node_modules/turndown/package.json'))

  await initOutput({
    kit, extraDeleteKeyList: [ 'overrides' ],
    copyMapPathList: [
      [ 'node_modules/turndown/LICENSE', 'LICENSE' ],
      [ 'node_modules/@mixmark-io/domino/LICENSE', 'LICENSE.@mixmark-io_domino' ]
    ],
    editPackageJSON: (packageJSON) => {
      const pkgPackageJSON = require('turndown/package.json')
      const pkgPackageJSONDomino = require('@mixmark-io/domino/package.json')
      packageJSON[ 'version' ] ||= pkgPackageJSON.version
      packageJSON[ 'license' ] = pkgPackageJSON.license
      packageJSON[ 'config' ][ 'TURNDOWN_VERSION' ] = pkgPackageJSON.version
      packageJSON[ 'config' ][ 'MIXMARK_IO_DOMINO_LICENSE' ] = pkgPackageJSONDomino.license
      packageJSON[ 'config' ][ 'MIXMARK_IO_DOMINO_VERSION' ] = pkgPackageJSONDomino.version
    }
  })

  kit.RUN('npm run build-webpack')
}, { title: 'build' })
