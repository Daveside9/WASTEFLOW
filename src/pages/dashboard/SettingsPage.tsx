import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Moon, Sun, User, Bell, Lock, Shield, Trash2, LogOut,
  Check, AlertTriangle, type LucideIcon,
} from 'lucide-react'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer"
      style={{ backgroundColor: checked ? '#0FA68E' : 'var(--border-stronger)' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  )
}

// ─── Settings section card ────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  description,
  children,
  danger,
}: {
  icon: LucideIcon
  title: string
  description: string
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <div
      className="th-bg-card rounded-2xl p-6 border"
      style={{ borderColor: danger ? 'rgba(192,57,43,0.3)' : 'var(--border-color)' }}
    >
      <div className="flex items-start gap-4 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: danger ? 'rgba(192,57,43,0.12)' : 'rgba(15,166,142,0.12)' }}
        >
          <Icon size={18} strokeWidth={1.8} style={{ color: danger ? '#C0392B' : '#0FA68E' }} />
        </div>
        <div>
          <h3 className="th-text text-[15px] font-semibold tracking-tight">{title}</h3>
          <p className="th-text-sec text-[12.5px] mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── Toast notification ────────────────────────────────────────────────────────

function Toast({ message, show }: { message: string; show: boolean }) {
  if (!show) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div
        className="th-bg-card rounded-xl px-5 py-3 shadow-lg flex items-center gap-2 border"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <Check size={16} style={{ color: '#0E7B40' }} />
        <span className="th-text text-[13px] font-medium">{message}</span>
      </div>
    </div>
  )
}

// ─── Settings state ────────────────────────────────────────────────────────────

const SETTINGS_KEY = 'wflow_settings'

interface SettingsState {
  notifications: {
    listingUpdates: boolean
    creditAlerts:   boolean
    marketAlerts:    boolean
    emailUpdates:    boolean
  }
  privacy: {
    profileVisible: boolean
    dataSharing:    boolean
    activityStatus: boolean
  }
}

