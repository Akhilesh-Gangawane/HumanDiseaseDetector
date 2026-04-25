'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

interface Stats {
  doctors: number
  patients: number
  labTests: number
  predictions: number
  medicines: number
}

function useCountUp(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start || target === 0) return
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setValue(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return value
}

function StatCard({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const count = useCountUp(value, 1600, isInView)

  const display = value >= 1000
    ? `${(count / 1000).toFixed(count >= 1000 ? 0 : 1)}K+`
    : count > 0 ? `${count}${suffix}` : suffix || '—'

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      whileHover={{ x: 10, scale: 1.05 }}
      className="flex items-center gap-6 backdrop-blur-sm bg-white/40 p-4 rounded-2xl hover:bg-white/60 transition-all duration-300"
    >
      <div className="text-5xl font-bold text-sky-600">{display}</div>
      <div className="text-lg text-gray-700">{label}</div>
    </motion.div>
  )
}

export default function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/public/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  const statItems = stats
    ? [
        { value: stats.doctors, label: 'Certified Doctors', suffix: '+' },
        { value: stats.patients, label: 'Patients Served', suffix: '+' },
        { value: stats.labTests, label: 'Lab Tests Completed', suffix: '+' },
        { value: stats.predictions, label: 'AI Predictions Made', suffix: '+' },
      ]
    : [
        { value: 0, label: 'Certified Doctors', suffix: '' },
        { value: 0, label: 'Patients Served', suffix: '' },
        { value: 0, label: 'Lab Tests Completed', suffix: '' },
        { value: 0, label: 'AI Predictions Made', suffix: '' },
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

          {/* Right: Live Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="group backdrop-blur-xl bg-gradient-to-br from-sky-50/80 to-white/80 p-10 rounded-3xl shadow-2xl border border-sky-200 hover:shadow-3xl hover:scale-105 transition-all duration-500"
          >
            <h3 className="text-2xl font-bold text-sky-900 mb-8 group-hover:text-sky-600 transition-colors duration-300">
              Platform at a Glance
            </h3>
            <div className="space-y-4">
              {statItems.map((stat, i) => (
                <StatCard key={i} value={stat.value} label={stat.label} suffix={stat.suffix} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
