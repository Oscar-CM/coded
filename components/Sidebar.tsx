'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

interface Category {
  id: string; name: string; slug: string; icon: string
  subCategories?: SubCategory[]
}
interface SubCategory { id: string; name: string; slug: string; icon: string; categoryId: string }

const collectionItems = [
  { label: 'Featured',     href: '/dashboard?featured=1',       icon: '★', badge: 'HOT',  badgeColor: '#ff6b00' },
  { label: 'New Arrivals', href: '/dashboard?sort=newest',      icon: '◉', badge: 'NEW',  badgeColor: '#00e5ff' },
  { label: 'Trending',     href: '/dashboard?sort=trending',    icon: '▲' },
  { label: 'Legendary',    href: '/dashboard?rarity=legendary', icon: '◆', badge: 'RARE', badgeColor: '#ffd700' },
]

const rarityItems = [
  { label: 'Legendary', href: '/dashboard?rarity=legendary', icon: '◆' },
  { label: 'Epic',      href: '/dashboard?rarity=epic',      icon: '◆' },
  { label: 'Rare',      href: '/dashboard?rarity=rare',      icon: '◆' },
  { label: 'Uncommon',  href: '/dashboard?rarity=uncommon',  icon: '▸' },
  { label: 'Common',    href: '/dashboard?rarity=common',    icon: '▸' },
]

const accountItems = [
  { label: 'Profile',        href: '/dashboard/account',       icon: '▸' },
  { label: 'Orders',         href: '/dashboard/account/orders',icon: '▸' },
  { label: 'Settings',       href: '/dashboard/settings',      icon: '▸' },
  { label: 'Contact Support',href: '/dashboard/contact',       icon: '✉' },
]

interface SidebarProps {
  onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({})
  const [openSections, setOpenSections] = useState({
    STORE: true, COLLECTIONS: true, RARITY: false, ACCOUNT: false,
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/subcategories').then(r => r.json()),
    ]).then(([cats, subs]: [Category[], SubCategory[]]) => {
      const withSubs = cats.map((c: Category) => ({
        ...c,
        subCategories: subs.filter((s: SubCategory) => s.categoryId === c.id),
      }))
      setCategories(withSubs)
      // Auto-open the active category
      const activeCat = searchParams.get('cat')
      if (activeCat) {
        const match = withSubs.find(c => c.slug === activeCat)
        if (match) setOpenCats(prev => ({ ...prev, [match.id]: true }))
      }
    }).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function isActive(href: string) {
    const [path, qs] = href.split('?')
    if (path !== pathname) return false
    if (!qs) return !searchParams.toString()
    const params = new URLSearchParams(qs)
    for (const [k, v] of params.entries()) {
      if (searchParams.get(k) !== v) return false
    }
    return true
  }

  function NavItem({ label, href, icon, badge, badgeColor }: { label: string; href: string; icon: string; badge?: string; badgeColor?: string }) {
    const active = isActive(href)
    return (
      <Link href={href} onClick={onClose}
        className={['flex items-center justify-between py-1.5 px-2 text-[11px] transition-all group',
          active ? 'text-[#00ff41] bg-[#003b00] text-glow' : 'text-[#4a7a4a] hover:text-[#00ff41] hover:bg-[#001a00]'].join(' ')}>
        <span className="flex items-center gap-1.5">
          <span className={['text-[9px]', active ? 'text-[#00ff41]' : 'text-[#1a3a1a] group-hover:text-[#00b32d]'].join(' ')}>{icon}</span>
          {label}
        </span>
        {badge && <span className="text-[7px] px-1 py-0.5 font-bold tracking-wider shrink-0" style={{ color: badgeColor, border: `1px solid ${badgeColor}55` }}>{badge}</span>}
      </Link>
    )
  }

  function SectionHeader({ heading, open, onToggle }: { heading: string; open: boolean; onToggle: () => void }) {
    return (
      <button onClick={onToggle}
        className="flex items-center justify-between w-full px-2 py-1.5 text-[10px] tracking-widest font-bold text-[#4a7a4a] hover:text-[#00ff41] transition-colors">
        <span className="flex items-center gap-1.5"><span className="text-[#00ff41] text-xs">◈</span>{heading}</span>
        <span className="text-[8px] transition-transform duration-200" style={{ transform: open ? 'rotate(90deg)' : 'none' }}>▶</span>
      </button>
    )
  }

