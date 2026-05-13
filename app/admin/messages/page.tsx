'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { updateSettings } from '@/lib/actions/settings'

interface Message {
  id: string; name: string; email: string; category: string; subject: string
  message: string; status: string; priority: string; adminNotes: string | null; createdAt: string
}

const PRIORITY_COLORS: Record<string, string> = { urgent: '#ff2222', high: '#ff6b00', normal: '#00e5ff', low: '#4a7a4a' }
const STATUS_COLORS:   Record<string, string> = { open: '#ff6b00', 'in_progress': '#ffd700', resolved: '#00ff41', closed: '#4a3030' }

const CAT_LABELS: Record<string, string> = {
  general: 'General', technical: 'Technical', payment_issue: 'Payment',
  refund: 'Refund', report_abuse: 'Abuse', partnership: 'Partnership',
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const data: Message[] = await fetch('/api/contact').then(r => r.json())
    setMessages(data)
    // Pre-fill admin notes
    const n: Record<string, string> = {}
    data.forEach(m => { if (m.adminNotes) n[m.id] = m.adminNotes })
    setNotes(n)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/contact/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    await load()
  }

  async function saveNotes(id: string) {
    setSaving(id)
    await fetch(`/api/contact/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminNotes: notes[id] ?? '' }) })
    setSaving(null)
    await load()
  }

  const filtered = filter === 'all' ? messages : messages.filter(m => m.status === filter)

  const counts = {
    open:        messages.filter(m => m.status === 'open').length,
    in_progress: messages.filter(m => m.status === 'in_progress').length,
    resolved:    messages.filter(m => m.status === 'resolved').length,
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-[#3a0000] pb-4">
        <div>
          <h1 className="text-[#ff2222] font-bold text-lg tracking-widest">MESSAGES</h1>
          <p className="text-[#4a3030] text-xs">
            {counts.open} open · {counts.in_progress} in progress · {counts.resolved} resolved
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 text-[9px] flex-wrap">
        {[['all','ALL'],['open','OPEN'],['in_progress','IN PROGRESS'],['resolved','RESOLVED'],['closed','CLOSED']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={['px-3 py-1 border tracking-wider transition-all',
              filter === v ? 'border-[#ff2222] text-[#ff2222] bg-[#0a0000]' : 'border-[#1a0000] text-[#4a3030] hover:border-[#ff2222]'].join(' ')}>
            {l}
            {v !== 'all' && counts[v as keyof typeof counts] != null && (
              <span className="ml-1 opacity-60">({counts[v as keyof typeof counts] ?? 0})</span>
            )}
          </button>
        ))}
      </div>

      {loading ? <span className="text-[#4a3030] text-xs tracking-widest">LOADING...</span> : (
        <div className="flex flex-col gap-2">
          {filtered.length === 0 && <span className="text-[#4a3030] text-xs">No messages.</span>}
          {filtered.map(msg => (
            <div key={msg.id} className="border border-[#1a0000] bg-[#050000]">
              {/* Message header row */}
              <button onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
                className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-[#0a0000] transition-colors">
                {/* Priority dot */}
                <span className="w-2 h-2 rounded-full shrink-0 mt-1"
                  style={{ background: PRIORITY_COLORS[msg.priority] ?? '#4a3030' }} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[#ff2222] text-xs font-bold truncate">{msg.subject}</span>
                    <span className="text-[9px] px-1.5 py-0.5 border shrink-0"
                      style={{ color: STATUS_COLORS[msg.status] ?? '#4a3030', borderColor: `${STATUS_COLORS[msg.status] ?? '#4a3030'}44` }}>
                      {msg.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-[#3a0000] text-[9px] border border-[#1a0000] px-1.5 py-0.5 shrink-0">
                      {CAT_LABELS[msg.category] ?? msg.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[#4a3030] mt-0.5">
                    <span>{msg.name}</span>
                    <span>{msg.email}</span>
                    <span className="hidden sm:block">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <span className="text-[#3a0000] text-[8px] shrink-0 mt-0.5"
                  style={{ transform: expanded === msg.id ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>▶</span>
              </button>

              {/* Expanded detail */}
              {expanded === msg.id && (
                <div className="border-t border-[#0f0000] px-4 py-3 flex flex-col gap-3">
                  {/* Message body */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[#4a3030] text-[9px] tracking-widest uppercase">Message</span>
                    <p className="text-[#7aaa7a] text-xs leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>

                  {/* Admin notes */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[#4a3030] text-[9px] tracking-widest uppercase">Admin Notes</span>
                    <textarea value={notes[msg.id] ?? ''}
                      onChange={e => setNotes(n => ({ ...n, [msg.id]: e.target.value }))}
                      placeholder="Internal notes (not visible to user)..."
                      rows={2}
                      className="bg-black border border-[#1a0000] text-[#ff2222] text-xs px-3 py-2 outline-none resize-none focus:border-[#ff2222] w-full placeholder:text-[#1a0000]" />
                    <button onClick={() => saveNotes(msg.id)} disabled={saving === msg.id}
                      className="self-start border border-[#3a0000] text-[#4a3030] hover:border-[#ff2222] hover:text-[#ff2222] px-3 py-1 text-[9px] tracking-widest transition-all disabled:opacity-50">
                      {saving === msg.id ? 'SAVING...' : 'SAVE NOTES'}
                    </button>
                  </div>

                  {/* Status actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[#4a3030] text-[9px] tracking-widest uppercase">Change Status:</span>
                    {['open','in_progress','resolved','closed'].map(s => (
                      <button key={s} onClick={() => updateStatus(msg.id, s)}
                        disabled={msg.status === s}
                        className="text-[9px] px-2 py-1 border tracking-wider transition-all disabled:opacity-30"
                        style={msg.status !== s ? { borderColor: STATUS_COLORS[s], color: STATUS_COLORS[s] } : { borderColor: '#1a0000', color: '#4a3030' }}>
                        {s.replace('_', ' ').toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
