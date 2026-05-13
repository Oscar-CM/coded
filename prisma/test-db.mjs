import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'dev.db')
const url = 'file:' + dbPath.replace(/\\/g, '/')
console.log('Testing URL:', url)

const client = createClient({ url })
const result = await client.execute('SELECT 1 as test')
console.log('DB connection OK:', result.rows)
