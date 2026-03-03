'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const stats = [
    { value: '81%', label: 'Accuracy' },
    { value: '24/7', label: 'Monitoring' },
    { value: '100%', label: 'Secure & Private' },
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
              The Future of
              <br />
              Healthcare is Here
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Dhanvantari AI combines cutting-edge artificial intelligence with medical expertise
              to provide real-time health monitoring and early disease detection.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our platform analyzes your health data continuously, alerting you and your healthcare
              providers to potential issues before they become serious.
            </p>
          </motion.div>

          {/* Right: Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="bg-gradient-to-br from-sky-50 to-white p-10 rounded-3xl shadow-2xl border border-sky-200"
          >
            <h3 className="text-2xl font-bold text-sky-900 mb-8">Why Choose Us</h3>
            <div className="space-y-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-6"
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
