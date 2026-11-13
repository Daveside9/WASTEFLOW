import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTrading } from '@/context/TradingContext'
import type { WasteListing } from '@/context/TradingContext'
import DashboardShell from '@/components/dashboard/DashboardShell'
import CreateListingModal, { WASTE_LABELS, WASTE_ICONS } from '@/components/dashboard/CreateListingModal'
import VerifyListingModal from '@/components/dashboard/VerifyListingModal'
import FlowTracker from '@/components/dashboard/FlowTracker'
import ChatGateway from '@/components/dashboard/ChatGateway'
import { StarDisplay } from '@/components/dashboard/SellerRating'
import { calcSellerRating } from '@/components/dashboard/SellerRating'
import {
  Plus, Scale, MapPin, Clock, ChevronRight,
  CheckCircle2, XCircle, Package, User,
  CreditCard, AlertTriangle, ShieldCheck, Eye,
  MessageSquare,
} from 'lucide-react'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  available:       'bg-sky-500/15 text-sky-300 border-sky-500/30',
  verified:        'bg-teal/20 text-teal-light border-teal/35',
  reserved:        'bg-amber-500/15 text-amber-400 border-amber-500/30',
  inspecting:      'bg-blue-500/15 text-blue-400 border-blue-500/30',
  payment_pending: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  completed:       'bg-green-500/15 text-green-400 border-green-500/30',
  cancelled:       'bg-white/[0.07] text-white/25 border-white/[0.07]',
}
const STATUS_LABELS: Record<string, string> = {
  available:       'Awaiting Verification',
  verified:        'Verified — Ready',
  reserved:        'Reserved',
  inspecting:      'Being Inspected',
  payment_pending: 'Payment Pending',
  completed:       'Completed',
  cancelled:       'Cancelled',
}

function fmt(n: number) { return `₦${n.toLocaleString()}` }
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Listing Card ─────────────────────────────────────────────────────────────

function ListingCard({ listing, onSelect }: { listing: WasteListing; onSelect: () => void }) {
  const Icon = WASTE_ICONS[listing.wasteType]
  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-2xl border border-white/[0.07] bg-white/[0.03]
                 hover:bg-white/[0.06] hover:border-teal/20 hover:-translate-y-0.5
                 transition-all duration-150 p-5 cursor-pointer group flex flex-col gap-4"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal/15 flex items-center justify-center flex-shrink-0">
            <Icon size={18} className="text-teal-light" strokeWidth={1.7} />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white">{WASTE_LABELS[listing.wasteType]}</p>
            <p className="text-[12px] text-white/40">{listing.sourcerName} · {listing.sourcerRegion}</p>
          </div>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${STATUS_STYLES[listing.status]}`}>
          {STATUS_LABELS[listing.status]}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/[0.04] rounded-xl p-2.5 text-center border border-white/[0.05]">
          <p className="text-[9.5px] text-white/30 uppercase tracking-wider mb-0.5">
            {listing.verifiedWeight ? 'Verified' : 'Est.'} Weight
          </p>
          <p className="text-[14px] font-bold text-white">
            {listing.verifiedWeight ?? listing.estimatedWeight} kg
          </p>
        </div>
        <div className="bg-white/[0.04] rounded-xl p-2.5 text-center border border-white/[0.05]">
          <p className="text-[9.5px] text-white/30 uppercase tracking-wider mb-0.5">Price/kg</p>
          <p className="text-[14px] font-bold text-teal-light">{fmt(listing.pricePerKg)}</p>
        </div>
        <div className="bg-white/[0.04] rounded-xl p-2.5 text-center border border-white/[0.05]">
          <p className="text-[9.5px] text-white/30 uppercase tracking-wider mb-0.5">
            {listing.agreedTotal ? 'Agreed Total' : listing.verifiedTotal ? 'Verified Total' : 'Est. Total'}
          </p>
          <p className="text-[14px] font-bold text-white">
            {listing.agreedTotal
              ? fmt(listing.agreedTotal)
              : listing.verifiedTotal
                ? fmt(listing.verifiedTotal)
                : fmt(listing.totalPrice)}
          </p>
        </div>
      </div>

      {/* Flow tracker */}
      {listing.status !== 'cancelled' && (
        <FlowTracker status={listing.status} compact />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[11.5px] text-white/30">
        <span className="flex items-center gap-1.5"><MapPin size={11} /> {listing.locationArea}</span>
        <span className="flex items-center gap-1.5">
          <Clock size={11} /> {fmtDate(listing.createdAt)}
          <ChevronRight size={13} className="text-white/15 group-hover:text-teal-light transition-colors ml-1" />
        </span>
      </div>
    </button>
  )
}

// ─── Listing Detail Modal ────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
      <span className="text-[12px] text-white/40">{label}</span>
      <span className="text-[13px] font-semibold text-white">{value}</span>
    </div>
  )
}

function ActionButton({
  onClick, children, variant = 'primary', disabled = false,
}: {
  onClick: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}) {
  const base = 'w-full py-3.5 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-teal hover:bg-teal-dark text-white shadow-teal',
    secondary: 'bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-white',
    danger:    'border border-red-500/30 text-red-400 hover:border-red-500/60 hover:bg-red-500/10',
  }
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]}`}>
      {children}
    </button>
  )
}

