import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { createHash } from 'crypto'

function parseCountry(req: NextRequest): string {
  // Vercel / Cloudflare inject geo headers
  const country = req.headers.get('x-vercel-ip-country')
    || req.headers.get('cf-ipcountry')
    || req.headers.get('x-country')
  if (country && country !== 'XX') return country

  // Fall back to Accept-Language (e.g. "en-US,en;q=0.9" → "US")
  const lang = req.headers.get('accept-language') ?? ''
  const match = lang.match(/[a-z]{2}-([A-Z]{2})/i)
  if (match) return match[1].toUpperCase()

  return 'Unknown'
}

function hashIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : '0.0.0.0'
  // Store a one-way hash for privacy
  return createHash('sha256').update(ip + 'cl_salt').digest('hex').slice(0, 16)
}

export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json()
    const ua = req.headers.get('user-agent') ?? ''
    // Skip bots
    if (/bot|crawl|spider|slurp|facebookexternalhit/i.test(ua)) return Response.json({ ok: true })

    await prisma.pageVisit.create({
      data: {
        path:      path ?? '/',
        country:   parseCountry(req),
        language:  (req.headers.get('accept-language') ?? '').split(',')[0].split(';')[0].trim(),
        userAgent: ua.slice(0, 200),
        referrer:  (req.headers.get('referer') ?? '').slice(0, 200),
        ipHash:    hashIp(req),
      },
    })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false })
  }
}
