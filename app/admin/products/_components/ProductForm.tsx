'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct } from '@/lib/actions/products'
import { type DbProduct } from '@/lib/products'

interface Category { id: string; name: string; icon: string }
interface SubCat   { id: string; name: string; icon: string; categoryId: string }

interface ProductFormProps { product?: DbProduct }

const STATUS_OPTS    = ['in_stock', 'almost_out', 'out_of_stock']
const RARITY_OPTS    = ['common', 'uncommon', 'rare', 'epic', 'legendary']
const BG_PRESETS     = ['#0a1628','#150a28','#0a2810','#282200','#001a28','#1a0a0a','#0f0f14','#280a0a','#0a1a0a','#1a1400','#0a0a1e','#0f140a']
const ACCENT_PRESETS = ['#00e5ff','#bf00ff','#00ff41','#ffd700','#ff2222','#ff6b00','#7c7cff','#4040ff','#80ff40']

const inputCls = 'bg-black border border-[#3a0000] text-[#ff2222] text-xs px-3 py-2 outline-none focus:border-[#ff2222] w-full placeholder:text-[#1a0000] transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[#4a3030] text-[9px] tracking-widest uppercase">{label}</label>
      {children}
    </div>
  )
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [subcats, setSubcats] = useState<SubCat[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name:              product?.name ?? '',
    description:       product?.description ?? '',
    symbol:            product?.symbol ?? '📦',
    categoryId:        product?.categoryId ?? '',
    subCategoryId:     product?.subCategoryId ?? '',
    amountIn:          product?.amountIn ?? 0,
    sellingPrice:      product?.sellingPrice ?? 0,
    potentialEarnings: product?.potentialEarnings != null ? String(product.potentialEarnings) : '',
    status:            product?.status ?? 'in_stock',
    rarity:            product?.rarity ?? 'common',
    cardBg:            product?.cardBg ?? '#0a1628',
    cardAccent:        product?.cardAccent ?? '#00e5ff',
    featured:          product?.featured ?? false,
  })

  // Load categories once
  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then((cats: Category[]) => {
      setCategories(cats)
      if (!form.categoryId && cats.length) {
        setForm(f => ({ ...f, categoryId: cats[0].id }))
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load subcategories whenever categoryId changes
  useEffect(() => {
    if (!form.categoryId) { setSubcats([]); return }
    fetch(`/api/subcategories?catId=${form.categoryId}`)
      .then(r => r.json())
      .then((subs: SubCat[]) => {
        setSubcats(subs)
        // If current subCategoryId doesn't belong to the new category, clear it
        if (form.subCategoryId && !subs.find(s => s.id === form.subCategoryId)) {
          setForm(f => ({ ...f, subCategoryId: '' }))
        }
      })
      .catch(() => setSubcats([]))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.categoryId])

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSave() {
    if (!form.name || !form.categoryId || !form.sellingPrice) {
      setError('Name, category, and selling price are required.'); return
    }
    setSaving(true); setError('')
    try {
      const data = {
        ...form,
        amountIn:          Number(form.amountIn),
        sellingPrice:      Number(form.sellingPrice),
        potentialEarnings: form.potentialEarnings !== '' ? Number(form.potentialEarnings) : null,
        subCategoryId:     form.subCategoryId || null,
      }
      if (product) {
        await updateProduct(product.id, data)
      } else {
        await createProduct(data)
      }
      router.push('/admin/products')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save.')
    } finally { setSaving(false) }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <div className="text-[#ff2222] text-xs border border-[#ff2222] p-2 bg-[#0a0000]">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="NAME *">
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Product name" className={inputCls} />
        </Field>

        <Field label="SYMBOL (emoji)">
          <input type="text" value={form.symbol} onChange={e => set('symbol', e.target.value)} className={inputCls} maxLength={4} />
        </Field>

        <Field label="CATEGORY *">
          <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} className={`${inputCls} cursor-pointer`}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </Field>

        {/* Subcategory — only show when subcats exist for selected category */}
        <Field label={subcats.length > 0 ? 'SUBCATEGORY (optional)' : 'SUBCATEGORY'}>
          {subcats.length > 0 ? (
            <select value={form.subCategoryId} onChange={e => set('subCategoryId', e.target.value)} className={`${inputCls} cursor-pointer`}>
              <option value="">— None —</option>
              {subcats.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
            </select>
          ) : (
            <div className="bg-black border border-[#1a0000] text-[#3a0000] text-xs px-3 py-2 italic">
              {form.categoryId ? 'No subcategories for this category yet' : 'Select a category first'}
            </div>
          )}
        </Field>

        <Field label="STATUS">
          <select value={form.status} onChange={e => set('status', e.target.value)} className={`${inputCls} cursor-pointer`}>
            {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>)}
          </select>
        </Field>

        <Field label="RARITY">
          <select value={form.rarity} onChange={e => set('rarity', e.target.value)} className={`${inputCls} cursor-pointer`}>
            {RARITY_OPTS.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
          </select>
        </Field>

        <Field label="AMOUNT IN STOCK">
          <input type="number" min={0} value={form.amountIn} onChange={e => set('amountIn', +e.target.value)} className={inputCls} />
        </Field>

        <Field label="SELLING PRICE ($) *">
          <input type="number" min={0} step={0.01} value={form.sellingPrice} onChange={e => set('sellingPrice', +e.target.value)} className={inputCls} />
        </Field>

        <Field label="POTENTIAL EARNINGS ($) — optional">
          <input type="number" min={0} step={0.01} value={form.potentialEarnings}
            onChange={e => set('potentialEarnings', e.target.value)}
            placeholder="leave blank if N/A" className={inputCls} />
        </Field>
      </div>

      <Field label="DESCRIPTION *">
        <textarea value={form.description} onChange={e => set('description', e.target.value)}
          rows={3} className={`${inputCls} resize-none`} placeholder="Asset description..." />
      </Field>

      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="accent-[#ff2222]" />
        <span className="text-[#4a3030] text-xs tracking-wider">FEATURED (show first in store)</span>
      </label>

      {/* Card colours */}
      <Field label="CARD BACKGROUND">
        <div className="flex items-center gap-2 flex-wrap">
          {BG_PRESETS.map(c => (
            <button key={c} type="button" onClick={() => set('cardBg', c)}
              className="w-7 h-7 border-2 transition-all"
              style={{ background: c, borderColor: form.cardBg === c ? '#ff2222' : 'transparent' }} />
          ))}
          <input type="color" value={form.cardBg} onChange={e => set('cardBg', e.target.value)}
            className="w-7 h-7 border border-[#3a0000] cursor-pointer bg-transparent rounded-none" />
          <span className="text-[#4a3030] text-[10px] font-mono">{form.cardBg}</span>
        </div>
      </Field>

      <Field label="CARD ACCENT / GLOW">
        <div className="flex items-center gap-2 flex-wrap">
          {ACCENT_PRESETS.map(c => (
            <button key={c} type="button" onClick={() => set('cardAccent', c)}
              className="w-7 h-7 border-2 transition-all"
              style={{ background: c, borderColor: form.cardAccent === c ? '#ff2222' : 'transparent' }} />
          ))}
          <input type="color" value={form.cardAccent} onChange={e => set('cardAccent', e.target.value)}
            className="w-7 h-7 border border-[#3a0000] cursor-pointer bg-transparent rounded-none" />
          <span className="text-[#4a3030] text-[10px] font-mono">{form.cardAccent}</span>
        </div>
      </Field>

      {/* Preview */}
      <div className="flex flex-col gap-2">
        <span className="text-[#4a3030] text-[9px] tracking-widest uppercase">Card Preview</span>
        <div className="relative w-42 border-2 overflow-hidden" style={{ borderColor: form.cardAccent }}>
          <div className="relative h-27.5 flex items-center justify-center" style={{ background: form.cardBg }}>
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: `repeating-linear-gradient(45deg, ${form.cardAccent}22 0px, ${form.cardAccent}22 1px, transparent 1px, transparent 8px)` }} />
            <div className="flex flex-col items-center gap-1 relative z-10">
              <span className="text-4xl">{form.symbol}</span>
              <span className="text-[9px] uppercase font-bold" style={{ color: form.cardAccent }}>{form.rarity}</span>
            </div>
          </div>
          <div className="p-2 flex flex-col gap-1" style={{ background: '#07090a' }}>
            <span className="text-[11px] font-bold truncate" style={{ color: form.cardAccent }}>{form.name || 'Product Name'}</span>
            <div className="flex justify-between text-[10px]">
              <span style={{ color: form.amountIn === 0 ? '#ff2222' : '#00ff41' }}>{form.amountIn}</span>
              <span className="text-[#ffd700] font-bold">${Number(form.sellingPrice).toFixed(2)}</span>
            </div>
            {form.potentialEarnings && (
              <span className="text-[8px] text-[#00e5ff]">~${Number(form.potentialEarnings).toFixed(0)} potential</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t border-[#1a0000]">
        <button onClick={handleSave} disabled={saving}
          className="border border-[#ff2222] bg-[#ff2222] text-black hover:bg-transparent hover:text-[#ff2222] px-6 py-2 text-xs tracking-widest font-bold transition-all disabled:opacity-50">
          {saving ? 'SAVING...' : product ? '▸ UPDATE ASSET' : '▸ CREATE ASSET'}
        </button>
        <button onClick={() => router.back()}
          className="border border-[#3a0000] text-[#4a3030] hover:border-[#ff2222] hover:text-[#ff2222] px-4 py-2 text-xs tracking-widest transition-all">
          CANCEL
        </button>
      </div>
    </div>
  )
}
