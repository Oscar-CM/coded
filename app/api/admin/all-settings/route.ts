import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const rows = await prisma.siteSetting.findMany()
    return Response.json(Object.fromEntries(rows.map(r => [r.key, r.value])))
  } catch {
    return Response.json({})
  }
}
