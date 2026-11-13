import { Link } from 'react-router-dom'
import { ArrowLeft, Waves } from 'lucide-react'

interface Props {
  children: React.ReactNode
  backTo?: string
  backLabel?: string
}

// Shared dark background + logo used by all auth pages
export default function AuthLayout({ children, backTo = '/', backLabel = 'Back to home' }: Props) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: `
          radial-gradient(ellipse 70% 50% at 80% 20%, rgba(15,166,142,0.10) 0%, transparent 60%),
          radial-gradient(ellipse 50% 60% at 10% 80%, rgba(15,166,142,0.06) 0%, transparent 55%),
          linear-gradient(170deg, #040F18 0%, #071C2C 50%, #082436 100%)
        `,
      }}
    >
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 lg:px-10 h-16 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2 no-underline" aria-label="WasteFlow home">
          <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center
                          shadow-[0_2px_8px_rgba(15,166,142,0.45)]">
            <Waves size={16} className="text-white" strokeWidth={2.2} />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-white">
            Waste<span className="text-teal-light">Flow</span>
          </span>
        </Link>

        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium
                     text-white/40 hover:text-white/80 no-underline transition-colors"
        >
          <ArrowLeft size={14} />
          {backLabel}
        </Link>
      </header>

      {/* Page content */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        {children}
      </main>
    </div>
  )
}
