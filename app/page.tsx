import Navbar from '@/components/landing/Navbar'
import HeroVideo from '@/components/landing/HeroVideo'
import FeaturesSection from '@/components/landing/FeaturesSection'
import HowItWorks from '@/components/landing/HowItWorks'
import HealthScroll from '@/components/landing/HealthScroll'
import AboutSection from '@/components/landing/AboutSection'
import ContactSection from '@/components/landing/ContactSection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'
import ScrollProgress from '@/components/ui/ScrollProgress'
import AnimatedBackground from '@/components/ui/AnimatedBackground'

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main className="relative">
        {/* neural‑network style animated canvas background (blue/white) */}
        <AnimatedBackground fullScreen={false} />

        <HeroVideo />
        <FeaturesSection />
        <HowItWorks />
        <HealthScroll />
        <AboutSection />
        <ContactSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
