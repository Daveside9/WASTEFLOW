import { useScrollReveal } from '@/hooks/useScrollReveal'
import { circularItems } from '@/data/landingData'
import Icon from '@/components/ui/Icon'

function CircularCard({ item, index }: { item: typeof circularItems[0], index: number }) {
  const { ref, visible } = useScrollReveal()
  return (
    <div
      ref={ref}
      className={`border border-white/[0.08] rounded-2xl p-7 text-center
                  bg-white/[0.04] hover:bg-white/[0.08]
                  hover:-translate-y-1 transition-all duration-200 relative z-10
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="w-12 h-12 rounded-xl bg-teal/20 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
        <Icon name={item.icon} size={22} className="text-teal-light" strokeWidth={1.7} />
      </div>
      <h3 className="text-[15px] font-semibold text-white mb-2 tracking-[-0.01em]">{item.title}</h3>
      <p className="text-[13px] text-white/45 leading-relaxed">{item.desc}</p>
    </div>
  )
}

export default function CircularSection() {
  const { ref: headRef, visible: headVisible } = useScrollReveal()

  return (
    <section
      id="circular"
      className="py-24 lg:py-28 relative overflow-hidden"
      style={{ background: '#071C2C' }}
      aria-labelledby="circular-heading"
    >
      {/* Subtle radial accent */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(15,166,142,0.07) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          ref={headRef}
          className={`transition-all duration-600 ${headVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
          <p className="section-pill-light">Blue Circular Economy</p>
          <h2
            id="circular-heading"
            className="text-[2rem] lg:text-[2.4rem] font-extrabold text-white
                       tracking-[-0.03em] leading-[1.15] mb-4"
          >
            Waste as a Resource,<br className="hidden sm:block" /> Not Just a Problem
          </h2>
          <p className="text-[15.5px] text-white/50 max-w-xl leading-[1.75]">
            WasteFlow treats marine waste as the starting point of a circular loop —
            from recovery to productive reuse, traceable every step of the way.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
          {circularItems.map((item, i) => (
            <CircularCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
