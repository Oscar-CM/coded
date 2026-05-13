'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

interface Settings { site_name?: string; banner_enabled?: string; banner_message?: string; banner_color?: string }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [time, setTime] = useState('')
  const [settings, setSettings] = useState<Settings>({})

  useEffect(() => {
    if (sessionStorage.getItem('cl_authed') !== '1') { router.replace('/'); return }
    const stored = sessionStorage.getItem('cl_email')
    if (!stored) { router.replace('/email'); return }
    setEmail(stored)
    fetch('/api/settings').then(r => r.json()).then(setSettings).catch(() => {})
    // Track this visit (fire-and-forget)
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: window.location.pathname }) }).catch(() => {})
  }, [router])

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  if (!email) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex items-center gap-3 text-[#00ff41]">
        <span className="cursor-blink" /><span className="text-sm tracking-widest">LOADING...</span>
      </div>
    </div>
  )

  const siteName = settings.site_name ?? 'CODEDLOGS'
  const bannerOn = settings.banner_enabled === 'true'
  const bannerColor = settings.banner_color ?? '#ff6b00'

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* ── Announcement Banner ── */}
      {bannerOn && settings.banner_message && (
        <div className="text-center text-[10px] font-bold tracking-widest py-1.5 px-4 shrink-0"
          style={{ background: `${bannerColor}22`, color: bannerColor, borderBottom: `1px solid ${bannerColor}44` }}>
          ◈ {settings.banner_message} ◈
        </div>
      )}

      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-[#1a3a1a] bg-[#020a02] shrink-0 z-50 relative">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile-only hamburger */}
          <button onClick={() => setMobileSidebarOpen(o => !o)}
            className="md:hidden text-[#00ff41] hover:text-[#00e5ff] text-sm transition-colors w-7 h-7 flex items-center justify-center shrink-0"
            aria-label="Open menu">
            ☰
          </button>
          <span className="text-[#00ff41] font-bold text-sm tracking-widest text-glow-strong animate-glow-pulse"
            style={{ letterSpacing: '0.2em' }}>
            {siteName.toUpperCase()}
          </span>
          <span className="text-[#1a3a1a] text-xs hidden sm:block">/ ASSET REPOSITORY</span>
        </div>

        <div className="hidden md:flex items-center gap-4 text-[9px] tracking-widest text-[#4a7a4a]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse inline-block" />SECURE
          </span>
          <span>SYS:ONLINE</span>
          <span className="text-[#00b32d] tabular-nums">{time}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 crt-border px-2 sm:px-3 py-1 bg-[#050f05]">
            <span className="text-[#4a7a4a] text-[10px] hidden sm:block">USER:</span>
            <span className="text-[#00ff41] text-glow text-[10px] sm:text-[11px] font-bold tracking-wide max-w-[110px] sm:max-w-[160px] truncate">
              {email}
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse shrink-0" />
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile backdrop */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 bg-black/70 z-30 md:hidden" onClick={() => setMobileSidebarOpen(false)} />
        )}

        {/* Sidebar:
            Mobile  → fixed overlay, toggled by hamburger
            Desktop → always visible, always full-width, no collapse */}
        <aside className={[
          // mobile: fixed slide-in
          'fixed inset-y-0 left-0 z-40 w-64',
          // desktop: always-visible inline sidebar
          'md:relative md:z-auto md:inset-y-auto md:left-auto md:w-56 md:translate-x-0',
          'border-r border-[#1a3a1a] bg-[#020a02] transition-transform duration-300 flex flex-col shrink-0',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}>
          <Sidebar onClose={() => setMobileSidebarOpen(false)} />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-black relative min-w-0">
          <div className="absolute inset-0 pointer-events-none opacity-[0.025] z-10"
            style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,255,65,0.5) 2px, rgba(0,255,65,0.5) 3px)' }} />
          <div className="relative z-0 p-3 sm:p-5">{children}</div>
        </main>
      </div>

      {/* ── Status bar ── */}
      <footer className="flex items-center justify-between px-3 sm:px-4 py-1 border-t border-[#1a3a1a] bg-[#020a02] text-[9px] text-[#1a3a1a] tracking-widest shrink-0">
        <span>{siteName.toUpperCase()} v2.4.1</span>
        <span className="hidden sm:block">AES-256 ENCRYPTED · ZERO LOGS</span>
        <span className="text-[#003b00]">SESSION: ACTIVE</span>
      </footer>
    </div>
  )
}