function ListingDetailModal({ listing: initial, onClose }: { listing: WasteListing; onClose: () => void }) {  const { user }   = useAuth()
  const trading    = useTrading()
  const listing    = trading.getListingById(initial.id) ?? initial

  const [meetPoint,    setMeetPoint]    = useState(listing.meetingPoint ?? '')
  const [meetTime,     setMeetTime]     = useState(listing.meetingTime  ?? '')
  const [agreedWeight, setAgreedWeight] = useState(String(listing.agreedWeight ?? listing.verifiedWeight ?? listing.estimatedWeight))
  const [subStep,      setSubStep]      = useState<'main' | 'schedule' | 'inspect'>('main')
  const [showVerify,   setShowVerify]   = useState(false)
  const [showChat,     setShowChat]     = useState(false)

  const isSeller        = user?.id === listing.sourcerId
  const isAssignedBuyer = user?.id === listing.buyerId
  const isBuyer         = user?.role === 'buyer'
  const isWeigher       = user?.role === 'weigher'
  const Icon            = WASTE_ICONS[listing.wasteType]

  // Chat: seller ↔ weigher only (when listing is assigned to a weigher or in-flight)
  const canChat = (
    (isSeller  && listing.weigherName) ||
    (isWeigher && listing.sourcerName)
  )
  const chatOtherName = isSeller  ? (listing.weigherName  ?? '') : listing.sourcerName
  const chatOtherRole = isSeller  ? 'weigher' : 'seller'
  const chatOtherId   = isSeller  ? (listing.weigherId ?? '') : listing.sourcerId

  // Seller reputation (computed from all listings in context)
  const { listings: allListings } = trading
  const sellerCompleted  = allListings.filter(l => l.sourcerId === listing.sourcerId && l.status === 'completed')
  const sellerStats = {
    completedTrades: sellerCompleted.length,
    totalKgSold:     sellerCompleted.reduce((s, l) => s + (l.agreedWeight ?? l.estimatedWeight), 0),
    totalEarned:     sellerCompleted.reduce((s, l) => s + (l.agreedTotal ?? l.totalPrice), 0),
  }
  const { rating, label: ratingLabel, color: ratingColor } = calcSellerRating(sellerStats)

  const inputClass = `w-full px-4 py-3 rounded-xl text-[14px] text-white bg-white/[0.06]
                      border border-white/[0.09] focus:border-teal outline-none placeholder:text-white/25 transition-all`

  // ── Condition badge ──
  const conditionBadge = listing.verifiedCondition
    ? listing.verifiedCondition === 'clean'        ? 'bg-green-500/15 text-green-400 border-green-500/30'
    : listing.verifiedCondition === 'moderate'     ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    : 'bg-red-500/15 text-red-400 border-red-500/30'
    : ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-[540px] max-h-[92vh] overflow-y-auto rounded-2xl border border-white/[0.08]"
        style={{ background: '#0B2233' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] sticky top-0 z-10"
             style={{ background: '#0B2233' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal/15 flex items-center justify-center">
              <Icon size={17} className="text-teal-light" strokeWidth={1.7} />
            </div>
            <div>
              <p className="text-[14.5px] font-bold text-white">{WASTE_LABELS[listing.wasteType]}</p>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[listing.status]}`}>
                {STATUS_LABELS[listing.status]}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white cursor-pointer">
            <XCircle size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">

          {/* Flow tracker */}
          {listing.status !== 'cancelled' && <FlowTracker status={listing.status} />}

          {/* Seller reputation strip */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                   style={{ background: `${ratingColor}20` }}>
                <span className="text-[12px] font-extrabold" style={{ color: ratingColor }}>
                  {sellerStats.completedTrades === 0 ? '—' : rating.toFixed(1)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <StarDisplay rating={rating} size={12} />
                  <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded-full text-white"
                        style={{ background: ratingColor }}>
                    {ratingLabel}
                  </span>
                </div>
                <p className="text-[11px] text-white/35 mt-0.5">
                  {listing.sourcerName} · {sellerStats.completedTrades} trade{sellerStats.completedTrades !== 1 ? 's' : ''} completed
                </p>
              </div>
            </div>
            {/* Chat button — seller ↔ weigher */}
            {canChat && (
              <button
                onClick={() => setShowChat(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal/10 hover:bg-teal/20
                           border border-teal/25 text-teal-light text-[12px] font-semibold
                           cursor-pointer transition-all flex-shrink-0"
              >
                <MessageSquare size={13} /> Chat
              </button>
            )}
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/[0.04] rounded-xl p-3 text-center border border-white/[0.06]">
              <p className="text-[9.5px] text-white/30 uppercase tracking-wider mb-1">Est. Weight</p>
              <p className="text-[16px] font-bold text-white">{listing.estimatedWeight} kg</p>
            </div>
            <div className="bg-white/[0.04] rounded-xl p-3 text-center border border-white/[0.06]">
              <p className="text-[9.5px] text-white/30 uppercase tracking-wider mb-1">Price / kg</p>
              <p className="text-[16px] font-bold text-teal-light">{fmt(listing.pricePerKg)}</p>
            </div>
            <div className="bg-white/[0.04] rounded-xl p-3 text-center border border-white/[0.06]">
              <p className="text-[9.5px] text-white/30 uppercase tracking-wider mb-1">
                {listing.agreedTotal ? 'Agreed Total' : listing.verifiedTotal ? 'Verified Total' : 'Est. Total'}
              </p>
              <p className="text-[16px] font-bold text-white">
                {listing.agreedTotal
                  ? fmt(listing.agreedTotal)
                  : listing.verifiedTotal
                    ? fmt(listing.verifiedTotal)
                    : fmt(listing.totalPrice)}
              </p>
            </div>
          </div>

          {/* Verified info */}
          {listing.verifiedWeight && (
            <div className="rounded-xl border border-teal/25 bg-teal/[0.07] p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-teal-light" strokeWidth={1.8} />
                  <span className="text-[13px] font-semibold text-white">Weigher Verified</span>
                </div>
                {listing.verifiedCondition && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize ${conditionBadge}`}>
                    {listing.verifiedCondition}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[12.5px]">
                <span className="text-white/50">Verified weight: <span className="text-white font-semibold">{listing.verifiedWeight} kg</span></span>
                <span className="text-white/50">Verified total: <span className="text-teal-light font-semibold">{fmt(listing.verifiedTotal!)}</span></span>
              </div>
              {listing.weigherName && (
                <span className="text-[11.5px] text-white/35 flex items-center gap-1">
                  <User size={11} /> Verified by {listing.weigherName}
                  {listing.verifiedAt && ` · ${fmtDate(listing.verifiedAt)}`}
                </span>
              )}
              {listing.weigherNotes && (
                <p className="text-[12px] text-white/45 bg-white/[0.04] rounded-lg px-3 py-2 border border-white/[0.06]">
                  "{listing.weigherNotes}"
                </p>
              )}
            </div>
          )}

          {/* Listing info */}
          <div className="flex flex-col">
            <DetailRow label="Seller"   value={`${listing.sourcerName} · ${listing.sourcerRegion}`} />
            <DetailRow label="Location" value={listing.locationArea} />
            <DetailRow label="Posted"   value={fmtDate(listing.createdAt)} />
            {listing.buyerName && <DetailRow label="Buyer" value={listing.buyerName} />}
            {listing.meetingPoint && (
              <DetailRow
                label="Meeting"
                value={`${listing.meetingPoint}${listing.meetingTime ? ' · ' + new Date(listing.meetingTime).toLocaleString() : ''}`}
              />
            )}
          </div>

          {listing.description && (
            <p className="text-[13px] text-white/50 leading-relaxed bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
              {listing.description}
            </p>
          )}

          {/* Blue Credits */}
          {listing.blueCreditsEarned && (
            <div className="rounded-xl border border-teal/25 bg-teal/[0.07] px-4 py-3 flex items-center gap-3">
              <span className="text-2xl">🔵</span>
              <div>
                <p className="text-[14px] font-bold text-teal-light">{listing.blueCreditsEarned} Blue Credits Earned</p>
                <p className="text-[11.5px] text-white/40">Calculated at 5 credits / kg verified weight</p>
              </div>
            </div>
          )}

          {/* ── ROLE ACTIONS ── */}

          {/* WEIGHER: verify unverified listing */}
          {isWeigher && listing.status === 'available' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-sky-500/[0.08] border border-sky-500/20">
                <Eye size={14} className="text-sky-400 mt-0.5 flex-shrink-0" />
                <p className="text-[12.5px] text-sky-300 leading-relaxed">
                  Weigh this material and confirm its value. Once verified, buyers will be notified.
                </p>
              </div>
              <ActionButton onClick={() => { setShowVerify(true) }}>
                <Scale size={16} /> Verify Weight & Value
              </ActionButton>
            </div>
          )}

          {/* BUYER: express interest in verified listing */}
          {isBuyer && !isAssignedBuyer && listing.status === 'verified' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-teal/[0.08] border border-teal/20">
                <ShieldCheck size={14} className="text-teal-light mt-0.5 flex-shrink-0" />
                <p className="text-[12.5px] text-white/60 leading-relaxed">
                  This material has been verified by a Weigher. Express interest to reserve it and schedule an inspection.
                </p>
              </div>
              <ActionButton onClick={() => { trading.expressInterest(listing.id, user!.id, user!.fullName); onClose() }}>
                👋 Express Interest & Reserve
              </ActionButton>
            </div>
          )}

          {/* BUYER: schedule meeting */}
          {isAssignedBuyer && listing.status === 'reserved' && subStep === 'main' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/20">
                <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-[12.5px] text-amber-300 leading-relaxed">
                  You've reserved this listing. Schedule a meeting with the seller to inspect the material.
                </p>
              </div>
              <ActionButton onClick={() => setSubStep('schedule')}>
                📍 Schedule Inspection Meeting
              </ActionButton>
            </div>
          )}

          {/* BUYER: schedule form */}
          {isAssignedBuyer && listing.status === 'reserved' && subStep === 'schedule' && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[12px] font-semibold text-white/50 block mb-1.5">Meeting location</label>
                <input className={inputClass} placeholder="e.g. Apapa Gate 3, Lagos"
                  value={meetPoint} onChange={e => setMeetPoint(e.target.value)} />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-white/50 block mb-1.5">Date & time</label>
                <input className={inputClass} type="datetime-local"
                  value={meetTime} onChange={e => setMeetTime(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <ActionButton onClick={() => setSubStep('main')} variant="secondary">← Back</ActionButton>
                <ActionButton
                  onClick={() => { trading.scheduleMeeting(listing.id, meetPoint, meetTime); setSubStep('main') }}
                  disabled={!meetPoint || !meetTime}
                >
                  Confirm Meeting
                </ActionButton>
              </div>
            </div>
          )}

          {/* BUYER: confirm inspection */}
          {isAssignedBuyer && (listing.status === 'reserved' || listing.status === 'inspecting') && subStep === 'inspect' && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[12px] font-semibold text-white/50 block mb-1.5">
                  Actual weight after inspection (kg)
                </label>
                <input className={inputClass} type="number" min="0.1" step="0.1"
                  value={agreedWeight} onChange={e => setAgreedWeight(e.target.value)} />
              </div>
              {agreedWeight && +agreedWeight > 0 && (
                <div className="bg-teal/10 border border-teal/20 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-[13px] text-white/50">Agreed total</span>
                  <span className="text-[17px] font-bold text-teal-light">
                    {fmt(+agreedWeight * listing.pricePerKg)}
                  </span>
                </div>
              )}
              <div className="flex gap-2">
                <ActionButton onClick={() => setSubStep('main')} variant="secondary">← Back</ActionButton>
                <ActionButton
                  onClick={() => { trading.confirmInspection(listing.id, +agreedWeight); setSubStep('main') }}
                  disabled={!agreedWeight || +agreedWeight <= 0}
                >
                  <CheckCircle2 size={16} /> Confirm Inspection
                </ActionButton>
              </div>
            </div>
          )}

          {/* BUYER: go to inspect when meeting is set */}
          {isAssignedBuyer && (listing.status === 'reserved' || listing.status === 'inspecting')
            && subStep === 'main' && listing.meetingPoint && (
            <ActionButton onClick={() => setSubStep('inspect')} variant="secondary">
              <Scale size={16} /> Confirm Inspection & Agree Weight
            </ActionButton>
          )}

          {/* BUYER: confirm payment sent */}
          {isAssignedBuyer && listing.status === 'payment_pending'
            && !listing.timeline.some(t => t.type === 'payment_sent') && (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-purple-500/[0.08] border border-purple-500/20">
                <CreditCard size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                <p className="text-[12.5px] text-purple-300 leading-relaxed">
                  Agreed total: <strong className="text-white">{fmt(listing.agreedTotal ?? listing.totalPrice)}</strong>.
                  Transfer payment to the seller and confirm below.
                </p>
              </div>
              <ActionButton onClick={() => { trading.confirmPaymentSent(listing.id); onClose() }}>
                <CreditCard size={16} /> Confirm Payment Sent
              </ActionButton>
            </div>
          )}

          {/* SELLER: confirm payment received */}
          {isSeller && listing.status === 'payment_pending'
            && listing.timeline.some(t => t.type === 'payment_sent') && (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-green-500/[0.08] border border-green-500/20">
                <CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-[12.5px] text-green-300 leading-relaxed">
                  Buyer has confirmed payment. Confirm receipt to complete the trade and earn Blue Credits.
                </p>
              </div>
              <ActionButton onClick={() => { trading.confirmPaymentReceived(listing.id); onClose() }}>
                <CheckCircle2 size={16} /> Confirm Payment Received
              </ActionButton>
            </div>
          )}

          {/* SELLER: cancel */}
          {isSeller && ['available', 'verified', 'reserved'].includes(listing.status) && (
            <ActionButton
              onClick={() => { trading.cancelListing(listing.id); onClose() }}
              variant="danger"
            >
              <XCircle size={15} /> Cancel Listing
            </ActionButton>
          )}

          {/* ── Trade Timeline ── */}
          <div>
            <p className="text-[11px] font-semibold text-white/25 uppercase tracking-wider mb-3">Timeline</p>
            <div className="flex flex-col gap-0">
              {listing.timeline.map((ev, i) => (
                <div key={ev.id} className="flex items-start gap-3 pb-4 relative">
                  {/* Vertical line */}
                  {i < listing.timeline.length - 1 && (
                    <div className="absolute left-[7px] top-5 bottom-0 w-px bg-white/[0.06]" />
                  )}
                  <div className={`flex-shrink-0 w-3.5 h-3.5 rounded-full border-2 mt-0.5
                                   ${i === listing.timeline.length - 1
                                     ? 'border-teal-light bg-teal/30'
                                     : 'border-white/20 bg-white/[0.06]'}`} />
                  <div>
                    <p className="text-[12.5px] text-white/75 font-medium capitalize leading-snug">
                      {ev.type.replace(/_/g, ' ')}
                      {ev.note && <span className="text-white/40 font-normal"> — {ev.note}</span>}
                    </p>
                    <p className="text-[11px] text-white/30 mt-0.5">
                      {ev.actorName} · {new Date(ev.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showVerify && (
        <VerifyListingModal
          listing={listing}
          onClose={() => { setShowVerify(false); onClose() }}
        />
      )}

      {showChat && canChat && (
        <ChatGateway
          listingId={listing.id}
          listingTitle={`${WASTE_LABELS[listing.wasteType]} — ${listing.estimatedWeight} kg`}
          otherUserId={chatOtherId}
          otherName={chatOtherName}
          otherRole={chatOtherRole}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  )
}

// ─── Filter tabs ─────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'mine' | 'available' | 'active' | 'completed'

// ─── Main page ───────────────────────────────────────────────────────────────

export default function WasteMarketPage() {
  const { user }     = useAuth()
  const { listings } = useTrading()
  const [showCreate, setShowCreate] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter,     setFilter]     = useState<FilterKey>('all')

  const isSeller  = user?.role === 'seller'
  const isBuyer   = user?.role === 'buyer'
  const isWeigher = user?.role === 'weigher'

  // Role-aware default filter
  const effectiveFilter = filter

  const filtered = listings.filter(l => {
    if (effectiveFilter === 'mine')
      return l.sourcerId === user?.id || l.buyerId === user?.id || l.weigherId === user?.id
    if (effectiveFilter === 'available')
      return isBuyer ? l.status === 'verified' : isWeigher ? l.status === 'available' : l.status === 'available'
    if (effectiveFilter === 'active')
      return ['reserved', 'inspecting', 'payment_pending'].includes(l.status)
    if (effectiveFilter === 'completed')
      return l.status === 'completed'
    // 'all': buyers don't see unverified listings
    if (isBuyer) return l.status !== 'available'
    return true
  })

  const selected = listings.find(l => l.id === selectedId)

  // Tab config per role
  const tabs: { key: FilterKey; label: string; count?: number }[] = isSeller
    ? [
        { key: 'all',       label: 'All' },
        { key: 'mine',      label: 'My Listings', count: listings.filter(l => l.sourcerId === user?.id).length },
        { key: 'active',    label: 'Active',      count: listings.filter(l => l.sourcerId === user?.id && ['reserved','inspecting','payment_pending'].includes(l.status)).length },
        { key: 'completed', label: 'Completed' },
      ]
    : isBuyer
    ? [
        { key: 'all',       label: 'All Verified' },
        { key: 'mine',      label: 'My Purchases', count: listings.filter(l => l.buyerId === user?.id).length },
        { key: 'active',    label: 'Active',       count: listings.filter(l => l.buyerId === user?.id && ['reserved','inspecting','payment_pending'].includes(l.status)).length },
        { key: 'completed', label: 'Completed' },
      ]
    : [
        { key: 'all',       label: 'All' },
        { key: 'available', label: 'Pending Queue', count: listings.filter(l => l.status === 'available').length },
        { key: 'mine',      label: 'Verified by Me', count: listings.filter(l => l.weigherId === user?.id).length },
        { key: 'completed', label: 'Completed' },
      ]

  const subtitle = isSeller  ? 'Post waste and track your listings through the full trade flow'
                 : isBuyer   ? 'Browse verified waste materials available for purchase'
                 : 'Verify incoming waste listings before they reach buyers'

  return (
    <DashboardShell title="Waste Market" subtitle={subtitle}>
      <div className="p-6">

        {/* Page header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium
                            transition-all cursor-pointer
                            ${filter === t.key
                              ? 'bg-teal/15 text-teal-light border border-teal/30'
                              : 'text-white/40 hover:text-white/70 border border-white/[0.06] hover:border-white/20'}`}
              >
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                                    ${filter === t.key ? 'bg-teal/30 text-teal-light' : 'bg-white/[0.08] text-white/40'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {isSeller && (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal hover:bg-teal-dark
                         text-white text-[13.5px] font-semibold shadow-teal cursor-pointer
                         transition-all hover:-translate-y-px"
            >
              <Plus size={16} strokeWidth={2.5} /> Post Waste
            </button>
          )}
        </div>

        {/* Role info banner */}
        {isBuyer && filter !== 'mine' && filter !== 'active' && filter !== 'completed' && (
          <div className="mb-5 px-4 py-3.5 rounded-xl border border-teal/20 bg-teal/[0.06]
                          flex items-start gap-3">
            <ShieldCheck size={16} className="text-teal-light mt-0.5 flex-shrink-0" strokeWidth={1.8} />
            <p className="text-[12.5px] text-white/55 leading-relaxed">
              All listings shown here have been weighed and verified by an independent Weigher.
              Express interest to reserve a listing and schedule an inspection.
            </p>
          </div>
        )}

        {isWeigher && (filter === 'all' || filter === 'available') && (
          <div className="mb-5 px-4 py-3.5 rounded-xl border border-sky-500/20 bg-sky-500/[0.06]
                          flex items-start gap-3">
            <Scale size={16} className="text-sky-400 mt-0.5 flex-shrink-0" strokeWidth={1.8} />
            <p className="text-[12.5px] text-white/55 leading-relaxed">
              Listings in <strong className="text-sky-300">Awaiting Verification</strong> status need your weigh-in.
              Once verified, buyers will be notified automatically.
            </p>
          </div>
        )}

        {/* Listings */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4 border border-white/[0.06]">
              <Package size={28} className="text-white/15" strokeWidth={1.3} />
            </div>
            <p className="text-[15px] font-semibold text-white/35 mb-1">Nothing here yet</p>
            <p className="text-[13px] text-white/20 max-w-[260px] leading-relaxed">
              {isSeller   ? 'Post your first waste listing to get started.'
               : isBuyer  ? 'No verified waste available right now. Check back soon.'
               : 'No listings waiting for verification at the moment.'}
            </p>
            {isSeller && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal hover:bg-teal-dark
                           text-white text-[13.5px] font-semibold shadow-teal cursor-pointer transition-all"
              >
                <Plus size={15} strokeWidth={2.5} /> Post Waste
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(l => (
              <ListingCard key={l.id} listing={l} onSelect={() => setSelectedId(l.id)} />
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateListingModal onClose={() => setShowCreate(false)} />}
      {selected   && <ListingDetailModal listing={selected} onClose={() => setSelectedId(null)} />}
    </DashboardShell>
  )
}
