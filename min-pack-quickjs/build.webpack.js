const { runKit } = require('@dr-js/core/library/node/kit.js')
const { editText } = require('@dr-js/core/library/node/fs/File.js')
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
  isProduction && !isWatch && await minifyFileWithTerser({ filePath: kit.fromOutput('index.js'), option: getTerserOption({ ecma: 5 }), kit })

  // HACK: "bug fix" for terser:
  //   terser will convert `\xBE` to `¾`, this is valid UTF-8, but for ASCII encoding like Latin-1 this will be 2 char `Â¾`,
  //   or quote AI: the character Â¾ (Unicode U+00BE) is being mangled into two characters: Ã‚Â¾ (U+00C2 and U+00BE). This is a classic UTF-8 misinterpreted as ISO-8859-1 (Latin-1) error.
  //
  //   in Browser, when this js script is used without encoding marking like `<script src="##.js" charset="utf-8"></script>` or `Content-Type: application/javascript; charset=utf-8`
  //   this will raise error: `Aborted(CompileError: WebAssembly.instantiate(): section was shorter than expected size (106306 bytes expected, 830 decoded) @+842)`
  //
  //   for now we don't want the extra UTF-8 limit, so we revert what terser did for charCode >= 0x80
  //
  //   sample test script:
  //   {
  //     const simp_good = `\0asm\0\0\0\xBEi\`\x7F\x7F\0\``
  //     const simp_bad_ = '\0asm\0\0\0¾i`\0`'
  //     console.log('! simp_good', JSON.stringify(simp_good))
  //     console.log('! simp_bad_', JSON.stringify(simp_bad_))
  //     console.log('! simp_good.length', simp_good.length)
  //     console.log('! simp_bad_.length', simp_bad_.length)
  //     console.log('! simp_good === simp_bad_', simp_good === simp_bad_)
  //     for (let i = 0; i < simp_good.length; i++) {
  //       simp_good.charAt(i) !== simp_bad_.charAt(i) && console.log(`! diff at #${i}, good: ${simp_good.charAt(i)} ${simp_good.charCodeAt(i)}, bad_: ${simp_bad_.charAt(i)} ${simp_bad_.charCodeAt(i)}`)
  //     }
  //   }
  isProduction && !isWatch && await editText((text) => {
    for (const charCode of Array.from({ length: 0xFF - 0x80 + 1 }, (_, i) => 0x80 + i)) { // [0x80,0x81,...,0xFE,0xFF]
      text = text.replaceAll(String.fromCharCode(charCode), `\\x${charCode.toString(16).padStart(2, '0').toUpperCase()}`)
    }
    return text
  }, kit.fromOutput('index.js'))
}, { title: 'build.webpack' })
