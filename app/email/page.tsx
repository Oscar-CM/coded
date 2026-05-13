'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function EmailPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (sessionStorage.getItem('cl_authed') !== '1') {
      router.replace('/')
      return
    }
    if (sessionStorage.getItem('cl_email')) {
      router.replace('/dashboard')
      return
    }
    setTimeout(() => inputRef.current?.focus(), 200)
  }, [router])

  function validate(val: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()

    if (!validate(trimmed)) {
      setErrorMsg('Invalid email format. Try again.')
      setStatus('error')
      setTimeout(() => setStatus('idle'), 600)
      return
    }

    setStatus('success')
    sessionStorage.setItem('cl_email', trimmed)
    setTimeout(() => router.push('/dashboard'), 900)
  }

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden scanlines animate-flicker">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#00ff41 1px, transparent 1px), linear-gradient(90deg, #00ff41 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-xl flex flex-col gap-6 animate-slide-up">
        {/* Header */}
        <div className="crt-border-bright bg-[#050f05] p-5 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#00ff41] text-glow-strong text-lg font-bold tracking-widest">
              CODEDLOGS
            </span>
            <span className="text-[#4a7a4a] text-xs">/ IDENTITY VERIFICATION</span>
          </div>
          <div className="text-[#00b32d] text-xs leading-5">
            <span className="text-[#4a7a4a]">STATUS:</span>{' '}
            <span className="text-[#00ff41]">AUTH_PASSED</span>
            <br />
            <span className="text-[#4a7a4a]">STEP:</span>{' '}
            <span className="text-[#ffd700]">02 / 02 — EMAIL REGISTRATION</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[#4a7a4a] text-xs tracking-widest uppercase">
              ╔═══ ENTER YOUR EMAIL ADDRESS ═══╗
            </label>

            <div
              className={[
                'flex items-center gap-3 crt-border bg-[#050f05] px-4 py-3 transition-all duration-200',
                status === 'error' ? 'animate-shake !border-[#ff2222] !shadow-[0_0_10px_#ff222244]' : '',
                status === 'success' ? '!border-[#00ff41] !shadow-[0_0_14px_#00ff4166]' : '',
              ].join(' ')}
            >
              <span className="text-[#00ff41] text-glow select-none text-sm shrink-0">&gt;_</span>
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@domain.com"
                className="flex-1 bg-transparent text-[#00ff41] placeholder:text-[#1a3a1a] text-sm outline-none caret-[#00ff41]"
                autoComplete="email"
                disabled={status === 'success'}
              />
              {status === 'success' && (
                <span className="text-[#00ff41] text-glow text-sm shrink-0">✓</span>
              )}
            </div>

            {status === 'error' && (
              <span className="text-[#ff2222] text-xs">{errorMsg}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={email.length === 0 || status === 'success'}
            className="crt-border bg-[#003b00] hover:bg-[#00b32d] hover:text-black text-[#00ff41] text-glow py-2 px-6 text-sm tracking-widest uppercase transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold"
          >
            {status === 'success' ? '[ ✓ IDENTITY CONFIRMED ]' : '[ CONFIRM IDENTITY ]'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-[#1a3a1a] text-[10px] text-center tracking-widest flex flex-col gap-1">
          <span>Your email is stored locally and used to personalize your session.</span>
          <span>No account creation required.</span>
        </div>
      </div>
    </div>
  )
}
