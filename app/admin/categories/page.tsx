'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { createCategory, updateCategory, deleteCategory } from '@/lib/actions/categories'
import { createSubCategory, updateSubCategory, deleteSubCategory } from '@/lib/actions/subcategories'

interface SubCat { id: string; name: string; slug: string; icon: string; order: number; categoryId: string }
interface Category { id: string; name: string; slug: string; icon: string; description: string | null; order: number; subCategories?: SubCat[] }

function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }

const CAT_BLANK  = { name: '', slug: '', icon: '📦', description: '', order: 0 }
const SUB_BLANK  = { name: '', slug: '', icon: '▸', order: 0 }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [catMode, setCatMode] = useState<'list' | 'add' | 'edit'>('list')
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [catForm, setCatForm] = useState(CAT_BLANK)
  const [subMode, setSubMode] = useState<Record<string, 'list' | 'add' | 'edit'>>({})
  const [editingSub, setEditingSub] = useState<SubCat | null>(null)
  const [subForm, setSubForm] = useState<Record<string, typeof SUB_BLANK>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const [cats, subs]: [Category[], SubCat[]] = await Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/subcategories').then(r => r.json()),
    ])
    const withSubs = cats.map(c => ({ ...c, subCategories: subs.filter(s => s.categoryId === c.id) }))
    setCategories(withSubs)
  }, [])

  useEffect(() => { load() }, [load])

  // ── Category handlers ──
  function startAddCat() { setCatForm(CAT_BLANK); setEditingCat(null); setCatMode('add'); setError('') }
  function startEditCat(c: Category) {
    setCatForm({ name: c.name, slug: c.slug, icon: c.icon, description: c.description ?? '', order: c.order })
    setEditingCat(c); setCatMode('edit'); setError('')
  }

  async function saveCat() {
    if (!catForm.name || !catForm.slug) { setError('Name and slug required.'); return }
    setSaving(true); setError('')
    try {
      if (catMode === 'add') await createCategory({ ...catForm, description: catForm.description || undefined })
      else if (editingCat) await updateCategory(editingCat.id, { ...catForm, description: catForm.description || undefined })
      await load(); setCatMode('list')
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed.') }
    finally { setSaving(false) }
  }

  async function deleteCat(id: string) {
    if (!confirm('Delete this category and all its subcategories?')) return
    try { await deleteCategory(id); await load() } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Error') }
  }

  // ── Subcategory handlers ──
  function startAddSub(catId: string) {
    setSubForm(f => ({ ...f, [catId]: SUB_BLANK }))
    setSubMode(m => ({ ...m, [catId]: 'add' }))
    setEditingSub(null); setError('')
  }

  function startEditSub(catId: string, sub: SubCat) {
    setSubForm(f => ({ ...f, [catId]: { name: sub.name, slug: sub.slug, icon: sub.icon, order: sub.order } }))
    setSubMode(m => ({ ...m, [catId]: 'edit' }))
    setEditingSub(sub); setError('')
  }

  async function saveSub(catId: string) {
    const form = subForm[catId]
    if (!form?.name || !form.slug) { setError('Name and slug required.'); return }
    setSaving(true); setError('')
    try {
      if (subMode[catId] === 'add') await createSubCategory({ ...form, categoryId: catId })
      else if (editingSub) await updateSubCategory(editingSub.id, form)
      await load(); setSubMode(m => ({ ...m, [catId]: 'list' }))
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed.') }
    finally { setSaving(false) }
  }

  async function deleteSub(id: string) {
    if (!confirm('Delete subcategory?')) return
    try { await deleteSubCategory(id); await load() } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Error') }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#3a0000] pb-4">
        <div>
          <h1 className="text-[#ff2222] font-bold text-lg tracking-widest">CATEGORIES</h1>
          <p className="text-[#4a3030] text-xs">{categories.length} categories</p>
        </div>
        {catMode === 'list' && (
          <button onClick={startAddCat}
            className="border border-[#ff2222] text-[#ff2222] hover:bg-[#ff2222] hover:text-black px-4 py-1.5 text-xs tracking-widest transition-all font-bold">
            + NEW CATEGORY
          </button>
        )}
      </div>

      {error && <div className="text-[#ff2222] text-xs border border-[#ff2222] bg-[#0a0000] p-2">{error}</div>}

      {/* Category form */}
      {(catMode === 'add' || catMode === 'edit') && (
        <div className="border border-[#3a0000] bg-[#0a0000] p-4 flex flex-col gap-3">
          <h2 className="text-[#ff2222] font-bold text-sm tracking-wider">{catMode === 'add' ? 'NEW CATEGORY' : 'EDIT CATEGORY'}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              ['NAME *', 'name', (v: string) => setCatForm(f => ({ ...f, name: v, slug: catMode === 'add' ? slugify(v) : f.slug }))],
              ['SLUG *', 'slug', (v: string) => setCatForm(f => ({ ...f, slug: v }))],
              ['ICON',   'icon', (v: string) => setCatForm(f => ({ ...f, icon: v }))],
            ].map(([label, key, onChange]) => (
              <div key={key as string} className="flex flex-col gap-1">
                <label className="text-[#4a3030] text-[9px] tracking-widest">{label as string}</label>
                <input type="text" value={(catForm as Record<string, string | number>)[key as string] as string}
                  onChange={e => (onChange as (v: string) => void)(e.target.value)}
                  className="bg-black border border-[#3a0000] text-[#ff2222] text-xs px-3 py-1.5 outline-none focus:border-[#ff2222]" />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-[#4a3030] text-[9px] tracking-widest">DESCRIPTION</label>
              <input type="text" value={catForm.description}
                onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))}
                className="bg-black border border-[#3a0000] text-[#ff2222] text-xs px-3 py-1.5 outline-none focus:border-[#ff2222]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[#4a3030] text-[9px] tracking-widest">ORDER</label>
              <input type="number" value={catForm.order}
                onChange={e => setCatForm(f => ({ ...f, order: +e.target.value }))}
                className="bg-black border border-[#3a0000] text-[#ff2222] text-xs px-3 py-1.5 outline-none focus:border-[#ff2222]" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveCat} disabled={saving}
              className="border border-[#ff2222] bg-[#ff2222] text-black px-4 py-1.5 text-xs tracking-widest font-bold hover:bg-transparent hover:text-[#ff2222] transition-all disabled:opacity-50">
              {saving ? 'SAVING...' : '▸ SAVE'}
            </button>
            <button onClick={() => setCatMode('list')} className="border border-[#3a0000] text-[#4a3030] hover:border-[#ff2222] hover:text-[#ff2222] px-4 py-1.5 text-xs tracking-widest transition-all">
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Category list */}
      {catMode === 'list' && categories.map(cat => (
        <div key={cat.id} className="border border-[#1a0000] bg-[#050000]">
          {/* Category row */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#0f0000]">
            <button onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
              className="flex items-center gap-3 flex-1 text-left">
              <span className="text-xl">{cat.icon}</span>
              <div>
                <span className="text-[#ff2222] font-bold text-sm">{cat.name}</span>
                <span className="text-[#4a3030] text-[10px] ml-2">/{cat.slug}</span>
                <span className="text-[#3a0000] text-[9px] ml-2">
                  {cat.subCategories?.length ?? 0} subcategories
                </span>
              </div>
              <span className="text-[8px] text-[#3a0000] ml-2 transition-transform"
                style={{ transform: expandedCat === cat.id ? 'rotate(90deg)' : 'none' }}>▶</span>
            </button>
            <div className="flex gap-2">
              <button onClick={() => startEditCat(cat)} className="text-[10px] text-[#4a3030] hover:text-[#ff2222] border border-[#1a0000] hover:border-[#ff2222] px-2 py-0.5 transition-colors">EDIT</button>
              <button onClick={() => deleteCat(cat.id)} className="text-[10px] text-[#3a0000] hover:text-[#ff2222] border border-[#1a0000] hover:border-[#ff2222] px-2 py-0.5 transition-colors">DEL</button>
            </div>
          </div>

          {/* Subcategories (expanded) */}
          {expandedCat === cat.id && (
            <div className="flex flex-col gap-0 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#4a3030] text-[9px] tracking-widest uppercase">Subcategories</span>
                {(!subMode[cat.id] || subMode[cat.id] === 'list') && (
                  <button onClick={() => startAddSub(cat.id)}
                    className="text-[9px] text-[#ff2222] border border-[#3a0000] hover:border-[#ff2222] px-2 py-0.5 transition-colors">
                    + ADD SUB
                  </button>
                )}
              </div>

              {/* Sub form */}
              {(subMode[cat.id] === 'add' || subMode[cat.id] === 'edit') && (
                <div className="border border-[#3a0000] bg-[#0a0000] p-3 mb-3 flex flex-col gap-2">
                  <div className="grid grid-cols-3 gap-2">
                    {[['NAME', 'name'], ['SLUG', 'slug'], ['ICON', 'icon']].map(([label, key]) => (
                      <div key={key} className="flex flex-col gap-1">
                        <label className="text-[#4a3030] text-[8px] tracking-widest">{label}</label>
                        <input type="text"
                          value={(subForm[cat.id] as Record<string, string | number>)?.[key] as string ?? ''}
                          onChange={e => {
                            const val = e.target.value
                            setSubForm(f => ({
                              ...f,
                              [cat.id]: {
                                ...f[cat.id],
                                [key]: val,
                                ...(key === 'name' && subMode[cat.id] === 'add' ? { slug: slugify(val) } : {}),
                              }
                            }))
                          }}
                          className="bg-black border border-[#3a0000] text-[#ff2222] text-[10px] px-2 py-1 outline-none" />
                      </div>
                    ))}
                    <div className="flex flex-col gap-1">
                      <label className="text-[#4a3030] text-[8px] tracking-widest">ORDER</label>
                      <input type="number" value={subForm[cat.id]?.order ?? 0}
                        onChange={e => setSubForm(f => ({ ...f, [cat.id]: { ...f[cat.id], order: +e.target.value } }))}
                        className="bg-black border border-[#3a0000] text-[#ff2222] text-[10px] px-2 py-1 outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveSub(cat.id)} disabled={saving}
                      className="text-[9px] border border-[#ff2222] bg-[#ff2222] text-black px-3 py-1 hover:bg-transparent hover:text-[#ff2222] transition-all disabled:opacity-50">
                      {saving ? '...' : 'SAVE'}
                    </button>
                    <button onClick={() => setSubMode(m => ({ ...m, [cat.id]: 'list' }))}
                      className="text-[9px] border border-[#3a0000] text-[#4a3030] hover:border-[#ff2222] px-3 py-1 transition-all">
                      CANCEL
                    </button>
                  </div>
                </div>
              )}

              {/* Sub list */}
              {cat.subCategories?.length === 0 && <span className="text-[#2a0000] text-[10px]">No subcategories yet.</span>}
              {cat.subCategories?.map(sub => (
                <div key={sub.id} className="flex items-center justify-between py-1.5 border-b border-[#0a0000]">
                  <span className="flex items-center gap-2 text-[11px] text-[#4a3030]">
                    <span>{sub.icon}</span>{sub.name}
                    <span className="text-[#2a0000] text-[9px]">/{sub.slug}</span>
                  </span>
                  <div className="flex gap-1.5">
                    <button onClick={() => startEditSub(cat.id, sub)}
                      className="text-[9px] text-[#4a3030] hover:text-[#ff2222] border border-[#0a0000] hover:border-[#ff2222] px-1.5 py-0.5">EDIT</button>
                    <button onClick={() => deleteSub(sub.id)}
                      className="text-[9px] text-[#2a0000] hover:text-[#ff2222] border border-[#0a0000] hover:border-[#ff2222] px-1.5 py-0.5">DEL</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
