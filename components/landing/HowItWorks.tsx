'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const steps = [
    {
      number: '01',
      title: 'Sign Up & Login',
      description: 'Create your account as a patient or doctor and access your personalized healthcare dashboard.',
      color: 'from-sky-400 to-sky-500',
    },
    {
      number: '02',
      title: 'Choose Service',
      description: 'Select from AI disease prediction, doctor consultation, pathology tests, or buy medicines online.',
      color: 'from-sky-500 to-sky-600',
    },
    {
      number: '03',
      title: 'Get Treatment',
      description: 'Receive AI predictions, consult specialists, book lab tests, or order medicines with home delivery.',
      color: 'from-sky-600 to-sky-700',
    },
    {
      number: '04',
      title: 'Stay Protected',
      description: 'Explore health insurance plans for comprehensive coverage and access medical knowledge resources.',
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
              className="relative group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-sky-300 to-sky-200 -z-10" />
              )}

              <div className="text-center backdrop-blur-lg bg-white/50 p-8 rounded-3xl hover:bg-white/70 hover:shadow-xl transition-all duration-500">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  className={`w-32 h-32 mx-auto mb-6 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-500`}
                >
                  <span className="text-5xl font-bold text-white">{step.number}</span>
                </motion.div>
                <h3 className="text-xl font-bold text-sky-900 mb-3 group-hover:text-sky-600 transition-colors duration-300">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
