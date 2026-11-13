import { useScrollReveal } from '@/hooks/useScrollReveal'
import { journeySteps } from '@/data/landingData'
import Icon from '@/components/ui/Icon'

function StepCard({ step, index }: { step: typeof journeySteps[0], index: number }) {
  const { ref, visible } = useScrollReveal<HTMLLIElement>()

  return (
    <li
      ref={ref}
      className={`relative flex flex-col items-center text-center group
                  transition-all duration-500
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      <div className="relative mb-5">
        <div
          className="w-[68px] h-[68px] rounded-2xl
                     bg-white/[0.05] hover:bg-white/[0.09]
                     border border-white/[0.08]
                     flex items-center justify-center
                     group-hover:-translate-y-1
                     transition-all duration-200"
        >
          <Icon name={step.icon} size={26} className="text-teal-light" strokeWidth={1.7} />
        </div>
        <span
          aria-hidden="true"
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full
                     bg-teal text-white text-[10px] font-bold
                     flex items-center justify-center shadow-sm"
        >
          {step.num}
        </span>
      </div>

      <h3 className="text-[14px] font-bold text-white mb-1.5 tracking-[-0.01em]">
        {step.title}
      </h3>
      <p className="text-[12.5px] text-white/45 leading-[1.6] px-1">{step.desc}</p>
    </li>
  )
}

export default function JourneySection() {
  const { ref, visible } = useScrollReveal()

  return (
    <section
      id="how-it-works"
      className="py-24 lg:py-28"
      style={{ background: '#071C2C' }}
      aria-labelledby="journey-heading"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div
          ref={ref}
          className={`max-w-2xl transition-all duration-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
          <p className="section-pill-light">The Workflow</p>
          <h2
            id="journey-heading"
            className="text-[2rem] lg:text-[2.4rem] font-extrabold text-white
                       tracking-[-0.03em] leading-[1.15] mb-4"
          >
            From Listing to Reuse —<br className="hidden sm:block" /> Every Step Verified
          </h2>
          <p className="text-[15.5px] text-white/50 leading-[1.75] max-w-xl">
            A clear 7-stage journey ensures that every kilogram collected is traceable,
            every reward is earned, and every material finds its best use.
          </p>
        </div>

        <div className="relative mt-14">
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-[33px] left-[4.5%] right-[4.5%] h-px
                       bg-gradient-to-r from-transparent via-white/10 to-transparent"
          />
          <ol className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-x-4 gap-y-10 list-none m-0 p-0">
            {journeySteps.map((step, i) => (
              <StepCard key={step.title} step={step} index={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
