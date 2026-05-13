import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Check root dev.db
const rootUrl = 'file:' + path.join(__dirname, '..', 'dev.db').replace(/\\/g, '/')
console.log('Root URL:', rootUrl)
const c1 = createClient({ url: rootUrl })
const r1 = await c1.execute("SELECT name FROM sqlite_master WHERE type='table'")
console.log('Root tables:', r1.rows.map(r => r.name))
