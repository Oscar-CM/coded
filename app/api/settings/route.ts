import { prisma } from '@/lib/prisma'

const PUBLIC_KEYS = ['site_name', 'site_tagline', 'banner_enabled', 'banner_message', 'banner_color', 'currency_symbol', 'support_email']

export async function GET() {
  try {
    const rows = await prisma.siteSetting.findMany({ where: { key: { in: PUBLIC_KEYS } } })
    return Response.json(Object.fromEntries(rows.map(r => [r.key, r.value])))
  } catch {
    return Response.json({})
  }
}
