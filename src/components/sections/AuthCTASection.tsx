import { Link } from 'react-router-dom'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { Check } from 'lucide-react'

const signInFeatures = [
  'Role-based dashboard tailored to your work',
  'Real-time waste listings and trade updates',
  'Verified collection history and Blue Credits',
  'Notifications for new listings and verification tasks',
]

const registerFeatures = [
  'Choose your role and operating region',
  'Verify your account before you start',
  'List, verify, or purchase waste material',
  'Earn Blue Credits for verified waste',
]

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5 text-[13.5px] text-white/60">
      <span className="flex-shrink-0 mt-0.5 w-[18px] h-[18px] rounded-full bg-teal/25 flex items-center justify-center">
        <Check size={10} className="text-teal-light" strokeWidth={3} />
      </span>
      {text}
    </li>
  )
}

export default function AuthCTASection() {
  const { ref: headRef, visible: headVisible } = useScrollReveal()
  const { ref: cardsRef, visible: cardsVisible } = useScrollReveal()

  return (
    <section
      className="py-24 lg:py-28"
      style={{ background: '#071C2C' }}
      aria-labelledby="auth-heading"
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-8">

        {/* Heading */}
        <div
          ref={headRef}
          className={`text-center mb-12 transition-all duration-600
                      ${headVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
          <p className="section-pill-light justify-center">Get Started</p>
          <h2
            id="auth-heading"
            className="text-[2rem] lg:text-[2.4rem] font-extrabold text-white
                       tracking-[-0.03em] leading-[1.15] mb-4 max-w-xl mx-auto"
          >
            Join the WasteFlow Community
          </h2>
          <p className="text-[15.5px] text-white/50 max-w-lg mx-auto leading-[1.75]">
            Already part of a cleanup team? Sign in. New to the platform? Create an account
            and choose your role — every account is verified before it is activated.
          </p>
        </div>

        {/* Cards */}
        <div
          ref={cardsRef}
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-600
                      ${cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
          {/* Sign In */}
          <div
            className="rounded-2xl p-10 flex flex-col gap-5 border border-teal/20"
            style={{ background: 'linear-gradient(145deg, #0d3047 0%, #0a2638 100%)' }}
          >
            <div className="w-12 h-12 rounded-xl bg-teal/20 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                className="text-teal-light" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </div>
            <div>
              <h3 className="text-[1.35rem] font-bold text-white tracking-tight mb-1.5">Sign In</h3>
              <p className="text-[14px] text-white/50 leading-relaxed">
                Access your dashboard, hotspot map, cleanup tasks, and Blue Credits ledger.
              </p>
            </div>
            <ul className="list-none m-0 p-0 flex flex-col gap-2.5" aria-label="Sign-in features">
              {signInFeatures.map(f => <CheckItem key={f} text={f} />)}
            </ul>
            <Link
              to="/signin"
              className="mt-2 inline-flex items-center justify-center gap-2
                         py-3.5 px-7 bg-teal hover:bg-teal-dark
                         text-white text-[14px] font-semibold rounded-xl
                         shadow-teal hover:shadow-teal-hover
                         transition-all duration-200 no-underline
                         hover:-translate-y-0.5"
            >
              Sign In to Your Account →
            </Link>
          </div>

          {/* Register */}
          <div
            className="rounded-2xl p-10 flex flex-col gap-5 border border-white/[0.08]"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                className="text-white/70" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <div>
              <h3 className="text-[1.35rem] font-bold text-white tracking-tight mb-1.5">Create Account</h3>
              <p className="text-[14px] text-white/50 leading-relaxed">
                Join as a Seller, Buyer, or Weigher. Free to join.
              </p>
            </div>
            <ul className="list-none m-0 p-0 flex flex-col gap-2.5" aria-label="Registration features">
              {registerFeatures.map(f => <CheckItem key={f} text={f} />)}
            </ul>
            <Link
              to="/register"
              className="mt-2 inline-flex items-center justify-center gap-2
                         py-3.5 px-7 border border-white/20 hover:border-white/40
                         hover:bg-white/[0.06]
                         text-white text-[14px] font-semibold rounded-xl
                         transition-all duration-200 no-underline
                         hover:-translate-y-0.5"
            >
              Create Your Account →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
