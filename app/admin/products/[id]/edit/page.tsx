'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ProductForm from '../../_components/ProductForm'
import { type DbProduct } from '@/lib/products'

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<DbProduct | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then((p: DbProduct) => { setProduct(p); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-[#4a3030] text-xs tracking-widest">LOADING...</div>
  if (!product) return <div className="text-[#ff2222] text-xs">Product not found.</div>

  return (
    <div className="flex flex-col gap-5">
      <div className="border-b border-[#3a0000] pb-4">
        <h1 className="text-[#ff2222] font-bold text-lg tracking-widest">EDIT ASSET</h1>
        <p className="text-[#4a3030] text-xs">{product.name}</p>
      </div>
      <ProductForm product={product} />
    </div>
  )
}
