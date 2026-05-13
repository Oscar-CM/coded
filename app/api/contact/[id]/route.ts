import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data: Record<string, string> = {}
    if (body.status     != null) data.status     = body.status
    if (body.adminNotes != null) data.adminNotes  = body.adminNotes
    const msg = await prisma.contactMessage.update({ where: { id }, data })
    return Response.json(msg)
  } catch {
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}
