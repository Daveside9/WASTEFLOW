import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTrading } from '@/context/TradingContext'
import type { WasteListing } from '@/context/TradingContext'
import DashboardShell from '@/components/dashboard/DashboardShell'
import VerifyListingModal from '@/components/dashboard/VerifyListingModal'
import {
  Package, Scale, CheckCircle2, Coins, MapPin, Star,
  Clock, TrendingUp, Award, ShieldCheck, type LucideIcon,
} from 'lucide-react'

function fmt(n: number) { return `₦${n.toLocaleString()}` }

// ─── Stat card ────────────────────────────────────────────────────────────────

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

// ─── Star rating display ──────────────────────────────────────────────────────

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={16}
          strokeWidth={1.5}
          className={i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-white/20'}
        />
      ))}
      <span className="ml-1.5 text-[13px] font-semibold text-white/70">{rating.toFixed(1)}</span>
    </div>
  )
}

// ─── Profile card ─────────────────────────────────────────────────────────────

function WeigherProfileCard({ verifiedCount, totalWeight }: { verifiedCount: number; totalWeight: number }) {
  const { user } = useAuth()

  // Derive a simple rating from verified count (demo logic — replace with real ratings later)
  const rating = Math.min(5, 3.5 + verifiedCount * 0.15)
  const badge  = verifiedCount >= 20 ? 'Expert Weigher'
               : verifiedCount >= 10 ? 'Certified Weigher'
               : verifiedCount >= 3  ? 'Active Weigher'
               : 'New Weigher'

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-teal/20 flex items-center justify-center">
          <span className="text-[1.4rem] font-extrabold text-teal-light">
            {user?.avatarInitials ?? '??'}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="text-[16px] font-bold text-white truncate">{user?.fullName}</h2>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full
                             bg-teal/20 text-teal-light border border-teal/30">
              {badge}
            </span>
          </div>
          <p className="text-[12.5px] text-white/40 mb-3">{user?.email}</p>
          <StarRating rating={rating} />
        </div>
      </div>

      {/* Details row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/[0.06]">

        {/* Location */}
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
            <MapPin size={15} strokeWidth={1.8} className="text-teal-light" />
          </div>
          <div>
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-0.5">Hub Location</p>
            <p className="text-[13px] font-semibold text-white">{user?.region ?? 'Not set'}</p>
            <p className="text-[11.5px] text-white/35">Coastal zone</p>
          </div>
        </div>

        {/* Verifications done */}
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={15} strokeWidth={1.8} className="text-teal-light" />
          </div>
          <div>
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-0.5">Verifications</p>
            <p className="text-[13px] font-semibold text-white">{verifiedCount} completed</p>
            <p className="text-[11.5px] text-white/35">Total verified</p>
          </div>
        </div>

        {/* Total weight processed */}
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
            <TrendingUp size={15} strokeWidth={1.8} className="text-teal-light" />
          </div>
          <div>
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-0.5">Weight Processed</p>
            <p className="text-[13px] font-semibold text-white">{totalWeight.toLocaleString()} kg</p>
            <p className="text-[11.5px] text-white/35">Across all verifications</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Achievement badges ───────────────────────────────────────────────────────

function Achievements({ verifiedCount }: { verifiedCount: number }) {
  const badges = [
    { icon: Award,       label: 'First Verification', unlocked: verifiedCount >= 1,  desc: 'Complete your first verification' },
    { icon: ShieldCheck, label: '5 Verified',          unlocked: verifiedCount >= 5,  desc: 'Verify 5 listings' },
    { icon: Scale,       label: '10 Verified',         unlocked: verifiedCount >= 10, desc: 'Verify 10 listings' },
    { icon: TrendingUp,  label: 'Power Weigher',       unlocked: verifiedCount >= 20, desc: 'Verify 20 listings' },
  ]

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
      <p className="text-[13px] font-semibold text-white mb-4">Achievements</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {badges.map(({ icon: Icon, label, unlocked, desc }) => (
          <div
            key={label}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center
                        ${unlocked
                          ? 'border-teal/30 bg-teal/10'
                          : 'border-white/[0.06] bg-white/[0.02] opacity-40'}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                             ${unlocked ? 'bg-teal/25' : 'bg-white/[0.05]'}`}>
              <Icon size={17} strokeWidth={1.7} className={unlocked ? 'text-teal-light' : 'text-white/30'} />
            </div>
            <p className={`text-[11.5px] font-semibold leading-tight ${unlocked ? 'text-white' : 'text-white/30'}`}>
              {label}
            </p>
            {!unlocked && <p className="text-[10.5px] text-white/20 leading-tight">{desc}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function WeigherDashboard() {
  const { user }     = useAuth()
  const { listings } = useTrading()
  const navigate     = useNavigate()
  const [selected, setSelected] = useState<WasteListing | null>(null)

  const pending              = listings.filter(l => l.status === 'available')
  const verifiedByMe         = listings.filter(l => l.weigherId === user?.id)
  const totalVerifiedWeight  = verifiedByMe.reduce((s, l) => s + (l.verifiedWeight ?? 0), 0)
  const totalVerifiedValue   = verifiedByMe.reduce((s, l) => s + (l.verifiedTotal ?? 0), 0)

  // Sort queue: newest first
  const queue = [...pending].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

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
      <div className="p-6 flex flex-col gap-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Package}      label="Pending Verification" value={pending.length} accent />
          <StatCard icon={CheckCircle2} label="Verified by Me"       value={verifiedByMe.length} />
          <StatCard icon={Scale}        label="Total Weight"         value={`${totalVerifiedWeight} kg`} />
          <StatCard icon={Coins}        label="Verified Value"       value={fmt(totalVerifiedValue)} sub="from all verifications" />
        </div>

        {/* ── Profile card ── */}
        <WeigherProfileCard
          verifiedCount={verifiedByMe.length}
          totalWeight={totalVerifiedWeight}
        />

        {/* ── Achievements ── */}
        <Achievements verifiedCount={verifiedByMe.length} />

        {/* ── Verification Queue ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-semibold text-white">Verification Queue</p>
              {pending.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-teal text-white text-[10px]
                                 font-bold flex items-center justify-center">
                  {pending.length}
                </span>
              )}
            </div>
            <button
              onClick={() => navigate('/dashboard/market')}
              className="text-[13px] text-teal-light hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>

          {queue.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
              <Scale size={28} className="text-white/15 mx-auto mb-3" strokeWidth={1.3} />
              <p className="text-[14px] text-white/30">No listings waiting for verification.</p>
              <p className="text-[13px] text-white/20 mt-1">You'll be notified when a seller posts new waste.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {queue.slice(0, 5).map(l => (
                <div
                  key={l.id}
                  className="flex items-center justify-between p-4 rounded-xl
                             bg-white/[0.04] border border-white/[0.06]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Pulse indicator — new item */}
                    <span className="relative flex-shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-light block" />
                      <span className="absolute inset-0 rounded-full bg-teal-light animate-ping opacity-60" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold text-white capitalize truncate">
                        {l.wasteType.replace('_', ' ')} — {l.estimatedWeight} kg (est.)
                      </p>
                      <p className="text-[12px] text-white/35 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} /> {l.locationArea}
                        <span className="mx-1 text-white/15">·</span>
                        <Clock size={11} /> {new Date(l.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(l)}
                    className="flex-shrink-0 ml-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl
                               bg-teal hover:bg-teal-dark text-white text-[13px] font-semibold
                               cursor-pointer shadow-teal transition-all"
                  >
                    <Scale size={13} strokeWidth={2} /> Verify
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Recent verifications ── */}
        {verifiedByMe.length > 0 && (
          <div>
            <p className="text-[14px] font-semibold text-white mb-4">My Recent Verifications</p>
            <div className="flex flex-col gap-2">
              {verifiedByMe.slice(0, 4).map(l => (
                <div
                  key={l.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl
                             bg-white/[0.03] border border-white/[0.05]"
                >
                  <div>
                    <p className="text-[13px] font-semibold text-white capitalize">
                      {l.wasteType.replace('_', ' ')} — {l.verifiedWeight} kg
                    </p>
                    <p className="text-[11.5px] text-white/35">
                      {l.sourcerName} · {l.verifiedAt ? new Date(l.verifiedAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <span className="text-[13px] font-bold text-teal-light">
                    {fmt(l.verifiedTotal ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selected && <VerifyListingModal listing={selected} onClose={() => setSelected(null)} />}
    </DashboardShell>
  )
}
