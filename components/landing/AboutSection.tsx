'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const stats = [
    { value: '500+', label: 'Certified Doctors' },
    { value: '200+', label: 'Lab Tests Available' },
    { value: '10K+', label: 'Medicines in Stock' },
    { value: '24/7', label: 'Support Available' },
  ]

  return (
    <section id="about" ref={ref} className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left: Description */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-sky-900 mb-6">
              Complete Healthcare
              <br />
              Platform for Everyone
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Dhanvantari AI is your all-in-one healthcare solution combining AI-powered disease prediction,
              online doctor consultations, pathology services, and an online pharmacy.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              From preventive care to treatment and medication delivery, we provide comprehensive
              healthcare services with the convenience of digital access and the assurance of quality care.
            </p>
          </motion.div>

          {/* Right: Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="group backdrop-blur-xl bg-gradient-to-br from-sky-50/80 to-white/80 p-10 rounded-3xl shadow-2xl border border-sky-200 hover:shadow-3xl hover:scale-105 transition-all duration-500"
          >
            <h3 className="text-2xl font-bold text-sky-900 mb-8 group-hover:text-sky-600 transition-colors duration-300">Why Choose Us</h3>
            <div className="space-y-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  whileHover={{ x: 10, scale: 1.05 }}
                  className="flex items-center gap-6 backdrop-blur-sm bg-white/40 p-4 rounded-2xl hover:bg-white/60 transition-all duration-300"
                >
                  <div className="text-5xl font-bold text-sky-600">{stat.value}</div>
                  <div className="text-lg text-gray-700">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