const DEFAULT_SETTINGS: SettingsState = {
  notifications: {
    listingUpdates: true,
    creditAlerts:   true,
    marketAlerts:    false,
    emailUpdates:    true,
  },
  privacy: {
    profileVisible: true,
    dataSharing:    false,
    activityStatus: true,
  },
}

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, updateUser, deleteAccount, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  // Profile form
  const [profile, setProfile] = useState({
    fullName: user?.fullName ?? '',
    email:    user?.email    ?? '',
    region:   user?.region   ?? '',
  })

  // Settings
  const [settings, setSettings] = useState<SettingsState>(loadSettings)

  // Password form
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })

  // UI
  const [toast, setToast]           = useState({ message: '', show: false })
  const [showDelete, setShowDelete]   = useState(false)
  const [showClearData, setShowClearData] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  const showToast = useCallback((message: string) => {
    setToast({ message, show: true })
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500)
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleSaveProfile = () => {
    updateUser({
      fullName:       profile.fullName,
      email:          profile.email,
      region:         profile.region,
      avatarInitials: profile.fullName.slice(0, 2).toUpperCase(),
    })
    showToast('Profile updated successfully')
  }

  const handleToggleNotif = (key: keyof SettingsState['notifications']) => {
    setSettings((s) => {
      const updated = {
        ...s,
        notifications: { ...s.notifications, [key]: !s.notifications[key] },
      }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const handleTogglePrivacy = (key: keyof SettingsState['privacy']) => {
    setSettings((s) => {
      const updated = {
        ...s,
        privacy: { ...s.privacy, [key]: !s.privacy[key] },
      }
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      showToast('Please fill in all password fields')
      return
    }
    if (passwords.new !== passwords.confirm) {
      showToast('New passwords do not match')
      return
    }
    if (passwords.new.length < 6) {
      showToast('Password must be at least 6 characters')
      return
    }
    setPasswords({ current: '', new: '', confirm: '' })
    showToast('Password updated successfully')
  }

  const handleDeleteAccount = () => {
    if (deleteConfirm !== 'DELETE') return
    deleteAccount()
    navigate('/', { replace: true })
  }

  const handleClearData = () => {
    // Wipe ALL localStorage — data + session
    localStorage.clear()
    sessionStorage.clear()
    setShowClearData(false)
    // Hard reload to the sign-in page so React state is fully reset
    window.location.href = '/signin'
  }

  const handleNuclear = () => {
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/signin'
  }

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  // Shared input class using CSS variables
  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-input)',
    color:          'var(--text-primary)',
    borderColor:    'var(--border-color)',
  }

  const inputClass =
    'border rounded-xl px-4 py-2.5 text-[13.5px] w-full outline-none transition-colors focus:border-teal'

  return (
    <DashboardShell title="Settings" subtitle="Manage your account and preferences">
      <div className="max-w-3xl mx-auto p-6 lg:p-8 space-y-5">

        {/* ── Appearance ─────────────────────────────────────────────────────── */}
        <Section
          icon={theme === 'dark' ? Moon : Sun}
          title="Appearance"
          description="Customize how the dashboard looks"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="th-text text-[13.5px] font-medium">Theme</p>
              <p className="th-text-sec text-[12px] mt-0.5">Choose between dark and light mode</p>
            </div>
            <div
              className="flex items-center gap-1 p-1 rounded-xl border"
              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
            >
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[12.5px] font-medium transition-all cursor-pointer
                  ${theme === 'dark' ? 'bg-teal text-white' : 'th-text-sec'}`}
              >
                <Moon size={14} /> Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[12.5px] font-medium transition-all cursor-pointer
                  ${theme === 'light' ? 'bg-teal text-white' : 'th-text-sec'}`}
              >
                <Sun size={14} /> Light
              </button>
            </div>
          </div>
        </Section>

        {/* ── Profile ────────────────────────────────────────────────────────── */}
        <Section icon={User} title="Profile" description="Update your personal information">
          <div className="space-y-4">
            <div>
              <label className="th-text-sec text-[12px] font-medium block mb-1.5">Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className={inputClass}
                style={inputStyle}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="th-text-sec text-[12px] font-medium block mb-1.5">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className={inputClass}
                style={inputStyle}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="th-text-sec text-[12px] font-medium block mb-1.5">Region / State</label>
              <select
                value={profile.region}
                onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                className={inputClass + ' cursor-pointer'}
                style={inputStyle}
              >
                <option value="">Select region</option>
                <option value="Lagos">Lagos</option>
                <option value="Rivers">Rivers</option>
                <option value="Akwa Ibom">Akwa Ibom</option>
                <option value="Delta">Delta</option>
                <option value="Bayelsa">Bayelsa</option>
                <option value="Cross River">Cross River</option>
                <option value="Ogun">Ogun</option>
                <option value="Ondo">Ondo</option>
              </select>
            </div>
            <button
              onClick={handleSaveProfile}
              className="bg-teal hover:bg-teal-dark text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </Section>

        {/* ── Notifications ───────────────────────────────────────────────────── */}
        <Section icon={Bell} title="Notifications" description="Choose what you want to be notified about">
          <div className="space-y-1">
            {[
              { key: 'listingUpdates' as const, label: 'Listing updates',   desc: 'Get notified when your listings are verified or sold' },
              { key: 'creditAlerts'   as const, label: 'Blue Credit alerts', desc: 'Notifications when credits are earned or updated' },
              { key: 'marketAlerts'    as const, label: 'Market alerts',      desc: 'New material listings matching your interests' },
              { key: 'emailUpdates'    as const, label: 'Email updates',       desc: 'Receive periodic summary emails' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="th-text text-[13px] font-medium">{label}</p>
                  <p className="th-text-sec text-[11.5px] mt-0.5">{desc}</p>
                </div>
                <Toggle checked={settings.notifications[key]} onChange={() => handleToggleNotif(key)} label={label} />
              </div>
            ))}
          </div>
        </Section>

        {/* ── Security ───────────────────────────────────────────────────────── */}
        <Section icon={Lock} title="Security" description="Manage your password and account security">
          <div className="space-y-4">
            <div>
              <label className="th-text-sec text-[12px] font-medium block mb-1.5">Current Password</label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className={inputClass}
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="th-text-sec text-[12px] font-medium block mb-1.5">New Password</label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="th-text-sec text-[12px] font-medium block mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              onClick={handleChangePassword}
              className="th-hover-bg border rounded-xl text-[13px] font-semibold px-5 py-2.5 transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            >
              Update Password
            </button>
          </div>
        </Section>

        {/* ── Privacy ────────────────────────────────────────────────────────── */}
        <Section icon={Shield} title="Privacy" description="Control your data and visibility">
          <div className="space-y-1">
            {[
              { key: 'profileVisible' as const, label: 'Profile visibility', desc: 'Allow other users to see your profile' },
              { key: 'dataSharing'    as const, label: 'Data sharing',       desc: 'Share anonymized usage data to improve the platform' },
              { key: 'activityStatus' as const, label: 'Activity status',    desc: 'Show when you are active on the platform' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="th-text text-[13px] font-medium">{label}</p>
                  <p className="th-text-sec text-[11.5px] mt-0.5">{desc}</p>
                </div>
                <Toggle checked={settings.privacy[key]} onChange={() => handleTogglePrivacy(key)} label={label} />
              </div>
            ))}
          </div>
        </Section>

        {/* ── Danger Zone ────────────────────────────────────────────────────── */}
        <Section icon={AlertTriangle} title="Danger Zone" description="Irreversible account actions" danger>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="th-text text-[13px] font-medium">Sign out</p>
                <p className="th-text-sec text-[11.5px] mt-0.5">Log out of your current session</p>
              </div>
              <button
                onClick={handleLogout}
                className="th-hover-bg flex items-center gap-2 border rounded-xl text-[12.5px] font-semibold px-4 py-2 cursor-pointer transition-colors"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
            <div
              className="flex items-center justify-between pt-4"
              style={{ borderTop: '1px solid var(--border-color)' }}
            >
              <div>
                <p className="th-text text-[13px] font-medium">Sign out &amp; clear everything</p>
                <p className="th-text-sec text-[11.5px] mt-0.5">Wipes your session, listings, notifications and all stored data</p>
              </div>
              <button
                onClick={handleNuclear}
                className="flex items-center gap-2 text-[12.5px] font-semibold px-4 py-2 rounded-xl cursor-pointer transition-colors text-white"
                style={{ backgroundColor: '#E67E22' }}
              >
                <Trash2 size={14} /> Clear &amp; Sign out
              </button>
            </div>
            <div
              className="flex items-center justify-between pt-4"
              style={{ borderTop: '1px solid var(--border-color)' }}
            >
              <div>
                <p className="text-[13px] font-medium" style={{ color: '#E67E22' }}>Clear all data</p>
                <p className="th-text-sec text-[11.5px] mt-0.5">Wipe all listings, notifications and reports from this browser</p>
              </div>
              <button
                onClick={() => setShowClearData(true)}
                className="flex items-center gap-2 text-[12.5px] font-semibold px-4 py-2 rounded-xl cursor-pointer transition-colors text-white"
                style={{ backgroundColor: '#E67E22' }}
              >
                <Trash2 size={14} /> Clear Data
              </button>
            </div>
            <div
              className="flex items-center justify-between pt-4"
              style={{ borderTop: '1px solid var(--border-color)' }}
            >
              <div>
                <p className="text-[13px] font-medium" style={{ color: '#C0392B' }}>Delete account</p>
                <p className="th-text-sec text-[11.5px] mt-0.5">Permanently remove your account and all associated data</p>
              </div>
              <button
                onClick={() => setShowDelete(true)}
                className="flex items-center gap-2 text-[12.5px] font-semibold px-4 py-2 rounded-xl cursor-pointer transition-colors text-white"
                style={{ backgroundColor: '#C0392B' }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </Section>
      </div>

      {/* ── Delete account modal ──────────────────────────────────────────────── */}
      {showDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <div
            className="th-bg-card rounded-2xl p-6 max-w-md w-full border"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(192,57,43,0.12)' }}
              >
                <AlertTriangle size={18} style={{ color: '#C0392B' }} />
              </div>
              <h3 className="th-text text-[16px] font-bold">Delete Account</h3>
            </div>
            <p className="th-text-sec text-[13px] mb-4 leading-relaxed">
              This action is permanent and cannot be undone. All your listings, credits, and account
              data will be permanently removed.
            </p>
            <p className="th-text text-[12.5px] font-medium mb-2">
              Type <span style={{ color: '#C0392B' }} className="font-bold">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className={inputClass}
              style={inputStyle}
              placeholder="DELETE"
              autoFocus
            />
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setShowDelete(false); setDeleteConfirm('') }}
                className="th-hover-bg flex-1 border rounded-xl text-[13px] font-semibold py-2.5 cursor-pointer transition-colors"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE'}
                className="flex-1 text-white text-[13px] font-semibold py-2.5 rounded-xl cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#C0392B' }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast.message} show={toast.show} />

      {/* ── Clear data modal ─────────────────────────────────────────────────── */}
      {showClearData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="th-bg-card rounded-2xl p-6 max-w-md w-full border"
               style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ backgroundColor: 'rgba(230,126,34,0.12)' }}>
                <Trash2 size={18} style={{ color: '#E67E22' }} />
              </div>
              <h3 className="th-text text-[16px] font-bold">Clear All App Data</h3>
            </div>
            <p className="th-text-sec text-[13px] mb-5 leading-relaxed">
              This will permanently delete all <strong className="th-text">listings</strong>,{' '}
              <strong className="th-text">notifications</strong>, and{' '}
              <strong className="th-text">waste reports</strong> stored in this browser.
              Your login session will be kept. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearData(false)}
                className="th-hover-bg flex-1 border rounded-xl text-[13px] font-semibold py-2.5 cursor-pointer transition-colors"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 text-white text-[13px] font-semibold py-2.5 rounded-xl cursor-pointer transition-colors"
                style={{ backgroundColor: '#E67E22' }}
              >
                Yes, Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
