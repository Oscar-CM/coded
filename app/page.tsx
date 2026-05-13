'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// Passcode is validated server-side via /api/auth/passcode (configurable in admin settings)

const ASCII_LOGO = `
 ██████╗ ██████╗ ██████╗ ███████╗██████╗ ██╗      ██████╗  ██████╗ ███████╗
██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔══██╗██║     ██╔═══██╗██╔════╝ ██╔════╝
██║     ██║   ██║██║  ██║█████╗  ██║  ██║██║     ██║   ██║██║  ███╗███████╗
██║     ██║   ██║██║  ██║██╔══╝  ██║  ██║██║     ██║   ██║██║   ██║╚════██║
╚██████╗╚██████╔╝██████╔╝███████╗██████╔╝███████╗╚██████╔╝╚██████╔╝███████║
 ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝ ╚══════╝`

export default function PasscodePage() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const [lockTimer, setLockTimer] = useState(0)
  const [logLines, setLogLines] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sessionStorage.getItem('cl_authed') === '1') {
      const email = sessionStorage.getItem('cl_email')
      if (email) { router.replace('/dashboard'); return }
      router.replace('/email')
      return
    }

    const bootLines = [
      'CODEDLOGS SECURE TERMINAL v2.4.1',
      'Copyright (c) 2099 CodedLogs Corp. All rights reserved.',
      '',
      'Initializing secure channel.................. [OK]',
      'Encrypting connection........................ [OK]',
      'Loading asset repository..................... [OK]',
      'Authentication module active.',
      '',
      '⚠  ACCESS RESTRICTED — AUTHORIZED USERS ONLY',
    ]

    let i = 0
    const interval = setInterval(() => {
      if (i < bootLines.length) {
        const line = bootLines[i]
        i++
        setLogLines((prev) => [...prev, line])
      } else {
        clearInterval(interval)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }, 120)

    return () => clearInterval(interval)
  }, [router])

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logLines])

  useEffect(() => {
    if (locked && lockTimer > 0) {
      const t = setTimeout(() => setLockTimer((n) => n - 1), 1000)
      return () => clearTimeout(t)
    }
    if (locked && lockTimer === 0) {
      setLocked(false)
      setAttempts(0)
      setLogLines((prev) => [...prev, 'Lockout expired. You may try again.'])
    }
  }, [locked, lockTimer])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (locked || status === 'success') return

    const entered = input.trim()
    setInput('')
    setLogLines((prev) => [...prev, `> ${'*'.repeat(entered.length)}`])

    // Validate passcode server-side (admin can change it in settings)
    let valid = false
    try {
      const res = await fetch('/api/auth/passcode', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: entered }) })
      const data = await res.json()
      valid = data.valid === true
    } catch {
      valid = false
    }

    if (valid) {
      setStatus('success')
      setLogLines((prev) => [
        ...prev,
        '',
        '[ ✓ ACCESS GRANTED ]',
        'Redirecting to identity verification...',
      ])
      sessionStorage.setItem('cl_authed', '1')
      setTimeout(() => router.push('/email'), 1200)
    } else {
      const next = attempts + 1
      setAttempts(next)
      setStatus('error')

      if (next >= 3) {
        setLocked(true)
        setLockTimer(30)
        setLogLines((prev) => [
          ...prev,
          `[ ✗ ACCESS DENIED ] — ${next} failed attempts.`,
          'SECURITY LOCKOUT ENGAGED: 30 seconds.',
        ])
      } else {
        setLogLines((prev) => [
          ...prev,
          `[ ✗ ACCESS DENIED ] — Attempt ${next}/3.`,
        ])
      }

      setTimeout(() => setStatus('idle'), 600)
    }
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

      <div className="relative z-10 w-full max-w-3xl flex flex-col gap-6">
        {/* ASCII Logo */}
        <pre
          className="text-[#00ff41] text-[5.5px] sm:text-[7px] leading-tight select-none animate-glow-pulse overflow-x-hidden"
          aria-label="CodedLogs"
        >
          {ASCII_LOGO}
        </pre>

        {/* Terminal log window */}
        <div
          ref={logRef}
          className="crt-border bg-[#050f05] p-4 h-44 overflow-y-auto text-xs leading-5 font-mono"
        >
          {logLines.map((line, i) => (
            <div
              key={i}
              className={
                line.includes('✓ ACCESS GRANTED')
                  ? 'text-[#00ff41] font-bold'
                  : line.includes('✗ ACCESS DENIED') || line.includes('LOCKOUT')
                    ? 'text-[#ff2222]'
                    : line.includes('RESTRICTED') || line.includes('AUTHORIZED') || line.includes('⚠')
                      ? 'text-[#ffd700]'
                      : 'text-[#00b32d]'
              }
            >
              {line || ' '}
            </div>
          ))}
          {status !== 'success' && (
            <div className="flex items-center text-[#00ff41] mt-1">
              <span className="text-[#4a7a4a]">root@codedlogs:~#&nbsp;</span>
              <span className="cursor-blink" />
            </div>
          )}
        </div>

        {/* Passcode input form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <span className="text-[#4a7a4a] text-xs tracking-widest uppercase">
            ╔═══ ENTER ACCESS CODE ═══╗
          </span>

          <div
            className={[
              'flex items-center gap-3 crt-border bg-[#050f05] px-4 py-3 transition-all duration-200',
              status === 'error' ? 'animate-shake !border-[#ff2222] !shadow-[0_0_10px_#ff222244]' : '',
              status === 'success' ? '!border-[#00ff41] !shadow-[0_0_12px_#00ff4166]' : '',
              locked ? 'opacity-40 cursor-not-allowed' : '',
            ].join(' ')}
          >
            <span className="text-[#00ff41] text-glow select-none text-sm shrink-0">&gt;_</span>
            <div className="relative flex-1 h-7 overflow-hidden">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => !locked && setInput(e.target.value.toUpperCase())}
                onPaste={(e) => e.preventDefault()}
                className="absolute inset-0 opacity-0 w-full h-full"
                autoComplete="off"
                spellCheck={false}
                disabled={locked || status === 'success'}
                maxLength={20}
              />
              <span className="text-[#00ff41] tracking-[0.4em] text-base pointer-events-none select-none leading-7">
                {'▪'.repeat(input.length)}
                <span className="cursor-blink align-bottom" />
              </span>
            </div>

            {locked && (
              <span className="text-[#ff2222] text-xs font-bold shrink-0 tabular-nums">
                🔒 {lockTimer}s
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={locked || input.length === 0 || status === 'success'}
            className="crt-border bg-[#003b00] hover:bg-[#00b32d] hover:text-black text-[#00ff41] text-glow py-2 px-6 text-sm tracking-widest uppercase transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold"
          >
            {status === 'success' ? '[ ✓ AUTHENTICATED ]' : '[ AUTHENTICATE ]'}
          </button>
        </form>

        <p className="text-[#1a3a1a] text-[10px] text-center tracking-widest uppercase">
          Unauthorized access is prohibited and will be logged · CodedLogs Security System
        </p>
      </div>
    </div>
  )
}
