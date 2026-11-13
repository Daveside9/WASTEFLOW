import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Waves, LogOut, LayoutDashboard,
  Coins, Settings, Store, Bell, Menu, X, Search, Scale,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTrading } from '@/context/TradingContext'

// ─── Nav item definitions per role ───────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  seller:  'Seller',
  buyer:   'Buyer',
  weigher: 'Weigher',
}

interface NavItem { icon: LucideIcon; label: string; path: string }

function getNavItems(role: string): NavItem[] {
  const base: NavItem[] = [
    { icon: LayoutDashboard, label: 'Overview',       path: '/dashboard' },
  ]
  const listings: NavItem = { icon: Search,   label: 'My Listings',   path: '/dashboard/market' }
  const market:   NavItem = { icon: Store,    label: 'Waste Market',  path: '/dashboard/market' }
  const verify:   NavItem = { icon: Scale,    label: 'Verifications', path: '/dashboard/market' }
  const credits:  NavItem = { icon: Coins,    label: 'Blue Credits',   path: '/dashboard/credits' }
  const settings: NavItem = { icon: Settings, label: 'Settings',       path: '/dashboard/settings' }

  switch (role) {
    case 'seller':  return [...base, listings, credits, settings]
    case 'buyer':   return [...base, market, credits, settings]
    case 'weigher': return [...base, verify, credits, settings]
    default:        return [...base, market, settings]
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props { children: React.ReactNode; title: string; subtitle?: string }

export default function DashboardShell({ children, title, subtitle }: Props) {
  const { user, logout }          = useAuth()
  const { notifications: allNotifs, markNotificationsRead } = useTrading()
  const navigate                  = useNavigate()
  const location                  = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showNotifs,  setShowNotifs] = useState(false)

  // Filter notifications to only those for this user's role
  const notifications = allNotifs.filter(n => n.forRole === 'all' || n.forRole === user?.role)
  const unreadCount   = notifications.filter(n => !n.read).length

  const navItems = getNavItems(user?.role ?? 'seller')
  const roleLabel = ROLE_LABELS[user?.role ?? ''] ?? ''

  const handleLogout = () => { logout(); navigate('/', { replace: true }) }

  const handleNotifClick = () => {
    setShowNotifs(s => !s)
    if (unreadCount > 0) markNotificationsRead()
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col ${mobile ? 'h-full' : 'h-screen sticky top-0'}`}
         style={{ background: 'var(--bg-sidebar)' }}>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal flex items-center justify-center shadow-teal">
            <Waves size={14} className="text-white" strokeWidth={2.2} />
          </div>
          <span className="text-[14px] font-bold text-white tracking-tight">
            Waste<span className="text-teal-light">Flow</span>
          </span>
        </div>
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="text-white/40 hover:text-white cursor-pointer">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto" aria-label="Dashboard navigation">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path
          return (
            <button
              key={label}
              onClick={() => { navigate(path); if (mobile) setMobileOpen(false) }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left
                          text-[13.5px] font-medium transition-all duration-150 cursor-pointer
                          ${active
                            ? 'bg-teal/15 text-teal-light'
                            : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'}`}
            >
              <Icon size={16} strokeWidth={1.8} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center
                          text-[12px] font-bold text-teal-light flex-shrink-0">
            {user?.avatarInitials ?? '?'}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-white truncate">{user?.fullName}</div>
            <div className="text-[11px] text-white/35 truncate">{roleLabel}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[13px] text-white/35 hover:text-red-400
                     transition-colors w-full cursor-pointer py-1"
        >
          <LogOut size={14} strokeWidth={1.8} /> Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-app)' }}>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 flex-shrink-0 border-r border-white/[0.06]">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex-shrink-0">
            <Sidebar mobile />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="flex items-center justify-between px-6 h-16 border-b border-white/[0.06] flex-shrink-0 sticky top-0 z-40"
                style={{ background: 'var(--bg-app)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-white/50 hover:text-white cursor-pointer mr-1"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-[17px] font-bold text-white tracking-tight leading-tight">{title}</h1>
              {subtitle && <p className="text-[12px] text-white/35">{subtitle}</p>}
            </div>
          </div>

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={handleNotifClick}
              className="relative w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.09]
                         flex items-center justify-center text-white/60 hover:text-white
                         transition-colors cursor-pointer border border-white/[0.07]"
              aria-label={`${unreadCount} unread notifications`}
            >
              <Bell size={16} strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal
                                 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification panel */}
            {showNotifs && (
              <div
                className="absolute right-0 top-11 w-80 rounded-2xl border border-white/[0.08]
                           shadow-[0_16px_48px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                style={{ background: 'var(--bg-card)' }}
              >
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-[13px] font-semibold text-white">Notifications</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0
                    ? <p className="text-[13px] text-white/30 text-center py-8">No notifications yet</p>
                    : notifications.slice(0, 20).map(n => (
                        <button
                          key={n.id}
                          onClick={() => { n.listingId && navigate('/dashboard/market'); setShowNotifs(false) }}
                          className={`w-full text-left px-4 py-3 border-b border-white/[0.04]
                                      hover:bg-white/[0.04] transition-colors cursor-pointer
                                      ${!n.read ? 'bg-teal/[0.05]' : ''}`}
                        >
                          <p className="text-[13px] font-semibold text-white leading-tight">{n.title}</p>
                          <p className="text-[12px] text-white/40 mt-0.5 leading-snug">{n.body}</p>
                          <p className="text-[10px] text-white/25 mt-1">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </button>
                      ))
                  }
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
