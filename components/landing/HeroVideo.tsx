'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Button from '../Button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import VideoTransition from '../VideoTransition'

export default function HeroVideo() {
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleGetStarted = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      router.push('/login')
    }, 2000) // Adjust timing based on video duration
  }

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      {/* Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] overflow-hidden"
          >
            <VideoTransition />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/herosection.mp4" type="video/mp4" />
      </video>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-900/70 via-sky-800/50 to-sky-900/70" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
        >
          AI-Powered Smart
          <br />
          Healthcare Monitoring
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="text-lg md:text-xl mb-10 max-w-2xl text-gray-200 leading-relaxed"
        >
          Predict diseases early. Monitor recovery intelligently.
          <br />
          Connect with doctors seamlessly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button variant="solid" onClick={handleGetStarted}>Get Started</Button>
          <Button variant="outline" onClick={() => scrollToSection('#features')}>Learn More</Button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1.5 h-1.5 bg-white rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  )
}
