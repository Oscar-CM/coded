'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSubCategories(categoryId?: string) {
  return prisma.subCategory.findMany({
    where: categoryId ? { categoryId } : undefined,
    orderBy: [{ categoryId: 'asc' }, { order: 'asc' }],
  })
}

export async function createSubCategory(data: {
  name: string; slug: string; icon?: string; categoryId: string; order?: number
}) {
  const sub = await prisma.subCategory.create({ data })
  revalidatePath('/dashboard')
  revalidatePath('/admin/categories')
  return sub
}

export async function updateSubCategory(id: string, data: {
  name?: string; slug?: string; icon?: string; order?: number
}) {
  const sub = await prisma.subCategory.update({ where: { id }, data })
  revalidatePath('/dashboard')
  revalidatePath('/admin/categories')
  return sub
}

export async function deleteSubCategory(id: string) {
  await prisma.subCategory.delete({ where: { id } })
  revalidatePath('/dashboard')
  revalidatePath('/admin/categories')
}
