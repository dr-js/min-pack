const { runKit } = require('@dr-js/core/library/node/kit.js')
const { resetDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyDeleteForce, modifyCopy } = require('@dr-js/core/library/node/fs/Modify.js')

const { trimFileNodeModules } = require('@dr-js/dev/library/node/package/Trim.js')
const { editPackageJSON } = require('@dr-js/core/library/node/module/PackageJSON.js')
const { fetchNpmPkg } = require('../function.js')

runKit(async (kit) => {
  kit.padLog('reset output')
  await resetDirectory(kit.fromOutput())

  await fetchNpmPkg(kit, 'ssh2', '1.x')

  kit.stepLog('manual trim')
  await modifyDeleteForce(kit.fromOutput('.github/'))
  await modifyDeleteForce(kit.fromOutput('examples/'))
  await modifyDeleteForce(kit.fromOutput('test/'))
  await modifyDeleteForce(kit.fromOutput('util/'))
  await modifyDeleteForce(kit.fromOutput('install.js'))

  const trimFileList = await trimFileNodeModules(kit.fromOutput())
  kit.stepLog(`trim ${trimFileList.length} file`)

  kit.stepLog('trim "package.json"')
  await editPackageJSON((packageJSON) => {
    packageJSON[ 'name' ] = '@min-pack/ssh2'
    for (const key of [
      'devDependencies', 'optionalDependencies',
      'scripts', 'keywords', 'repository'
    ]) packageJSON[ key ] = undefined
    return packageJSON
  }, kit.fromOutput('package.json'))

  await modifyCopy(kit.fromRoot('README.md'), kit.fromOutput('README.md'))
}, { title: 'fetch-latest-ssh2' })
