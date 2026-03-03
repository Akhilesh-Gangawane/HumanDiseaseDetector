'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import VideoTransition from '../VideoTransition'

export default function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleStartTrial = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      router.push('/login')
    }, 2000) // Adjust timing based on video duration
  }

  return (
    <section ref={ref} className="py-24 px-6 bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 relative overflow-hidden">
      {/* Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          >
            <VideoTransition />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Healthcare?
          </h2>
          <p className="text-xl text-sky-100 mb-10 leading-relaxed">
            Join thousands of users who trust Dhanvantari AI for their health monitoring and disease prediction needs.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartTrial}
              disabled={isTransitioning}
              className="px-10 py-4 bg-white text-sky-600 font-bold text-lg rounded-full hover:shadow-2xl transition-all cursor-pointer disabled:opacity-50"
            >
              Start Free Trial
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection('#contact')}
              className="px-10 py-4 border-2 border-white text-white font-bold text-lg rounded-full hover:bg-white hover:text-sky-600 transition-all cursor-pointer"
            >
              Schedule Demo
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 flex items-center justify-center gap-8 text-white"
          >
            <div className="text-center">
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-sky-100">Active Users</div>
            </div>
            <div className="w-px h-12 bg-sky-400" />
            <div className="text-center">
              <div className="text-3xl font-bold">98%</div>
              <div className="text-sky-100">Accuracy Rate</div>
            </div>
            <div className="w-px h-12 bg-sky-400" />
            <div className="text-center">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sky-100">Support</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
