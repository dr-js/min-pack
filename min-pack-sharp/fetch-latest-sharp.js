const { runKit } = require('@dr-js/core/library/node/kit.js')
const { resetDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyDeleteForce, modifyCopy } = require('@dr-js/core/library/node/fs/Modify.js')

const { trimFileNodeModules } = require('@dr-js/dev/library/node/package/Trim.js')
const { editPackageJSON } = require('@dr-js/core/library/node/module/PackageJSON.js')
const { fetchNpmPkg } = require('../function.js')

runKit(async (kit) => {
  kit.padLog('reset output')
  await resetDirectory(kit.fromOutput())
  await fetchNpmPkg(kit, 'sharp', '0.32.x')

  kit.stepLog('preload binary') // https://sharp.pixelplumbing.com/install#cross-platform
  kit.RUN('npm install --omit=dev --omit=optional', { cwd: kit.fromOutput() })
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
