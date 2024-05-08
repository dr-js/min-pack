const { join } = require('node:path')

const { runKit } = require('@dr-js/core/library/node/kit.js')
const { LDB, AA } = require('./output-gitignore/')
const { setTimeoutAsync } = require('@dr-js/core/library/common/time.js')

runKit(async (kit) => {
  const uri = join(__dirname, 'test-db-gitignore/')
  const db = await LDB.connect(uri)
  kit.log(new Date().toISOString(), 'connect')

  const tbl = await db.createTable(
    'myTable',
    [
      { vector: [ 3.1, 4.1 ], item: 'foo', price: 10.0 },
      { vector: [ 5.9, 26.5 ], item: 'bar', price: 20.0 }
    ],
    { writeMode: LDB.WriteMode.Overwrite }
  ).catch(console.error) || await db.openTable('myTable')
  kit.log(new Date().toISOString(), 'createTable')

  // const { Schema, Field, Float32, FixedSizeList, Int32, Float16, Utf8 } = AA
  // const schema = new Schema([
  //   new Field('id', new Int32()),
  //   new Field('name', new Utf8())
  // ])
  // const empty_tbl = await db.createTable({ name: 'empty_table', schema })

  let index = 999
  while (index--) {
    const newData = Array.from({ length: 500 }, (_, i) => ({
      vector: [ i, i + 1 ],
      item: 'fizz',
      price: i * 0.1
    }))
    await tbl.add(newData)
    kit.log(new Date().toISOString(), 'add')

    // console.log(tbl)
    for await (const batch of tbl.query()
      .nearestTo([ 100, 100 ])
      .limit(10)) {
      console.log(`batch ${batch}`)
    }
    kit.log(new Date().toISOString(), 'query')
    // const query = await tbl.search([ 100, 100 ]).limit(2).execute()
    await tbl.createIndex('vector')
    kit.log(new Date().toISOString(), 'createIndex')

    await setTimeoutAsync(200)
  }
})
