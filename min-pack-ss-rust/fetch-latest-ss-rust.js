const { writeBuffer, writeText } = require('@dr-js/core/library/node/fs/File.js')
const { resetDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyRename, modifyCopy } = require('@dr-js/core/library/node/fs/Modify.js')
const { editPackageJSON } = require('@dr-js/core/library/node/module/PackageJSON.js')
const { extractAutoAsync } = require('@dr-js/core/library/node/module/Archive/archive.js')
const { fetchWithJumpProxy } = require('@dr-js/core/library/node/module/Software/npm.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')

runKit(async (kit) => {
  kit.padLog('reset output')
  await resetDirectory(kit.fromOutput())

  kit.stepLog('check latest release') // https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28
  const [ { name: RELEASE_NAME, assets: RELEASE_ASSET_LIST } ] = await (await fetchWithJumpProxy('https://api.github.com/repos/shadowsocks/shadowsocks-rust/releases?per_page=1', {
    headers: { 'x-github-api-version': '2022-11-28', 'accept': 'application/vnd.github+json', 'user-agent': 'dr-js/min-pack' }, jumpMax: 8, timeout: 42 * 1000
  })).json()
  kit.log(`get release: "${RELEASE_NAME}", assets: ${RELEASE_ASSET_LIST.length}`)
  await writeText(kit.fromOutput('ssservice.info'), RELEASE_NAME)
  for (const { name, browser_download_url: assetUrl } of RELEASE_ASSET_LIST) {
    if (!name.endsWith('aarch64-unknown-linux-gnu.tar.xz') && !name.endsWith('x86_64-unknown-linux-gnu.tar.xz')) continue
    kit.log(`fetch asset: "${assetUrl}"...`)
    await resetDirectory(kit.fromTemp())
    const buffer = await (await fetchWithJumpProxy(assetUrl, { jumpMax: 8, timeout: 42 * 1000 })).buffer()
    await writeBuffer(kit.fromTemp(name), buffer)
    await extractAutoAsync(kit.fromTemp(name), kit.fromTemp('unpack/'))
    await modifyRename(kit.fromTemp('unpack/ssservice'), kit.fromOutput(name.includes('x86_64') ? 'ssservice-linux-x64' : 'ssservice-linux-arm64'))
  }

  kit.stepLog('add "package.json"')
  await editPackageJSON((packageJSON) => {
    packageJSON[ 'private' ] = undefined
    packageJSON[ 'scripts' ] = undefined
    packageJSON[ 'config' ] = { RELEASE_NAME }
    return packageJSON
  }, kit.fromRoot('package.json'), kit.fromOutput('package.json'))
  await modifyCopy(kit.fromRoot('bin.js'), kit.fromOutput('bin.js'))
  await modifyCopy(kit.fromRoot('README.md'), kit.fromOutput('README.md'))
}, { title: 'fetch-latest-ss-rust' })