  return (
    <nav className="flex flex-col gap-0.5 py-3 px-2 overflow-y-auto h-full">
      {/* Mobile close */}
      <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-[#1a3a1a] md:hidden">
        <span className="text-[#00ff41] text-xs font-bold tracking-widest text-glow">CODEDLOGS</span>
        <button onClick={onClose} className="text-[#4a7a4a] hover:text-[#ff2222] text-sm">✕</button>
      </div>

      {/* ── STORE (dynamic categories + subcategories) ── */}
      <SectionHeader heading="STORE" open={openSections.STORE} onToggle={() => setOpenSections(p => ({ ...p, STORE: !p.STORE }))} />
      {openSections.STORE && (
        <div className="flex flex-col mb-1">
          {/* All Assets */}
          <NavItem label="All Assets" href="/dashboard" icon="▸" />

          {/* Categories with sub-items */}
          {categories.map(cat => {
            const catHref = `/dashboard?cat=${cat.slug}`
            const catActive = searchParams.get('cat') === cat.slug
            const expanded = openCats[cat.id]
            const hasSubs = cat.subCategories && cat.subCategories.length > 0

            return (
              <div key={cat.id} className="flex flex-col">
                <div className="flex items-center">
                  <Link href={catHref} onClick={onClose}
                    className={['flex-1 flex items-center gap-1.5 py-1.5 px-2 text-[11px] transition-all group',
                      catActive ? 'text-[#00ff41] bg-[#003b00] text-glow' : 'text-[#4a7a4a] hover:text-[#00ff41] hover:bg-[#001a00]'].join(' ')}>
                    <span className="text-[12px]">{cat.icon}</span>
                    {cat.name}
                  </Link>
                  {hasSubs && (
                    <button
                      onClick={() => setOpenCats(p => ({ ...p, [cat.id]: !p[cat.id] }))}
                      className="px-1.5 py-1.5 text-[8px] text-[#1a3a1a] hover:text-[#00ff41] transition-colors shrink-0"
                      style={{ transform: expanded ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>
                      ▶
                    </button>
                  )}
                </div>

                {/* Subcategories */}
                {hasSubs && expanded && (
                  <div className="flex flex-col ml-5 border-l border-[#0d2a0d] pl-2">
                    {cat.subCategories!.map(sub => (
                      <Link key={sub.id}
                        href={`/dashboard?cat=${cat.slug}&sub=${sub.slug}`}
                        onClick={onClose}
                        className={['flex items-center gap-1.5 py-1 px-2 text-[10px] transition-all group',
                          searchParams.get('sub') === sub.slug && searchParams.get('cat') === cat.slug
                            ? 'text-[#00ff41] bg-[#002800]'
                            : 'text-[#3a6a3a] hover:text-[#00ff41] hover:bg-[#001a00]'].join(' ')}>
                        <span className="text-[9px]">{sub.icon}</span>
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── COLLECTIONS ── */}
      <SectionHeader heading="COLLECTIONS" open={openSections.COLLECTIONS} onToggle={() => setOpenSections(p => ({ ...p, COLLECTIONS: !p.COLLECTIONS }))} />
      {openSections.COLLECTIONS && (
        <div className="flex flex-col ml-3 border-l border-[#1a3a1a] pl-2 mb-1">
          {collectionItems.map(i => <NavItem key={i.label} {...i} />)}
        </div>
      )}

      {/* ── RARITY ── */}
      <SectionHeader heading="RARITY" open={openSections.RARITY} onToggle={() => setOpenSections(p => ({ ...p, RARITY: !p.RARITY }))} />
      {openSections.RARITY && (
        <div className="flex flex-col ml-3 border-l border-[#1a3a1a] pl-2 mb-1">
          {rarityItems.map(i => <NavItem key={i.label} {...i} />)}
        </div>
      )}

      {/* ── ACCOUNT ── */}
      <SectionHeader heading="ACCOUNT" open={openSections.ACCOUNT} onToggle={() => setOpenSections(p => ({ ...p, ACCOUNT: !p.ACCOUNT }))} />
      {openSections.ACCOUNT && (
        <div className="flex flex-col ml-3 border-l border-[#1a3a1a] pl-2 mb-1">
          {accountItems.map(i => <NavItem key={i.label} {...i} />)}
        </div>
      )}

      {/* ── Disconnect ── */}
      <div className="mt-auto pt-3 border-t border-[#1a3a1a] px-2">
        <button onClick={() => { sessionStorage.clear(); window.location.href = '/' }}
          className="flex items-center gap-2 text-[11px] text-[#ff2222] hover:text-[#ff4444] hover:bg-[#1a0000] w-full px-2 py-1.5 transition-colors">
          <span className="text-[9px]">◉</span>DISCONNECT
        </button>
      </div>
    </nav>
  )
}
