'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createOrder(data: {
  email: string
  productId: string
  amount: number
  currency: string
  txHash?: string
}) {
  const order = await prisma.order.create({
    data,
    include: { product: true },
  })
  revalidatePath('/admin/orders')
  return order
}

export async function updateOrderStatus(id: string, status: string) {
  const order = await prisma.order.update({
    where: { id },
    data: { status },
  })
  revalidatePath('/admin/orders')
  return order
}

export async function getOrders() {
  return prisma.order.findMany({
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getOrderStats() {
  const [total, pending, confirmed, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.order.count({ where: { status: 'confirmed' } }),
    prisma.order.aggregate({ _sum: { amount: true }, where: { status: 'confirmed' } }),
  ])
  return { total, pending, confirmed, revenue: revenue._sum.amount ?? 0 }
}
