import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'admin_passcode' } })
    const passcode = setting?.value ?? 'ADMIN2099'
    return Response.json({ valid: code?.trim() === passcode.trim() })
  } catch {
    return Response.json({ valid: false })
  }
}
