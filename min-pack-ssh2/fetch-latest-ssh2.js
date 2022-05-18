const { basename } = require('node:path')

const { runKit } = require('@dr-js/core/library/node/kit.js')
const { resetDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyDelete, modifyDeleteForce, modifyRename, modifyCopy } = require('@dr-js/core/library/node/fs/Modify.js')
const { extractAutoAsync } = require('@dr-js/core/library/node/module/Archive/archive.js')

const { findPathFragList } = require('@dr-js/dev/library/node/file.js')
const { trimFileNodeModules } = require('@dr-js/dev/library/node/package/Trim.js')
const { editPackageJSON } = require('@dr-js/core/library/node/module/PackageJSON.js')

const PACK_PACKAGE = 'ssh2@1'
const FIND_FRAG = /^ssh2-1.*/

runKit(async (kit) => {
  kit.padLog('reset output')
  await resetDirectory(kit.fromOutput())

  kit.stepLog(`download latest "${PACK_PACKAGE}"`)
  kit.RUN([ 'npm', 'pack', PACK_PACKAGE ], { quiet: true })

  const tgzPath = await findPathFragList(kit.PATH_ROOT, [ FIND_FRAG ])
  const unpackPath = kit.fromRoot(`${PACK_PACKAGE}-unpack`)
  kit.stepLog(`unpack "${basename(tgzPath)}"`)
  await resetDirectory(unpackPath)
  await extractAutoAsync(tgzPath, unpackPath)
  await modifyRename(await findPathFragList(unpackPath, [ /./ ]), kit.fromOutput())
  await modifyDelete(tgzPath)
  await modifyDelete(unpackPath)

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
