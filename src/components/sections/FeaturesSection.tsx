import { useScrollReveal } from '@/hooks/useScrollReveal'
import { features } from '@/data/landingData'
import Icon from '@/components/ui/Icon'

function FeatureCard({ feature, index }: { feature: typeof features[0], index: number }) {
  const { ref, visible } = useScrollReveal()
  return (
    <div
      ref={ref}
      className={`rounded-2xl p-7 border border-white/[0.07]
                  bg-white/[0.04] hover:bg-white/[0.07]
                  hover:-translate-y-1
                  hover:border-teal/30
                  transition-all duration-200
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div
        className="w-[48px] h-[48px] rounded-xl bg-teal/15 flex items-center justify-center mb-5"
        aria-hidden="true"
      >
        <Icon name={feature.icon} size={22} className="text-teal-light" strokeWidth={1.7} />
      </div>
      <h3 className="text-[16px] font-semibold text-white mb-2.5 tracking-[-0.01em]">
        {feature.title}
      </h3>
      <p className="text-[13.5px] text-white/45 leading-[1.7]">{feature.desc}</p>
    </div>
  )
}

export default function FeaturesSection() {
  const { ref: headRef, visible: headVisible } = useScrollReveal()

  return (
    <section
      id="features"
      className="py-24 lg:py-28"
      style={{ background: '#0B2233' }}
      aria-labelledby="features-heading"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          ref={headRef}
          className={`transition-all duration-600 ${headVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
          <p className="section-pill-light">Platform Capabilities</p>
          <h2
            id="features-heading"
            className="text-[2rem] lg:text-[2.4rem] font-extrabold text-white
                       tracking-[-0.03em] leading-[1.15] mb-4"
          >
            Everything You Need to Coordinate<br className="hidden sm:block" /> Marine Waste Cleanup
          </h2>
          <p className="text-[15.5px] text-white/50 max-w-xl leading-[1.75]">
            Built for coastal communities, sellers, weighers, and buyers —
            with role-based access so everyone sees what's relevant to their work.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
