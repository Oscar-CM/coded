'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { order: 'asc' } })
}

export async function createCategory(data: {
  name: string
  slug: string
  icon: string
  description?: string
  order?: number
}) {
  const cat = await prisma.category.create({ data })
  revalidatePath('/dashboard')
  revalidatePath('/admin/categories')
  return cat
}

export async function updateCategory(id: string, data: {
  name?: string
  slug?: string
  icon?: string
  description?: string
  order?: number
}) {
  const cat = await prisma.category.update({ where: { id }, data })
  revalidatePath('/dashboard')
  revalidatePath('/admin/categories')
  return cat
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } })
  revalidatePath('/dashboard')
  revalidatePath('/admin/categories')
}
