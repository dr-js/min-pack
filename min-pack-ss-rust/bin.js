#!/usr/bin/env node

const RUNTIME = `${process.platform}-${process.arch}`
if (![ 'linux-x64', 'linux-arm64' ].includes(RUNTIME)) {
  console.error(`bad RUNTIME: ${RUNTIME}`)
  process.exit(-1)
}

const { resolve } = require('node:path')
const { spawnSync } = require('node:child_process')
const [
  , // node
  , // script
  ...extraArgs
] = process.argv
spawnSync(resolve(__dirname, `ssservice-${RUNTIME}`), extraArgs, { stdio: 'inherit' })
