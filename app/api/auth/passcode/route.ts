import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'store_passcode' } })
    const passcode = setting?.value ?? 'CODEDLOGS'
    return Response.json({ valid: code?.trim().toUpperCase() === passcode.trim().toUpperCase() })
  } catch {
    return Response.json({ valid: false })
  }
}
