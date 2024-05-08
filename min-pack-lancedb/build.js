const { runKit } = require('@dr-js/core/library/node/kit.js')
const { /* modifyCopy, */ modifyDeleteForce } = require('@dr-js/core/library/node/fs/Modify.js')
const { editPackageJSON } = require('@dr-js/core/library/node/module/PackageJSON.js')
const { initOutput } = require('@dr-js/dev/library/output.js')
const { fetchNpmPkg } = require('../function.js')

runKit(async (kit) => {
  kit.padLog('run npm install')
  await modifyDeleteForce(kit.fromRoot('node_modules/'))
  await modifyDeleteForce(kit.fromRoot('package-lock.json'))
  kit.RUN('npm install --lockfile-version 3 --no-audit --no-fund --no-update-notifier')

  const { version: pkgVersion } = require('@lancedb/lancedb/package.json')
  kit.padLog(`force install linux x64/arm64 addon @${pkgVersion}`)
  await modifyDeleteForce(kit.fromRoot('node_modules/@lancedb/lancedb-linux-arm64-gnu/'))
  await modifyDeleteForce(kit.fromRoot('node_modules/@lancedb/lancedb-linux-x64-gnu/'))
  await fetchNpmPkg(kit, '@lancedb/lancedb-linux-arm64-gnu', pkgVersion, kit.fromRoot('node_modules/@lancedb/lancedb-linux-arm64-gnu/'))
  await fetchNpmPkg(kit, '@lancedb/lancedb-linux-x64-gnu', pkgVersion, kit.fromRoot('node_modules/@lancedb/lancedb-linux-x64-gnu/'))

  await initOutput({ kit })
  // await modifyCopy(kit.fromRoot('node_modules/@lancedb/lancedb/LICENSE'), kit.fromOutput('LICENSE'))

  await editPackageJSON((packageJSON) => {
    packageJSON[ 'overrides' ] = undefined
    const pkgPackageJSON = require('@lancedb/lancedb/package.json')
    packageJSON[ 'version' ] ||= pkgPackageJSON.version
    packageJSON[ 'license' ] = pkgPackageJSON.license
    packageJSON[ 'config' ][ 'LANCEDB_VERSION' ] = pkgPackageJSON.version
    return packageJSON
  }, kit.fromOutput('package.json'))

  kit.RUN('npm run build-webpack')
}, { title: 'build-lancedb' })
