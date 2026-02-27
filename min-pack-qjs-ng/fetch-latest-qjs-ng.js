const { chmodSync } = require('node:fs')
const { writeBufferSync, writeTextSync } = require('@dr-js/core/library/node/fs/File.js')
const { resetDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyCopySync } = require('@dr-js/core/library/node/fs/Modify.js')
const { editPackageJSON } = require('@dr-js/core/library/node/module/PackageJSON.js')
const { fetchWithJumpProxy } = require('@dr-js/core/library/node/module/Software/npm.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')

runKit(async (kit) => {
  kit.padLog('reset output')
  await resetDirectory(kit.fromOutput())

  kit.stepLog('check latest release') // https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28
  const [ { name: RELEASE_NAME, assets: RELEASE_ASSET_LIST } ] = await (await fetchWithJumpProxy('https://api.github.com/repos/quickjs-ng/quickjs/releases?per_page=1', {
    headers: { 'x-github-api-version': '2022-11-28', 'accept': 'application/vnd.github+json', 'user-agent': 'dr-js/min-pack' }, jumpMax: 8, timeout: 42 * 1000
  })).json()
  kit.log(`get release: "${RELEASE_NAME}", assets: ${RELEASE_ASSET_LIST.length}`)
  const infoList = [ RELEASE_NAME ]
  for (const { name, browser_download_url: assetUrl } of RELEASE_ASSET_LIST) {
    if (
      !name.endsWith('qjs-linux-aarch64') && !name.endsWith('qjs-linux-x86_64') &&
      !name.endsWith('qjsc-linux-aarch64') && !name.endsWith('qjsc-linux-x86_64')
    ) continue
    infoList.push(assetUrl)
    kit.log(`fetch asset: "${assetUrl}"...`)
    const buffer = await (await fetchWithJumpProxy(assetUrl, { jumpMax: 8, timeout: 42 * 1000 })).buffer()
    const bin = name.split('/').pop().replace('x86_64', 'x64').replace('aarch64', 'amd64')
    writeBufferSync(kit.fromOutput(bin), buffer)
    chmodSync(kit.fromOutput(bin), 0o755) // NOTE: add executable permission
  }
  writeTextSync(kit.fromOutput('qjs-ng.info'), infoList.join('\n'))

  kit.stepLog('add "package.json"')
  await editPackageJSON((packageJSON) => {
    packageJSON[ 'private' ] = undefined
    packageJSON[ 'scripts' ] = undefined
    packageJSON[ 'config' ] = { RELEASE_NAME }
    return packageJSON
  }, kit.fromRoot('package.json'), kit.fromOutput('package.json'))
  modifyCopySync(kit.fromRoot('bin.js'), kit.fromOutput('bin.js'))
  modifyCopySync(kit.fromRoot('bin.qjsc.js'), kit.fromOutput('bin.qjsc.js'))
  modifyCopySync(kit.fromRoot('README.md'), kit.fromOutput('README.md'))
}, { title: 'fetch-latest-ss-rust' })
