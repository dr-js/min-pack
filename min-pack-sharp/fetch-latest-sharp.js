const { basename } = require('node:path')

const { runKit } = require('@dr-js/core/library/node/kit.js')
const { resetDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyDelete, modifyDeleteForce, modifyRename, modifyCopy } = require('@dr-js/core/library/node/fs/Modify.js')
const { extractAutoAsync } = require('@dr-js/core/library/node/module/Archive/archive.js')

const { findPathFragList } = require('@dr-js/dev/library/node/file.js')
const { trimFileNodeModules } = require('@dr-js/dev/library/node/package/Trim.js')
const { editPackageJSON } = require('@dr-js/core/library/node/module/PackageJSON.js')

const PACK_PACKAGE = 'sharp@0.32'
const FIND_FRAG = /^sharp-0\..*/

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

  kit.stepLog('preload binary') // https://sharp.pixelplumbing.com/install#cross-platform
  kit.RUN('npm install --omit=dev --omit=optional --prefer-offline', { cwd: kit.fromOutput() })
  kit.RUN('npm run install --platform=linux --arch=x64', { cwd: kit.fromOutput() })
  kit.RUN('npm run install --platform=linux --arch=arm64', { cwd: kit.fromOutput() })

  kit.stepLog('manual trim')
  await modifyDeleteForce(kit.fromOutput('install/'))
  await modifyDeleteForce(kit.fromOutput('lib/agent.js'))
  await modifyDeleteForce(kit.fromOutput('src/'))
  await modifyDeleteForce(kit.fromOutput('binding.gyp'))

  const trimFileList = await trimFileNodeModules(kit.fromOutput())
  kit.stepLog(`trim ${trimFileList.length} file`)
  kit.RUN([ 'find', kit.fromOutput('vendor/'), '-empty', '-type', 'd', '-delete' ])

  kit.stepLog('trim "package.json"')
  await editPackageJSON((packageJSON) => {
    packageJSON[ 'name' ] = '@min-pack/sharp'
    for (const key of [
      'devDependencies', 'optionalDependencies',
      'scripts', 'contributors', 'keywords', 'files',
      'funding', 'semistandard', 'cc', 'tsd'
    ]) delete packageJSON[ key ]
    for (const packageName of [ // used for prebuild install
      'node-addon-api', 'prebuild-install', 'simple-get', 'tar-fs', 'tunnel-agent'
    ]) delete packageJSON[ 'dependencies' ][ packageName ]
    return packageJSON
  }, kit.fromOutput('package.json'))

  await modifyCopy(kit.fromRoot('README.md'), kit.fromOutput('README.md'))
}, { title: 'fetch-latest-sharp' })
