'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')
  const [checking, setChecking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (sessionStorage.getItem('cl_admin') === '1') {
      router.replace('/admin/overview')
    } else {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || checking) return
    setChecking(true)
    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: input.trim() }),
      })
      const { valid } = await res.json()
      if (valid) {
        setStatus('success')
        sessionStorage.setItem('cl_admin', '1')
        setTimeout(() => router.push('/admin/overview'), 800)
      } else {
        setStatus('error')
        setInput('')
        setTimeout(() => setStatus('idle'), 600)
      }
    } catch {
      setStatus('error')
      setInput('')
      setTimeout(() => setStatus('idle'), 600)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 scanlines">
      <div className="w-full max-w-sm flex flex-col gap-5 animate-slide-up">
        <div className="flex flex-col gap-1">
          <span className="text-[#ff2222] text-xs tracking-widest">⚠ RESTRICTED ACCESS</span>
          <h1 className="text-[#00ff41] text-glow-strong text-xl font-bold tracking-widest">ADMIN TERMINAL</h1>
          <p className="text-[#4a7a4a] text-[10px]">CodedLogs Management Console v1.0</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className={['flex items-center gap-3 crt-border bg-[#050f05] px-4 py-3',
            status === 'error' ? 'animate-shake border-[#ff2222]!' : status === 'success' ? 'border-[#00ff41]!' : ''].join(' ')}>
            <span className="text-[#ff2222] shrink-0">&gt;_</span>
            <input ref={inputRef} type="password" value={input} onChange={e => setInput(e.target.value)}
              placeholder="admin code"
              className="flex-1 bg-transparent text-[#ff2222] placeholder:text-[#1a0000] text-sm outline-none"
              disabled={status === 'success' || checking} />
          </div>
          <button type="submit" disabled={!input || status === 'success' || checking}
            className="crt-border bg-[#1a0000] hover:bg-[#ff2222] hover:text-black text-[#ff2222] py-2 text-sm tracking-widest uppercase transition-all disabled:opacity-30 font-bold cursor-pointer">
            {checking ? '[ VERIFYING... ]' : status === 'success' ? '[ ✓ ACCESS GRANTED ]' : '[ AUTHENTICATE ]'}
          </button>
        </form>

        <a href="/" className="text-[#1a3a1a] text-[10px] text-center hover:text-[#4a7a4a] transition-colors tracking-widest">
          ← Return to CodedLogs
        </a>
      </div>
    </div>
  )
}
