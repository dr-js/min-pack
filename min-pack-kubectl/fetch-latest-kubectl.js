const { chmodSync } = require('node:fs')
const { calcHash } = require('@dr-js/core/library/node/data/Buffer.js')
const { existPath } = require('@dr-js/core/library/node/fs/Path.js')
const { readBuffer, writeBuffer } = require('@dr-js/core/library/node/fs/File.js')
const { resetDirectory, createDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyCopy } = require('@dr-js/core/library/node/fs/Modify.js')
const { editPackageJSON } = require('@dr-js/core/library/node/module/PackageJSON.js')
const { fetchWithJump } = require('@dr-js/core/library/node/net.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')

runKit(async (kit) => {
  kit.padLog('reset output')
  await resetDirectory(kit.fromOutput())

  kit.stepLog('check latest k8s release...') // from: https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/
  const RELEASE_NAME = await (await fetchWithJump('https://dl.k8s.io/release/stable.txt', { jumpMax: 8, timeout: 42 * 1000 })).text()
  kit.log(`get k8s release: "${RELEASE_NAME}"`)

  for (const arch of [ 'x64', 'arm64' ]) {
    const url = `https://dl.k8s.io/release/${RELEASE_NAME}/bin/linux/${arch === 'x64' ? 'amd64' : arch}/kubectl`
    const cachePath = kit.fromTemp(url.replaceAll(/\W/g, '_'))
    if (!await existPath(cachePath)) {
      await createDirectory(kit.fromTemp())
      kit.log(`fetch "kubectl" binary to cache: "${url}"...`)
      await writeBuffer(cachePath, await (await fetchWithJump(url, { jumpMax: 4, timeout: 420 * 1000 })).buffer())
    }
    const buffer = await readBuffer(cachePath)
    const bufferSha256Hex = calcHash(buffer, 'sha256', 'hex')
    kit.stepLog(`prepare pkg "kubectl-linux-${arch}/"`)
    await resetDirectory(kit.fromOutput(`kubectl-linux-${arch}/`))
    const binPath = kit.fromOutput(`kubectl-linux-${arch}/kubectl`)
    await writeBuffer(binPath, buffer)
    chmodSync(binPath, 0o755) // NOTE: add executable permission
    await editPackageJSON((packageJSON) => {
      packageJSON[ 'private' ] = packageJSON[ 'bin' ] = packageJSON[ 'scripts' ] = packageJSON[ 'optionalDependencies' ] = undefined
      packageJSON[ 'name' ] += `-${arch}`
      packageJSON[ 'cpu' ] = [ arch ]
      packageJSON[ 'config' ] = { RELEASE_NAME, KUBECTL_BIN_SHA256: bufferSha256Hex }
      return packageJSON
    }, kit.fromRoot('package.json'), kit.fromOutput(`kubectl-linux-${arch}/package.json`))
    await modifyCopy(kit.fromRoot('README.arch.md'), kit.fromOutput(`kubectl-linux-${arch}/README.md`))
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
