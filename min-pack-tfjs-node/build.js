const { runKit } = require('@dr-js/core/library/node/kit.js')
const { readJSONSync } = require('@dr-js/core/library/node/fs/File.js')
const { modifyDeleteForce } = require('@dr-js/core/library/node/fs/Modify.js')
const { initOutput } = require('@dr-js/dev/library/output.js')

runKit(async (kit) => {
  kit.padLog('run npm install')
  await modifyDeleteForce(kit.fromRoot('node_modules/'))
  await modifyDeleteForce(kit.fromRoot('package-lock.json'))
  kit.RUN('npm install --lockfile-version 3 --no-audit --no-fund --no-update-notifier --ignore-scripts')

  await initOutput({
    kit, extraDeleteKeyList: [ 'overrides' ],
    copyMapPathList: [ [ 'node_modules/@huggingface/transformers/LICENSE', 'LICENSE' ] ],
    editPackageJSON: (packageJSON) => {
      const pkgPackageJSON = readJSONSync(kit.fromRoot('node_modules/@huggingface/transformers/package.json'))
      packageJSON[ 'version' ] ||= pkgPackageJSON.version
      packageJSON[ 'license' ] = pkgPackageJSON.license
      packageJSON[ 'config' ][ 'TRANSFORMERS_JS_VERSION' ] = pkgPackageJSON.version
      packageJSON[ 'config' ][ 'ONNXRUNTIME_NODE_VERSION' ] = readJSONSync(kit.fromRoot('node_modules/onnxruntime-node/package.json')).version
    }
  })

  kit.RUN('npm run build-webpack')
}, { title: 'build-tfjs-node' })
