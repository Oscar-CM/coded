import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

const PRIORITIES: Record<string, string> = {
  payment_issue:  'urgent',
  technical:      'high',
  refund:         'high',
  report_abuse:   'urgent',
  general:        'normal',
  partnership:    'low',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, category, subject, message } = body
    if (!name || !email || !category || !subject || !message) {
      return Response.json({ error: 'All fields are required.' }, { status: 400 })
    }
    const msg = await prisma.contactMessage.create({
      data: {
        name:     name.trim().slice(0, 100),
        email:    email.trim().toLowerCase().slice(0, 200),
        category: category.trim(),
        subject:  subject.trim().slice(0, 200),
        message:  message.trim().slice(0, 2000),
        priority: PRIORITIES[category] ?? 'normal',
      },
    })
    return Response.json({ ok: true, id: msg.id })
  } catch {
    return Response.json({ error: 'Failed to submit. Try again.' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return Response.json(messages)
  } catch {
    return Response.json([])
  }
}
