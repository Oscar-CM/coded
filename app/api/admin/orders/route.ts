import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return Response.json(orders)
  } catch {
    return Response.json([])
  }
}
