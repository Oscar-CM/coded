import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now     = new Date()
    const todayStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart   = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 6)
    const monthStart  = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalVisits, todayVisits, weekVisits, monthVisits,
      allVisits,
      openMessages, totalMessages,
      pendingOrders, confirmedOrders, revenueData,
      topProducts, lowStock,
    ] = await Promise.all([
      prisma.pageVisit.count(),
      prisma.pageVisit.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.pageVisit.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.pageVisit.count({ where: { createdAt: { gte: monthStart } } }),

      // Last 30 days for charts
      prisma.pageVisit.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } },
        select: { createdAt: true, country: true, path: true },
        orderBy: { createdAt: 'desc' },
      }),

      prisma.contactMessage.count({ where: { status: 'open' } }),
      prisma.contactMessage.count(),

      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'confirmed' } }),
      prisma.order.aggregate({ _sum: { amount: true }, where: { status: 'confirmed' } }),

      // Top 5 products by order count
      prisma.product.findMany({
        include: { _count: { select: { orders: true } }, category: { select: { name: true } } },
        orderBy: { orders: { _count: 'desc' } },
        take: 5,
      }),

      // Low stock products
      prisma.product.findMany({
        where: { amountIn: { gt: 0, lte: 5 }, status: { not: 'out_of_stock' } },
        select: { name: true, amountIn: true, symbol: true },
        orderBy: { amountIn: 'asc' },
        take: 5,
      }),
    ])

    // Build daily visit counts (last 7 days)
    const daily: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart); d.setDate(d.getDate() - i)
      daily[d.toISOString().slice(0, 10)] = 0
    }
    allVisits.forEach(v => {
      const key = v.createdAt.toISOString().slice(0, 10)
      if (key in daily) daily[key] = (daily[key] ?? 0) + 1
    })

    // Country breakdown
    const countryMap: Record<string, number> = {}
    allVisits.forEach(v => {
      const c = v.country || 'Unknown'
      countryMap[c] = (countryMap[c] ?? 0) + 1
    })
    const countries = Object.entries(countryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }))

    // Top pages
    const pageMap: Record<string, number> = {}
    allVisits.forEach(v => { pageMap[v.path] = (pageMap[v.path] ?? 0) + 1 })
    const topPages = Object.entries(pageMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([path, count]) => ({ path, count }))

    return Response.json({
      visits: { total: totalVisits, today: todayVisits, week: weekVisits, month: monthVisits, daily, countries, topPages },
      messages: { open: openMessages, total: totalMessages },
      orders: { pending: pendingOrders, confirmed: confirmedOrders, revenue: revenueData._sum.amount ?? 0 },
      topProducts: topProducts.map(p => ({ id: p.id, name: p.name, symbol: p.symbol, category: p.category.name, orders: p._count.orders })),
      lowStock,
    })
  } catch (e) {
    console.error(e)
    return Response.json({ visits: { total: 0, today: 0, week: 0, month: 0, daily: {}, countries: [], topPages: [] }, messages: { open: 0, total: 0 }, orders: { pending: 0, confirmed: 0, revenue: 0 }, topProducts: [], lowStock: [] })
  }
}
