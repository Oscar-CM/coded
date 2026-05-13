import { type DbProduct, rarityColors, statusConfig, RARITY_IDX, type Rarity, type StockStatus } from '@/lib/products'

interface AssetCardProps {
  product: DbProduct
  onClick?: (product: DbProduct) => void
}

export default function AssetCard({ product, onClick }: AssetCardProps) {
  const rarityColor = rarityColors[product.rarity as Rarity] ?? '#4a5568'
  const statusCfg = statusConfig[product.status as StockStatus] ?? statusConfig.in_stock
  const rarityIndex = RARITY_IDX.indexOf(product.rarity)

  return (
    <button
      onClick={() => onClick?.(product)}
      className="relative flex flex-col rounded-none border-2 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff41] text-left"
      style={{
        width: '168px',
        borderColor: rarityColor,
        boxShadow: `0 0 12px ${rarityColor}44, 0 4px 20px rgba(0,0,0,0.8)`,
        background: '#050505',
      }}
    >
      {/* Top rarity stripe */}
      <div className="absolute top-0 left-0 right-0 h-0.5 z-10"
        style={{ background: `linear-gradient(90deg, transparent, ${rarityColor}, transparent)` }} />

      {/* Card art */}
      <div className="relative w-full h-[110px] flex items-center justify-center overflow-hidden shrink-0"
        style={{ background: product.cardBg }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `repeating-linear-gradient(45deg, ${product.cardAccent}22 0px, ${product.cardAccent}22 1px, transparent 1px, transparent 8px)` }} />
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 168 110" fill="none">
          <path d="M0 20 L10 20 L10 10 L20 10" stroke={product.cardAccent} strokeWidth="1" />
          <path d="M168 20 L158 20 L158 10 L148 10" stroke={product.cardAccent} strokeWidth="1" />
          <path d="M0 90 L10 90 L10 100 L20 100" stroke={product.cardAccent} strokeWidth="1" />
          <path d="M168 90 L158 90 L158 100 L148 100" stroke={product.cardAccent} strokeWidth="1" />
          <line x1="0" y1="55" x2="30" y2="55" stroke={product.cardAccent} strokeWidth="0.5" strokeDasharray="4 3" />
          <line x1="138" y1="55" x2="168" y2="55" stroke={product.cardAccent} strokeWidth="0.5" strokeDasharray="4 3" />
        </svg>
        <div className="relative z-10 flex flex-col items-center gap-1">
          <span className="text-4xl select-none" style={{ filter: `drop-shadow(0 0 8px ${product.cardAccent})` }}>
            {product.symbol}
          </span>
          <span className="text-[9px] tracking-widest font-bold uppercase"
            style={{ color: product.cardAccent, textShadow: `0 0 6px ${product.cardAccent}` }}>
            {product.category.name}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-1.5 p-2.5 flex-1" style={{ background: '#07090a' }}>
        <span className="text-[11px] font-bold leading-tight tracking-wide"
          style={{ color: rarityColor, textShadow: `0 0 6px ${rarityColor}66` }}>
          {product.name}
        </span>

        {/* Rarity pips */}
        <div className="flex items-center gap-1">
          {RARITY_IDX.map((r, i) => (
            <div key={r} className="w-3 h-1"
              style={{ background: rarityIndex >= i ? rarityColor : '#1a1a1a', opacity: rarityIndex >= i ? 1 : 0.3 }} />
          ))}
          <span className="text-[8px] ml-0.5 uppercase tracking-widest" style={{ color: rarityColor, opacity: 0.7 }}>
            {product.rarity}
          </span>
        </div>

        <p className="text-[8.5px] text-[#4a7a4a] leading-[1.4] line-clamp-2 mt-0.5">{product.description}</p>

        <div className="h-px w-full mt-auto" style={{ background: `${rarityColor}22` }} />

        {/* Prices */}
        <div className="flex justify-between items-end text-[9px] font-bold tracking-wider">
          <div className="flex flex-col items-start">
            <span className="text-[#4a7a4a] text-[7px] uppercase">IN STOCK</span>
            <span className="text-[11px]"
              style={{ color: product.amountIn === 0 ? '#ff2222' : product.amountIn <= 5 ? '#ff6b00' : '#00ff41' }}>
              {product.amountIn === 0 ? '—' : product.amountIn}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[#4a7a4a] text-[7px] uppercase">PRICE</span>
            <span className="text-[11px] text-[#ffd700]">${product.sellingPrice.toFixed(2)}</span>
            {product.potentialEarnings && (
              <span className="text-[7px] text-[#00e5ff] opacity-70">
                ~${product.potentialEarnings.toFixed(0)} potential
              </span>
            )}
          </div>
        </div>

        <div className="w-full text-center text-[7.5px] font-bold py-0.5 tracking-widest uppercase"
          style={{ color: statusCfg.color, background: statusCfg.bg, border: `1px solid ${statusCfg.color}33` }}>
          {statusCfg.label}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${rarityColor}, transparent)` }} />
    </button>
  )
}
