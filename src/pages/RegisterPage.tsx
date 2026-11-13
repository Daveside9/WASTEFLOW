import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Eye, EyeOff, Loader2, CheckCircle2,
  Package, Recycle, Scale, Check,
  type LucideIcon,
} from 'lucide-react'
import AuthLayout  from '@/components/auth/AuthLayout'
import AuthInput   from '@/components/auth/AuthInput'
import { useAuth } from '@/context/AuthContext'
import type { UserRole, BuyerProfile } from '@/context/AuthContext'

// Roles that require additional review before activation
const RESTRICTED: UserRole[] = ['weigher']

// ─── Role definitions ─────────────────────────────────────────────────────────

type RoleOption = {
  value: UserRole
  label: string
  desc: string
  Icon: LucideIcon
}

const roleOptions: RoleOption[] = [
  {
    value: 'seller',
    label: 'Seller',
    desc:  'Source of waste — list the marine waste you have collected or hold, and sell to buyers.',
    Icon:  Package,
  },
  {
    value: 'buyer',
    label: 'Buyer',
    desc:  'Recycling company or processor — browse and purchase verified recovered materials.',
    Icon:  Recycle,
  },
  {
    value: 'weigher',
    label: 'Weigher',
    desc:  'Neutral third party — weigh waste and confirm its value before sale.',
    Icon:  Scale,
  },
]

// ─── Password strength ────────────────────────────────────────────────────────

function passwordStrength(pwd: string) {
  if (!pwd) return { score: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8)           score++
  if (pwd.length >= 12)          score++
  if (/[A-Z]/.test(pwd))         score++
  if (/[0-9]/.test(pwd))         score++
  if (/[^A-Za-z0-9]/.test(pwd))  score++
  if (score <= 1) return { score, label: 'Weak',   color: 'bg-red-500' }
  if (score <= 2) return { score, label: 'Fair',   color: 'bg-amber-500' }
  if (score <= 3) return { score, label: 'Good',   color: 'bg-teal' }
  return               { score, label: 'Strong', color: 'bg-green-500' }
}

// ─── FormState ────────────────────────────────────────────────────────────────

interface FormState {
  fullName:    string
  email:       string
  password:    string
  region:      string
  role:        UserRole | ''
  agreed:      boolean
  // Buyer company fields
  isCompany:          boolean
  companyName:        string
  registrationNumber: string
  processingCapacity: string
}

type Errors = Partial<Record<keyof FormState, string>>

