'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { updateOrderStatus } from '@/lib/actions/orders'

interface Order {
  id: string; email: string; amount: number; currency: string
  txHash: string | null; status: string; createdAt: string
  product: { name: string; symbol: string; category: { name: string } }
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#ff6b00', confirmed: '#00ff41', failed: '#ff2222', refunded: '#4a7a4a'
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/orders')
    const data = await res.json()
    setOrders(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleStatus(id: string, status: string) {
    await updateOrderStatus(id, status)
    await load()
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-[#3a0000] pb-4">
        <div>
          <h1 className="text-[#ff2222] font-bold text-lg tracking-widest">ORDERS</h1>
          <p className="text-[#4a3030] text-xs">{orders.length} total</p>
        </div>
        <div className="flex gap-1.5 text-[9px]">
          {['all', 'pending', 'confirmed', 'failed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={['px-2 py-1 border tracking-wider transition-all', filter === f
                ? 'border-[#ff2222] text-[#ff2222] bg-[#1a0000]'
                : 'border-[#1a0000] text-[#4a3030] hover:border-[#ff2222]'].join(' ')}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? <span className="text-[#4a3030] text-xs tracking-widest">LOADING...</span> : (
        <div className="flex flex-col gap-0 border border-[#1a0000]">
          {filtered.length === 0 && <div className="px-3 py-4 text-[#4a3030] text-xs">No orders.</div>}
          {filtered.map(order => (
            <div key={order.id} className="flex flex-col gap-2 px-3 py-3 border-b border-[#0f0000] hover:bg-[#0a0000]">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{order.product.symbol}</span>
                    <span className="text-[#ff2222] text-xs font-bold">{order.product.name}</span>
                    <span className="text-[#4a3030] text-[10px]">({order.product.category.name})</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[#4a3030] flex-wrap">
                    <span>{order.email}</span>
                    <span className="text-[#ffd700] font-bold">${order.amount.toFixed(2)} {order.currency}</span>
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  {order.txHash && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[9px] text-[#4a3030]">TX:</span>
                      <span className="text-[9px] text-[#00e5ff] font-mono break-all">{order.txHash}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] font-bold tracking-wider px-2 py-0.5"
                    style={{ color: STATUS_COLORS[order.status] ?? '#4a3030', border: `1px solid ${STATUS_COLORS[order.status] ?? '#1a0000'}44` }}>
                    {order.status.toUpperCase()}
                  </span>

                  {order.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatus(order.id, 'confirmed')}
                        className="text-[9px] text-[#00ff41] border border-[#00ff4133] hover:bg-[#003b00] px-2 py-0.5 transition-colors">
                        ✓ CONFIRM
                      </button>
                      <button onClick={() => handleStatus(order.id, 'failed')}
                        className="text-[9px] text-[#ff2222] border border-[#ff222233] hover:bg-[#1a0000] px-2 py-0.5 transition-colors">
                        ✗ FAIL
                      </button>
                    </>
                  )}
                  {order.status === 'confirmed' && (
                    <button onClick={() => handleStatus(order.id, 'refunded')}
                      className="text-[9px] text-[#4a7a4a] border border-[#1a0000] hover:border-[#4a7a4a] px-2 py-0.5 transition-colors">
                      REFUND
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
