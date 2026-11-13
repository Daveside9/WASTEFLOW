import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Package, Recycle, Scale, ShieldCheck } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthInput  from '@/components/auth/AuthInput'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/context/AuthContext'

const DEMO_ROLES: { role: UserRole; label: string; desc: string; icon: typeof Package }[] = [
  { role: 'seller',  label: 'Seller',  desc: 'List & sell waste',      icon: Package     },
  { role: 'buyer',   label: 'Buyer',   desc: 'Browse & buy materials', icon: Recycle     },
  { role: 'weigher', label: 'Weigher', desc: 'Verify & weigh waste',   icon: Scale       },
  { role: 'admin',   label: 'Admin',   desc: 'Platform management',    icon: ShieldCheck },
]

export default function SignInPage() {
  const { login, error: authError, clearError } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  const [showPwd,   setShowPwd]   = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [demoRole,  setDemoRole]  = useState<UserRole>('seller')
  const [form,      setForm]      = useState({ email: '', password: '' })
  const [errors,    setErrors]    = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const e: typeof errors = {}
    if (!form.email.trim())                            e.email    = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email.trim())) e.email    = 'Enter a valid email address.'
    if (!form.password)                                e.password = 'Password is required.'
    return e
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    clearError()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    try {
      await login(form.email.trim(), form.password, demoRole)
      const dest = demoRole === 'admin' ? '/admin' : from
      navigate(dest, { replace: true })
    } catch {
      // error already in authError
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-[420px]">
        <div
          className="rounded-2xl p-8 border border-white/[0.08]"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}
        >
          <div className="mb-7">
            <h1 className="text-[1.6rem] font-extrabold text-white tracking-tight mb-1.5">
              Welcome back
            </h1>
            <p className="text-[14px] text-white/45 leading-relaxed">
              Sign in to your WasteFlow account.
            </p>
          </div>

          {authError && (
            <div role="alert" className="mb-5 px-4 py-3 rounded-xl bg-red-custom/10 border border-red-custom/30
                           text-[13px] text-red-400 flex items-center gap-2">
              <span aria-hidden="true">⚠</span> {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate aria-label="Sign in form" className="flex flex-col gap-5">

            {/* ── Demo role selector ── */}
            <div>
              <p className="text-[12px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                Sign in as
              </p>
              <div className="grid grid-cols-4 gap-2">
                {DEMO_ROLES.map(({ role, label, desc, icon: Icon }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setDemoRole(role)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border
                                transition-all cursor-pointer text-center
                                ${demoRole === role
                                  ? 'border-teal bg-teal/10'
                                  : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'}`}
                    aria-pressed={demoRole === role}
                  >
                    <Icon size={18} strokeWidth={1.7}
                      className={demoRole === role ? 'text-teal-light' : 'text-white/35'} />
                    <span className={`text-[12.5px] font-semibold leading-none
                                      ${demoRole === role ? 'text-white' : 'text-white/45'}`}>
                      {label}
                    </span>
                    <span className="text-[10.5px] text-white/25 leading-tight">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <AuthInput
              label="Email address" id="email" type="email" autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              error={errors.email}
            />

            <AuthInput
              label="Password" id="password"
              type={showPwd ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Your password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              error={errors.password}
              rightElement={
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="text-white/35 hover:text-white/70 transition-colors cursor-pointer"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <div className="-mt-2 text-right">
              <Link to="/forgot-password"
                className="text-[13px] text-teal-light/80 hover:text-teal-light no-underline transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-1 rounded-xl bg-teal hover:bg-teal-dark
                         disabled:opacity-50 disabled:cursor-not-allowed
                         text-white text-[14.5px] font-semibold shadow-teal hover:shadow-teal-hover
                         flex items-center justify-center gap-2
                         transition-all duration-200 cursor-pointer hover:-translate-y-px"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                : `Sign In as ${DEMO_ROLES.find(r => r.role === demoRole)?.label}`
              }
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-[12px] text-white/25 font-medium">or</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          <p className="text-center text-[13.5px] text-white/40">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-light font-semibold hover:underline no-underline">
              Create one free
            </Link>
          </p>
        </div>

        <p className="text-center text-[11.5px] text-white/25 mt-5 leading-relaxed px-2">
          By signing in you agree to our{' '}
          <a href="#" className="text-white/40 hover:text-white/60 underline">Terms of Use</a>
          {' '}and{' '}
          <a href="#" className="text-white/40 hover:text-white/60 underline">Privacy Policy</a>.
        </p>
      </div>
    </AuthLayout>
  )
}