// ─── Component ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const { register, error: authError, clearError } = useAuth()

  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form,    setForm]    = useState<FormState>({
    fullName: '', email: '', password: '', region: '', role: '', agreed: false,
    isCompany: false, companyName: '', registrationNumber: '', processingCapacity: '',
  })
  const [errors, setErrors] = useState<Errors>({})

  const strength = passwordStrength(form.password)
  const isRecycler = form.role === 'buyer'

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }

  const validate = (): Errors => {
    const e: Errors = {}
    if (!form.fullName.trim())                     e.fullName = 'Full name is required.'
    if (!form.email.trim())                        e.email    = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email))     e.email    = 'Enter a valid email address.'
    if (!form.password)                            e.password = 'Password is required.'
    else if (form.password.length < 8)             e.password = 'Password must be at least 8 characters.'
    if (!form.region.trim())                       e.region   = 'State or region is required.'
    if (!form.role)                                e.role     = 'Please select a role.'
    if (isRecycler && form.isCompany) {
      if (!form.companyName.trim())                e.companyName = 'Company name is required.'
    }
    if (!form.agreed)                              e.agreed   = 'You must accept the terms to continue.'
    return e
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    clearError()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)

    const buyerProfile: BuyerProfile | undefined = form.role === 'buyer' ? {
      isCompany:           form.isCompany,
      companyName:         form.isCompany ? form.companyName        : undefined,
      registrationNumber:  form.isCompany ? form.registrationNumber : undefined,
      processingCapacity:  form.isCompany ? form.processingCapacity : undefined,
    } : undefined

    try {
      await register({ ...form, role: form.role as UserRole, buyerProfile })
      setSuccess(true)
    } catch {
      // error displayed via authError
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    const restricted = form.role && RESTRICTED.includes(form.role as UserRole)
    return (
      <AuthLayout>
        <div className="w-full max-w-[440px]">
          <div
            className="rounded-2xl p-10 border border-white/[0.08] text-center"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <div className="w-16 h-16 rounded-full bg-teal/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={34} className="text-teal-light" strokeWidth={1.5} />
            </div>
            <h2 className="text-[1.4rem] font-extrabold text-white tracking-tight mb-2">
              Registration Submitted!
            </h2>
            <p className="text-[14px] text-white/50 leading-relaxed mb-4">
              Your account request has been received. You'll get a confirmation email once it's reviewed.
            </p>
            {restricted && (
              <p className="text-[12.5px] text-amber-400/80 bg-amber-500/10 border border-amber-500/20
                            rounded-xl px-4 py-3 mb-5 leading-relaxed">
                <strong className="text-amber-400 font-semibold">Approval required.</strong>{' '}
                Weigher access requires additional verification before activation.
              </p>
            )}
            <Link
              to="/signin"
              className="inline-flex items-center justify-center gap-2 py-3 px-8
                         bg-teal hover:bg-teal-dark text-white font-semibold rounded-xl
                         no-underline transition-all shadow-teal"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <AuthLayout>
      <div className="w-full max-w-[500px] py-4">
        <div
          className="rounded-2xl p-8 border border-white/[0.08]"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}
        >
          <div className="mb-7">
            <h1 className="text-[1.6rem] font-extrabold text-white tracking-tight mb-1.5">
              Create your account
            </h1>
            <p className="text-[14px] text-white/45 leading-relaxed">
              Join the WasteFlow community — free to join.
            </p>
          </div>

          {/* Auth-level error banner */}
          {authError && (
            <div role="alert" className="mb-5 px-4 py-3 rounded-xl bg-red-custom/10
                           border border-red-custom/30 text-[13px] text-red-400 flex items-center gap-2">
              <span aria-hidden="true">⚠</span> {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate aria-label="Registration form" className="flex flex-col gap-5">

            {/* ── Name + Email ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <AuthInput
                label="Full name" id="fullName" type="text" autoComplete="name"
                placeholder="Your full name"
                value={form.fullName} onChange={e => set('fullName', e.target.value)}
                error={errors.fullName}
              />
              <AuthInput
                label="Email address" id="email" type="email" autoComplete="email"
                placeholder="you@example.com"
                value={form.email} onChange={e => set('email', e.target.value)}
                error={errors.email}
              />
            </div>

            {/* ── Password + Region ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <AuthInput
                  label="Password" id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={form.password} onChange={e => set('password', e.target.value)}
                  error={errors.password}
                  rightElement={
                    <button type="button" onClick={() => setShowPwd(s => !s)}
                      className="text-white/35 hover:text-white/70 transition-colors cursor-pointer"
                      aria-label={showPwd ? 'Hide password' : 'Show password'}>
                      {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  }
                />
                {/* Strength bar */}
                {form.password && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex gap-1 flex-1">
                      {[1,2,3,4].map(n => (
                        <div key={n}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            n <= strength.score ? strength.color : 'bg-white/10'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-white/40 font-medium w-10 text-right">
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <AuthInput
                label="State / Region" id="region" type="text"
                placeholder="e.g. Lagos, Rivers State"
                value={form.region} onChange={e => set('region', e.target.value)}
                error={errors.region}
              />
            </div>

            {/* ── Role selector ── */}
            <div>
              <p className="text-[13px] font-semibold text-white/70 mb-2.5">Your role</p>
              <div className="flex flex-col gap-2">
                {roleOptions.map(({ value, label, desc, Icon }) => {
                  const selected = form.role === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set('role', value)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left
                                  transition-all duration-150 cursor-pointer w-full
                                  ${selected
                                    ? 'border-teal bg-teal/10'
                                    : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'}`}
                      aria-pressed={selected}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                                       ${selected ? 'bg-teal/25' : 'bg-white/[0.07]'}`}>
                        <Icon size={16} strokeWidth={1.8}
                          className={selected ? 'text-teal-light' : 'text-white/40'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[13px] font-semibold leading-tight
                                         ${selected ? 'text-white' : 'text-white/65'}`}>
                          {label}
                        </div>
                        <div className="text-[11.5px] text-white/30 leading-snug mt-0.5 truncate">
                          {desc}
                        </div>
                      </div>
                      {/* Radio dot */}
                      <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center
                                       justify-center transition-all
                                       ${selected ? 'border-teal bg-teal' : 'border-white/20'}`}>
                        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>

              {errors.role && (
                <p role="alert" className="mt-2 text-[12px] text-red-400 font-medium flex items-center gap-1">
                  <span aria-hidden="true">⚠</span> {errors.role}
                </p>
              )}

              {/* Restricted role notice */}
              {form.role && RESTRICTED.includes(form.role as UserRole) && (
                <p className="mt-2 text-[12px] text-amber-400/70 leading-relaxed">
                  {form.role === 'weigher'
                    ? 'Waste Sourcer accounts are reviewed before activation to ensure field credibility.'
                    : 'This role requires additional verification before you can access all features.'
                  }
                </p>
              )}
            </div>

            {/* ── Recycler company fields (conditional) ── */}
            {isRecycler && (
              <div
                className="rounded-xl border border-white/[0.08] p-4 flex flex-col gap-4"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <p className="text-[13px] font-semibold text-white/60">
                  Are you registering as a company?
                </p>

                {/* Individual / Company toggle */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: false, label: 'Individual' },
                    { val: true,  label: 'Company / Organisation' },
                  ].map(opt => (
                    <button
                      key={String(opt.val)}
                      type="button"
                      onClick={() => set('isCompany', opt.val)}
                      className={`py-2.5 rounded-xl text-[13px] font-medium border transition-all cursor-pointer
                                  ${form.isCompany === opt.val
                                    ? 'border-teal bg-teal/10 text-white'
                                    : 'border-white/[0.08] text-white/40 hover:border-white/20 hover:text-white/60'}`}
                      aria-pressed={form.isCompany === opt.val}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Company-specific fields */}
                {form.isCompany && (
                  <div className="flex flex-col gap-3">
                    <AuthInput
                      label="Company / Organisation name"
                      id="companyName" type="text"
                      placeholder="e.g. Lagos Recyclers Ltd."
                      value={form.companyName}
                      onChange={e => set('companyName', e.target.value)}
                      error={errors.companyName}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <AuthInput
                        label="Registration number (optional)"
                        id="registrationNumber" type="text"
                        placeholder="RC 123456"
                        value={form.registrationNumber}
                        onChange={e => set('registrationNumber', e.target.value)}
                      />
                      <AuthInput
                        label="Processing capacity (optional)"
                        id="processingCapacity" type="text"
                        placeholder="e.g. 5 tonnes/month"
                        value={form.processingCapacity}
                        onChange={e => set('processingCapacity', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Terms ── */}
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={form.agreed}
                  onChange={e => set('agreed', e.target.checked)}
                  className="sr-only"
                  aria-describedby={errors.agreed ? 'agreed-error' : undefined}
                />
                <div
                  className={`w-[18px] h-[18px] rounded flex items-center justify-center
                               border transition-all duration-150 cursor-pointer
                               ${form.agreed ? 'bg-teal border-teal' : 'bg-white/[0.05] border-white/20'}`}
                  aria-hidden="true"
                >
                  {form.agreed && <Check size={11} className="text-white" strokeWidth={3} />}
                </div>
              </div>
              <span className="text-[13px] text-white/40 leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-teal-light/80 hover:text-teal-light underline">Terms of Use</a>
                {' '}and{' '}
                <a href="#" className="text-teal-light/80 hover:text-teal-light underline">Privacy Notice</a>.
                Location access will only be requested when needed.
              </span>
            </label>
            {errors.agreed && (
              <p id="agreed-error" role="alert"
                 className="-mt-3 text-[12px] text-red-400 font-medium flex items-center gap-1">
                <span aria-hidden="true">⚠</span> {errors.agreed}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-1 rounded-xl bg-teal hover:bg-teal-dark
                         disabled:opacity-50 disabled:cursor-not-allowed
                         text-white text-[14.5px] font-semibold
                         shadow-teal hover:shadow-teal-hover
                         flex items-center justify-center gap-2
                         transition-all duration-200 cursor-pointer hover:-translate-y-px"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Creating account…</>
                : 'Create Account'
              }
            </button>
          </form>

          <p className="text-center text-[13.5px] text-white/40 mt-5">
            Already have an account?{' '}
            <Link to="/signin"
              className="text-teal-light font-semibold hover:underline no-underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
