'use client'

import { useEffect, useState } from 'react'
import { type DbProduct, rarityColors, statusConfig, RARITY_IDX, type Rarity, type StockStatus } from '@/lib/products'
import { createOrder } from '@/lib/actions/orders'

const CRYPTO_META = {
  BTC:  { label: 'Bitcoin',      symbol: '₿', color: '#f7931a', fallback: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',          settingKey: 'wallet_btc' },
  ETH:  { label: 'Ethereum',     symbol: 'Ξ', color: '#627eea', fallback: '0x742d35Cc6634C0532925a3b8D7c9B8c4A2e4f5a',    settingKey: 'wallet_eth' },
  USDT: { label: 'USDT (TRC20)', symbol: '₮', color: '#26a17b', fallback: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtHR',           settingKey: 'wallet_usdt_trc20' },
  BNB:  { label: 'BNB',          symbol: 'B', color: '#f3ba2f', fallback: 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2',   settingKey: 'wallet_bnb' },
}
type CryptoKey = keyof typeof CRYPTO_META

interface AssetDetailProps {
  product: DbProduct
  onClose: () => void
}

export default function AssetDetail({ product, onClose }: AssetDetailProps) {
  const rarityColor = rarityColors[product.rarity as Rarity] ?? '#4a5568'
  const rarityIndex = RARITY_IDX.indexOf(product.rarity)
  const statusCfg = statusConfig[product.status as StockStatus] ?? statusConfig.in_stock

  const [step, setStep] = useState<'info' | 'pay' | 'submit' | 'done'>('info')
  const [currency, setCurrency] = useState<CryptoKey>('BTC')
  const [txHash, setTxHash] = useState('')
  const [email, setEmail] = useState('')
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [wallets, setWallets] = useState<Record<string, string>>({})

  useEffect(() => {
    const stored = sessionStorage.getItem('cl_email')
    if (stored) setEmail(stored)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    // Load wallet addresses from settings
    fetch('/api/admin/wallets').then(r => r.json()).then(setWallets).catch(() => {})
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [onClose])

  function getAddress(key: CryptoKey) {
    return wallets[CRYPTO_META[key].settingKey] || CRYPTO_META[key].fallback
  }

  function copyAddress() {
    navigator.clipboard.writeText(getAddress(currency))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSubmitOrder() {
    if (!txHash.trim()) return
    setSubmitting(true)
    try {
      await createOrder({
        email: email || 'anonymous',
        productId: product.id,
        amount: product.sellingPrice,
        currency,
        txHash: txHash.trim(),
      })
      setStep('done')
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const wallet = { ...CRYPTO_META[currency], address: getAddress(currency) }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.88)' }} onClick={onClose}>
      <div className="relative w-full sm:w-auto sm:max-w-lg rounded-none border-2 overflow-hidden animate-slide-up"
        style={{ borderColor: rarityColor, boxShadow: `0 0 30px ${rarityColor}44`, background: '#07090a', maxHeight: '92dvh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b shrink-0"
          style={{ borderColor: `${rarityColor}33`, background: '#050f05' }}>
          <div className="flex items-center gap-2 text-[10px] tracking-widest text-[#4a7a4a]">
            {step !== 'info' && (
              <button onClick={() => setStep('info')} className="text-[#4a7a4a] hover:text-[#00ff41] mr-1">←</button>
            )}
            <span style={{ color: rarityColor }}>◈</span>
            <span>{step === 'info' ? 'ASSET DETAILS' : step === 'pay' ? 'CRYPTO PAYMENT' : step === 'submit' ? 'SUBMIT TX HASH' : 'ORDER PLACED'}</span>
          </div>
          <button onClick={onClose} className="text-[#4a7a4a] hover:text-[#ff2222] text-sm transition-colors" aria-label="Close">✕</button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(92dvh - 40px)' }}>

          {/* ─── INFO STEP ─── */}
          {step === 'info' && (<>
            {/* Card art */}
            <div className="relative w-full flex items-center justify-center overflow-hidden" style={{ height: 180, background: product.cardBg }}>
              <div className="absolute inset-0 opacity-25"
                style={{ backgroundImage: `repeating-linear-gradient(45deg, ${product.cardAccent}22 0px, ${product.cardAccent}22 1px, transparent 1px, transparent 8px)` }} />
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 500 180" fill="none">
                <path d="M0 36 L18 36 L18 18 L36 18" stroke={product.cardAccent} strokeWidth="1.5" />
                <path d="M500 36 L482 36 L482 18 L464 18" stroke={product.cardAccent} strokeWidth="1.5" />
                <path d="M0 144 L18 144 L18 162 L36 162" stroke={product.cardAccent} strokeWidth="1.5" />
                <path d="M500 144 L482 144 L482 162 L464 162" stroke={product.cardAccent} strokeWidth="1.5" />
                <circle cx="250" cy="90" r="50" stroke={product.cardAccent} strokeWidth="0.5" strokeDasharray="8 6" opacity="0.4" />
              </svg>
              <div className="relative z-10 flex flex-col items-center gap-2">
                <span className="text-6xl select-none" style={{ filter: `drop-shadow(0 0 14px ${product.cardAccent})` }}>{product.symbol}</span>
                <span className="text-[10px] tracking-widest font-bold uppercase" style={{ color: product.cardAccent, textShadow: `0 0 8px ${product.cardAccent}` }}>{product.category.name}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 p-4">
              {/* Name + rarity */}
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold tracking-wide" style={{ color: rarityColor, textShadow: `0 0 10px ${rarityColor}66` }}>{product.name}</h2>
                <div className="flex items-center gap-2">
                  {RARITY_IDX.map((r, i) => (
                    <div key={r} style={{ width: 20, height: 6, background: rarityIndex >= i ? rarityColor : '#1a1a1a', boxShadow: rarityIndex >= i ? `0 0 4px ${rarityColor}` : 'none' }} />
                  ))}
                  <span className="text-[10px] uppercase tracking-widest font-bold ml-1" style={{ color: rarityColor }}>{product.rarity}</span>
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-px" style={{ border: `1px solid ${rarityColor}22` }}>
                {[['CATEGORY', product.category.name], ['STATUS', statusCfg.label], ['RARITY', product.rarity.toUpperCase()], ['ID', `#${product.id.slice(-6)}`]].map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-0.5 p-2" style={{ background: '#050f05' }}>
                    <span className="text-[8px] text-[#4a7a4a] tracking-widest">{k}</span>
                    <span className="text-[11px] font-bold tracking-wide" style={{ color: k === 'STATUS' ? statusCfg.color : rarityColor }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              <p className="text-[12px] text-[#7aaa7a] leading-relaxed">{product.description}</p>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 p-3 text-center" style={{ border: `1px solid ${product.amountIn === 0 ? '#ff222233' : '#00ff4133'}`, background: '#050f05' }}>
                  <span className="text-[8px] text-[#4a7a4a] tracking-widest uppercase">In Stock</span>
                  <span className="text-3xl font-bold tabular-nums" style={{ color: product.amountIn === 0 ? '#ff2222' : product.amountIn <= 5 ? '#ff6b00' : '#00ff41' }}>
                    {product.amountIn === 0 ? '—' : product.amountIn}
                  </span>
                  <span className="text-[8px]" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 text-center" style={{ border: '1px solid #ffd70033', background: '#050f05' }}>
                  <span className="text-[8px] text-[#4a7a4a] tracking-widest uppercase">Price</span>
                  <span className="text-3xl font-bold tabular-nums text-[#ffd700]" style={{ textShadow: '0 0 10px #ffd70066' }}>${product.sellingPrice.toFixed(2)}</span>
                  <span className="text-[8px] text-[#4a7a4a]">per license</span>
                </div>
              </div>

              {/* Potential earnings — prominent panel above the CTA */}
              {product.potentialEarnings && (
                <div
                  className="flex items-center justify-between gap-4 px-4 py-3"
                  style={{ border: '1px solid #00e5ff33', background: '#00e5ff08' }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-[#4a7a4a] tracking-widest uppercase">Potential Earnings</span>
                    <span className="text-[11px] text-[#4a7a4a] leading-tight">
                      Minimum Value
                    </span>
                  </div>
                  <span
                    className="text-2xl font-bold tabular-nums shrink-0"
                    style={{ color: '#00e5ff', textShadow: '0 0 12px #00e5ff66' }}
                  >
                    ${product.potentialEarnings.toFixed(2)}
                  </span>
                </div>
              )}

              <button disabled={product.status === 'out_of_stock'}
                onClick={() => setStep('pay')}
                className="w-full py-3 text-sm font-bold tracking-widest uppercase transition-all duration-200 border disabled:opacity-30 disabled:cursor-not-allowed"
                style={product.status !== 'out_of_stock'
                  ? { color: '#000', background: rarityColor, borderColor: rarityColor, boxShadow: `0 0 16px ${rarityColor}66` }
                  : { color: '#ff2222', borderColor: '#ff222233', background: 'transparent' }}>
                {product.status === 'out_of_stock' ? '✕ OUT OF STOCK' : `▸ PAY WITH CRYPTO — $${product.sellingPrice.toFixed(2)}`}
              </button>
            </div>
          </>)}

          {/* ─── PAYMENT STEP ─── */}
          {step === 'pay' && (
            <div className="flex flex-col gap-4 p-4">
              <div className="flex flex-col gap-1">
                <span className="text-[#4a7a4a] text-[9px] tracking-widest">PAYING FOR</span>
                <span className="text-[#00ff41] font-bold">{product.name}</span>
                <span className="text-[#ffd700] text-lg font-bold">${product.sellingPrice.toFixed(2)}</span>
              </div>

              {/* Currency selector */}
              <div className="flex flex-col gap-2">
                <span className="text-[#4a7a4a] text-[9px] tracking-widest uppercase">Select Currency</span>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(CRYPTO_META) as [CryptoKey, typeof CRYPTO_META.BTC][]).map(([key, w]) => (
                    <button key={key} onClick={() => setCurrency(key)}
                      className="flex flex-col items-center gap-1 p-2 border text-center transition-all"
                      style={{ borderColor: currency === key ? w.color : '#1a3a1a', background: currency === key ? `${w.color}22` : '#050f05' }}>
                      <span className="text-lg font-bold" style={{ color: w.color }}>{w.symbol}</span>
                      <span className="text-[8px] tracking-widest" style={{ color: currency === key ? w.color : '#4a7a4a' }}>{key}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className="flex flex-col gap-2">
                <span className="text-[#4a7a4a] text-[9px] tracking-widest uppercase">{wallet.label} Address</span>
                <div className="flex items-center gap-2 crt-border bg-[#050f05] p-2">
                  <span className="text-[10px] text-[#00ff41] font-mono flex-1 break-all leading-tight">{wallet.address}</span>
                  <button onClick={copyAddress}
                    className="shrink-0 text-[9px] px-2 py-1 border transition-colors"
                    style={{ borderColor: copied ? '#00ff41' : '#1a3a1a', color: copied ? '#00ff41' : '#4a7a4a' }}>
                    {copied ? '✓ COPIED' : 'COPY'}
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="text-[10px] text-center p-2 border border-[#1a3a1a] text-[#4a7a4a]">
                Send exactly <span style={{ color: wallet.color }} className="font-bold">${product.sellingPrice.toFixed(2)} worth of {wallet.label}</span> to the address above
              </div>

              <button onClick={() => setStep('submit')}
                className="w-full py-2.5 text-sm font-bold tracking-widest uppercase border transition-all"
                style={{ color: wallet.color, borderColor: wallet.color, background: `${wallet.color}22` }}>
                I'VE SENT THE PAYMENT →
              </button>
            </div>
          )}

          {/* ─── SUBMIT TX HASH ─── */}
          {step === 'submit' && (
            <div className="flex flex-col gap-4 p-4">
              <div className="text-[10px] text-[#4a7a4a] leading-5">
                Paste your transaction hash below. Your order will be confirmed once we verify the payment on-chain.
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[#4a7a4a] text-[9px] tracking-widest">EMAIL (for delivery)</span>
                <div className="flex items-center gap-2 crt-border bg-[#050f05] px-3 py-2">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                    className="flex-1 bg-transparent text-[#00ff41] text-xs outline-none placeholder:text-[#1a3a1a]" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[#4a7a4a] text-[9px] tracking-widest">TRANSACTION HASH</span>
                <div className="flex items-center gap-2 crt-border bg-[#050f05] px-3 py-2">
                  <span className="text-[#4a7a4a] text-xs shrink-0">&gt;_</span>
                  <input type="text" value={txHash} onChange={e => setTxHash(e.target.value)}
                    placeholder="0x... or txid..."
                    className="flex-1 bg-transparent text-[#00ff41] text-xs outline-none placeholder:text-[#1a3a1a] font-mono" />
                </div>
              </div>

              <button onClick={handleSubmitOrder} disabled={!txHash.trim() || submitting}
                className="w-full py-2.5 text-sm font-bold tracking-widest uppercase border transition-all disabled:opacity-30"
                style={{ color: '#000', background: rarityColor, borderColor: rarityColor }}>
                {submitting ? 'SUBMITTING...' : '▸ SUBMIT ORDER'}
              </button>
            </div>
          )}

          {/* ─── DONE ─── */}
          {step === 'done' && (
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <span className="text-5xl">✓</span>
              <h3 className="text-[#00ff41] text-glow font-bold tracking-widest">ORDER RECEIVED</h3>
              <p className="text-[#4a7a4a] text-xs leading-5">
                Your payment is being verified on-chain.<br/>
                Delivery will be sent to <span className="text-[#00ff41]">{email || 'your email'}</span> once confirmed.
              </p>
              <button onClick={onClose}
                className="crt-border px-6 py-2 text-xs text-[#00ff41] tracking-widest hover:bg-[#003b00] transition-colors">
                CLOSE
              </button>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-0.5"
            style={{ background: `linear-gradient(90deg, transparent, ${rarityColor}, transparent)` }} />
        </div>
      </div>
    </div>
  )
}
