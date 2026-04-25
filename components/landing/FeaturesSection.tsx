'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import {
  NeuralNetworkBg,
  EKGWaveBg,
  NetworkMapBg,
  LockSecurityBg,
  AnalyticsChartBg,
  MobileAppBg
} from '@/components/ui/FeatureBackgrounds'

export default function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [stats, setStats] = useState({ doctors: 0, medicines: 0, labTests: 0 })

  useEffect(() => {
    fetch('/api/public/stats')
      .then(r => r.json())
      .then(d => setStats({
        doctors: d.doctors ?? 0,
        medicines: d.medicines ?? 0,
        labTests: d.labTests ?? 0,
      }))
      .catch(() => {})
  }, [])

  const fmt = (n: number, fallback: string) =>
    n > 0 ? (n >= 1000 ? `${Math.floor(n / 1000)}K+` : `${n}+`) : fallback

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'AI Disease Prediction',
      description: 'Advanced machine learning algorithms analyze your symptoms to predict potential diseases with high accuracy across 669 disease classes.',
      background: <NeuralNetworkBg />,
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: 'Consult Doctors',
      description: `Connect with ${fmt(stats.doctors, 'certified')} specialists through video, chat, or in-person appointments 24/7.`,
      background: <NetworkMapBg />,
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      title: 'Pathology Tests',
      description: `Book lab tests online with free home sample collection. ${fmt(stats.labTests, 'Multiple')} tests completed on our platform.`,
      background: <EKGWaveBg />,
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      title: 'Online Pharmacy',
      description: `${fmt(stats.medicines, 'Genuine')} medicines with same-day delivery, cashless payment, and verified products.`,
      background: <MobileAppBg />,
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Knowledge Center',
      description: 'Access curated medical articles, research papers, and health guides from trusted sources worldwide.',
      background: <AnalyticsChartBg />,
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Health Insurance',
      description: 'Comprehensive health insurance plans with 100% coverage, cashless claims, and family protection.',
      background: <LockSecurityBg />,
    },
  ]

  return (
    <section id="features" ref={ref} className="py-24 px-6 bg-gradient-to-b from-white to-sky-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-sky-900 mb-4">
            Comprehensive Healthcare Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need for complete healthcare management in one platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="group relative backdrop-blur-xl bg-white/60 p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:bg-white/80 transition-all duration-500 border border-sky-100 overflow-hidden"
            >
              {feature.background}
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-sky-900 mb-3 group-hover:text-sky-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
