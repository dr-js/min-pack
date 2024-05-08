const { join } = require('node:path')

const { setTimeoutAsync } = require('@dr-js/core/library/common/time.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')
const { TFJS } = require('./output-gitignore/')

runKit(async (kit) => {
  // console.log(TFJS)
  TFJS.env.localModelPath = join(__dirname, 'tf-models-gitignore/')
  TFJS.env.allowRemoteModels = false
  const extractor = await TFJS.pipeline('feature-extraction', 'Xenova/jina-embeddings-v2-base-zh', { quantized: true })

  kit.log(new Date().toISOString(), 'extractor')

  let index = 999
  while (index--) {
    // Compute sentence embeddings
    const texts = [ 'How is the weather today?', '今天天气怎么样?' ]
    const output = await extractor(texts, { pooling: 'mean', normalize: true })
    kit.log(new Date().toISOString(), 'output')
    // console.log(output)
    // Tensor {
    //    dims: [2, 768],
    //    type: 'float32',
    //    data: Float32Array(1536)[...],
    //    size: 1536
    // }

    // Compute cosine similarity between the two embeddings
    const score = TFJS.cos_sim(output[ 0 ].data, output[ 1 ].data)
    kit.log(new Date().toISOString(), 'score', score) // 0.7061612582768001

    await setTimeoutAsync(200)
  }
})
