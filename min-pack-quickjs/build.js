const { runKit } = require('@dr-js/core/library/node/kit.js')
const { modifyDeleteForce } = require('@dr-js/core/library/node/fs/Modify.js')
const { initOutput } = require('@dr-js/dev/library/output.js')

runKit(async (kit) => {
  kit.padLog('run npm install')
  await modifyDeleteForce(kit.fromRoot('node_modules/'))
  await modifyDeleteForce(kit.fromRoot('package-lock.json'))
  kit.RUN('npm install --lockfile-version 3 --no-audit --no-fund --no-update-notifier')

  await initOutput({
    kit,
    copyMapPathList: [ [ 'node_modules/quickjs-emscripten-core/LICENSE', 'LICENSE' ] ],
    editPackageJSON: (packageJSON) => {
      const pkgCorePackageJSON = require(kit.fromRoot('node_modules/quickjs-emscripten-core/package.json'))
      const pkgFilePackageJSON = require(kit.fromRoot('node_modules/@jitl/quickjs-singlefile-cjs-release-sync/package.json'))
      packageJSON[ 'version' ] ||= pkgCorePackageJSON.version
      packageJSON[ 'license' ] = pkgCorePackageJSON.license
      packageJSON[ 'config' ][ 'QUICKJS_EMSCRIPTEN_CORE_VERSION' ] = pkgCorePackageJSON.version
      packageJSON[ 'config' ][ 'QUICKJS_SINGLEFILE_CJS_RELEASE_SYNC_VERSION' ] = pkgFilePackageJSON.version
    }
  })

  kit.RUN('npm run build-webpack')
}, { title: 'build-quickjs' })
