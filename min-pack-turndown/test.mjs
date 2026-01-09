import { runKit } from '@dr-js/core/module/node/kit.js'
import TurndownService from './output-gitignore/index.mjs'

runKit(async (kit) => {
  // console.log(TurndownService)
  const turndownService = new TurndownService()
  const markdown = turndownService.turndown('<h1>Hello world!</h1>')
  kit.log(new Date().toISOString(), `OUTPUT: ${JSON.stringify(markdown)}`)
})
