'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { updateSettings } from '@/lib/actions/settings'

type SettingGroup = { label: string; icon: string; keys: Array<{ key: string; label: string; type?: 'text' | 'password' | 'color' | 'toggle' | 'number'; placeholder?: string; hint?: string }> }

const GROUPS: SettingGroup[] = [
  {
    label: 'Branding', icon: '◈',
    keys: [
      { key: 'site_name',    label: 'Site Name',    placeholder: 'CodedLogs', hint: 'Shown in the header and browser tab' },
      { key: 'site_tagline', label: 'Tagline',       placeholder: 'Digital Asset Repository', hint: 'Shown in header subtitle' },
      { key: 'support_email',label: 'Support Email', placeholder: 'support@codedlogs.io' },
      { key: 'currency_symbol', label: 'Currency Symbol', placeholder: '$' },
    ],
  },
  {
    label: 'Access Control', icon: '🔒',
    keys: [
      { key: 'store_passcode', label: 'Store Passcode', type: 'password', placeholder: 'CODEDLOGS',  hint: 'Users enter this to access the store gate.' },
      { key: 'admin_passcode', label: 'Admin Passcode', type: 'password', placeholder: 'ADMIN2099',  hint: 'Password to access this admin panel.' },
    ],
  },
  {
    label: 'Announcement Banner', icon: '📡',
    keys: [
      { key: 'banner_enabled', label: 'Enable Banner', type: 'toggle', hint: 'Show a banner at the top of the store' },
      { key: 'banner_message', label: 'Banner Message', placeholder: 'New drops every Friday!', hint: 'Text shown in the banner' },
      { key: 'banner_color',   label: 'Banner Color',  type: 'color', hint: 'Accent color for the banner' },
    ],
  },
  {
    label: 'Crypto Wallets', icon: '₿',
    keys: [
      { key: 'wallet_btc',         label: 'Bitcoin (BTC)',    placeholder: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', hint: 'Receiving address for BTC payments' },
      { key: 'wallet_eth',         label: 'Ethereum (ETH)',   placeholder: '0x742d35Cc...', hint: 'Receiving address for ETH payments' },
      { key: 'wallet_usdt_trc20',  label: 'USDT (TRC-20)',   placeholder: 'TYDzsYUE...', hint: 'TRON network USDT address' },
      { key: 'wallet_bnb',         label: 'BNB',             placeholder: 'bnb1grpf0...', hint: 'BNB Smart Chain address' },
    ],
  },
  {
    label: 'Inventory', icon: '📦',
    keys: [
      { key: 'low_stock_threshold', label: 'Low Stock Threshold', type: 'number', placeholder: '5', hint: 'Products at or below this count show as "Almost Out"' },
      { key: 'featured_limit',      label: 'Featured Limit',      type: 'number', placeholder: '8', hint: 'Maximum number of featured products shown first' },
    ],
  },
]

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/admin/all-settings').then(r => r.json()).then(setValues).catch(() => {})
  }, [])

  function set(key: string, value: string) { setValues(v => ({ ...v, [key]: value })) }
  function toggleReveal(key: string) { setRevealedKeys(prev => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s }) }

  async function handleSave() {
    setSaving(true); setSaved(false)
    try {
      await updateSettings(values)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#3a0000] pb-4">
        <div>
          <h1 className="text-[#ff2222] font-bold text-lg tracking-widest">SITE SETTINGS</h1>
          <p className="text-[#4a3030] text-xs">Configure your CodedLogs platform</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className={['border px-5 py-2 text-xs tracking-widest font-bold transition-all disabled:opacity-50',
            saved ? 'border-[#00ff41] text-[#00ff41] bg-[#003b00]' : 'border-[#ff2222] bg-[#ff2222] text-black hover:bg-transparent hover:text-[#ff2222]'].join(' ')}>
          {saving ? 'SAVING...' : saved ? '✓ SAVED' : '▸ SAVE ALL'}
        </button>
      </div>

      {GROUPS.map(group => (
        <div key={group.label} className="flex flex-col gap-3 border border-[#1a0000] bg-[#050000] p-4">
          <h2 className="text-[#ff2222] text-xs font-bold tracking-widest flex items-center gap-2">
            <span>{group.icon}</span>{group.label.toUpperCase()}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {group.keys.map(field => (
              <div key={field.key} className="flex flex-col gap-1">
                <label className="text-[#4a3030] text-[9px] tracking-widest uppercase">{field.label}</label>

                {field.type === 'toggle' ? (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" checked={values[field.key] === 'true'}
                        onChange={e => set(field.key, e.target.checked ? 'true' : 'false')}
                        className="sr-only" />
                      <div className={['w-10 h-5 rounded-full transition-colors duration-200',
                        values[field.key] === 'true' ? 'bg-[#ff2222]' : 'bg-[#1a0000]'].join(' ')}>
                        <div className={['absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200',
                          values[field.key] === 'true' ? 'translate-x-5' : 'translate-x-0.5'].join(' ')} />
                      </div>
                    </div>
                    <span className={['text-xs', values[field.key] === 'true' ? 'text-[#ff2222]' : 'text-[#4a3030]'].join(' ')}>
                      {values[field.key] === 'true' ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </label>

                ) : field.type === 'color' ? (
                  <div className="flex items-center gap-2">
                    <input type="color" value={values[field.key] ?? '#ff6b00'}
                      onChange={e => set(field.key, e.target.value)}
                      className="w-8 h-8 border border-[#3a0000] cursor-pointer bg-transparent rounded-none" />
                    <div className="flex items-center gap-2 flex-1 border border-[#3a0000] bg-black px-3 py-1.5">
                      <input type="text" value={values[field.key] ?? ''}
                        onChange={e => set(field.key, e.target.value)}
                        className="flex-1 bg-transparent text-[#ff2222] text-xs outline-none font-mono" />
                    </div>
                    <div className="w-8 h-8 border border-[#3a0000]"
                      style={{ background: values[field.key] ?? '#ff6b00' }} />
                  </div>

                ) : field.type === 'password' ? (
                  <div className="flex items-center gap-2 border border-[#3a0000] bg-black px-3 py-1.5 focus-within:border-[#ff2222] transition-colors">
                    <input
                      type={revealedKeys.has(field.key) ? 'text' : 'password'}
                      value={values[field.key] ?? ''}
                      onChange={e => set(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="flex-1 bg-transparent text-[#ff2222] text-xs outline-none placeholder:text-[#1a0000]" />
                    <button type="button" onClick={() => toggleReveal(field.key)}
                      className="text-[#3a0000] hover:text-[#ff2222] text-[10px] shrink-0 transition-colors">
                      {revealedKeys.has(field.key) ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>

                ) : (
                  <div className="flex items-center gap-2 border border-[#3a0000] bg-black px-3 py-1.5 focus-within:border-[#ff2222] transition-colors">
                    <input type={field.type ?? 'text'} value={values[field.key] ?? ''}
                      onChange={e => set(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="flex-1 bg-transparent text-[#ff2222] text-xs outline-none placeholder:text-[#1a0000]" />
                  </div>
                )}

                {field.hint && <span className="text-[#2a0000] text-[9px]">{field.hint}</span>}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Preview banner */}
      {values.banner_enabled === 'true' && values.banner_message && (
        <div className="flex flex-col gap-2">
          <span className="text-[#4a3030] text-[9px] tracking-widest">BANNER PREVIEW</span>
          <div className="text-center text-[10px] font-bold tracking-widest py-2"
            style={{ background: `${values.banner_color ?? '#ff6b00'}22`, color: values.banner_color ?? '#ff6b00', border: `1px solid ${values.banner_color ?? '#ff6b00'}44` }}>
            ◈ {values.banner_message} ◈
          </div>
        </div>
      )}

      <button onClick={handleSave} disabled={saving}
        className={['w-full sm:w-auto sm:self-end border px-8 py-2.5 text-sm tracking-widest font-bold transition-all disabled:opacity-50',
          saved ? 'border-[#00ff41] text-[#00ff41] bg-[#003b00]' : 'border-[#ff2222] bg-[#ff2222] text-black hover:bg-transparent hover:text-[#ff2222]'].join(' ')}>
        {saving ? 'SAVING...' : saved ? '✓ ALL CHANGES SAVED' : '▸ SAVE ALL SETTINGS'}
      </button>
    </div>
  )
}
