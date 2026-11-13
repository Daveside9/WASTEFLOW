import Navbar          from '@/components/layout/Navbar'
import Footer          from '@/components/layout/Footer'
import HeroSection     from '@/components/sections/HeroSection'
import ImpactBar       from '@/components/sections/ImpactBar'
import JourneySection  from '@/components/sections/JourneySection'
import FeaturesSection from '@/components/sections/FeaturesSection'
import CircularSection from '@/components/sections/CircularSection'
import RolesSection    from '@/components/sections/RolesSection'
import AuthCTASection  from '@/components/sections/AuthCTASection'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ImpactBar />
        <JourneySection />
        <FeaturesSection />
        <CircularSection />
        <RolesSection />
        <AuthCTASection />
      </main>
      <Footer />
    </>
  )
}
