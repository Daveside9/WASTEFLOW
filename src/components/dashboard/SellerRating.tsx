import { Star, ShieldCheck, TrendingUp, Award } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

export interface SellerStats {
  completedTrades: number
  totalKgSold:     number
  totalEarned:     number
}

export function calcSellerRating(stats: SellerStats): {
  rating:    number
  label:     string
  color:     string
  loyaltyPct: number
} {
  const { completedTrades, totalKgSold } = stats

  // Rating formula:
  // Base 3.0 for first completed trade
  // +0.2 per completed trade (capped contribution)
  // +0.1 per 100 kg sold
  // Max 5.0
  const raw = completedTrades === 0
    ? 0
    : Math.min(5, 3.0 + completedTrades * 0.2 + (totalKgSold / 100) * 0.1)

  const rating = Math.round(raw * 10) / 10

  const label =
    completedTrades === 0 ? 'New Seller' :
    rating >= 4.5         ? 'Top Seller' :
    rating >= 4.0         ? 'Trusted Seller' :
    rating >= 3.5         ? 'Reliable Seller' :
    rating >= 3.0         ? 'Active Seller' :
                            'New Seller'

  const color =
    rating >= 4.5 ? '#22C55E' :
    rating >= 4.0 ? '#0FA68E' :
    rating >= 3.5 ? '#3B82F6' :
    rating >= 3.0 ? '#F59E0B' :
                    '#6B7280'

  // Loyalty % — based on how many trades out of milestones completed
  const loyaltyPct = Math.min(100, Math.round((completedTrades / 10) * 100))

  return { rating, label, color, loyaltyPct }
}

// ─── Star display ─────────────────────────────────────────────────────────────

export function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.floor(rating)
        const half   = !filled && i < rating
        return (
          <Star
            key={i}
            size={size}
            strokeWidth={1.5}
            className={
              filled ? 'text-amber-400 fill-amber-400' :
              half   ? 'text-amber-400 fill-amber-400/40' :
                       'text-white/15'
            }
          />
        )
      })}
    </div>
  )
}

// ─── Full seller rating card ──────────────────────────────────────────────────

export default function SellerRatingCard({ stats }: { stats: SellerStats }) {
  const { rating, label, color, loyaltyPct } = calcSellerRating(stats)
  const { completedTrades, totalKgSold, totalEarned } = stats

  const milestones = [
    { icon: Award,       label: 'First Sale',    unlocked: completedTrades >= 1,  target: 1  },
    { icon: ShieldCheck, label: '5 Trades',       unlocked: completedTrades >= 5,  target: 5  },
    { icon: TrendingUp,  label: 'Top Seller',     unlocked: completedTrades >= 10, target: 10 },
    { icon: Star,        label: 'Elite Seller',   unlocked: completedTrades >= 20, target: 20 },
  ]

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 flex flex-col gap-5">
      <p className="text-[13px] font-semibold text-white">Seller Reputation</p>

      {/* Rating row */}
      <div className="flex items-center gap-4">
        {/* Score circle */}
        <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 border"
             style={{ background: `${color}18`, borderColor: `${color}40` }}>
          <span className="text-[1.5rem] font-extrabold leading-none" style={{ color }}>
            {completedTrades === 0 ? '—' : rating.toFixed(1)}
          </span>
          <span className="text-[9px] text-white/30 mt-0.5">/ 5.0</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <StarDisplay rating={rating} size={15} />
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: color }}>
              {label}
            </span>
          </div>
          <p className="text-[11.5px] text-white/35">
            {completedTrades === 0
              ? 'Complete your first trade to earn a rating'
              : `Based on ${completedTrades} completed trade${completedTrades !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Loyalty bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[11.5px] font-semibold text-white/50">Loyalty Progress</p>
          <p className="text-[11.5px] font-bold text-teal-light">{loyaltyPct}%</p>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${loyaltyPct}%`, background: color }}
          />
        </div>
        <p className="text-[10.5px] text-white/25 mt-1.5">
          {completedTrades < 10
            ? `${10 - completedTrades} more trade${10 - completedTrades !== 1 ? 's' : ''} to reach Top Seller`
            : '🏆 Top Seller status achieved!'}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Trades Done',  value: completedTrades },
          { label: 'Total kg Sold', value: `${totalKgSold.toLocaleString()} kg` },
          { label: 'Total Earned',  value: `₦${totalEarned.toLocaleString()}` },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.04] rounded-xl p-2.5 text-center border border-white/[0.05]">
            <p className="text-[13px] font-bold text-white">{s.value}</p>
            <p className="text-[9.5px] text-white/30 uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Milestones */}
      <div>
        <p className="text-[11.5px] font-semibold text-white/40 uppercase tracking-wider mb-2.5">Milestones</p>
        <div className="grid grid-cols-4 gap-2">
          {milestones.map(({ icon: Icon, label: ml, unlocked, target }) => (
            <div key={ml}
                 className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center
                             ${unlocked
                               ? 'border-teal/30 bg-teal/10'
                               : 'border-white/[0.05] bg-white/[0.02] opacity-40'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                               ${unlocked ? 'bg-teal/25' : 'bg-white/[0.05]'}`}>
                <Icon size={15} strokeWidth={1.7} className={unlocked ? 'text-teal-light' : 'text-white/30'} />
              </div>
              <p className={`text-[10px] font-semibold leading-tight
                             ${unlocked ? 'text-white' : 'text-white/25'}`}>
                {ml}
              </p>
              {!unlocked && (
                <p className="text-[9px] text-white/20">{target} trades</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
