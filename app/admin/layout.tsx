'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { label: 'Overview',   href: '/admin/overview',   icon: '◈' },
  { label: 'Products',   href: '/admin/products',   icon: '▸' },
  { label: 'Categories', href: '/admin/categories', icon: '▸' },
  { label: 'Orders',     href: '/admin/orders',     icon: '▸' },
  { label: 'Messages',   href: '/admin/messages',   icon: '✉' },
  { label: 'Settings',   href: '/admin/settings',   icon: '⚙' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [ready, setReady]           = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (pathname === '/admin') { setReady(true); return }
    if (sessionStorage.getItem('cl_admin') !== '1') {
      router.replace('/admin')
    } else {
      setReady(true)
    }
  }, [router, pathname])

  // Close mobile nav when route changes
  useEffect(() => { setSidebarOpen(false) }, [pathname])

  if (!ready) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <span className="text-[#ff2222] text-xs tracking-widest">VERIFYING...</span>
    </div>
  )

  if (pathname === '/admin') return <>{children}</>

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-[#3a0000] bg-[#0a0000] shrink-0 z-50 relative">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="md:hidden w-7 h-7 flex items-center justify-center text-[#ff2222] hover:text-[#ff4444] transition-colors text-base"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <span className="text-[#ff2222] font-bold text-sm tracking-widest" style={{ textShadow: '0 0 8px #ff222266' }}>
            CODEDLOGS ADMIN
          </span>
          <span className="text-[#3a0000] text-xs hidden sm:block">/ MANAGEMENT CONSOLE</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <a href="/dashboard"
            className="text-[#4a7a4a] text-[10px] hover:text-[#00ff41] tracking-wider transition-colors hidden sm:block">
            ← STOREFRONT
          </a>
          <button
            onClick={() => { sessionStorage.removeItem('cl_admin'); router.push('/admin') }}
            className="text-[10px] text-[#ff2222] border border-[#3a0000] hover:border-[#ff2222] px-2 py-1 transition-colors tracking-widest"
          >
            LOGOUT
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/70 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — fixed overlay on mobile, always-visible inline on desktop */}
        <aside className={[
          // Mobile: fixed overlay sliding from left
          'fixed inset-y-0 left-0 z-40 w-52',
          // Desktop: always-visible inline
          'md:relative md:z-auto md:inset-y-auto md:left-auto md:w-44 md:translate-x-0 md:shrink-0',
          'border-r border-[#3a0000] bg-[#0a0000] flex flex-col transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}>
          {/* Mobile close + branding */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#3a0000] md:hidden">
            <span className="text-[#ff2222] text-xs font-bold tracking-widest">ADMIN</span>
            <button onClick={() => setSidebarOpen(false)} className="text-[#4a3030] hover:text-[#ff2222] text-sm">✕</button>
          </div>

          <nav className="flex flex-col gap-0.5 p-2 sm:p-3 flex-1 overflow-y-auto">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'flex items-center gap-2 px-3 py-2.5 text-[11px] tracking-wider transition-all rounded-none',
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'text-[#ff2222] bg-[#1a0000] border-l-2 border-[#ff2222]'
                    : 'text-[#4a3030] hover:text-[#ff2222] hover:bg-[#0f0000]',
                ].join(' ')}
              >
                <span className="text-sm">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-3 border-t border-[#3a0000] flex flex-col gap-1">
            <a href="/dashboard" className="text-[#4a3030] text-[9px] hover:text-[#00ff41] tracking-wider transition-colors md:hidden">
              ← Back to Storefront
            </a>
            <span className="text-[#3a0000] text-[9px] tracking-widest hidden md:block">ADMIN SESSION</span>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-[#050000] p-3 sm:p-5 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
