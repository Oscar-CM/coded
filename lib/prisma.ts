import { PrismaClient } from '@/lib/generated/prisma'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'

function createPrismaClient() {
  const url = 'file:' + path.join(process.cwd(), 'dev.db').replace(/\\/g, '/')
  const adapter = new PrismaLibSql({ url })
  return new PrismaClient({ adapter })
}

// In dev, never reuse a cached client — stale instances lose newly-migrated models.
// In production, use a singleton to avoid exhausting connections.
let _client: PrismaClient | null = null

export function getPrisma(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    const g = globalThis as unknown as { prisma?: PrismaClient }
    if (!g.prisma) g.prisma = createPrismaClient()
    return g.prisma
  }
  // Dev: reuse within one module lifetime but never persist across hot reloads
  if (!_client) _client = createPrismaClient()
  return _client
}

export const prisma = getPrisma()
