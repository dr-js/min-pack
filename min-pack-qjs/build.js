const { resetDirectorySync } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyCopySync } = require('@dr-js/core/library/node/fs/Modify.js')
const { editPackageJSON } = require('@dr-js/core/library/node/module/PackageJSON.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')

runKit(async (kit) => {
  kit.padLog('reset output')
  resetDirectorySync(kit.fromOutput())

  await editPackageJSON((packageJSON) => {
    packageJSON[ 'private' ] = undefined
    packageJSON[ 'scripts' ] = undefined
    return packageJSON
  }, kit.fromRoot('package.json'), kit.fromOutput('package.json'))
  for (const file of [
    'bin.qjsc.sh',
    'bin.sh',
    'Dockerfile',
    'qjs-linux-amd64',
    'qjs-linux-arm64',
    'qjsc-linux-amd64',
    'qjsc-linux-arm64',
    'README.md',
  ]) modifyCopySync(kit.fromRoot(file), kit.fromOutput(file))
}, { title: 'build' })
