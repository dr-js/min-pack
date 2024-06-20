const { runKit } = require('@dr-js/core/library/node/kit.js')

const { minifyFileWithTerser, getTerserOption } = require('@dr-js/dev/library/minify.js')
const { compileWithWebpack, commonFlag } = require('@dr-js/dev/library/webpack.js')

runKit(async (kit) => {
  const { mode, isProduction, isWatch, profileOutput, getCommonWebpackConfig } = await commonFlag({ kit })

  const config = getCommonWebpackConfig(({
    entry: { index: kit.fromRoot('build.webpack-index.js') },
    externals: { fs: 'var Error', path: 'var Error' }, // TODO: NOTE: in `emscripten-module.cjs` to load wasm file, should not need
    output: { path: kit.fromOutput(), filename: 'index.js', library: { name: 'QuickJS', type: 'umd' }, globalObject: 'this', asyncChunks: false }
  }))

  kit.padLog(`compile with webpack mode: ${mode}, isWatch: ${Boolean(isWatch)}`)
  await compileWithWebpack({ config, isWatch, profileOutput, kit })

  isProduction && !isWatch && kit.padLog('minify with terser')
  isProduction && !isWatch && await minifyFileWithTerser({ filePath: kit.fromOutput('index.js'), option: getTerserOption(), kit })
}, { title: 'build.webpack' })
