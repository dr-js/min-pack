const { runKit } = require('@dr-js/core/library/node/kit.js')

const { minifyFileWithTerser, getTerserOption } = require('@dr-js/dev/library/minify.js')
const { compileWithWebpack, commonFlag } = require('@dr-js/dev/library/webpack.js')

runKit(async (kit) => {
  const { mode, isProduction, isWatch, profileOutput, getCommonWebpackConfig } = await commonFlag({ kit })

  const config = getCommonWebpackConfig(({
    // entry: { index: kit.fromRoot('build.webpack-index.js') },
    entry: { index: kit.fromRoot('node_modules/turndown/lib/turndown.es.js') },
    output: { path: kit.fromOutput(), filename: 'index.mjs', library: { type: 'module' } },
    experiments: { outputModule: true }
  }))

  kit.padLog(`compile with webpack mode: ${mode}, isWatch: ${Boolean(isWatch)}`)
  await compileWithWebpack({ config, isWatch, profileOutput, kit })

  isProduction && !isWatch && kit.padLog('minify with terser')
  isProduction && !isWatch && await minifyFileWithTerser({ filePath: kit.fromOutput('index.mjs'), option: getTerserOption({ isReadable: true }), kit })
}, { title: 'build.webpack' })
