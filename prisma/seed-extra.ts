import 'dotenv/config'
import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'

const url = 'file:' + path.join(process.cwd(), 'dev.db').replace(/\\/g, '/')
const adapter = new PrismaLibSql({ url })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.siteSetting.upsert({
    where: { key: 'admin_passcode' },
    update: {},
    create: { key: 'admin_passcode', value: 'ADMIN2099' },
  })
  console.log('✓ admin_passcode seeded')
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); process.exit(1) })
