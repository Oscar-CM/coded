'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'

const CATEGORIES = [
  { value: 'general',        label: 'General Inquiry',      icon: '💬', eta: '24–48 hours',      color: '#00e5ff' },
  { value: 'technical',      label: 'Technical Issue',       icon: '🔧', eta: '4–8 hours',        color: '#00ff41' },
  { value: 'payment_issue',  label: 'Payment Problem',       icon: '💳', eta: '2–4 hours',        color: '#ff6b00' },
  { value: 'refund',         label: 'Refund Request',        icon: '↩️',  eta: '24–48 hours',      color: '#ffd700' },
  { value: 'report_abuse',   label: 'Report Content / Abuse',icon: '⚠️', eta: '1–2 hours',        color: '#ff2222' },
  { value: 'partnership',    label: 'Partnership Inquiry',   icon: '🤝', eta: '3–5 business days', color: '#bf00ff' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', category: '', subject: '', message: '' })
  const [step, setStep] = useState<'form' | 'sent'>('form')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const selected = CATEGORIES.find(c => c.value === form.category)

  function set(k: keyof typeof form, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.category || !form.subject || !form.message) {
      setError('Please fill in all fields.'); return
    }
    setSending(true); setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setStep('sent')
    } catch {
      setError('Network error. Please try again.')
    } finally { setSending(false) }
  }

  if (step === 'sent') return (
    <div className="max-w-lg mx-auto flex flex-col items-center gap-6 py-12 text-center">
      <span className="text-5xl">✓</span>
      <div>
        <h1 className="text-[#00ff41] text-glow font-bold text-xl tracking-widest">MESSAGE SENT</h1>
        <p className="text-[#4a7a4a] text-sm mt-2">Your inquiry has been received.</p>
      </div>
      {selected && (
        <div className="crt-border bg-[#050f05] p-4 w-full flex flex-col gap-1">
          <span className="text-[9px] text-[#4a7a4a] tracking-widest uppercase">Expected Response Time</span>
          <span className="text-lg font-bold" style={{ color: selected.color }}>{selected.eta}</span>
          <span className="text-[10px] text-[#4a7a4a]">for {selected.label}</span>
        </div>
      )}
      <a href="/dashboard"
        className="crt-border px-6 py-2 text-xs text-[#00ff41] tracking-widest hover:bg-[#003b00] transition-colors">
        ← BACK TO STORE
      </a>
    </div>
  )

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-[#1a3a1a] pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[#4a7a4a] text-xs hidden sm:block">root@codedlogs:~$</span>
          <h1 className="text-[#00ff41] text-glow font-bold text-sm tracking-widest uppercase">CONTACT SUPPORT</h1>
        </div>
        <p className="text-[#4a7a4a] text-xs">Select a category below — response times vary by priority.</p>
      </div>

      {/* Category picker */}
      <div className="flex flex-col gap-2">
        <span className="text-[#4a7a4a] text-[9px] tracking-widest uppercase">Inquiry Type</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat.value} type="button" onClick={() => set('category', cat.value)}
              className={['flex flex-col gap-1 p-2.5 border text-left transition-all',
                form.category === cat.value
                  ? 'border-current bg-[#050f05]'
                  : 'border-[#1a3a1a] hover:border-[#4a7a4a]'].join(' ')}
              style={form.category === cat.value ? { borderColor: cat.color } : {}}>
              <span className="text-base">{cat.icon}</span>
              <span className="text-[10px] font-bold leading-tight"
                style={{ color: form.category === cat.value ? cat.color : '#4a7a4a' }}>
                {cat.label}
              </span>
              <span className="text-[8px] text-[#1a3a1a]">~{cat.eta}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ETA banner */}
      {selected && (
        <div className="flex items-center gap-3 px-3 py-2 border text-[10px]"
          style={{ borderColor: `${selected.color}44`, background: `${selected.color}11`, color: selected.color }}>
          <span className="text-base">{selected.icon}</span>
          <span><strong>{selected.label}</strong> — expected response: <strong>{selected.eta}</strong></span>
        </div>
      )}

      {error && <p className="text-[#ff2222] text-xs">{error}</p>}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { k: 'name'  as const, label: 'Your Name',   type: 'text',  placeholder: 'John Doe' },
            { k: 'email' as const, label: 'Email Address',type: 'email', placeholder: 'you@example.com' },
          ].map(({ k, label, type, placeholder }) => (
            <div key={k} className="flex flex-col gap-1">
              <label className="text-[#4a7a4a] text-[9px] tracking-widest uppercase">{label}</label>
              <div className="flex items-center gap-2 crt-border bg-[#050f05] px-3 py-2">
                <input type={type} value={form[k]} onChange={e => set(k, e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent text-[#00ff41] text-xs outline-none placeholder:text-[#1a3a1a]" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[#4a7a4a] text-[9px] tracking-widest uppercase">Subject</label>
          <div className="flex items-center gap-2 crt-border bg-[#050f05] px-3 py-2">
            <input type="text" value={form.subject} onChange={e => set('subject', e.target.value)}
              placeholder="Brief description of your issue"
              className="flex-1 bg-transparent text-[#00ff41] text-xs outline-none placeholder:text-[#1a3a1a]" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[#4a7a4a] text-[9px] tracking-widest uppercase">
            Message <span className="text-[#1a3a1a]">({form.message.length}/2000)</span>
          </label>
          <div className="crt-border bg-[#050f05] px-3 py-2">
            <textarea value={form.message} onChange={e => set('message', e.target.value)}
              placeholder="Describe your issue in detail..."
              rows={5} maxLength={2000}
              className="w-full bg-transparent text-[#00ff41] text-xs outline-none placeholder:text-[#1a3a1a] resize-none" />
          </div>
        </div>

        <button type="submit" disabled={sending || !form.category}
          className="crt-border bg-[#003b00] hover:bg-[#00b32d] hover:text-black text-[#00ff41] text-glow py-2.5 text-sm tracking-widest uppercase transition-all disabled:opacity-30 font-bold">
          {sending ? '[ TRANSMITTING... ]' : '[ SEND MESSAGE ]'}
        </button>
      </form>
    </div>
  )
}
