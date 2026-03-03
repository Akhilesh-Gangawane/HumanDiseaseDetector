'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import CounterAnimation from './CounterAnimation'

export default function AIConfidence() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <div ref={ref} className="relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-sky-500/20 to-sky-600/20 backdrop-blur-lg border border-sky-300/30 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sky-900 font-semibold">AI Confidence</span>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full"
          />
        </div>

        <div className="text-5xl font-bold text-sky-600 mb-2">
          <CounterAnimation value={98} suffix="%" />
        </div>

        <motion.div
          className="w-full h-2 bg-sky-200 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-sky-500 to-sky-600"
            initial={{ width: 0 }}
            animate={isInView ? { width: '98%' } : {}}
            transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
          />
        </motion.div>

        <p className="text-sm text-gray-600 mt-3">
          Prediction accuracy based on 50,000+ analyzed cases
        </p>
      </motion.div>
    </div>
  )
}
