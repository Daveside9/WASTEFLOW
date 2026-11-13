import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Waves } from 'lucide-react'

const navLinks = [
  { label: 'How It Works',     href: '/#how-it-works' },
  { label: 'Features',         href: '/#features' },
  { label: 'Circular Economy', href: '/#circular' },
  { label: 'Impact',           href: '/#impact' },
  { label: 'About',            href: '/#about' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location  = useLocation()
  const isLanding = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isLanding && href.startsWith('/#')) {
      e.preventDefault()
      document.getElementById(href.slice(2))?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-nav shadow-nav' : 'glass-nav'
      }`}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-[68px] flex items-center justify-between">

        {/* ── Logo ── */}
        <Link
          to="/"
          className="flex items-center gap-2.5 no-underline group"
          aria-label="WasteFlow home"
        >
          <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center
                          shadow-[0_2px_8px_rgba(15,166,142,0.5)]
                          group-hover:shadow-[0_4px_14px_rgba(15,166,142,0.7)]
                          transition-shadow duration-200">
            <Waves size={17} className="text-white" strokeWidth={2.2} />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-white leading-none">
            Waste<span className="text-teal-light">Flow</span>
          </span>
        </Link>

        {/* ── Desktop links ── */}
        <ul className="hidden md:flex items-center gap-6 list-none m-0 p-0">
          {navLinks.map(link => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={e => handleAnchor(e, link.href)}
                className="text-[13.5px] font-medium text-white/65 hover:text-white
                           transition-colors duration-150 no-underline tracking-[-0.01em]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* ── Auth buttons ── */}
        <div className="hidden md:flex items-center gap-2.5">
          <Link
            to="/signin"
            className="px-4 py-2 rounded-lg border border-white/20 hover:border-white/45
                       text-white/80 hover:text-white text-[13.5px] font-medium
                       transition-all duration-150 no-underline"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-lg bg-teal hover:bg-teal-dark
                       text-white text-[13.5px] font-semibold
                       shadow-teal hover:shadow-teal-hover
                       transition-all duration-150 no-underline
                       hover:-translate-y-px"
          >
            Get Started
          </Link>
        </div>

        {/* ── Hamburger ── */}
        <button
          className="md:hidden text-white/80 hover:text-white p-1.5 -mr-1.5 transition-colors"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="md:hidden glass-nav border-t border-white/[0.07] px-6 pb-5 pt-4 flex flex-col gap-3.5">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={e => { handleAnchor(e, link.href); setMenuOpen(false) }}
              className="text-[14px] font-medium text-white/70 hover:text-white no-underline transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2.5 pt-3 border-t border-white/[0.08]">
            <Link to="/signin"   className="text-center py-2.5 rounded-lg border border-white/20 text-white/80 text-sm font-medium no-underline">Sign In</Link>
            <Link to="/register" className="text-center py-2.5 rounded-lg bg-teal text-white text-sm font-semibold no-underline">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
