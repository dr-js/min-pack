const { runKit } = require('@dr-js/core/library/node/kit.js')
const { resetDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyDeleteForce } = require('@dr-js/core/library/node/fs/Modify.js')

const { trimFileNodeModules } = require('@dr-js/dev/library/node/package/Trim.js')
const { editPackageJSON } = require('@dr-js/core/library/node/module/PackageJSON.js')
const { fetchNpmPkg } = require('../function.js')

const fetchNpm = async (
  kit,
  pkgVerMain // = '8' or '6'
) => {
  const resultPath = kit.fromRoot(`node_modules/npm${pkgVerMain}`)
  await fetchNpmPkg(kit, 'npm', pkgVerMain, resultPath)

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
  await fetchNpm(kit, '8')

  kit.padLog('fetch latest npm@6')
  await fetchNpm(kit, '6')
}, { title: 'fetch-latest-npm' })
