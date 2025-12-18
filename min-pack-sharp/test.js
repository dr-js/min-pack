const { join } = require('node:path')

const { binary } = require('@dr-js/core/library/common/format.js')
const { readBufferSync } = require('@dr-js/core/library/node/fs/File.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')
const Sharp = require('./output-gitignore/') // console.log(Sharp.versions)

runKit(async (kit) => {
  kit.log('Sharp:', JSON.stringify(Sharp.versions, null, 2))

  for (const path of [
    'test-asset/TEST_BUFFER_PNG',
    'test-asset/TEST_BUFFER_JPG',
    'test-asset/TEST_BUFFER_WEBP',
    'test-asset/TEST_BUFFER_GIF',
    'test-asset/TEST_BUFFER_SVG'
  ]) {
    kit.stepLog('TEST:', path)

    const bufferSrc = readBufferSync(join(__dirname, path))
    kit.log(`bufferSrc: ${binary(bufferSrc.byteLength)}B`)

    const { format, pages, loop, hasAlpha, autoOrient: { width, height } } = await Sharp(bufferSrc).metadata()
    kit.log('metadata:', JSON.stringify({ format, width, height, pages, loop, hasAlpha }))

    const isAnimated = format === 'gif'
    const pipeline = Sharp(bufferSrc, { autoOrient: true, animated: isAnimated }) // https://sharp.pixelplumbing.com/api-constructor#parameters
    const pipelineThumb = isAnimated ? Sharp(bufferSrc, { autoOrient: true }) : pipeline.clone()
    const [ bufferOut, bufferOutThumb ] = await Promise.all([
      await pipeline
        .png({ force: false, palette: true }) // comparable to `pngquant`
        .jpeg({ force: false, mozjpeg: true, quality: 75 }) // comparable to `cjpeg`
        .webp({ force: false, nearLossless: true, effort: 4 }) // comparable to 'cwebp' // sharp-0.34.5 286.41KiB (610ms) vs cwebp-1.2.1 287.26KiB (402ms)
        .gif({ force: false, reuse: true, dither: 0, effort: 6 }) // TODO: NOT-comparable to 'gifsicle' // sharp-0.34.5 3.69MiB (1125ms) vs gifsicle-1.92 2.32MiB (420ms)
        .toBuffer({ resolveWithObject: true }),
      await pipelineThumb
        .resize(256, 512, { fit: 'inside', withoutEnlargement: true })
        .png({ force: true, palette: true }) // comparable to `pngquant`
        .toBuffer({ resolveWithObject: true })
    ])
    kit.log(`bufferOut: ${binary(bufferOut.data.byteLength)}B`, JSON.stringify(bufferOut.info))
    kit.log(`bufferOutThumb: ${binary(bufferOutThumb.data.byteLength)}B`, JSON.stringify(bufferOutThumb.info))
  }
})

