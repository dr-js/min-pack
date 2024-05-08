const { runKit } = require('@dr-js/core/library/node/kit.js')
const { minifyFileWithTerser, getTerserOption } = require('@dr-js/dev/library/minify.js')
const { compileWithWebpack, commonFlag } = require('@dr-js/dev/library/webpack.js')

runKit(async (kit) => {
  const { mode, isProduction, isWatch, profileOutput, getCommonWebpackConfig } = await commonFlag({ kit })

  const config = getCommonWebpackConfig(({
    isNodeEnv: true,
    entry: { index: kit.fromRoot('build.webpack-index.js') },
    externals: { 'openai': 'openai' }, // mark "openai" as external
    output: { path: kit.fromOutput(), filename: 'index.js', library: { type: 'commonjs2' } },
    extraModuleRuleList: [ { test: /\.node$/, use: [ { loader: 'node-loader', options: { name: 'addon-[path][name].[ext]' } } ] } ]
  }))

  // TODO: NOTE: will warn: Module not found: Error: Can't resolve './lancedb.*-*.node' in '.../node_modules/@lancedb/lancedb/dist
  kit.padLog(`compile with webpack mode: ${mode}, isWatch: ${Boolean(isWatch)}`)
  await compileWithWebpack({ config, isWatch, profileOutput, kit })

  isProduction && !isWatch && kit.padLog('minify with terser')
  isProduction && !isWatch && await minifyFileWithTerser({ filePath: kit.fromOutput('index.js'), option: getTerserOption(), kit })
}, { title: 'build.webpack' })
