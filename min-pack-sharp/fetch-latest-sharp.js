const { runKit } = require('@dr-js/core/library/node/kit.js')
const { writeTextSync } = require('@dr-js/core/library/node/fs/File.js')
const { resetDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyDeleteForce, modifyCopy, modifyRename } = require('@dr-js/core/library/node/fs/Modify.js')
const { editPackageJSON, writePackageJSON } = require('@dr-js/core/library/node/module/PackageJSON.js')
const { trimFileNodeModules, trimEmptyFolder } = require('@dr-js/dev/library/node/package/Trim.js')
const { fetchNpmPkg } = require('../function.js')

runKit(async (kit) => {
  kit.padLog('reset output')
  await resetDirectory(kit.fromOutput())

  const fromOutPkg = (...args) => kit.fromOutput('pkg/', ...args)
  await fetchNpmPkg(kit, 'sharp', '0.34.x', fromOutPkg())

  kit.stepLog('trim "package.json"')
  const sharpPkgJSON = require(fromOutPkg('package.json'))
  await editPackageJSON((packageJSON) => {
    for (const key of [
      'devDependencies', 'optionalDependencies',
      'scripts', 'contributors', 'keywords', 'files', 'binary', 'type', 'types',
      'funding', 'semistandard', 'cc', 'tsd', 'nyc'
    ]) delete packageJSON[ key ]
    return packageJSON
  }, fromOutPkg('package.json'))

  kit.stepLog('install dep')
  kit.RUN('npm install --lockfile-version 3 --no-audit --no-fund --no-update-notifier', { cwd: fromOutPkg() })

  kit.stepLog('preload binary') // https://sharp.pixelplumbing.com/install#cross-platform
  const { version: pkgVersion, optionalDependencies: optDep } = sharpPkgJSON
  kit.padLog(`force install linux x64/arm64 addon @${pkgVersion}`)
  for (const pkgAddon of [
    // glibc (Debian)
    '@img/sharp-linux-arm64', '@img/sharp-libvips-linux-arm64',
    '@img/sharp-linux-x64', '@img/sharp-libvips-linux-x64',
    // musl (Alpine)
    '@img/sharp-linuxmusl-arm64', '@img/sharp-libvips-linuxmusl-arm64',
    '@img/sharp-linuxmusl-x64', '@img/sharp-libvips-linuxmusl-x64'
  ]) {
    await modifyDeleteForce(fromOutPkg('node_modules/', pkgAddon))
    await fetchNpmPkg(kit, pkgAddon, optDep[ pkgAddon ] || pkgVersion, fromOutPkg('node_modules/', pkgAddon))
  }

  kit.stepLog('manual trim')
  await modifyDeleteForce(fromOutPkg('install/'))
  await modifyDeleteForce(fromOutPkg('src/'))

  const trimFileList = await trimFileNodeModules(fromOutPkg())
  kit.stepLog(`trim ${trimFileList.length} file`)
  const trimFolderList = await trimEmptyFolder(fromOutPkg())
  kit.stepLog(`trim ${trimFolderList.length} folder`)

  const rootPkgJSON = require('./package.json')
  await writePackageJSON(kit.fromOutput('package.json'), {
    name: rootPkgJSON.name,
    version: rootPkgJSON.version || sharpPkgJSON.version,
    description: rootPkgJSON.description,
    license: sharpPkgJSON.license,
    main: 'index.js'
  })
  writeTextSync(kit.fromOutput('index.js'), 'module.exports = require("./pkg")')
  await modifyRename(fromOutPkg('LICENSE'), kit.fromOutput('LICENSE'))
  await modifyCopy(kit.fromRoot('README.md'), kit.fromOutput('README.md'))
}, { title: 'fetch-latest-sharp' })
