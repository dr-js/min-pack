#!/usr/bin/env node
process.env.npm_config_audit = 'false' // https://docs.npmjs.com/cli/v6/using-npm/config#audit
process.env.npm_config_fund = 'false' // https://docs.npmjs.com/cli/v6/using-npm/config#fund
process.env.npm_config_update_notifier = 'false' // https://docs.npmjs.com/cli/v6/using-npm/config#update-notifier
require('./node_modules/npm6/bin/npm-cli.js')
