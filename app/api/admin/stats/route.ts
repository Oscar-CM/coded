import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [products, categories, inStock, almostOut, outOfStock, totalOrders, pendingOrders, revenue] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.product.count({ where: { status: 'in_stock' } }),
      prisma.product.count({ where: { status: 'almost_out' } }),
      prisma.product.count({ where: { status: 'out_of_stock' } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.aggregate({ _sum: { amount: true }, where: { status: 'confirmed' } }),
    ])
    return Response.json({
      products, categories, inStock, almostOut, outOfStock,
      totalOrders, pendingOrders,
      revenue: revenue._sum.amount ?? 0,
    })
  } catch {
    return Response.json({ products: 0, categories: 0, inStock: 0, almostOut: 0, outOfStock: 0, totalOrders: 0, pendingOrders: 0, revenue: 0 })
  }
}
