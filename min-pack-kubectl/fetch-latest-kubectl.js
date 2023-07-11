const { chmodSync } = require('node:fs')
const { writeBuffer, writeText } = require('@dr-js/core/library/node/fs/File.js')
const { resetDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyCopy } = require('@dr-js/core/library/node/fs/Modify.js')
const { editPackageJSON } = require('@dr-js/core/library/node/module/PackageJSON.js')
const { fetchWithJump } = require('@dr-js/core/library/node/net.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')

runKit(async (kit) => {
  kit.padLog('reset output')
  await resetDirectory(kit.fromOutput())

  kit.stepLog('check latest release') // from: https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/
  const RELEASE_NAME = await (await fetchWithJump('https://dl.k8s.io/release/stable.txt', { jumpMax: 8, timeout: 42 * 1000 })).text()
  kit.log(`get release: "${RELEASE_NAME}"`)
  await writeText(kit.fromOutput('kubectl.info'), RELEASE_NAME)
  for (const arch of [ 'amd64', 'arm64' ]) {
    kit.log(`fetch binary for: "${arch}"...`)
    const file = kit.fromOutput(arch === 'amd64' ? 'kubectl-linux-x64' : 'kubectl-linux-arm64')
    const buffer = await (await fetchWithJump(`https://dl.k8s.io/release/${RELEASE_NAME}/bin/linux/${arch}/kubectl`, { jumpMax: 8, timeout: 420 * 1000 })).buffer()
    await writeBuffer(file, buffer)
    chmodSync(file, 0o755) // NOTE: add executable permission
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
