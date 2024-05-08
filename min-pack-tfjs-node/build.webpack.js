const { runKit } = require('@dr-js/core/library/node/kit.js')
const { modifyCopy, modifyDeleteForce } = require('@dr-js/core/library/node/fs/Modify.js')

const { minifyFileWithTerser, getTerserOption } = require('@dr-js/dev/library/minify.js')
const { compileWithWebpack, commonFlag } = require('@dr-js/dev/library/webpack.js')

runKit(async (kit) => {
  const { mode, isProduction, isWatch, profileOutput, getCommonWebpackConfig } = await commonFlag({ kit })

  const config = getCommonWebpackConfig(({
    isNodeEnv: true,
    entry: { index: kit.fromRoot('build.webpack-index.js') },
    externals: { 'sharp': 'var Error' }, // mark "sharp" as external // TODO: NOTE: use 'Error' to skip init check in '@xenova/transformers/src/utils/image.js'
    output: { path: kit.fromOutput(), filename: 'index.js', library: { type: 'commonjs2' } },
    extraModuleRuleList: [ { test: /\.node$/, use: [ { loader: 'node-loader', options: { name: 'addon-[path][name].[ext]' } } ] } ]
  }))

  kit.padLog(`compile with webpack mode: ${mode}, isWatch: ${Boolean(isWatch)}`)
  await compileWithWebpack({ config, isWatch, profileOutput, kit })

  isProduction && !isWatch && kit.padLog('minify with terser')
  isProduction && !isWatch && await minifyFileWithTerser({ filePath: kit.fromOutput('index.js'), option: getTerserOption(), kit })

  kit.padLog('copy extra addon files')
  await modifyCopy(
    kit.fromRoot('node_modules/onnxruntime-node/bin/napi-v3/'),
    kit.fromOutput('addon-node_modules/onnxruntime-node/bin/napi-v3/')
  )

  kit.padLog('drop non-linux addon')
  await modifyDeleteForce(kit.fromOutput('addon-node_modules/onnxruntime-node/bin/napi-v3/darwin/'))
  await modifyDeleteForce(kit.fromOutput('addon-node_modules/onnxruntime-node/bin/napi-v3/win32/'))
}, { title: 'build.webpack' })
