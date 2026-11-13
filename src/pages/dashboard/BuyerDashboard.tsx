import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTrading } from '@/context/TradingContext'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { Package, Clock, CheckCircle2, Coins, ArrowRight, type LucideIcon } from 'lucide-react'

// Statuses that count as an active trade for the buyer
const ACTIVE_STATUSES = ['reserved','inspecting','payment_pending','verified']

function fmt(n: number) { return `₦${n.toLocaleString()}` }

function StatCard({ icon: Icon, label, value, sub, accent = false }:
  { icon: LucideIcon; label: string; value: string|number; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border flex flex-col gap-3
                     ${accent ? 'bg-teal/10 border-teal/25' : 'bg-white/[0.04] border-white/[0.07]'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                       ${accent ? 'bg-teal/25' : 'bg-white/[0.07]'}`}>
        <Icon size={19} strokeWidth={1.7} className={accent ? 'text-teal-light' : 'text-white/50'}/>
      </div>
      <div>
        <p className="text-[2rem] font-extrabold text-white tracking-tight leading-none">{value}</p>
        <p className="text-[12.5px] text-white/50 mt-1">{label}</p>
        {sub && <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function BuyerDashboard() {
  const { user }     = useAuth()
  const { listings } = useTrading()
  const navigate     = useNavigate()

  const myPurchases    = listings.filter(l => l.buyerId === user?.id)
  const available      = listings.filter(l => l.status === 'verified')  // buyers only see verified
  const activeTrades   = myPurchases.filter(l => ACTIVE_STATUSES.includes(l.status))
  const completedBuys  = myPurchases.filter(l => l.status === 'completed')
  const totalSpent     = completedBuys.reduce((s, l) => s + (l.agreedTotal ?? l.totalPrice), 0)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <DashboardShell
      title="Overview"
      subtitle={`${greeting}, ${user?.fullName?.split(' ')[0] ?? ''}`}
    >
      <div className="p-6 flex flex-col gap-8">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Package}      label="Available Waste"  value={available.length} accent />
          <StatCard icon={Clock}        label="Active Trades"    value={activeTrades.length} />
          <StatCard icon={CheckCircle2} label="Completed Buys"   value={completedBuys.length} />
          <StatCard icon={Coins}        label="Total Spent"      value={fmt(totalSpent)} />
        </div>

        {/* ── Available Now ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-semibold text-white">Available Now</p>
            <button onClick={() => navigate('/dashboard/market')}
              className="text-[13px] text-teal-light hover:underline flex items-center gap-1 cursor-pointer">
              Browse all <ArrowRight size={13}/>
            </button>
          </div>
          {available.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
              <p className="text-[14px] text-white/30">No verified waste available yet.</p>
              <p className="text-[13px] text-white/20 mt-1">You'll get a notification when a Weigher verifies new waste.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {available.slice(0, 4).map(l => (
                <button
                  key={l.id}
                  onClick={() => navigate('/dashboard/market')}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.04]
                             border border-white/[0.06] hover:bg-white/[0.07] cursor-pointer transition-all"
                >
                  <div className="text-left">
                    <p className="text-[13.5px] font-semibold text-white capitalize">{l.wasteType.replace('_',' ')} — {l.estimatedWeight} kg</p>
                    <p className="text-[12px] text-white/35">{l.locationArea} · {l.sourcerName}</p>
                  </div>
                  <p className="text-[14px] font-bold text-teal-light">{fmt(l.totalPrice)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
