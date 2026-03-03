'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const steps = [
    {
      number: '01',
      title: 'Sign Up & Connect',
      description: 'Create your account and connect your health monitoring devices or manually input your health data.',
      color: 'from-sky-400 to-sky-500',
    },
    {
      number: '02',
      title: 'AI Analysis',
      description: 'Our advanced AI algorithms analyze your health patterns, vitals, and historical data in real-time.',
      color: 'from-sky-500 to-sky-600',
    },
    {
      number: '03',
      title: 'Get Insights',
      description: 'Receive personalized health insights, early disease predictions, and actionable recommendations.',
      color: 'from-sky-600 to-sky-700',
    },
    {
      number: '04',
      title: 'Connect with Doctors',
      description: 'Seamlessly connect with healthcare professionals for consultations and treatment plans.',
      color: 'from-sky-700 to-sky-800',
    },
  ]

  return (
    <section ref={ref} className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-sky-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get started with Dhanvantari AI in four simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-sky-300 to-sky-200 -z-10" />
              )}

              <div className="text-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-32 h-32 mx-auto mb-6 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-xl`}
                >
                  <span className="text-5xl font-bold text-white">{step.number}</span>
                </motion.div>
                <h3 className="text-xl font-bold text-sky-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
