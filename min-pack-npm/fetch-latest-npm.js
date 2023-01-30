const { basename } = require('node:path')

const { runKit } = require('@dr-js/core/library/node/kit.js')
const { resetDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyDelete, modifyDeleteForce, modifyRename } = require('@dr-js/core/library/node/fs/Modify.js')
const { extractAutoAsync } = require('@dr-js/core/library/node/module/Archive/archive.js')

const { findPathFragList } = require('@dr-js/dev/library/node/file.js')
const { trimFileNodeModules } = require('@dr-js/dev/library/node/package/Trim.js')
const { editPackageJSON } = require('@dr-js/core/library/node/module/PackageJSON.js')

const fetchNpm = async (
  kit,
  PACK_PACKAGE, // = 'npm@8',
  FIND_FRAG // = /^npm-8.*/
) => {
  kit.stepLog(`download latest "${PACK_PACKAGE}"`)
  kit.RUN([ 'npm', 'pack', PACK_PACKAGE ], { quiet: true })

  const tgzPath = await findPathFragList(kit.PATH_ROOT, [ FIND_FRAG ])
  const unpackPath = kit.fromRoot(`${PACK_PACKAGE}-unpack`)
  const resultPath = kit.fromRoot('node_modules/', PACK_PACKAGE.replace(/\W/g, ''))
  kit.stepLog(`unpack "${basename(tgzPath)}"`)
  await resetDirectory(unpackPath)
  await modifyDeleteForce(resultPath)
  await extractAutoAsync(tgzPath, unpackPath)
  await modifyRename(kit.fromRoot(unpackPath, 'package/'), resultPath)
  await modifyDelete(tgzPath)
  await modifyDelete(unpackPath)

  kit.stepLog('trim "package.json"')
  await editPackageJSON((packageJSON) => {
    for (const key of [
      'bin', 'files', 'directories', 'exports',
      'devDependencies', 'scripts', 'config',
      'keywords', 'bugs', 'repository', 'workspaces', 'tap'
    ]) packageJSON[ key ] = undefined
    return packageJSON
  }, kit.fromRoot(resultPath, 'package.json'))

  kit.stepLog('update bundled deps (slow)')
  kit.RUN('npm update --no-audit --no-fund', { cwd: resultPath, quiet: true })

  kit.stepLog('audit deps')
  kit.RUN('npm audit --audit-level=high', { cwd: resultPath, quiet: true })

  kit.stepLog('trim "changelogs|docs|man"')
  await modifyDeleteForce(kit.fromRoot(resultPath, 'changelogs/'))
  await modifyDeleteForce(kit.fromRoot(resultPath, 'docs/'))
  await modifyDeleteForce(kit.fromRoot(resultPath, 'man/'))

  const trimFileList = await trimFileNodeModules(resultPath)
  kit.stepLog(`trim ${trimFileList.length} file`)
}

runKit(async (kit) => {
  kit.padLog('reset "node_modules/"')
  await resetDirectory(kit.fromRoot('node_modules/'))

  kit.padLog('fetch latest npm@8')
  await fetchNpm(kit, 'npm@8', /^npm-8.*/)

  kit.padLog('fetch latest npm@6')
  await fetchNpm(kit, 'npm@6', /^npm-6.*/)
}, { title: 'fetch-latest-npm' })
