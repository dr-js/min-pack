import { resolve } from 'path'
import { execSync } from 'child_process'

import { argvFlag, runMain } from 'dev-dep-tool/library/__utils__'
import { getLogger } from 'dev-dep-tool/library/logger'
import { initOutput, packOutput, publishOutput } from 'dev-dep-tool/library/commonOutput'

const PATH_ROOT = resolve(__dirname, '..')
const PATH_OUTPUT = resolve(__dirname, '../output-gitignore')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)
const execOptionRoot = { cwd: fromRoot(), stdio: argvFlag('quiet') ? [ 'ignore', 'ignore' ] : 'inherit', shell: true }

runMain(async (logger) => {
  const { padLog } = logger

  const packageJSON = await initOutput({ fromRoot, fromOutput, logger, copyPathList: [] })

  if (!argvFlag('pack')) return

  padLog(`build library`)
  execSync('npm run build-library', execOptionRoot)

  const pathPackagePack = await packOutput({ fromRoot, fromOutput, logger })
  await publishOutput({ flagList: process.argv, packageJSON, pathPackagePack, extraArgs: [ '--access', 'public' ], logger })
}, getLogger(process.argv.slice(2).join('+'), argvFlag('quiet')))
