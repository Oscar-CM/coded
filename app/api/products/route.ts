import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const cat = searchParams.get('cat')
    const rarity = searchParams.get('rarity')
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (cat && cat !== 'all') where.category = { slug: cat }
    if (rarity && rarity !== 'all') where.rarity = rarity
    if (status && status !== 'all') where.status = status
    if (featured === '1') where.featured = true
    if (search) where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ]

    const products = await prisma.product.findMany({
      where,
      include: { category: true, subCategory: true },
      orderBy: { createdAt: 'desc' },
    })
    return Response.json(products)
  } catch {
    return Response.json([], { status: 200 })
  }
}
