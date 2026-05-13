'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'

interface Analytics {
  visits: {
    total: number; today: number; week: number; month: number
    daily: Record<string, number>
    countries: { country: string; count: number }[]
    topPages: { path: string; count: number }[]
  }
  messages: { open: number; total: number }
  orders: { pending: number; confirmed: number; revenue: number }
  topProducts: { id: string; name: string; symbol: string; category: string; orders: number }[]
  lowStock: { name: string; amountIn: number; symbol: string }[]
}

const COUNTRY_FLAGS: Record<string, string> = {
  US:'🇺🇸',GB:'🇬🇧',DE:'🇩🇪',FR:'🇫🇷',CA:'🇨🇦',AU:'🇦🇺',IN:'🇮🇳',BR:'🇧🇷',JP:'🇯🇵',KE:'🇰🇪',
  NG:'🇳🇬',ZA:'🇿🇦',GH:'🇬🇭',UG:'🇺🇬',TZ:'🇹🇿',SG:'🇸🇬',NL:'🇳🇱',SE:'🇸🇪',NO:'🇳🇴',FI:'🇫🇮',
}

function StatBox({ label, value, color, sub }: { label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 border border-[#1a0000] bg-[#050000]">
      <span className="text-[9px] text-[#4a3030] tracking-widest uppercase">{label}</span>
      <span className="text-2xl font-bold tabular-nums" style={{ color, textShadow: `0 0 8px ${color}44` }}>
        {value}
      </span>
      {sub && <span className="text-[9px] text-[#3a0000]">{sub}</span>}
    </div>
  )
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<Analytics | null>(null)

  useEffect(() => {
    fetch('/api/admin/analytics').then(r => r.json()).then(setData).catch(() => {})
    const id = setInterval(() => {
      fetch('/api/admin/analytics').then(r => r.json()).then(setData).catch(() => {})
    }, 30000) // refresh every 30s
    return () => clearInterval(id)
  }, [])

  if (!data) return <div className="text-[#4a3030] text-xs tracking-widest">LOADING METRICS...</div>

  const dailyMax = Math.max(1, ...Object.values(data.visits.daily))
  const countryMax = Math.max(1, ...data.visits.countries.map(c => c.count))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-[#3a0000] pb-4">
        <div>
          <h1 className="text-[#ff2222] font-bold text-lg tracking-widest">SYSTEM OVERVIEW</h1>
          <p className="text-[#4a3030] text-xs">Live analytics · refreshes every 30s</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse" />
          <span className="text-[#00ff41] text-[9px] tracking-widest">LIVE</span>
        </div>
      </div>

      {/* ── Visit stats ── */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[#ff2222] text-[10px] tracking-widest uppercase font-bold">Traffic</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatBox label="Today"        value={data.visits.today}  color="#00e5ff" />
          <StatBox label="This Week"    value={data.visits.week}   color="#00ff41" />
          <StatBox label="This Month"   value={data.visits.month}  color="#ffd700" />
          <StatBox label="All Time"     value={data.visits.total}  color="#bf00ff" />
        </div>
      </section>

      {/* ── 7-day bar chart ── */}
      <section className="flex flex-col gap-2">
        <h2 className="text-[#ff2222] text-[10px] tracking-widest uppercase font-bold">Daily Visits (last 7 days)</h2>
        <div className="border border-[#1a0000] bg-[#050000] p-4">
          <div className="flex items-end gap-1.5 h-24">
            {Object.entries(data.visits.daily).map(([date, count]) => {
              const pct = Math.round((count / dailyMax) * 100)
              const label = new Date(date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' })
              return (
                <div key={date} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-[#ff2222] text-[8px] tabular-nums">{count || ''}</span>
                  <div className="w-full rounded-none transition-all"
                    style={{ height: `${Math.max(4, pct)}%`, background: '#ff2222', opacity: 0.7 + 0.3 * (pct / 100) }} />
                  <span className="text-[#4a3030] text-[8px]">{label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Countries + Pages side-by-side ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Countries */}
        <section className="flex flex-col gap-2">
          <h2 className="text-[#ff2222] text-[10px] tracking-widest uppercase font-bold">Top Countries</h2>
          <div className="border border-[#1a0000] bg-[#050000] p-3 flex flex-col gap-2">
            {data.visits.countries.length === 0 && <span className="text-[#3a0000] text-[10px]">No data yet</span>}
            {data.visits.countries.map(({ country, count }) => (
              <div key={country} className="flex items-center gap-2">
                <span className="text-base w-6 shrink-0">{COUNTRY_FLAGS[country] ?? '🌐'}</span>
                <span className="text-[#4a3030] text-[10px] w-12 shrink-0">{country}</span>
                <div className="flex-1 h-2 bg-[#0a0000] relative">
                  <div className="absolute inset-y-0 left-0 bg-[#ff2222]"
                    style={{ width: `${Math.round((count / countryMax) * 100)}%`, opacity: 0.7 }} />
                </div>
                <span className="text-[#4a3030] text-[10px] tabular-nums w-6 text-right shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Top pages */}
        <section className="flex flex-col gap-2">
          <h2 className="text-[#ff2222] text-[10px] tracking-widest uppercase font-bold">Top Pages</h2>
          <div className="border border-[#1a0000] bg-[#050000] p-3 flex flex-col gap-1">
            {data.visits.topPages.length === 0 && <span className="text-[#3a0000] text-[10px]">No data yet</span>}
            {data.visits.topPages.map(({ path, count }) => (
              <div key={path} className="flex items-center justify-between py-0.5 border-b border-[#0a0000]">
                <span className="text-[#4a3030] text-[10px] font-mono truncate flex-1">{path}</span>
                <span className="text-[#ff2222] text-[10px] tabular-nums font-bold ml-2">{count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Orders + Messages ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatBox label="Pending Orders"  value={data.orders.pending}            color="#ff6b00" />
        <StatBox label="Confirmed Orders"value={data.orders.confirmed}          color="#00ff41" />
        <StatBox label="Revenue"         value={`$${data.orders.revenue.toFixed(2)}`} color="#ffd700" sub="confirmed only" />
        <StatBox label="Open Messages"   value={data.messages.open}             color="#00e5ff" sub={`of ${data.messages.total} total`} />
      </div>

      {/* ── Top products + Low stock ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <section className="flex flex-col gap-2">
          <h2 className="text-[#ff2222] text-[10px] tracking-widest uppercase font-bold">Top Products by Orders</h2>
          <div className="border border-[#1a0000] bg-[#050000] p-3 flex flex-col gap-1">
            {data.topProducts.length === 0 && <span className="text-[#3a0000] text-[10px]">No orders yet</span>}
            {data.topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2 py-1 border-b border-[#0a0000]">
                <span className="text-[#3a0000] text-[10px] w-4 shrink-0">#{i + 1}</span>
                <span className="text-base">{p.symbol}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[#ff2222] text-[10px] font-bold truncate block">{p.name}</span>
                  <span className="text-[#4a3030] text-[9px]">{p.category}</span>
                </div>
                <span className="text-[#ffd700] text-[10px] font-bold tabular-nums">{p.orders} orders</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-[#ff2222] text-[10px] tracking-widest uppercase font-bold">Low Stock Alerts</h2>
          <div className="border border-[#1a0000] bg-[#050000] p-3 flex flex-col gap-1">
            {data.lowStock.length === 0 && <span className="text-[#00ff41] text-[10px]">All stock levels are healthy</span>}
            {data.lowStock.map(p => (
              <div key={p.name} className="flex items-center gap-2 py-1 border-b border-[#0a0000]">
                <span className="text-base">{p.symbol}</span>
                <span className="text-[#ff6b00] text-[10px] font-bold flex-1">{p.name}</span>
                <span className="text-[#ff2222] text-[10px] tabular-nums font-bold">{p.amountIn} left</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Quick links ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Manage Products',   href: '/admin/products',   desc: 'Add, edit assets' },
          { label: 'Categories',        href: '/admin/categories', desc: 'Organise taxonomy' },
          { label: 'View Orders',       href: '/admin/orders',     desc: 'Confirm payments' },
          { label: 'Site Settings',     href: '/admin/settings',   desc: 'Config & wallets' },
        ].map(item => (
          <a key={item.href} href={item.href}
            className="flex flex-col gap-1 p-3 border border-[#1a0000] hover:border-[#ff2222] bg-[#050000] hover:bg-[#0a0000] transition-all group">
            <span className="text-[#ff2222] text-[11px] font-bold tracking-wider group-hover:text-glow">{item.label} →</span>
            <span className="text-[#3a0000] text-[9px]">{item.desc}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
