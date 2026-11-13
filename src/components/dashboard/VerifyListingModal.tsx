import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTrading } from '@/context/TradingContext'
import type { WasteListing } from '@/context/TradingContext'
import { XCircle, Loader2, Scale, MapPin, User, AlertTriangle } from 'lucide-react'
import { WASTE_LABELS } from '@/components/dashboard/CreateListingModal'

function fmt(n: number) { return `₦${n.toLocaleString()}` }

const CONDITIONS = [
  { value: 'clean',        label: 'Clean',        desc: 'Minimal contamination' },
  { value: 'moderate',     label: 'Moderate',     desc: 'Some contamination' },
  { value: 'contaminated', label: 'Contaminated', desc: 'Heavily mixed/dirty' },
]

export default function VerifyListingModal({ listing, onClose }: { listing: WasteListing; onClose: () => void }) {
  const { user }          = useAuth()
  const { verifyListing } = useTrading()

  const [verifiedWeight, setVerifiedWeight] = useState(String(listing.estimatedWeight))
  const [condition,      setCondition]      = useState('clean')
  const [notes,          setNotes]          = useState('')
  const [error,          setError]          = useState('')
  const [loading,        setLoading]        = useState(false)
  const [step,           setStep]           = useState<1 | 2>(1)

  const weightNum   = parseFloat(verifiedWeight) || 0
  const verifiedTotal = weightNum * listing.pricePerKg
  const diff          = weightNum - listing.estimatedWeight
  const diffPct       = listing.estimatedWeight > 0
    ? Math.round((diff / listing.estimatedWeight) * 100)
    : 0

  const handleNext = () => {
    if (!verifiedWeight || weightNum <= 0) {
      setError('Enter a valid weight greater than 0.')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    verifyListing(listing.id, user!.id, user!.fullName, weightNum, condition, notes)
    setLoading(false)
    onClose()
  }

  const inputClass = `w-full px-4 py-3 rounded-xl text-[14px] text-white bg-white/[0.05]
                      border border-white/[0.08] focus:border-teal outline-none placeholder:text-white/20 transition-all`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[480px] rounded-2xl border border-white/[0.08] overflow-hidden"
           style={{ background: '#0B2233' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal/15 flex items-center justify-center">
              <Scale size={16} className="text-teal-light" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-white">Verify Listing</h2>
              <p className="text-[11px] text-white/35">Step {step} of 2</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white cursor-pointer">
            <XCircle size={20} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex border-b border-white/[0.06]">
          {['Weigh', 'Confirm'].map((s, i) => (
            <div key={s} className={`flex-1 py-2.5 text-center text-[12px] font-semibold transition-all
                                     ${step === i + 1
                                       ? 'text-teal-light border-b-2 border-teal-light'
                                       : 'text-white/25'}`}>
              {s}
            </div>
          ))}
        </div>

        {/* Listing info */}
        <div className="mx-6 mt-5 p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] font-semibold text-white capitalize">
              {WASTE_LABELS[listing.wasteType]}
            </span>
            <span className="text-[12px] text-white/40">{listing.estimatedWeight} kg estimated</span>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-white/40">
            <span className="flex items-center gap-1"><User size={11} /> {listing.sourcerName}</span>
            <span className="flex items-center gap-1"><MapPin size={11} /> {listing.locationArea}</span>
          </div>
        </div>

        {step === 1 ? (
          <div className="p-6 flex flex-col gap-4">
            <div>
              <label className="text-[12px] font-semibold text-white/60 block mb-1.5">
                Actual weighed weight (kg)
              </label>
              <input
                className={inputClass}
                type="number" min="0.1" step="0.1"
                placeholder={`Seller estimated ${listing.estimatedWeight} kg`}
                value={verifiedWeight}
                onChange={e => { setVerifiedWeight(e.target.value); setError('') }}
                autoFocus
              />
              {error && <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                <AlertTriangle size={11} /> {error}
              </p>}
            </div>

            {/* Weight diff indicator */}
            {weightNum > 0 && weightNum !== listing.estimatedWeight && (
              <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[12.5px]
                              ${Math.abs(diffPct) > 20
                                ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                                : 'bg-teal/10 border-teal/20 text-teal-light'}`}>
                <AlertTriangle size={13} />
                Seller estimated {listing.estimatedWeight} kg. Your reading is{' '}
                {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg ({diff > 0 ? '+' : ''}{diffPct}%)
              </div>
            )}

            {/* Verified total preview */}
            {weightNum > 0 && (
              <div className="bg-teal/10 border border-teal/20 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-[13px] text-white/60">Verified total at ₦{listing.pricePerKg}/kg</span>
                <span className="text-[17px] font-bold text-teal-light">{fmt(verifiedTotal)}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="w-full py-3.5 rounded-xl bg-teal hover:bg-teal-dark
                         text-white font-semibold flex items-center justify-center gap-2
                         transition-all cursor-pointer shadow-teal"
            >
              Next: Condition & Notes →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">

            {/* Summary */}
            <div className="bg-teal/10 border border-teal/20 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[12px] text-white/50">Verified weight</p>
                <p className="text-[17px] font-bold text-white">{weightNum} kg</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-white/50">Verified total</p>
                <p className="text-[17px] font-bold text-teal-light">{fmt(verifiedTotal)}</p>
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="text-[12px] font-semibold text-white/60 block mb-2">Material condition</label>
              <div className="grid grid-cols-3 gap-2">
                {CONDITIONS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCondition(c.value)}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-center
                                transition-all cursor-pointer
                                ${condition === c.value
                                  ? 'border-teal bg-teal/15'
                                  : 'border-white/[0.08] hover:border-white/20 bg-white/[0.03]'}`}
                  >
                    <span className={`text-[13px] font-semibold
                                      ${condition === c.value ? 'text-teal-light' : 'text-white/50'}`}>
                      {c.label}
                    </span>
                    <span className="text-[10.5px] text-white/25 leading-tight">{c.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-[12px] font-semibold text-white/60 block mb-1.5">
                Weigher notes (optional)
              </label>
              <textarea
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="Packaging, contamination detail, access notes…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl border border-white/[0.10] text-white/50
                           hover:text-white hover:border-white/20 text-[13.5px] font-semibold
                           transition-all cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-teal hover:bg-teal-dark disabled:opacity-50
                           text-white font-semibold flex items-center justify-center gap-2
                           transition-all cursor-pointer shadow-teal"
              >
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Verifying…</>
                  : '✅ Confirm Verification'
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
