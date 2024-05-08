import * as LDB_BASE from '@lancedb/lancedb'
import * as LDB_NATIVE from '@lancedb/lancedb/dist/native.js'
import * as AA from 'apache-arrow'

const LDB = { ...LDB_BASE, ...LDB_NATIVE } // FIX: merge, `native.*` export exists in TS but missing in JS

export { LDB, AA }
