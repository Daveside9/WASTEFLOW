import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTrading } from '@/context/TradingContext'
import {
  Waves, Users, Package, Scale, ShieldCheck, TrendingUp,
  Coins, AlertTriangle, CheckCircle2, XCircle, LogOut,
  BarChart2, Bell, Search, Eye, Trash2, type LucideIcon,
} from 'lucide-react'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) { return `₦${n.toLocaleString()}` }
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_STYLES: Record<string, string> = {
  available:       'bg-sky-500/15 text-sky-300',
  verified:        'bg-teal/20 text-teal-light',
  reserved:        'bg-amber-500/15 text-amber-400',
  inspecting:      'bg-blue-500/15 text-blue-400',
  payment_pending: 'bg-purple-500/15 text-purple-300',
  completed:       'bg-green-500/15 text-green-400',
  cancelled:       'bg-white/10 text-white/30',
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color = 'teal' }:
  { icon: LucideIcon; label: string; value: string | number; sub?: string; color?: string }) {
  const bg    = color === 'red'    ? 'bg-red-500/10 border-red-500/20'
              : color === 'amber'  ? 'bg-amber-500/10 border-amber-500/20'
              : color === 'green'  ? 'bg-green-500/10 border-green-500/20'
              : color === 'purple' ? 'bg-purple-500/10 border-purple-500/20'
              : 'bg-teal/10 border-teal/20'
  const ic    = color === 'red'    ? 'text-red-400'
              : color === 'amber'  ? 'text-amber-400'
              : color === 'green'  ? 'text-green-400'
              : color === 'purple' ? 'text-purple-400'
              : 'text-teal-light'
  return (
    <div className={`rounded-2xl p-5 border flex flex-col gap-3 ${bg}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.06]`}>
        <Icon size={19} strokeWidth={1.7} className={ic} />
      </div>
      <div>
        <p className="text-[2rem] font-extrabold text-white tracking-tight leading-none">{value}</p>
        <p className="text-[12.5px] text-white/50 mt-1">{label}</p>
        {sub && <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-[15px] font-bold text-white">{title}</h2>
      {count !== undefined && (
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal/20 text-teal-light">
          {count}
        </span>
      )}
    </div>
  )
}

// ─── Demo users (since there's no real user DB yet) ───────────────────────────

const DEMO_USERS = [
  { id: 'usr_seller_001',  fullName: 'Demo Seller',  email: 'seller@demo.com',  role: 'seller',  region: 'Lagos',     approved: true,  joined: '2026-11-01' },
  { id: 'usr_buyer_001',   fullName: 'Demo Buyer',   email: 'buyer@demo.com',   role: 'buyer',   region: 'Rivers',    approved: true,  joined: '2026-11-02' },
  { id: 'usr_weigher_001', fullName: 'Demo Weigher', email: 'weigher@demo.com', role: 'weigher', region: 'Akwa Ibom', approved: true,  joined: '2026-11-03' },
  { id: 'usr_admin_001',   fullName: 'Platform Admin',email: 'admin@demo.com',  role: 'admin',   region: 'Lagos',     approved: true,  joined: '2026-11-01' },
]

const ROLE_BADGE: Record<string, string> = {
  seller:  'bg-teal/20 text-teal-light',
  buyer:   'bg-green-500/15 text-green-400',
  weigher: 'bg-purple-500/15 text-purple-300',
  admin:   'bg-amber-500/15 text-amber-400',
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'listings' | 'users' | 'trades' | 'activity'

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, logout }              = useAuth()
  const { listings, notifications }   = useTrading()
  const navigate                      = useNavigate()
  const [tab,     setTab]             = useState<Tab>('overview')
  const [search,  setSearch]          = useState('')
  const [confirm, setConfirm]         = useState<string | null>(null)

  const handleLogout = () => { logout(); navigate('/', { replace: true }) }

  // ── Computed stats ──────────────────────────────────────────────────────────
  const totalListings    = listings.length
  const activeListings   = listings.filter(l => !['completed','cancelled'].includes(l.status)).length
  const completedTrades  = listings.filter(l => l.status === 'completed').length
  const totalVerified    = listings.filter(l => l.verifiedWeight).reduce((s, l) => s + (l.verifiedWeight ?? 0), 0)
  const totalValue       = listings.filter(l => l.status === 'completed').reduce((s, l) => s + (l.agreedTotal ?? l.totalPrice), 0)
  const totalCredits     = listings.reduce((s, l) => s + (l.blueCreditsEarned ?? 0), 0)
  const pendingVerify    = listings.filter(l => l.status === 'available').length

  // ── Filtered listings ────────────────────────────────────────────────────────
  const filteredListings = useMemo(() => listings.filter(l =>
    search === '' ||
    l.sourcerName.toLowerCase().includes(search.toLowerCase()) ||
    l.locationArea.toLowerCase().includes(search.toLowerCase()) ||
    l.wasteType.toLowerCase().includes(search.toLowerCase()) ||
    l.status.toLowerCase().includes(search.toLowerCase())
  ), [listings, search])

  const filteredUsers = useMemo(() => DEMO_USERS.filter(u =>
    search === '' ||
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  ), [search])

  const TABS: { key: Tab; label: string; icon: LucideIcon }[] = [
    { key: 'overview',  label: 'Overview',  icon: BarChart2    },
    { key: 'listings',  label: 'Listings',  icon: Package      },
    { key: 'users',     label: 'Users',     icon: Users        },
    { key: 'trades',    label: 'Trades',    icon: TrendingUp   },
    { key: 'activity',  label: 'Activity',  icon: Bell         },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#071C2C' }}>

      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-white/[0.06] sticky top-0 z-40 flex-shrink-0"
              style={{ background: '#040F18' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Waves size={14} className="text-amber-400" strokeWidth={2.2} />
          </div>
          <span className="text-[14px] font-bold text-white tracking-tight">
            Waste<span className="text-teal-light">Flow</span>
          </span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 ml-1">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px] font-bold text-amber-400">
              {user?.avatarInitials}
            </div>
            <span className="text-[13px] font-semibold text-white hidden sm:block">{user?.fullName}</span>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08]
                       text-white/40 hover:text-red-400 hover:border-red-500/30 text-[12.5px]
                       transition-all cursor-pointer">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">

        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-52 flex-shrink-0 border-r border-white/[0.06] py-4 px-3 gap-0.5"
               style={{ background: '#040F18' }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left
                          text-[13px] font-medium transition-all cursor-pointer
                          ${tab === key
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'}`}>
              <Icon size={15} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto">

          {/* Mobile tabs */}
          <div className="lg:hidden flex border-b border-white/[0.06] overflow-x-auto">
            {TABS.map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex-shrink-0 px-4 py-3 text-[12.5px] font-semibold transition-all cursor-pointer border-b-2
                            ${tab === key ? 'text-amber-400 border-amber-400' : 'text-white/30 border-transparent'}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="p-6 max-w-7xl">

            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-[20px] font-bold text-white">Platform Overview</h1>
                  <p className="text-[13px] text-white/35 mt-0.5">Real-time platform metrics and activity</p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={Users}        label="Registered Users"    value={DEMO_USERS.length}  color="teal"   />
                  <StatCard icon={Package}      label="Total Listings"      value={totalListings}       color="purple" />
                  <StatCard icon={AlertTriangle}label="Pending Verification"value={pendingVerify}       color="amber"  />
                  <StatCard icon={CheckCircle2} label="Completed Trades"    value={completedTrades}     color="green"  />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={Scale}        label="Total Verified (kg)" value={`${totalVerified} kg`} color="teal"   />
                  <StatCard icon={TrendingUp}   label="Active Listings"     value={activeListings}        color="purple" />
                  <StatCard icon={Coins}        label="Blue Credits Issued" value={totalCredits}          color="amber"  />
                  <StatCard icon={ShieldCheck}  label="Total Trade Value"   value={fmt(totalValue)}       color="green"  />
                </div>

                {/* Recent listings */}
                <div>
                  <SectionHeader title="Recent Listings" count={listings.length} />
                  <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr style={{ background: '#040F18' }}>
                          {['Seller','Type','Est. Weight','Status','Location','Date'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {listings.slice(0, 6).map((l, i) => (
                          <tr key={l.id} className={`border-t border-white/[0.04] ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                            <td className="px-4 py-3 text-[13px] text-white font-medium">{l.sourcerName}</td>
                            <td className="px-4 py-3 text-[13px] text-white/60 capitalize">{l.wasteType.replace('_',' ')}</td>
                            <td className="px-4 py-3 text-[13px] text-white/60">{l.estimatedWeight} kg</td>
                            <td className="px-4 py-3">
                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[l.status]}`}>
                                {l.status.replace('_',' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[13px] text-white/40">{l.locationArea}</td>
                            <td className="px-4 py-3 text-[12px] text-white/30">{fmtDate(l.createdAt)}</td>
                          </tr>
                        ))}
                        {listings.length === 0 && (
                          <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px] text-white/25">No listings yet</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Users summary */}
                <div>
                  <SectionHeader title="Registered Users" count={DEMO_USERS.length} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {DEMO_USERS.map(u => (
                      <div key={u.id} className="rounded-xl p-4 border border-white/[0.07] bg-white/[0.03] flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0">
                          {u.fullName.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-white truncate">{u.fullName}</p>
                          <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full capitalize ${ROLE_BADGE[u.role]}`}>
                            {u.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── LISTINGS ── */}
            {tab === 'listings' && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h1 className="text-[20px] font-bold text-white">All Listings</h1>
                    <p className="text-[13px] text-white/35 mt-0.5">{listings.length} total listings on the platform</p>
                  </div>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                      value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search listings…"
                      className="pl-9 pr-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08]
                                 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-teal w-56"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.07] overflow-hidden overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr style={{ background: '#040F18' }}>
                        {['Seller','Type','Est. Wt.','Verified Wt.','Price/kg','Total','Status','Location','Date','Actions'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[10.5px] font-semibold text-white/30 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredListings.map((l, i) => (
                        <tr key={l.id} className={`border-t border-white/[0.04] hover:bg-white/[0.03] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}>
                          <td className="px-4 py-3 text-[13px] text-white font-medium whitespace-nowrap">{l.sourcerName}</td>
                          <td className="px-4 py-3 text-[13px] text-white/60 capitalize whitespace-nowrap">{l.wasteType.replace('_',' ')}</td>
                          <td className="px-4 py-3 text-[13px] text-white/60 whitespace-nowrap">{l.estimatedWeight} kg</td>
                          <td className="px-4 py-3 text-[13px] whitespace-nowrap">
                            {l.verifiedWeight
                              ? <span className="text-teal-light font-semibold">{l.verifiedWeight} kg</span>
                              : <span className="text-white/20">—</span>}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-white/60 whitespace-nowrap">{fmt(l.pricePerKg)}</td>
                          <td className="px-4 py-3 text-[13px] text-white font-semibold whitespace-nowrap">
                            {fmt(l.agreedTotal ?? l.verifiedTotal ?? l.totalPrice)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[l.status]}`}>
                              {l.status.replace('_',' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[12.5px] text-white/40 whitespace-nowrap max-w-[140px] truncate">{l.locationArea}</td>
                          <td className="px-4 py-3 text-[12px] text-white/30 whitespace-nowrap">{fmtDate(l.createdAt)}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-teal/15 flex items-center justify-center text-white/30 hover:text-teal-light transition-all cursor-pointer" title="View">
                                <Eye size={13} />
                              </button>
                              <button
                                onClick={() => setConfirm(l.id)}
                                className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-red-500/15 flex items-center justify-center text-white/30 hover:text-red-400 transition-all cursor-pointer" title="Remove">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredListings.length === 0 && (
                        <tr><td colSpan={10} className="px-4 py-10 text-center text-[13px] text-white/25">No listings found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── USERS ── */}
            {tab === 'users' && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h1 className="text-[20px] font-bold text-white">Registered Users</h1>
                    <p className="text-[13px] text-white/35 mt-0.5">{DEMO_USERS.length} users on the platform</p>
                  </div>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search users…"
                      className="pl-9 pr-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08]
                                 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-teal w-56" />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: '#040F18' }}>
                        {['User','Email','Role','Region','Status','Joined','Actions'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[10.5px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u, i) => (
                        <tr key={u.id} className={`border-t border-white/[0.04] hover:bg-white/[0.03] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                                {u.fullName.split(' ').map(n => n[0]).join('').slice(0,2)}
                              </div>
                              <span className="text-[13px] font-semibold text-white whitespace-nowrap">{u.fullName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[13px] text-white/50">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${ROLE_BADGE[u.role]}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[13px] text-white/50">{u.region}</td>
                          <td className="px-4 py-3">
                            {u.approved
                              ? <span className="flex items-center gap-1 text-[12px] text-green-400"><CheckCircle2 size={12}/> Active</span>
                              : <span className="flex items-center gap-1 text-[12px] text-amber-400"><AlertTriangle size={12}/> Pending</span>
                            }
                          </td>
                          <td className="px-4 py-3 text-[12px] text-white/30">{fmtDate(u.joined)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-teal/15 flex items-center justify-center text-white/30 hover:text-teal-light transition-all cursor-pointer"><Eye size={13}/></button>
                              <button className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-red-500/15 flex items-center justify-center text-white/30 hover:text-red-400 transition-all cursor-pointer"><XCircle size={13}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── TRADES ── */}
            {tab === 'trades' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h1 className="text-[20px] font-bold text-white">Trade History</h1>
                  <p className="text-[13px] text-white/35 mt-0.5">All trades across the platform</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={TrendingUp}   label="Total Trades"      value={totalListings}      color="teal"   />
                  <StatCard icon={CheckCircle2} label="Completed"         value={completedTrades}    color="green"  />
                  <StatCard icon={AlertTriangle}label="In Progress"       value={activeListings}     color="amber"  />
                  <StatCard icon={Coins}        label="Total Value"       value={fmt(totalValue)}    color="purple" />
                </div>

                <div className="rounded-2xl border border-white/[0.07] overflow-hidden overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr style={{ background: '#040F18' }}>
                        {['Seller','Buyer','Weigher','Material','Agreed Wt.','Value','Credits','Status','Date'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[10.5px] font-semibold text-white/30 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {listings.filter(l => l.status !== 'available').map((l, i) => (
                        <tr key={l.id} className={`border-t border-white/[0.04] hover:bg-white/[0.03] ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}>
                          <td className="px-4 py-3 text-[13px] text-white font-medium whitespace-nowrap">{l.sourcerName}</td>
                          <td className="px-4 py-3 text-[13px] text-white/50 whitespace-nowrap">{l.buyerName ?? <span className="text-white/20">—</span>}</td>
                          <td className="px-4 py-3 text-[13px] text-white/50 whitespace-nowrap">{l.weigherName ?? <span className="text-white/20">—</span>}</td>
                          <td className="px-4 py-3 text-[13px] text-white/60 capitalize whitespace-nowrap">{l.wasteType.replace('_',' ')}</td>
                          <td className="px-4 py-3 text-[13px] whitespace-nowrap">
                            {l.agreedWeight ? <span className="text-teal-light font-semibold">{l.agreedWeight} kg</span> : <span className="text-white/20">—</span>}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-white font-semibold whitespace-nowrap">{fmt(l.agreedTotal ?? l.totalPrice)}</td>
                          <td className="px-4 py-3 text-[13px] whitespace-nowrap">
                            {l.blueCreditsEarned
                              ? <span className="text-teal-light font-semibold">{l.blueCreditsEarned} 🔵</span>
                              : <span className="text-white/20">—</span>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[l.status]}`}>
                              {l.status.replace('_',' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[12px] text-white/30 whitespace-nowrap">{fmtDate(l.createdAt)}</td>
                        </tr>
                      ))}
                      {listings.filter(l => l.status !== 'available').length === 0 && (
                        <tr><td colSpan={9} className="px-4 py-10 text-center text-[13px] text-white/25">No trades yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── ACTIVITY ── */}
            {tab === 'activity' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h1 className="text-[20px] font-bold text-white">Platform Activity</h1>
                  <p className="text-[13px] text-white/35 mt-0.5">All system notifications and events</p>
                </div>

                <div className="flex flex-col gap-2">
                  {notifications.length === 0 ? (
                    <div className="rounded-2xl border border-white/[0.07] p-10 text-center">
                      <Bell size={28} className="text-white/15 mx-auto mb-3" />
                      <p className="text-[14px] text-white/30">No activity yet</p>
                      <p className="text-[12.5px] text-white/20 mt-1">Events will appear here as users interact with the platform</p>
                    </div>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={n.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all
                                                   ${i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.01]'} border-white/[0.05]`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[16px]
                                         ${n.type === 'completed' ? 'bg-green-500/15'
                                         : n.type === 'verified'  ? 'bg-teal/15'
                                         : n.type === 'payment'   ? 'bg-purple-500/15'
                                         : n.type === 'interest'  ? 'bg-blue-500/15'
                                         : 'bg-white/[0.06]'}`}>
                          {n.type === 'completed' ? '🎉'
                           : n.type === 'verified'  ? '✅'
                           : n.type === 'payment'   ? '💳'
                           : n.type === 'interest'  ? '👋'
                           : n.type === 'new_listing'? '🚨'
                           : '🔔'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[13.5px] font-semibold text-white leading-snug">{n.title}</p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize
                                               ${n.forRole === 'seller'  ? 'bg-teal/15 text-teal-light'
                                               : n.forRole === 'buyer'   ? 'bg-green-500/15 text-green-400'
                                               : n.forRole === 'weigher' ? 'bg-purple-500/15 text-purple-300'
                                               : 'bg-white/[0.08] text-white/40'}`}>
                                {n.forRole}
                              </span>
                              <span className="text-[11px] text-white/25 whitespace-nowrap">
                                {new Date(n.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-[12.5px] text-white/45 mt-0.5 leading-relaxed">{n.body}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Delete confirm modal ── */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] p-6" style={{ background: '#0B2233' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <h3 className="text-[15px] font-bold text-white">Remove Listing?</h3>
            </div>
            <p className="text-[13px] text-white/50 mb-5 leading-relaxed">
              This will permanently remove the listing from the platform. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.09] text-white/50 hover:text-white text-[13px] font-semibold cursor-pointer transition-all">
                Cancel
              </button>
              <button onClick={() => setConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold cursor-pointer transition-all">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
