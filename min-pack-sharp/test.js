const { join } = require('node:path')

const { readBufferSync } = require('@dr-js/core/library/node/fs/File.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')
const Sharp = require('./output-gitignore/')

runKit(async (kit) => {
  // console.log(Sharp)
  const MAX_ASSET_IMAGE_THUMB_WIDTH = 158 // px
  const MAX_ASSET_IMAGE_THUMB_HEIGHT = 4 * MAX_ASSET_IMAGE_THUMB_WIDTH // px

  const SHARP_OPTION = {} // just use default: https://sharp.pixelplumbing.com/api-constructor#parameters
  const SHARP_THUMB_RESIZE_OPTION = { fit: 'inside', withoutEnlargement: true }

  for (const path of [
    'test-asset/TEST_BUFFER_GIF',
    'test-asset/TEST_BUFFER_JPG',
    'test-asset/TEST_BUFFER_PNG',
    'test-asset/TEST_BUFFER_SVG',
    'test-asset/TEST_BUFFER_WEBP'
  ]) {
    kit.stepLog('TEST:', path)

    const imageBuffer = readBufferSync(join(__dirname, path))
    kit.log('imageBuffer:', imageBuffer.byteLength)

    const bufferImg = await Sharp(imageBuffer, SHARP_OPTION)
      .toBuffer()
    kit.log('bufferImg:', bufferImg.byteLength)

    const bufferImgThumb = await Sharp(imageBuffer, SHARP_OPTION)
      .resize(MAX_ASSET_IMAGE_THUMB_WIDTH, MAX_ASSET_IMAGE_THUMB_HEIGHT, SHARP_THUMB_RESIZE_OPTION)
      .toFormat('png')
      .toBuffer()
    kit.log('bufferImgThumb:', bufferImgThumb.byteLength)
  }
})

