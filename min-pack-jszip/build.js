const { runKit } = require('@dr-js/core/library/node/kit.js')
const { editJSON } = require('@dr-js/core/library/node/fs/File.js')
const { modifyDeleteForce } = require('@dr-js/core/library/node/fs/Modify.js')
const { initOutput } = require('@dr-js/dev/library/output.js')

runKit(async (kit) => {
  kit.padLog('run npm install')
  await modifyDeleteForce(kit.fromRoot('node_modules/'))
  await modifyDeleteForce(kit.fromRoot('package-lock.json'))
  kit.RUN('npm install --lockfile-version 3 --no-audit --no-fund --no-update-notifier')

  await initOutput({
    kit,
    copyMapPathList: [
      [ 'LICENSE.jszip-mit', 'LICENSE' ],
      [ 'node_modules/jszip/index.d.ts', 'index.d.ts' ]
    ],
    editPackageJSON: (packageJSON) => {
      const pkgPackageJSON = require('jszip/package.json')
      packageJSON[ 'version' ] ||= pkgPackageJSON.version
      packageJSON[ 'config' ][ 'JSZIP_VERSION' ] = pkgPackageJSON.version
    }
  })

  kit.RUN('npm run build-webpack')
}, { title: 'build' })
