import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, MailCheck } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthInput  from '@/components/auth/AuthInput'

export default function ForgotPasswordPage() {
  const [email,    setEmail]    = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [sent,     setSent]     = useState(false)

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!email.trim())                          { setError('Email is required.'); return }
    if (!/\S+@\S+\.\S+/.test(email.trim()))     { setError('Enter a valid email address.'); return }
    setError('')
    setLoading(true)
    // TODO: POST /api/v1/auth/forgot-password/
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout backTo="/signin" backLabel="Back to sign in">
        <div className="w-full max-w-[420px]">
          <div
            className="rounded-2xl p-10 border border-white/[0.08] text-center"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <div className="w-16 h-16 rounded-full bg-teal/20 flex items-center justify-center mx-auto mb-5">
              <MailCheck size={30} className="text-teal-light" strokeWidth={1.5} />
            </div>
            <h2 className="text-[1.4rem] font-extrabold text-white tracking-tight mb-2">
              Check your inbox
            </h2>
            <p className="text-[14px] text-white/50 leading-relaxed mb-7">
              If an account exists for <span className="text-white/70 font-medium">{email}</span>,
              you'll receive a password reset link shortly.
            </p>
            <Link
              to="/signin"
              className="inline-flex items-center justify-center gap-2 py-3 px-8
                         bg-teal hover:bg-teal-dark text-white font-semibold rounded-xl
                         no-underline transition-all shadow-teal"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout backTo="/signin" backLabel="Back to sign in">
      <div className="w-full max-w-[420px]">
        <div
          className="rounded-2xl p-8 border border-white/[0.08]"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}
        >
          <div className="mb-7">
            <h1 className="text-[1.6rem] font-extrabold text-white tracking-tight mb-1.5">
              Reset your password
            </h1>
            <p className="text-[14px] text-white/45 leading-relaxed">
              Enter the email linked to your account and we'll send a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate aria-label="Forgot password form" className="flex flex-col gap-5">
            <AuthInput
              label="Email address"
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              error={error}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-teal hover:bg-teal-dark
                         disabled:opacity-50 disabled:cursor-not-allowed
                         text-white text-[14.5px] font-semibold
                         shadow-teal hover:shadow-teal-hover
                         flex items-center justify-center gap-2
                         transition-all duration-200 cursor-pointer
                         hover:-translate-y-px"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Sending…</>
                : 'Send Reset Link'
              }
            </button>
          </form>

          <p className="text-center text-[13.5px] text-white/40 mt-5">
            Remembered it?{' '}
            <Link to="/signin" className="text-teal-light font-semibold hover:underline no-underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
