'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSetting.findMany()
  return Object.fromEntries(rows.map(r => [r.key, r.value]))
}

export async function getPublicSettings(): Promise<Record<string, string>> {
  const publicKeys = ['site_name', 'site_tagline', 'banner_enabled', 'banner_message', 'banner_color', 'currency_symbol', 'support_email']
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: publicKeys } } })
  return Object.fromEntries(rows.map(r => [r.key, r.value]))
}

export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key } })
  return row?.value ?? null
}

export async function updateSettings(data: Record<string, string>) {
  // SQLite allows only one write at a time — run sequentially, not in parallel
  for (const [key, value] of Object.entries(data)) {
    await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } })
  }
  revalidatePath('/dashboard')
  revalidatePath('/admin/settings')
}
