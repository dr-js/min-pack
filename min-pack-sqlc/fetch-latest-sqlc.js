const { writeBuffer, writeText } = require('@dr-js/core/library/node/fs/File.js')
const { resetDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyCopy, modifyRename } = require('@dr-js/core/library/node/fs/Modify.js')
const { editPackageJSON } = require('@dr-js/core/library/node/module/PackageJSON.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')
const { fetchBufferWithCache } = require('../function.js')
const { fetchWithJumpProxy } = require('@dr-js/core/library/node/module/Software/npm.js')
const { extractAutoAsync } = require('@dr-js/core/library/node/module/Archive/archive.js')

runKit(async (kit) => {
  kit.padLog('reset output')
  await resetDirectory(kit.fromOutput())

  kit.stepLog('check latest release') // https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28
  const [ { name: RELEASE_NAME, assets: RELEASE_ASSET_LIST } ] = await (await fetchWithJumpProxy('https://api.github.com/repos/sqlc-dev/sqlc/releases?per_page=1', {
    headers: { 'x-github-api-version': '2022-11-28', 'accept': 'application/vnd.github+json', 'user-agent': 'dr-js/min-pack' }, jumpMax: 8, timeout: 42 * 1000
  })).json()
  kit.log(`get release: "${RELEASE_NAME}", assets: ${RELEASE_ASSET_LIST.length}`)
  for (const { name, browser_download_url: assetUrl } of RELEASE_ASSET_LIST) {
    if (!name.endsWith('_linux_arm64.tar.gz') && !name.endsWith('_linux_amd64.tar.gz')) continue
    kit.log(`fetch asset: "${assetUrl}"...`)
    const { buffer, bufferSha256Hex } = await fetchBufferWithCache(kit, assetUrl)
    await resetDirectory(kit.fromTemp('bin/'))
    await writeBuffer(kit.fromTemp('bin/', name), buffer)
    await extractAutoAsync(kit.fromTemp('bin/', name), kit.fromTemp('bin/unpack/'))
    const arch = name.endsWith('_linux_arm64.tar.gz') ? 'arm64' : 'x64'
    await resetDirectory(kit.fromOutput(`sqlc-linux-${arch}/`))
    const binPath = kit.fromOutput(`sqlc-linux-${arch}/sqlc`)
    await modifyRename(kit.fromTemp('bin/unpack/sqlc'), binPath)
    await editPackageJSON((packageJSON) => {
      packageJSON[ 'private' ] = packageJSON[ 'bin' ] = packageJSON[ 'scripts' ] = packageJSON[ 'optionalDependencies' ] = undefined
      packageJSON[ 'name' ] += `-linux-${arch}`
      packageJSON[ 'cpu' ] = [ arch ]
      packageJSON[ 'config' ] = { RELEASE_NAME, SQLC_BIN_SHA256: bufferSha256Hex }
      return packageJSON
    }, kit.fromRoot('package.json'), kit.fromOutput(`sqlc-linux-${arch}/package.json`))
    await modifyCopy(kit.fromRoot('README.arch.md'), kit.fromOutput(`sqlc-linux-${arch}/README.md`))
  }

  kit.stepLog(`prepare pkg "meta/"`)
  await resetDirectory(kit.fromOutput('meta/'))
  await editPackageJSON((packageJSON) => {
    packageJSON[ 'private' ] = packageJSON[ 'scripts' ] = undefined
    packageJSON[ 'config' ] = { RELEASE_NAME }
    return packageJSON
  }, kit.fromRoot('package.json'), kit.fromOutput('meta/package.json'))
  await modifyCopy(kit.fromRoot('bin.sh'), kit.fromOutput('meta/bin.sh'))
  await modifyCopy(kit.fromRoot('README.md'), kit.fromOutput('meta/README.md'))
}, { title: 'fetch-latest-ss-rust' })
