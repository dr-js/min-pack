import { runKit } from '@dr-js/core/module/node/kit.js'
import JSZip from './output-gitignore/index.mjs'

runKit(async (kit) => {
  // console.log(JSZip)
  const zip = new JSZip()
  zip.file('Hello.txt', 'Hello World\n')
  const img = zip.folder('images')
  img.file('smile.gif', Buffer.from('{{imgData}}').toString('base64'), { base64: true })
  const zipArrBuf = await zip.generateAsync({ type: 'arraybuffer' })
  // console.log(zipArrBuf)
  kit.log(new Date().toISOString(), `OUTPUT: ${zipArrBuf.byteLength}B`)
  {
    const zip = await JSZip.loadAsync(zipArrBuf)
    kit.log(new Date().toISOString(), `files:\n  - ${Object.keys(zip.files).join('\n  - ')}`)
  }
})
