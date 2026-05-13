import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const catSlug = req.nextUrl.searchParams.get('cat')   // filter by category slug
    const catId   = req.nextUrl.searchParams.get('catId') // filter by category id

    const where = catSlug ? { category: { slug: catSlug } }
                : catId   ? { categoryId: catId }
                : {}

    const subs = await prisma.subCategory.findMany({
      where,
      include: { category: { select: { slug: true } } },
      orderBy: [{ category: { order: 'asc' } }, { order: 'asc' }],
    })
    return Response.json(subs)
  } catch {
    return Response.json([])
  }
}
