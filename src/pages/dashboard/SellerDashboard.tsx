import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTrading } from '@/context/TradingContext'
import type { CreateListingInput } from '@/context/TradingContext'
import DashboardShell from '@/components/dashboard/DashboardShell'
import CreateListingModal from '@/components/dashboard/CreateListingModal'
import WasteHotspotMap from '@/components/dashboard/WasteHotspotMap'
import SellerRatingCard from '@/components/dashboard/SellerRating'
import { Package, Clock, CheckCircle2, Coins, TrendingUp, ArrowRight, Plus, type LucideIcon } from 'lucide-react'

const ACTIVE_STATUSES = ['reserved', 'inspecting', 'payment_pending', 'verified']

function StatCard({ icon: Icon, label, value, sub, accent = false }:
  { icon: LucideIcon; label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border flex flex-col gap-3
                     ${accent ? 'bg-teal/10 border-teal/25' : 'bg-white/[0.04] border-white/[0.07]'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                       ${accent ? 'bg-teal/25' : 'bg-white/[0.07]'}`}>
        <Icon size={19} strokeWidth={1.7} className={accent ? 'text-teal-light' : 'text-white/50'} />
      </div>
      <div>
        <p className="text-[2rem] font-extrabold text-white tracking-tight leading-none">{value}</p>
        <p className="text-[12.5px] text-white/50 mt-1">{label}</p>
        {sub && <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function statusBadge(status: string) {
  if (status === 'available') return 'bg-sky-500/15 text-sky-300 border-sky-500/30'
  if (status === 'verified')  return 'bg-teal/20 text-teal-light border-teal/30'
  if (status === 'completed') return 'bg-green-500/15 text-green-400 border-green-500/30'
  return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
}

const STATUS_LABELS: Record<string, string> = {
  available:       'Awaiting Verification',
  verified:        'Verified',
  reserved:        'Reserved',
  inspecting:      'Inspecting',
  payment_pending: 'Payment Pending',
  completed:       'Completed',
  cancelled:       'Cancelled',
}

export default function SellerDashboard() {
  const { user }                        = useAuth()
  const { listings }     = useTrading()
  const navigate                        = useNavigate()
  const [showCreate, setShowCreate]     = useState(false)
  const [prefill,    setPrefill]        = useState<Partial<CreateListingInput> | null>(null)

  const myListings      = listings.filter(l => l.sourcerId === user?.id)
  const activeTrades    = myListings.filter(l => ACTIVE_STATUSES.includes(l.status))
  const completedTrades = myListings.filter(l => l.status === 'completed')
  const totalCredits    = myListings.reduce((s, l) => s + (l.blueCreditsEarned ?? 0), 0)
  const totalEarned     = completedTrades.reduce((s, l) => s + (l.agreedTotal ?? l.totalPrice), 0)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  // Called from the hotspot map's Quick List button
  const handleHotspotList = (data: Partial<CreateListingInput>) => {
    setPrefill(data)
    setShowCreate(true)
  }

  return (
    <DashboardShell
      title="Overview"
      subtitle={`${greeting}, ${user?.fullName?.split(' ')[0] ?? ''}`}
    >
      <div className="p-6 flex flex-col gap-8">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Package}      label="My Listings"      value={myListings.length} />
          <StatCard icon={Clock}        label="Active Trades"    value={activeTrades.length} accent />
          <StatCard icon={CheckCircle2} label="Completed Trades" value={completedTrades.length} />
          <StatCard icon={Coins}        label="Blue Credits"     value={totalCredits} sub="from verified trades" accent />
        </div>

        {/* ── Earnings banner ── */}
        {totalEarned > 0 && (
          <div className="bg-teal/10 border border-teal/20 rounded-2xl px-5 py-4 flex items-center gap-4">
            <TrendingUp size={24} className="text-teal-light flex-shrink-0" strokeWidth={1.6} />
            <div>
              <p className="text-[14px] font-bold text-white">
                ₦{totalEarned.toLocaleString()}{' '}
                <span className="text-white/40 font-normal text-[13px]">total earned from trades</span>
              </p>
              <p className="text-[12px] text-white/40">Based on agreed prices at inspection</p>
            </div>
          </div>
        )}

        {/* ── AI Waste Hotspot Map ── */}
        <WasteHotspotMap onCreateListing={handleHotspotList} />

        {/* ── Seller Reputation ── */}
        <SellerRatingCard stats={{
          completedTrades: completedTrades.length,
          totalKgSold:     completedTrades.reduce((s, l) => s + (l.agreedWeight ?? l.estimatedWeight), 0),
          totalEarned,
        }} />

        {/* ── My Recent Listings ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-semibold text-white">My Recent Listings</p>
            <button
              onClick={() => navigate('/dashboard/market')}
              className="text-[13px] text-teal-light hover:underline flex items-center gap-1 cursor-pointer"
            >
              View all <ArrowRight size={13} />
            </button>
          </div>

          {myListings.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
              <p className="text-[14px] text-white/30 mb-3">No listings yet</p>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal hover:bg-teal-dark
                           text-white text-[13.5px] font-semibold cursor-pointer shadow-teal transition-all"
              >
                <Plus size={16} strokeWidth={2.5} /> Post Your First Listing
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {myListings.slice(0, 5).map(l => (
                <button
                  key={l.id}
                  onClick={() => navigate('/dashboard/market')}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.04]
                             border border-white/[0.06] hover:bg-white/[0.07] cursor-pointer
                             transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-teal-light flex-shrink-0" />
                    <div className="text-left min-w-0">
                      <p className="text-[13.5px] font-semibold text-white capitalize truncate">
                        {l.wasteType.replace('_', ' ')} — {l.estimatedWeight} kg
                      </p>
                      <p className="text-[12px] text-white/35">{l.locationArea}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusBadge(l.status)}`}>
                      {STATUS_LABELS[l.status] ?? l.status}
                    </span>
                    <ArrowRight size={14} className="text-white/20 group-hover:text-teal-light transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateListingModal
          prefill={prefill ?? undefined}
          onClose={() => { setShowCreate(false); setPrefill(null) }}
        />
      )}
    </DashboardShell>
  )
}
