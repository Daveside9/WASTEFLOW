import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTrading } from '@/context/TradingContext'
import DashboardShell from '@/components/dashboard/DashboardShell'
import {
  Coins, TrendingUp, ArrowDownLeft, CheckCircle2, Clock,
  Wallet, Building2, CreditCard, ChevronRight, Info,
  ArrowUpRight, Package,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type WithdrawMethod = 'bank' | 'mobile' | 'wallet'

const METHOD_INFO: Record<WithdrawMethod, { label: string; icon: typeof Building2; hint: string }> = {
  bank:   { label: 'Bank Transfer',   icon: Building2,  hint: 'Processed within 1–2 business days' },
  mobile: { label: 'Mobile Money',    icon: CreditCard, hint: 'Instant to registered mobile number' },
  wallet: { label: 'Platform Wallet', icon: Wallet,     hint: 'Instant — use credits to buy waste' },
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function CreditStat({ icon: Icon, label, value, sub, color = 'teal' }: {
  icon: typeof Coins; label: string; value: string | number; sub?: string
  color?: 'teal' | 'green' | 'amber' | 'blue'
}) {
  const bg: Record<string, string> = {
    teal:  'bg-teal/10 border-teal/25',
    green: 'bg-green-500/10 border-green-500/25',
    amber: 'bg-amber-500/10 border-amber-500/25',
    blue:  'bg-blue-500/10 border-blue-500/25',
  }
  const iconBg: Record<string, string> = {
    teal:  'bg-teal/20 text-teal-light',
    green: 'bg-green-500/20 text-green-400',
    amber: 'bg-amber-500/20 text-amber-400',
    blue:  'bg-blue-500/20 text-blue-400',
  }
  return (
    <div className={`rounded-2xl p-5 border flex flex-col gap-3 ${bg[color]}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg[color]}`}>
        <Icon size={19} strokeWidth={1.7} />
      </div>
      <div>
        <p className="text-[2rem] font-extrabold text-white tracking-tight leading-none">{value}</p>
        <p className="text-[12.5px] text-white/50 mt-1">{label}</p>
        {sub && <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Withdraw modal ───────────────────────────────────────────────────────────

function WithdrawModal({ balance, onClose }: { balance: number; onClose: () => void }) {
  const [method, setMethod]   = useState<WithdrawMethod>('bank')
  const [amount, setAmount]   = useState('')
  const [account, setAccount] = useState('')
  const [name, setName]       = useState('')
  const [step, setStep]       = useState<'form' | 'confirm' | 'done'>('form')

  const nairaValue = Number(amount) * 10   // 1 Blue Credit = ₦10
  const maxCash    = balance               // can withdraw all credits

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 'form')    { setStep('confirm'); return }
    if (step === 'confirm') { setStep('done');    return }
  }

  const inp = `w-full px-4 py-3 rounded-xl text-[14px] text-white bg-white/[0.05]
               border border-white/[0.08] focus:border-teal outline-none transition-all
               placeholder:text-white/20`

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
         style={{ zIndex: 2000 }}>
      <div className="w-full max-w-[440px] rounded-2xl border border-white/[0.08] flex flex-col"
           style={{ background: '#0B2233', maxHeight: '92vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Coins size={18} className="text-teal-light" />
            <h2 className="text-[16px] font-bold text-white">
              {step === 'done' ? 'Withdrawal Requested' : 'Withdraw Blue Credits'}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white cursor-pointer text-[20px] leading-none">×</button>
        </div>

        <div className="overflow-y-auto p-6">
          {step === 'done' ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-green-400" />
              </div>
              <div>
                <p className="text-[16px] font-bold text-white">Request Submitted!</p>
                <p className="text-[13px] text-white/40 mt-1">
                  {Number(amount).toLocaleString()} credits (₦{nairaValue.toLocaleString()}) via {METHOD_INFO[method].label}
                </p>
                <p className="text-[12px] text-white/30 mt-2">{METHOD_INFO[method].hint}</p>
              </div>
              <button onClick={onClose}
                className="mt-2 px-6 py-2.5 rounded-xl bg-teal hover:bg-teal-dark text-white text-[13px]
                           font-semibold cursor-pointer transition-all">
                Done
              </button>
            </div>
          ) : step === 'confirm' ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.07] flex flex-col gap-3">
                <p className="text-[12px] text-white/40 uppercase tracking-wider font-semibold">Review Withdrawal</p>
                <div className="flex justify-between text-[14px]">
                  <span className="text-white/50">Amount</span>
                  <span className="text-white font-semibold">{Number(amount).toLocaleString()} credits</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-white/50">Naira value</span>
                  <span className="text-teal-light font-bold">₦{nairaValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-white/50">Method</span>
                  <span className="text-white font-semibold">{METHOD_INFO[method].label}</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-white/50">Account</span>
                  <span className="text-white font-semibold">{account}</span>
                </div>
                {name && (
                  <div className="flex justify-between text-[14px]">
                    <span className="text-white/50">Account name</span>
                    <span className="text-white font-semibold">{name}</span>
                  </div>
                )}
              </div>
              <div className="flex items-start gap-2 px-3.5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Info size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-white/50">{METHOD_INFO[method].hint}</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep('form')}
                  className="flex-1 py-3 rounded-xl border border-white/[0.10] text-white/50
                             hover:text-white hover:border-white/20 text-[13px] font-semibold
                             cursor-pointer transition-all">
                  Back
                </button>
                <button type="submit"
                  className="flex-1 py-3 rounded-xl bg-teal hover:bg-teal-dark text-white
                             text-[13px] font-semibold cursor-pointer transition-all">
                  Confirm Withdrawal
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Balance info */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-teal/[0.08] border border-teal/20">
                <div className="flex items-center gap-2">
                  <Coins size={15} className="text-teal-light" />
                  <span className="text-[13px] text-white/60">Available balance</span>
                </div>
                <span className="text-[15px] font-bold text-teal-light">{balance.toLocaleString()} credits</span>
              </div>

              {/* Conversion note */}
              <div className="flex items-start gap-2 px-3.5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <Info size={13} className="text-white/30 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-white/35">
                  1 Blue Credit = <strong className="text-white/60">₦10</strong>.
                  Minimum withdrawal is <strong className="text-white/60">50 credits (₦500)</strong>.
                </p>
              </div>

              {/* Method */}
              <div>
                <p className="text-[12px] font-semibold text-white/50 uppercase tracking-wider mb-2">Withdrawal method</p>
                <div className="flex flex-col gap-2">
                  {(Object.entries(METHOD_INFO) as [WithdrawMethod, typeof METHOD_INFO[WithdrawMethod]][]).map(([key, info]) => {
                    const Icon = info.icon
                    return (
                      <button key={key} type="button" onClick={() => setMethod(key)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left
                                    transition-all cursor-pointer
                                    ${method === key
                                      ? 'border-teal bg-teal/10 text-teal-light'
                                      : 'border-white/[0.08] text-white/40 hover:border-white/20'}`}>
                        <Icon size={16} strokeWidth={1.7} className="flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold">{info.label}</p>
                          <p className="text-[11px] text-white/30">{info.hint}</p>
                        </div>
                        {method === key && <div className="w-2 h-2 rounded-full bg-teal flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-[12px] font-semibold text-white/50 block mb-1.5">Credits to withdraw</label>
                <input className={inp} type="number" min="50" max={maxCash} placeholder="e.g. 200"
                  value={amount} onChange={e => setAmount(e.target.value)} required />
                {amount && Number(amount) > 0 && (
                  <p className="text-[11.5px] text-teal-light mt-1.5">
                    = ₦{(Number(amount) * 10).toLocaleString()} naira
                  </p>
                )}
              </div>

              {/* Account */}
              <div>
                <label className="text-[12px] font-semibold text-white/50 block mb-1.5">
                  {method === 'mobile' ? 'Mobile number' : method === 'wallet' ? 'Platform username / ID' : 'Account number'}
                </label>
                <input className={inp}
                  placeholder={method === 'mobile' ? '0801 234 5678' : method === 'wallet' ? 'your@email.com' : '0123456789'}
                  value={account} onChange={e => setAccount(e.target.value)} required />
              </div>

              {/* Account name (bank only) */}
              {method === 'bank' && (
                <div>
                  <label className="text-[12px] font-semibold text-white/50 block mb-1.5">Account name</label>
                  <input className={inp} placeholder="As it appears on your bank account"
                    value={name} onChange={e => setName(e.target.value)} required />
                </div>
              )}

              <button type="submit"
                disabled={!amount || Number(amount) < 50 || Number(amount) > balance || !account}
                className="w-full py-3.5 rounded-xl bg-teal hover:bg-teal-dark disabled:opacity-40
                           text-white font-semibold text-[13.5px] cursor-pointer transition-all
                           flex items-center justify-center gap-2">
                <ArrowDownLeft size={16} /> Review Withdrawal
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BlueCreditsPage() {
  const { user }    = useAuth()
  const { listings } = useTrading()
  const [showWithdraw, setShowWithdraw] = useState(false)

  const myListings      = listings.filter(l => l.sourcerId === user?.id)
  const completed       = myListings.filter(l => l.status === 'completed')
  const totalCredits    = myListings.reduce((s, l) => s + (l.blueCreditsEarned ?? 0), 0)
  const totalEarned     = completed.reduce((s, l) => s + (l.agreedTotal ?? l.totalPrice), 0)
  const pendingCredits  = myListings
    .filter(l => ['reserved','inspecting','payment_pending','verified'].includes(l.status))
    .reduce((s, l) => s + Math.round((l.agreedWeight ?? l.estimatedWeight) * 5), 0)

  // Build transaction history from completed + active listings
  const transactions = myListings
    .filter(l => l.blueCreditsEarned || ['reserved','inspecting','payment_pending'].includes(l.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const statusLabel: Record<string, string> = {
    completed:       'Earned',
    reserved:        'Pending',
    inspecting:      'Pending',
    payment_pending: 'Pending',
    verified:        'Pending',
  }
  const statusColor: Record<string, string> = {
    completed:       'text-green-400 bg-green-500/10 border-green-500/20',
    reserved:        'text-amber-400 bg-amber-500/10 border-amber-500/20',
    inspecting:      'text-amber-400 bg-amber-500/10 border-amber-500/20',
    payment_pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    verified:        'text-blue-400  bg-blue-500/10  border-blue-500/20',
  }

  return (
    <DashboardShell title="Blue Credits" subtitle="Your circular economy rewards">
      <div className="p-6 flex flex-col gap-8">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CreditStat icon={Coins}       label="Total Credits"    value={totalCredits.toLocaleString()}  color="teal"  sub="all time earned" />
          <CreditStat icon={TrendingUp}  label="Naira Value"      value={`₦${(totalCredits * 10).toLocaleString()}`} color="green" sub="at ₦10 per credit" />
          <CreditStat icon={Clock}       label="Pending Credits"  value={pendingCredits.toLocaleString()} color="amber" sub="from active trades" />
          <CreditStat icon={CheckCircle2} label="Trades Done"     value={completed.length}               color="blue"  sub="completed trades" />
        </div>

        {/* ── Balance card + withdraw ── */}
        <div className="rounded-2xl border border-teal/20 overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #071C2C 0%, #0a2a1f 100%)' }}>
          <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-[12px] text-white/40 uppercase tracking-wider font-semibold mb-1">Available Balance</p>
              <div className="flex items-end gap-3">
                <p className="text-[3rem] font-extrabold text-white leading-none tracking-tight">
                  {totalCredits.toLocaleString()}
                </p>
                <div className="mb-1.5">
                  <p className="text-[13px] text-teal-light font-semibold">Blue Credits</p>
                  <p className="text-[12px] text-white/35">≈ ₦{(totalCredits * 10).toLocaleString()}</p>
                </div>
              </div>
              {pendingCredits > 0 && (
                <p className="text-[12px] text-amber-400 mt-2 flex items-center gap-1.5">
                  <Clock size={12} />
                  +{pendingCredits.toLocaleString()} pending from active trades
                </p>
              )}
            </div>
            <button
              onClick={() => setShowWithdraw(true)}
              disabled={totalCredits < 50}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal hover:bg-teal-dark
                         disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold
                         text-[13.5px] cursor-pointer transition-all shadow-teal flex-shrink-0"
            >
              <ArrowDownLeft size={16} /> Withdraw Credits
            </button>
          </div>

          {/* Conversion guide */}
          <div className="border-t border-white/[0.06] px-6 py-3 flex flex-wrap gap-6">
            {[
              { label: '1 Credit',    value: '₦10' },
              { label: '100 Credits', value: '₦1,000' },
              { label: 'Min. withdrawal', value: '50 credits' },
              { label: 'Rate per kg', value: '5 credits' },
            ].map(r => (
              <div key={r.label}>
                <p className="text-[10.5px] text-white/25 uppercase tracking-wider">{r.label}</p>
                <p className="text-[13px] font-semibold text-white/70">{r.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── How you earn ── */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <p className="text-[13px] font-semibold text-white mb-3 flex items-center gap-2">
            <Info size={14} className="text-teal-light" /> How Blue Credits work
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { step: '1', title: 'List & Sell Waste', desc: 'Post a waste listing and complete a trade with a buyer.' },
              { step: '2', title: 'Credits Awarded',   desc: 'You earn 5 Blue Credits per kg of verified waste sold.' },
              { step: '3', title: 'Withdraw Anytime',  desc: 'Convert credits to cash via bank, mobile money, or platform wallet.' },
            ].map(s => (
              <div key={s.step} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-teal/20 text-teal-light text-[11px] font-bold
                                flex items-center justify-center flex-shrink-0 mt-0.5">
                  {s.step}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{s.title}</p>
                  <p className="text-[12px] text-white/40 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Transaction history ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-semibold text-white">Transaction History</p>
            <span className="text-[12px] text-white/30">{transactions.length} trade{transactions.length !== 1 ? 's' : ''}</span>
          </div>

          {transactions.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
              <Coins size={32} className="text-white/15 mx-auto mb-3" />
              <p className="text-[14px] text-white/30 mb-1">No credit transactions yet</p>
              <p className="text-[12.5px] text-white/20">
                Complete a trade to start earning Blue Credits
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {transactions.map(l => {
                const credits  = l.blueCreditsEarned ?? Math.round((l.agreedWeight ?? l.estimatedWeight) * 5)
                const isEarned = l.status === 'completed'
                const badge    = statusColor[l.status] ?? statusColor.verified
                const label    = statusLabel[l.status] ?? 'Pending'
                return (
                  <div key={l.id}
                    className="flex items-center justify-between p-4 rounded-xl
                               bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05]
                               transition-all group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                                       ${isEarned ? 'bg-green-500/15' : 'bg-amber-500/10'}`}>
                        {isEarned
                          ? <ArrowUpRight size={16} className="text-green-400" />
                          : <Clock size={16} className="text-amber-400" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-white capitalize truncate">
                          {l.wasteType.replace('_', ' ')} — {l.agreedWeight ?? l.estimatedWeight} kg
                        </p>
                        <p className="text-[11.5px] text-white/35 truncate">
                          {l.locationArea} · {new Date(l.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        {l.buyerName && (
                          <p className="text-[11px] text-white/25 truncate">Buyer: {l.buyerName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      <div className="text-right">
                        <p className={`text-[15px] font-bold ${isEarned ? 'text-green-400' : 'text-amber-400'}`}>
                          {isEarned ? '+' : '~'}{credits.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-white/30">credits</p>
                      </div>
                      <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full border ${badge}`}>
                        {label}
                      </span>
                      <ChevronRight size={14} className="text-white/15 group-hover:text-white/40 transition-colors" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Total earned summary */}
          {totalEarned > 0 && (
            <div className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl
                            bg-teal/[0.06] border border-teal/15">
              <div className="flex items-center gap-2 text-[13px] text-white/50">
                <Package size={14} className="text-teal-light" />
                Total naira earned from waste sales
              </div>
              <span className="text-[14px] font-bold text-teal-light">
                ₦{totalEarned.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {showWithdraw && (
        <WithdrawModal balance={totalCredits} onClose={() => setShowWithdraw(false)} />
      )}
    </DashboardShell>
  )
}
