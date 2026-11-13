import { Check } from 'lucide-react'
import type { ListingStatus } from '@/context/TradingContext'

// ─── Stage definitions ────────────────────────────────────────────────────────

interface Stage {
  key:    string
  label:  string
  status: ListingStatus[]   // which listing statuses count as this stage being active/done
}

const STAGES: Stage[] = [
  { key: 'listed',    label: 'Listed',     status: ['available'] },
  { key: 'verified',  label: 'Verified',   status: ['verified'] },
  { key: 'interest',  label: 'Interest',   status: ['reserved'] },
  { key: 'inspection',label: 'Inspection', status: ['inspecting', 'payment_pending'] },
  { key: 'payment',   label: 'Payment',    status: ['payment_pending'] },
  { key: 'complete',  label: 'Complete',   status: ['completed'] },
]

function getStageIndex(status: ListingStatus): number {
  if (status === 'available')       return 0
  if (status === 'verified')        return 1
  if (status === 'reserved')        return 2
  if (status === 'inspecting')      return 3
  if (status === 'payment_pending') return 4
  if (status === 'completed')       return 5
  return -1 // cancelled
}

// ─── Component ────────────────────────────────────────────────────────────────

interface FlowTrackerProps {
  status:  ListingStatus
  compact?: boolean
}

export default function FlowTracker({ status, compact = false }: FlowTrackerProps) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
        <div className="w-2 h-2 rounded-full bg-white/20 flex-shrink-0" />
        <span className="text-[12px] text-white/30">Listing cancelled</span>
      </div>
    )
  }

  const currentIndex = getStageIndex(status)

  return (
    <div className={`${compact ? '' : 'bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]'}`}>
      {!compact && (
        <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-3">Trade Progress</p>
      )}
      <div className="flex items-center gap-0">
        {STAGES.map((stage, i) => {
          const done    = i < currentIndex
          const active  = i === currentIndex

          return (
            <div key={stage.key} className="flex items-center flex-1 min-w-0">
              {/* Node */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className={`rounded-full flex items-center justify-center transition-all
                              ${compact ? 'w-5 h-5' : 'w-7 h-7'}
                              ${done    ? 'bg-teal border-2 border-teal'
                              : active  ? 'bg-teal/20 border-2 border-teal-light ring-2 ring-teal/20'
                              : 'bg-white/[0.05] border-2 border-white/[0.12]'}`}
                >
                  {done
                    ? <Check size={compact ? 9 : 12} strokeWidth={3} className="text-white" />
                    : active
                      ? <div className={`rounded-full bg-teal-light animate-pulse ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
                      : null
                  }
                </div>
                {!compact && (
                  <span className={`text-[9.5px] font-medium text-center leading-tight
                                    ${done ? 'text-teal-light' : active ? 'text-white/70' : 'text-white/20'}`}>
                    {stage.label}
                  </span>
                )}
              </div>

              {/* Connector (not after last) */}
              {i < STAGES.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 transition-all
                                 ${done ? 'bg-teal' : 'bg-white/[0.08]'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
