import { Link } from 'react-router-dom'
import { Waves } from 'lucide-react'

const platformLinks = [
  { label: 'How It Works',     href: '/#how-it-works' },
  { label: 'Features',         href: '/#features' },
  { label: 'Circular Economy', href: '/#circular' },
  { label: 'Impact Data',      href: '/#impact' },
]

const accountLinks = [
  { label: 'Sign In',           href: '/signin',   internal: true },
  { label: 'Create Account',    href: '/register', internal: true },
  { label: 'Password Recovery', href: '#',         internal: false },
]

const legalLinks = [
  { label: 'About',                       href: '#' },
  { label: 'Contact',                     href: '#' },
  { label: 'Privacy Policy',              href: '#' },
  { label: 'Terms of Use',                href: '#' },
  { label: 'Data & Prediction Limits',    href: '#' },
]

export default function Footer() {
  return (
    <footer className="text-white/55" style={{ background: '#040F18' }} role="contentinfo">
      <div className="max-w-7xl mx-auto px-5 pt-14 pb-8">

        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 no-underline" aria-label="WasteFlow home">
              <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center shadow-[0_2px_8px_rgba(15,166,142,0.4)]">
                <Waves size={16} className="text-white" strokeWidth={2.2} />
              </div>
              <span className="text-[16px] font-bold text-white tracking-tight">
                Waste<span className="text-teal-light">Flow</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed max-w-[280px]">
              AI-Assisted Marine Waste Management &amp; Blue Circular Economy Platform.
              Part of the NIMASA-BEAP Track 6 programme.
            </p>
          </div>

          {/* Platform */}
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">Platform</p>
            <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
              {platformLinks.map(l => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-white/55 hover:text-white transition-colors no-underline">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">Account</p>
            <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
              {accountLinks.map(l => (
                <li key={l.label}>
                  {l.internal
                    ? <Link to={l.href} className="text-sm text-white/55 hover:text-white transition-colors no-underline">{l.label}</Link>
                    : <a href={l.href} className="text-sm text-white/55 hover:text-white transition-colors no-underline">{l.label}</a>
                  }
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">Legal &amp; Info</p>
            <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
              {legalLinks.map(l => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-white/55 hover:text-white transition-colors no-underline">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-7 border-t border-white/10 text-xs">
          <span>© {new Date().getFullYear()} WasteFlow. All rights reserved.</span>
          <span className="inline-flex items-center gap-1.5 bg-teal/20 border border-teal/30 text-[#7ef0e8] text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            NIMASA-BEAP · Track 6
          </span>
        </div>
      </div>
    </footer>
  )
}
