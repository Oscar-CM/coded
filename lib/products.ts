// UI constants — types come from the generated Prisma client

export type StockStatus = 'in_stock' | 'almost_out' | 'out_of_stock'
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export const rarityColors: Record<Rarity, string> = {
  common:    '#4a5568',
  uncommon:  '#00ff41',
  rare:      '#00e5ff',
  epic:      '#bf00ff',
  legendary: '#ffd700',
}

export const statusConfig: Record<StockStatus, { label: string; color: string; bg: string }> = {
  in_stock:     { label: 'IN STOCK',    color: '#00ff41', bg: '#003b00' },
  almost_out:   { label: 'ALMOST OUT',  color: '#ff6b00', bg: '#2a1400' },
  out_of_stock: { label: 'OUT OF STOCK',color: '#ff2222', bg: '#2a0000' },
}

export const RARITY_ORDER = ['legendary', 'epic', 'rare', 'uncommon', 'common']
export const RARITY_IDX   = ['common', 'uncommon', 'rare', 'epic', 'legendary']

// DB product type (what the API + server actions return)
export interface DbProduct {
  id: string
  name: string
  description: string
  symbol: string
  categoryId: string
  category: { id: string; name: string; slug: string; icon: string }
  amountIn: number
  sellingPrice: number
  potentialEarnings: number | null
  status: string
  rarity: string
  cardBg: string
  cardAccent: string
  featured: boolean
  featuredOrder: number | null
  subCategoryId: string | null
  subCategory: { id: string; name: string; slug: string; icon: string } | null
  createdAt: string | Date
  updatedAt: string | Date
}
