#!/usr/bin/env node
process.env.npm_config_update_notifier = 'false' // https://docs.npmjs.com/cli/v6/using-npm/config#update-notifier
require('./node_modules/npm6/bin/npm-cli.js')
