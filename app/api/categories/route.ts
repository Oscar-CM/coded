import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } })
    return Response.json(categories)
  } catch {
    return Response.json([], { status: 200 })
  }
}
