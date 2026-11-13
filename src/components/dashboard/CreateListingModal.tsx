import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTrading } from '@/context/TradingContext'
import type { WasteType, CreateListingInput } from '@/context/TradingContext'
import {
  XCircle, Loader2,
  Package, Sprout, Layers, Wrench, Box,
  type LucideIcon,
} from 'lucide-react'

// ─── Waste-type display maps (shared with the market page) ───────────────────

export const WASTE_LABELS: Record<WasteType, string> = {
  plastic:       'Plastic',
  water_hyacinth:'Water Hyacinth',
  mixed:         'Mixed Waste',
  metal:         'Metal',
  other:         'Other',
}

export const WASTE_ICONS: Record<WasteType, LucideIcon> = {
  plastic:        Package,
  water_hyacinth: Sprout,
  mixed:          Layers,
  metal:          Wrench,
  other:          Box,
}

function fmt(n: number) { return `₦${n.toLocaleString()}` }

// ─── Create Listing Modal ────────────────────────────────────────────────────

export default function CreateListingModal({ onClose, prefill }: { onClose: () => void; prefill?: Partial<CreateListingInput> }) {
  const { user }          = useAuth()
  const { createListing } = useTrading()
  const [loading, setLoading] = useState(false)
  const [pickedLat, setPickedLat] = useState<number | undefined>(prefill?.lat)
  const [pickedLng, setPickedLng] = useState<number | undefined>(prefill?.lng)
  const [form, setForm] = useState({
    wasteType:       (prefill?.wasteType       ?? 'plastic') as WasteType,
    estimatedWeight: prefill?.estimatedWeight ? String(prefill.estimatedWeight) : '',
    pricePerKg:      prefill?.pricePerKg      ? String(prefill.pricePerKg)      : '',
    description:     prefill?.description     ?? '',
    locationArea:    prefill?.locationArea     ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.estimatedWeight || +form.estimatedWeight <= 0) e.estimatedWeight = 'Enter a valid weight.'
    if (!form.pricePerKg || +form.pricePerKg <= 0)          e.pricePerKg      = 'Enter a valid price.'
    if (!form.locationArea.trim())                           e.locationArea    = 'Enter a general area.'
    return e
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    const payload: CreateListingInput = {
      sourcerId:       user!.id,
      sourcerName:     user!.fullName,
      sourcerRegion:   user!.region,
      wasteType:       form.wasteType,
      estimatedWeight: +form.estimatedWeight,
      pricePerKg:      +form.pricePerKg,
      description:     form.description,
      locationArea:    form.locationArea,
      lat:             pickedLat,
      lng:             pickedLng,
      photos:          [],
    }
    await createListing(payload)
    setLoading(false)
    onClose()
  }

  const inputClass = (key: string) =>
    `w-full px-4 py-3 rounded-xl text-[14px] text-white bg-white/[0.05] border outline-none
     placeholder:text-white/20 transition-all
     ${errors[key] ? 'border-red-500/60' : 'border-white/[0.08] focus:border-teal'}`

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" style={{ zIndex: 2000 }}>
      <div
        className="w-full max-w-[480px] rounded-2xl border border-white/[0.08] flex flex-col"
        style={{ background: '#0B2233', maxHeight: '92vh' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
          <h2 className="text-[16px] font-bold text-white">Post Waste Listing</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white cursor-pointer"><XCircle size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">

          {/* AI hotspot prefill notice */}
          {prefill?.locationArea && (
            <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-teal/[0.08] border border-teal/20">
              <span className="text-teal-light text-[14px] flex-shrink-0">✨</span>
              <p className="text-[12px] text-white/55 leading-relaxed">
                Pre-filled from map pin: <strong className="text-white">{prefill.locationArea || `${prefill.lat?.toFixed(4)}, ${prefill.lng?.toFixed(4)}`}</strong>.
                Review and adjust before posting.
              </p>
            </div>
          )}

          {/* GPS coords display */}
          {(pickedLat && pickedLng) ? (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl
                            bg-teal/[0.07] border border-teal/25">
              <div className="flex items-center gap-2">
                <span className="text-teal-light text-[13px]">📍</span>
                <span className="text-[12.5px] text-white/70">
                  GPS: {pickedLat.toFixed(5)}, {pickedLng.toFixed(5)}
                </span>
              </div>
              <button type="button" onClick={() => { setPickedLat(undefined); setPickedLng(undefined) }}
                className="text-[11px] text-white/30 hover:text-red-400 cursor-pointer transition-colors">
                ✕ Remove
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07]">
              <span className="text-white/20 text-[13px]">📍</span>
              <p className="text-[12px] text-white/30">
                No GPS pin — close this and use "Report Waste Here" on the map to pin an exact location.
              </p>
            </div>
          )}

          {/* Waste type */}
          <div>
            <label className="text-[12px] font-semibold text-white/60 uppercase tracking-wider block mb-2">
              Waste type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(WASTE_LABELS) as [WasteType, string][]).map(([val, label]) => {
                const Icon = WASTE_ICONS[val]
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, wasteType: val }))}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border
                                text-[12px] font-medium transition-all cursor-pointer
                                ${form.wasteType === val
                                  ? 'border-teal bg-teal/15 text-teal-light'
                                  : 'border-white/[0.08] text-white/40 hover:border-white/20 hover:text-white/60'}`}
                  >
                    <Icon size={18} strokeWidth={1.7}/>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Weight + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-semibold text-white/60 block mb-1.5">Est. Weight (kg)</label>
              <input className={inputClass('estimatedWeight')} type="number" min="1" placeholder="e.g. 120"
                value={form.estimatedWeight} onChange={e => setForm(f => ({...f, estimatedWeight: e.target.value}))}/>
              {errors.estimatedWeight && <p className="text-[11px] text-red-400 mt-1">{errors.estimatedWeight}</p>}
            </div>
            <div>
              <label className="text-[12px] font-semibold text-white/60 block mb-1.5">Price per kg (₦)</label>
              <input className={inputClass('pricePerKg')} type="number" min="1" placeholder="e.g. 150"
                value={form.pricePerKg} onChange={e => setForm(f => ({...f, pricePerKg: e.target.value}))}/>
              {errors.pricePerKg && <p className="text-[11px] text-red-400 mt-1">{errors.pricePerKg}</p>}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-[12px] font-semibold text-white/60 block mb-1.5">General location area</label>
            <input className={inputClass('locationArea')} type="text" placeholder="e.g. Apapa Wharf, Lagos"
              value={form.locationArea} onChange={e => setForm(f => ({...f, locationArea: e.target.value}))}/>
            {errors.locationArea && <p className="text-[11px] text-red-400 mt-1">{errors.locationArea}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-[12px] font-semibold text-white/60 block mb-1.5">Description (optional)</label>
            <textarea
              rows={3}
              className={`${inputClass('description')} resize-none`}
              placeholder="Condition, contamination level, bagged/loose, access notes…"
              value={form.description}
              onChange={e => setForm(f => ({...f, description: e.target.value}))}
            />
          </div>

          {/* Preview total */}
          {form.estimatedWeight && form.pricePerKg && (
            <div className="bg-teal/10 border border-teal/20 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-[13px] text-white/60">Estimated total</span>
              <span className="text-[16px] font-bold text-teal-light">
                {fmt(+form.estimatedWeight * +form.pricePerKg)}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-teal hover:bg-teal-dark disabled:opacity-50
                       text-white font-semibold flex items-center justify-center gap-2
                       transition-all cursor-pointer shadow-teal"
          >
            {loading ? <><Loader2 size={16} className="animate-spin"/> Posting…</> : '🚨 Post Listing & Alert Buyers'}
          </button>
        </form>
      </div>
    </div>
  )
}
