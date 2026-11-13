import { useScrollReveal } from '@/hooks/useScrollReveal'
import { roles } from '@/data/landingData'
import Icon from '@/components/ui/Icon'

function RoleCard({ role, index }: { role: typeof roles[0], index: number }) {
  const { ref, visible } = useScrollReveal()
  return (
    <div
      ref={ref}
      className={`rounded-2xl p-6 text-center
                  bg-white/[0.04] hover:bg-white/[0.07]
                  border border-white/[0.07] hover:border-teal/30
                  hover:-translate-y-1 transition-all duration-200
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div
        className="w-12 h-12 rounded-xl bg-teal/15 flex items-center justify-center mx-auto mb-4"
        aria-hidden="true"
      >
        <Icon name={role.icon} size={22} className="text-teal-light" strokeWidth={1.7} />
      </div>
      <h3 className="text-[14.5px] font-semibold text-white mb-2 tracking-[-0.01em]">{role.name}</h3>
      <p className="text-[13px] text-white/45 leading-[1.6]">{role.desc}</p>
    </div>
  )
}

export default function RolesSection() {
  const { ref: headRef, visible: headVisible } = useScrollReveal()

  return (
    <section
      id="about"
      className="py-24 lg:py-28"
      style={{ background: '#0B2233' }}
      aria-labelledby="roles-heading"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          ref={headRef}
          className={`transition-all duration-600 ${headVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
          <p className="section-pill-light">Who It's Built For</p>
          <h2
            id="roles-heading"
            className="text-[2rem] lg:text-[2.4rem] font-extrabold text-white
                       tracking-[-0.03em] leading-[1.15] mb-4"
          >
            Every Stakeholder Has a Role
          </h2>
          <p className="text-[15.5px] text-white/50 max-w-xl leading-[1.75]">
            Role-based access means everyone sees the tools and data relevant to their work —
            nothing more, nothing less.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 mt-12">
          {roles.map((role, i) => (
            <RoleCard key={role.name} role={role} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
