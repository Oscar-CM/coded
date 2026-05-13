import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, subCategory: true },
    })
    if (!product) return Response.json(null, { status: 404 })
    return Response.json(product)
  } catch {
    return Response.json(null, { status: 500 })
  }
}
