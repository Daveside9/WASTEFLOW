import { useScrollReveal } from '@/hooks/useScrollReveal'
import { impactStats } from '@/data/landingData'
import Icon from '@/components/ui/Icon'

export default function ImpactBar() {
  const { ref, visible } = useScrollReveal()

  return (
    <div
      id="impact"
      className="border-y border-white/[0.06]"
      style={{ background: '#0B2233' }}
      role="region"
      aria-label="Platform impact metrics"
    >
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-6 lg:px-8 py-12
                    grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4
                    transition-all duration-700
                    ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
      >
        {impactStats.map((stat, i) => (
          <div
            key={stat.label}
            className="flex flex-col items-center text-center px-4 transition-all duration-500"
            style={{ transitionDelay: `${i * 90}ms` }}
          >
            <div className="w-11 h-11 rounded-2xl bg-teal/15 flex items-center justify-center mb-3.5">
              <Icon name={stat.icon} size={20} className="text-teal-light" strokeWidth={1.8} />
            </div>
            <div className="text-[2rem] font-extrabold text-white tracking-tight leading-none mb-1.5">
              {stat.value}
            </div>
            <div className="text-[13px] text-white/50 font-medium leading-snug">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
