const { basename, join } = require('node:path')
const { getRandomId62S } = require('@dr-js/core/library/common/math/random.js')
const { calcHash } = require('@dr-js/core/library/node/data/Buffer.js')
const { existPath } = require('@dr-js/core/library/node/fs/Path.js')
const { writeBuffer, readBuffer } = require('@dr-js/core/library/node/fs/File.js')
const { resetDirectory, createDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyDelete, modifyRename } = require('@dr-js/core/library/node/fs/Modify.js')
const { extractAutoAsync } = require('@dr-js/core/library/node/module/Archive/archive.js')
const { fetchWithJump } = require('@dr-js/core/library/node/net.js')
const { findPathFragList } = require('@dr-js/dev/library/node/file.js')

const fetchNpmPkg = async (
  kit, packageName, packageVerSpec,
  outputPath = kit.fromOutput(),
  tempPath = kit.fromTemp(getRandomId62S('fnp-'))
) => {
  await resetDirectory(tempPath)
  kit.stepLog(`download "${packageName}@${packageVerSpec}"`)
  kit.RUN([ 'npm', 'pack', `${packageName}@${packageVerSpec}` ], { quiet: true, cwd: tempPath })
  const tgzPath = await findPathFragList(tempPath, [ new RegExp(`^${packageName.replace(/\W/g, '.?')}-`) ])
  kit.stepLog(`unpack "${basename(tgzPath)}"`)
  const unpackPath = join(tempPath, 'unpack/')
  await extractAutoAsync(tgzPath, unpackPath)
  await modifyRename(await findPathFragList(unpackPath, [ /./ ]), outputPath)
  await modifyDelete(tempPath)
}

const _bufferWithCache = async (
  kit,
  asyncFunc,
  cachePath
) => {
  if (!await existPath(cachePath)) {
    await createDirectory(kit.fromTemp())
    await writeBuffer(cachePath, await asyncFunc(cachePath))
  }
  const buffer = await readBuffer(cachePath)
  const bufferSha256Hex = calcHash(buffer, 'sha256', 'hex')
  return { buffer, bufferSha256Hex }
}

const fetchBufferWithCache = async (
  kit,
  url,
  cachePath = kit.fromTemp(url.replaceAll(/\W/g, '_'))
) => _bufferWithCache(
  kit,
  async () => {
    kit.log(`fetch binary to cache: "${url}"...`)
    return (await fetchWithJump(url, { jumpMax: 4, timeout: 420 * 1000 })).buffer()
  },
  cachePath
)

module.exports = {
  fetchNpmPkg,
  fetchBufferWithCache
}
