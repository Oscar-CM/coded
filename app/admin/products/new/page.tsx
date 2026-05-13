'use client'

export const dynamic = 'force-dynamic'

import ProductForm from '../_components/ProductForm'

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="border-b border-[#3a0000] pb-4">
        <h1 className="text-[#ff2222] font-bold text-lg tracking-widest">NEW ASSET</h1>
        <p className="text-[#4a3030] text-xs">Create a new digital asset listing</p>
      </div>
      <ProductForm />
    </div>
  )
}
