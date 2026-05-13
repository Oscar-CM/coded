'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AssetCard from '@/components/AssetCard'
import AssetDetail from '@/components/AssetDetail'
import { type DbProduct, rarityColors, type Rarity } from '@/lib/products'

const RARITY_ORDER = ['legendary', 'epic', 'rare', 'uncommon', 'common']

interface SubCat { id: string; name: string; slug: string; icon: string; categoryId: string }

function DashboardContent() {
  const sp = useSearchParams()
  const [products, setProducts] = useState<DbProduct[]>([])
  const [subcats, setSubcats] = useState<SubCat[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<DbProduct | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'featured' | 'rarity' | 'price_asc' | 'price_desc' | 'stock'>('featured')

  const catParam      = sp.get('cat') ?? ''
  const subParam      = sp.get('sub') ?? ''
  const rarityParam   = sp.get('rarity') ?? ''
  const featuredParam = sp.get('featured') ?? ''

  useEffect(() => {
    setLoading(true)
    const qs = new URLSearchParams()
    if (catParam)      qs.set('cat', catParam)
    if (rarityParam)   qs.set('rarity', rarityParam)
    if (featuredParam) qs.set('featured', featuredParam)

    Promise.all([
      fetch(`/api/products?${qs}`).then(r => r.json()),
      catParam ? fetch(`/api/subcategories?cat=${catParam}`).then(r => r.json()) : Promise.resolve([]),
    ]).then(([prods, subs]) => {
      setProducts(prods as DbProduct[])
      setSubcats(subs as SubCat[])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [catParam, rarityParam, featuredParam])

  const filtered = useMemo(() => {
    let list = [...products]

    // Client-side subcategory filter (sub param stored in URL)
    if (subParam) list = list.filter(p => (p as DbProduct & { subCategory?: { slug: string } }).subCategory?.slug === subParam)

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.name.toLowerCase().includes(q)
      )
    }

    list.sort((a, b) => {
      if (sortBy === 'featured') {
        const af = a.featured ? (a.featuredOrder ?? 999) : 9999
        const bf = b.featured ? (b.featuredOrder ?? 999) : 9999
        if (af !== bf) return af - bf
        return RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)
      }
      if (sortBy === 'rarity')      return RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)
      if (sortBy === 'price_asc')   return a.sellingPrice - b.sellingPrice
      if (sortBy === 'price_desc')  return b.sellingPrice - a.sellingPrice
      if (sortBy === 'stock')       return b.amountIn - a.amountIn
      return 0
    })
    return list
  }, [products, search, sortBy, subParam])

  const stats = useMemo(() => ({
    total: products.length,
    inStock: products.filter(p => p.status === 'in_stock').length,
    almostOut: products.filter(p => p.status === 'almost_out').length,
    outOfStock: products.filter(p => p.status === 'out_of_stock').length,
  }), [products])

  const pageTitle = featuredParam ? 'FEATURED ASSETS'
    : catParam ? (products[0]?.category.name.toUpperCase() ?? catParam.toUpperCase())
    : rarityParam ? `${rarityParam.toUpperCase()} ASSETS`
    : 'ALL ASSETS'

  return (
    <>
      {selected && <AssetDetail product={selected} onClose={() => setSelected(null)} />}

      <div className="flex flex-col gap-4 sm:gap-5">
        {/* Header */}
        <div className="flex flex-col gap-1 border-b border-[#1a3a1a] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[#4a7a4a] text-xs hidden sm:block">root@codedlogs:~$</span>
            <h1 className="text-[#00ff41] text-glow font-bold text-sm tracking-widest">{pageTitle}</h1>
            {loading && <span className="cursor-blink" />}
          </div>
          <p className="text-[#4a7a4a] text-xs">
            {loading ? 'Loading...' : `${filtered.length} asset${filtered.length !== 1 ? 's' : ''}`}
            {subParam && subcats.find(s => s.slug === subParam) && (
              <span className="ml-1 text-[#00e5ff]">› {subcats.find(s => s.slug === subParam)!.name}</span>
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: 'TOTAL',      value: stats.total,      color: '#00e5ff' },
            { label: 'IN STOCK',   value: stats.inStock,    color: '#00ff41' },
            { label: 'ALMOST OUT', value: stats.almostOut,  color: '#ff6b00' },
            { label: 'OUT',        value: stats.outOfStock, color: '#ff2222' },
          ].map(s => (
            <div key={s.label} className="crt-border bg-[#050f05] px-3 py-2 flex flex-col gap-0.5">
              <span className="text-[9px] text-[#4a7a4a] tracking-widest">{s.label}</span>
              <span className="text-2xl font-bold tabular-nums"
                style={{ color: s.color, textShadow: `0 0 8px ${s.color}66` }}>
                {String(s.value).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>

        {/* Subcategory chips (shown when a category is active and has subcats) */}
        {subcats.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[9px] pb-0.5">
            <span className="text-[#4a7a4a] shrink-0 tracking-widest">SUB:</span>
            <a href={`/dashboard?cat=${catParam}`}
              className={['px-2 py-1 border tracking-wider transition-all shrink-0',
                !subParam ? 'bg-[#003b00] text-[#00ff41] border-[#00ff41]' : 'text-[#4a7a4a] border-[#1a3a1a] hover:border-[#4a7a4a]'].join(' ')}>
              ALL
            </a>
            {subcats.map(sub => (
              <a key={sub.id} href={`/dashboard?cat=${catParam}&sub=${sub.slug}`}
                className={['flex items-center gap-1 px-2 py-1 border tracking-wider transition-all shrink-0',
                  subParam === sub.slug ? 'bg-[#003b00] text-[#00ff41] border-[#00ff41]' : 'text-[#4a7a4a] border-[#1a3a1a] hover:border-[#4a7a4a] hover:text-[#00b32d]'].join(' ')}>
                <span>{sub.icon}</span>{sub.name}
              </a>
            ))}
          </div>
        )}

        {/* Search + Sort + Rarity */}
        <div className="flex flex-col gap-2 crt-border bg-[#050f05] p-3">
          <div className="flex items-center gap-2 border-b border-[#1a3a1a] pb-2">
            <span className="text-[#4a7a4a] text-xs shrink-0">&gt;_</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="search assets..."
              className="flex-1 bg-transparent text-[#00ff41] placeholder:text-[#1a3a1a] text-xs outline-none min-w-0" />
            {search && <button onClick={() => setSearch('')} className="text-[#ff2222] text-xs shrink-0">✕</button>}
          </div>

          <div className="flex flex-col gap-2 text-[9px]">
            {/* Sort */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[#4a7a4a] shrink-0 tracking-widest">SORT:</span>
              {([['featured','FEATURED ★'],['rarity','RARITY'],['price_asc','PRICE ↑'],['price_desc','PRICE ↓'],['stock','STOCK']] as const).map(([val, lbl]) => (
                <button key={val} onClick={() => setSortBy(val)}
                  className={['px-2 py-0.5 tracking-wider border shrink-0 transition-all',
                    sortBy === val ? 'bg-[#003b00] text-[#00ff41] border-[#00ff41]' : 'text-[#4a7a4a] border-[#1a3a1a] hover:border-[#4a7a4a] hover:text-[#00b32d]'].join(' ')}>
                  {lbl}
                </button>
              ))}
            </div>

            {/* Rarity filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[#4a7a4a] shrink-0 tracking-widest">RARITY:</span>
              {(['all','legendary','epic','rare','uncommon','common'] as const).map(r => {
                const active = r === 'all' ? !rarityParam : rarityParam === r
                const color  = r !== 'all' ? rarityColors[r as Rarity] : '#00ff41'
                const href   = r === 'all'
                  ? `/dashboard${catParam ? `?cat=${catParam}${subParam ? `&sub=${subParam}` : ''}` : ''}`
                  : `/dashboard?rarity=${r}${catParam ? `&cat=${catParam}` : ''}`
                return (
                  <a key={r} href={href}
                    className={['px-2 py-0.5 tracking-wider border shrink-0 transition-all',
                      active ? 'border-current' : 'text-[#4a7a4a] border-[#1a3a1a] hover:border-[#4a7a4a]'].join(' ')}
                    style={active ? { color, background: `${color}11` } : {}}>
                    {r.toUpperCase()}
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex items-center gap-3 py-16 text-[#4a7a4a]">
            <span className="cursor-blink" /><span className="text-xs tracking-widest">LOADING ASSETS...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {filtered.map(p => <AssetCard key={p.id} product={p} onClick={setSelected} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#1a3a1a]">
            <span className="text-4xl">◉</span>
            <span className="text-sm tracking-widest">NO ASSETS FOUND</span>
            <a href="/dashboard" className="text-xs text-[#4a7a4a] hover:text-[#00ff41] tracking-wider border border-[#1a3a1a] hover:border-[#00ff41] px-4 py-1 transition-colors">
              CLEAR FILTERS
            </a>
          </div>
        )}
      </div>
    </>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center gap-3 py-16 text-[#4a7a4a]">
        <span className="cursor-blink" /><span className="text-xs tracking-widest">LOADING...</span>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
