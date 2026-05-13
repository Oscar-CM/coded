'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getProducts(filters?: {
  categorySlug?: string
  rarity?: string
  status?: string
  featured?: boolean
  search?: string
}) {
  const where: Record<string, unknown> = {}

  if (filters?.categorySlug && filters.categorySlug !== 'all') {
    where.category = { slug: filters.categorySlug }
  }
  if (filters?.rarity && filters.rarity !== 'all') {
    where.rarity = filters.rarity
  }
  if (filters?.status && filters.status !== 'all') {
    where.status = filters.status
  }
  if (filters?.featured) {
    where.featured = true
  }
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { description: { contains: filters.search } },
    ]
  }

  return prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true, orders: { orderBy: { createdAt: 'desc' }, take: 10 } },
  })
}

export async function createProduct(data: {
  name: string
  description: string
  symbol: string
  categoryId: string
  amountIn: number
  sellingPrice: number
  potentialEarnings?: number | null
  status: string
  rarity: string
  cardBg: string
  cardAccent: string
  featured?: boolean
}) {
  const product = await prisma.product.create({ data, include: { category: true } })
  revalidatePath('/dashboard')
  revalidatePath('/admin/products')
  return product
}

export async function updateProduct(id: string, data: {
  name?: string
  description?: string
  symbol?: string
  categoryId?: string
  amountIn?: number
  sellingPrice?: number
  potentialEarnings?: number | null
  status?: string
  rarity?: string
  cardBg?: string
  cardAccent?: string
  featured?: boolean
}) {
  const product = await prisma.product.update({
    where: { id },
    data,
    include: { category: true },
  })
  revalidatePath('/dashboard')
  revalidatePath('/admin/products')
  return product
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } })
  revalidatePath('/dashboard')
  revalidatePath('/admin/products')
}
