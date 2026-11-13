import { ArrowRight, ChevronDown, Weight, Warehouse, CheckCircle, Recycle } from 'lucide-react'

const particles = [
  { left: '6%',  size: 5,  dur: 16, delay: 0 },
  { left: '19%', size: 8,  dur: 21, delay: 4 },
  { left: '34%', size: 4,  dur: 13, delay: 8 },
  { left: '52%', size: 7,  dur: 18, delay: 2 },
  { left: '68%', size: 5,  dur: 24, delay: 6 },
  { left: '82%', size: 9,  dur: 15, delay: 10 },
  { left: '12%', size: 3,  dur: 20, delay: 1 },
  { left: '45%', size: 6,  dur: 12, delay: 7 },
  { left: '75%', size: 4,  dur: 17, delay: 3 },
]

const statIcons = [Weight, Warehouse, CheckCircle, Recycle]

const heroStats = [
  { Icon: statIcons[0], value: '—', label: 'Verified Collected' },
  { Icon: statIcons[1], value: '—', label: 'Active Hubs' },
  { Icon: statIcons[2], value: '—', label: 'Cleanups Done' },
  { Icon: statIcons[3], value: '—', label: 'Blue Credits' },
]

const waves = [
  { cls: 'animate-wave-1', opacity: 0.55, fill: 'rgba(10,80,72,0.5)',  path: 'M0,70 C200,130 400,10 600,70 C800,130 1000,10 1200,70 C1400,130 1600,10 1440,70 L1440,220 L0,220Z' },
  { cls: 'animate-wave-2', opacity: 0.35, fill: 'rgba(15,120,100,0.4)',path: 'M0,100 C250,160 500,40 750,100 C1000,160 1250,40 1440,100 L1440,220 L0,220Z' },
  { cls: 'animate-wave-3', opacity: 0.2,  fill: 'rgba(6,55,50,0.55)',  path: 'M0,120 C300,170 600,70 900,120 C1200,170 1440,90 1440,120 L1440,220 L0,220Z' },
]

export default function HeroSection() {
  const scroll = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* ── Background ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 65% 35%, rgba(15,166,142,0.14) 0%, transparent 65%),
            radial-gradient(ellipse 50% 60% at 15% 75%, rgba(15,166,142,0.08) 0%, transparent 55%),
            linear-gradient(170deg, #061824 0%, #0a2638 22%, #0c3a4e 45%, #0a5448 72%, #083d36 100%)
          `,
        }}
      />

      {/* ── Particles ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-teal/25 particle"
            style={{ left: p.left, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}
          />
        ))}
      </div>

      {/* ── Waves ── */}
      <div className="absolute bottom-0 inset-x-0 h-48 pointer-events-none overflow-hidden" aria-hidden="true">
        {waves.map((w, i) => (
          <div
            key={i}
            className={`absolute inset-0 w-[200%] ${w.cls}`}
            style={{ opacity: w.opacity }}
          >
            <svg viewBox="0 0 1440 220" preserveAspectRatio="none" className="w-full h-full">
              <path d={w.path} fill={w.fill} />
            </svg>
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-36
                      grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-14 xl:gap-20 items-center">

        {/* Left column */}
        <div>
          {/* Programme badge */}
          <div className="inline-flex items-center gap-2 mb-7
                          bg-teal/[0.12] border border-teal/30 rounded-full
                          px-3.5 py-1.5 text-[11.5px] font-semibold tracking-[0.07em] uppercase text-teal-light">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-light animate-pulse-dot" aria-hidden="true" />
            NIMASA-BEAP · Track 6
          </div>

          <h1
            id="hero-heading"
            className="font-extrabold text-white leading-[1.06] tracking-[-0.04em] mb-6"
            style={{ fontSize: 'clamp(2.4rem, 5vw, 3.75rem)' }}
          >
            Turn Marine Waste<br />
            Into{' '}
            <span
              className="relative inline-block"
              style={{
                background: 'linear-gradient(135deg, #13C2A8 0%, #7ef0e0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Community Value.
            </span>
          </h1>

          <p className="text-[1.0625rem] text-white/60 leading-[1.8] mb-10 max-w-[520px] font-light">
            WasteFlow connects coastal communities, sellers, weighers, and buyers
            through AI-assisted hotspot mapping, verified collection records, and transparent
            Blue Credits — building a cleaner, circular blue economy.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => scroll('features')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5
                         bg-teal hover:bg-teal-dark text-white
                         text-[14.5px] font-semibold rounded-xl
                         shadow-teal hover:shadow-teal-hover
                         transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              Explore Platform
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => scroll('how-it-works')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5
                         border border-white/20 hover:border-white/40 hover:bg-white/[0.05]
                         text-white/80 hover:text-white
                         text-[14.5px] font-medium rounded-xl
                         transition-all duration-200 cursor-pointer"
            >
              How It Works
              <ChevronDown size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Right column — Stats card */}
        <div
          className="hidden lg:flex flex-col gap-3 glass rounded-3xl p-7"
          role="region"
          aria-label="Platform statistics"
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-light/70 mb-1">
            Platform at a Glance
          </p>
          <div className="grid grid-cols-2 gap-3">
            {heroStats.map(({ Icon, value, label }) => (
              <div
                key={label}
                className="bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.07]
                           rounded-2xl p-4 transition-colors duration-150"
              >
                <div className="w-9 h-9 rounded-xl bg-teal/20 flex items-center justify-center mb-3">
                  <Icon size={17} className="text-teal-light" strokeWidth={1.8} />
                </div>
                <div className="text-[1.5rem] font-extrabold text-white tracking-tight leading-none mb-1">
                  {value}
                </div>
                <div className="text-[11.5px] text-white/50 font-medium leading-tight">{label}</div>
              </div>
            ))}
          </div>
          <p className="text-[10.5px] text-white/30 text-center pt-1 leading-relaxed">
            Live data will appear here once the platform is operational.
          </p>
        </div>
      </div>
    </section>
  )
}
