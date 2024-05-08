const { basename, join } = require('node:path')
const { getRandomId62S } = require('@dr-js/core/library/common/math/random.js')
const { resetDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyDelete, modifyRename } = require('@dr-js/core/library/node/fs/Modify.js')
const { extractAutoAsync } = require('@dr-js/core/library/node/module/Archive/archive.js')
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

module.exports = {
  fetchNpmPkg
}
