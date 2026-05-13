'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { deleteProduct, updateProduct } from '@/lib/actions/products'
import { type DbProduct, statusConfig, type StockStatus } from '@/lib/products'

type InlineEdit = { id: string; field: 'amountIn' | 'sellingPrice' | 'featuredOrder'; value: string }

export default function AdminProductsPage() {
  const [products, setProducts] = useState<DbProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [inlineEdit, setInlineEdit] = useState<InlineEdit | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState('in_stock')
  const [saving, setSaving] = useState(false)

  // DnD state
  const dragId = useRef<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetch('/api/products').then(r => r.json())
    setProducts(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // ── Inline editing ────────────────────────────────────────────────────────
  async function commitInline() {
    if (!inlineEdit) return
    const raw = inlineEdit.value
    const val = inlineEdit.field === 'sellingPrice' ? parseFloat(raw) : parseInt(raw, 10)
    if (isNaN(val)) { setInlineEdit(null); return }
    await updateProduct(inlineEdit.id, { [inlineEdit.field]: val })
    setInlineEdit(null)
    await load()
  }

  async function handleStatusChange(id: string, status: string) {
    await updateProduct(id, { status })
    await load()
  }

  async function handleFeaturedToggle(p: DbProduct) {
    const nextFeatured = !p.featured
    const maxOrder = Math.max(0, ...products.filter(x => x.featured && x.featuredOrder != null).map(x => x.featuredOrder!))
    await updateProduct(p.id, {
      featured: nextFeatured,
      featuredOrder: nextFeatured ? maxOrder + 1 : null,
    })
    await load()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return
    try { await deleteProduct(id); await load() } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Error') }
  }

  async function handleBulkStatus() {
    if (selected.size === 0) return
    for (const id of selected) await updateProduct(id, { status: bulkStatus })
    setSelected(new Set()); await load()
  }

  function toggleSelect(id: string) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  // ── Drag-and-drop (featured reorder) ─────────────────────────────────────
  function handleDragStart(e: React.DragEvent, id: string) {
    dragId.current = id
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverId(id)
  }

  function handleDragLeave() { setDragOverId(null) }
  function handleDragEnd()   { dragId.current = null; setDragOverId(null) }

  async function handleDrop(targetId: string) {
    const fromId = dragId.current
    setDragOverId(null)
    dragId.current = null
    if (!fromId || fromId === targetId) return

    const sortedFeatured = [...products]
      .filter(p => p.featured)
      .sort((a, b) => (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999))

    const ids = sortedFeatured.map(p => p.id)
    const fromIdx = ids.indexOf(fromId)
    const toIdx   = ids.indexOf(targetId)
    if (fromIdx === -1 || toIdx === -1) return

    const reordered = [...ids]
    reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, fromId)

    setSaving(true)
    // SQLite requires sequential writes
    for (let i = 0; i < reordered.length; i++) {
      await updateProduct(reordered[i], { featuredOrder: i + 1 })
    }
    setSaving(false)
    await load()
  }

  // ── Derived lists ─────────────────────────────────────────────────────────
  const filtered = products.filter(p =>
    !search.trim() || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.name.toLowerCase().includes(search.toLowerCase())
  )
  const featured    = [...filtered].filter(p => p.featured).sort((a, b) => (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999))
  const notFeatured = filtered.filter(p => !p.featured)

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#3a0000] pb-4">
        <div>
          <h1 className="text-[#ff2222] font-bold text-lg tracking-widest">PRODUCTS</h1>
          <p className="text-[#4a3030] text-xs">{products.length} total · {products.filter(p => p.featured).length} featured</p>
        </div>
        <Link href="/admin/products/new"
          className="border border-[#ff2222] text-[#ff2222] hover:bg-[#ff2222] hover:text-black px-4 py-1.5 text-xs tracking-widest transition-all font-bold">
          + NEW ASSET
        </Link>
      </div>

      {/* Search + bulk */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2 border border-[#3a0000] bg-[#0a0000] px-3 py-2 flex-1">
          <span className="text-[#4a3030] text-xs">&gt;_</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="search products..."
            className="flex-1 bg-transparent text-[#ff2222] text-xs outline-none placeholder:text-[#1a0000]" />
          {search && <button onClick={() => setSearch('')} className="text-[#ff2222] text-xs">✕</button>}
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-[#4a3030]">{selected.size} selected</span>
            <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}
              className="bg-[#0a0000] border border-[#3a0000] text-[#ff2222] text-[10px] px-2 py-1 outline-none">
              <option value="in_stock">IN STOCK</option>
              <option value="almost_out">ALMOST OUT</option>
              <option value="out_of_stock">OUT OF STOCK</option>
            </select>
            <button onClick={handleBulkStatus}
              className="border border-[#ff2222] text-[#ff2222] hover:bg-[#ff2222] hover:text-black px-3 py-1 transition-all text-[10px]">
              APPLY
            </button>
            <button onClick={() => setSelected(new Set())} className="text-[#4a3030] hover:text-[#ff2222]">✕</button>
          </div>
        )}
      </div>

      {loading ? <span className="text-[#4a3030] text-xs tracking-widest">LOADING...</span> : (<>

        {/* ── Featured with Drag-and-Drop ── */}
        {featured.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 border-b border-[#1a0000] pb-1">
              <span className="text-[#ff6b00] text-[9px] tracking-widest font-bold uppercase">★ FEATURED ORDER</span>
              <span className="text-[#3a0000] text-[9px]">— drag rows to reorder</span>
              {saving && <span className="text-[#ff6b00] text-[9px] animate-pulse">SAVING...</span>}
            </div>

            <div className="flex flex-col gap-0 border border-[#1a0000]">
              {featured.map(p => (
                <div key={p.id}
                  draggable
                  onDragStart={e => handleDragStart(e, p.id)}
                  onDragOver={e => handleDragOver(e, p.id)}
                  onDragLeave={handleDragLeave}
                  onDragEnd={handleDragEnd}
                  onDrop={() => handleDrop(p.id)}
                  className={[
                    'flex items-center gap-3 px-3 py-2.5 border-b border-[#0f0000] transition-all cursor-grab active:cursor-grabbing select-none',
                    dragOverId === p.id ? 'bg-[#1a0800] border-t-2 border-t-[#ff6b00]' : 'hover:bg-[#0a0000]',
                  ].join(' ')}>
                  {/* Drag handle */}
                  <span className="text-[#3a0000] hover:text-[#ff6b00] text-base shrink-0" title="Drag to reorder">⠿</span>

                  {/* Order badge */}
                  <span className="text-[#ff6b00] text-[10px] font-bold w-5 shrink-0 tabular-nums">#{p.featuredOrder}</span>

                  {/* Name */}
                  <span className="text-base shrink-0">{p.symbol}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[#ff2222] text-xs font-bold truncate block">{p.name}</span>
                    <span className="text-[#4a3030] text-[9px]">{p.category.icon} {p.category.name}</span>
                  </div>

                  {/* Price */}
                  <span className="text-[#ffd700] text-xs font-bold hidden sm:block">${p.sellingPrice.toFixed(2)}</span>

                  {/* Status */}
                  <span className="text-[8px] font-bold tracking-wider hidden sm:block"
                    style={{ color: (statusConfig[p.status as StockStatus] ?? statusConfig.in_stock).color }}>
                    {(statusConfig[p.status as StockStatus] ?? statusConfig.in_stock).label}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => handleFeaturedToggle(p)}
                      className="text-[9px] text-[#ff6b00] border border-[#ff6b0033] px-1.5 py-0.5 hover:bg-[#1a0800]" title="Remove from featured">
                      ★ UNFEATURE
                    </button>
                    <Link href={`/admin/products/${p.id}/edit`}
                      className="text-[10px] text-[#4a3030] hover:text-[#ff2222] border border-[#1a0000] hover:border-[#ff2222] px-2 py-0.5">
                      EDIT
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── All other products ── */}
        <div className="flex flex-col gap-0 border border-[#1a0000]">
          <div className="hidden sm:grid grid-cols-[24px_2fr_1fr_90px_90px_80px_80px_110px] gap-2 px-3 py-2 bg-[#0f0000] text-[#4a3030] text-[9px] tracking-widest">
            <span/><span>Name</span><span>Category</span><span>Price</span><span>Stock</span>
            <span>Rarity</span><span>Status</span><span>Actions</span>
          </div>
          {notFeatured.length === 0 && featured.length === 0 && (
            <div className="px-3 py-4 text-[#4a3030] text-xs">No products found.</div>
          )}
          {notFeatured.map(p => (
            <ProductRow key={p.id} p={p} selected={selected} inlineEdit={inlineEdit}
              onToggleSelect={toggleSelect} onFeatured={handleFeaturedToggle}
              onStatusChange={handleStatusChange} onDelete={handleDelete}
              onInlineStart={setInlineEdit} onInlineCommit={commitInline}
              onInlineChange={v => setInlineEdit(ie => ie ? { ...ie, value: v } : null)} />
          ))}
        </div>
      </>)}
    </div>
  )
}

function ProductRow({ p, selected, inlineEdit, onToggleSelect, onFeatured, onStatusChange, onDelete, onInlineStart, onInlineCommit, onInlineChange }: {
  p: DbProduct
  selected: Set<string>
  inlineEdit: InlineEdit | null
  onToggleSelect: (id: string) => void
  onFeatured: (p: DbProduct) => void
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string, name: string) => void
  onInlineStart: (e: InlineEdit) => void
  onInlineCommit: () => void
  onInlineChange: (v: string) => void
}) {
  const s = statusConfig[p.status as StockStatus] ?? statusConfig.in_stock
  const isEditingPrice = inlineEdit?.id === p.id && inlineEdit.field === 'sellingPrice'
  const isEditingStock = inlineEdit?.id === p.id && inlineEdit.field === 'amountIn'
  const RARITY_COLORS: Record<string, string> = { common: '#4a5568', uncommon: '#00ff41', rare: '#00e5ff', epic: '#bf00ff', legendary: '#ffd700' }

  return (
    <div className="flex flex-col sm:grid sm:grid-cols-[24px_2fr_1fr_90px_90px_80px_80px_110px] gap-2 px-3 py-2.5 border-b border-[#0f0000] hover:bg-[#0a0000] transition-colors">
      <input type="checkbox" checked={selected.has(p.id)} onChange={() => onToggleSelect(p.id)}
        className="mt-0.5 accent-[#ff2222] w-3.5 h-3.5" />
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base shrink-0">{p.symbol}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#ff2222] text-xs font-bold truncate">{p.name}</span>
          </div>
          <span className="text-[#4a3030] text-[9px]">{p.category.icon} {p.category.name}</span>
        </div>
      </div>
      <span className="text-[#4a3030] text-[10px] flex items-center">{p.category.icon} {p.category.name}</span>
      <div className="flex items-center">
        {isEditingPrice ? (
          <input type="number" value={inlineEdit!.value} onChange={e => onInlineChange(e.target.value)}
            onBlur={onInlineCommit} onKeyDown={e => e.key === 'Enter' && onInlineCommit()}
            className="w-full bg-[#0f0000] border border-[#ff2222] text-[#ff2222] text-xs px-1 py-0.5 outline-none" autoFocus />
        ) : (
          <button onClick={() => onInlineStart({ id: p.id, field: 'sellingPrice', value: String(p.sellingPrice) })}
            className="text-[#ffd700] font-bold text-xs hover:underline text-left" title="Click to edit">
            ${p.sellingPrice.toFixed(2)}
            {p.potentialEarnings && <span className="block text-[9px] text-[#00e5ff] font-normal">~${p.potentialEarnings.toFixed(0)}</span>}
          </button>
        )}
      </div>
      <div className="flex items-center">
        {isEditingStock ? (
          <input type="number" value={inlineEdit!.value} onChange={e => onInlineChange(e.target.value)}
            onBlur={onInlineCommit} onKeyDown={e => e.key === 'Enter' && onInlineCommit()}
            className="w-full bg-[#0f0000] border border-[#ff2222] text-[#ff2222] text-xs px-1 py-0.5 outline-none" autoFocus />
        ) : (
          <button onClick={() => onInlineStart({ id: p.id, field: 'amountIn', value: String(p.amountIn) })}
            className="text-xs hover:underline" title="Click to edit"
            style={{ color: p.amountIn === 0 ? '#ff2222' : p.amountIn <= 5 ? '#ff6b00' : '#00ff41' }}>
            {p.amountIn}
          </button>
        )}
      </div>
      <span className="text-[10px] flex items-center capitalize" style={{ color: RARITY_COLORS[p.rarity] ?? '#4a5568' }}>{p.rarity}</span>
      <select value={p.status} onChange={e => onStatusChange(p.id, e.target.value)}
        className="bg-[#0a0000] border border-[#1a0000] text-[9px] px-1 py-0.5 outline-none cursor-pointer"
        style={{ color: s.color }}>
        <option value="in_stock">IN STOCK</option>
        <option value="almost_out">ALMOST OUT</option>
        <option value="out_of_stock">OUT OF STOCK</option>
      </select>
      <div className="flex gap-1.5 items-center">
        <button onClick={() => onFeatured(p)}
          className="text-[9px] text-[#3a0000] hover:text-[#ff6b00] border border-[#1a0000] hover:border-[#ff6b0033] px-1.5 py-0.5 transition-colors" title="Mark as featured">
          ☆ FEAT
        </button>
        <Link href={`/admin/products/${p.id}/edit`}
          className="text-[10px] text-[#4a3030] hover:text-[#ff2222] border border-[#1a0000] hover:border-[#ff2222] px-2 py-0.5 transition-colors">
          EDIT
        </Link>
        <button onClick={() => onDelete(p.id, p.name)}
          className="text-[10px] text-[#3a0000] hover:text-[#ff2222] border border-[#1a0000] hover:border-[#ff2222] px-2 py-0.5 transition-colors">
          DEL
        </button>
      </div>
    </div>
  )
}
