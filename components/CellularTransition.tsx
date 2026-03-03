'use client'

import { motion } from 'framer-motion'

export default function CellularTransition() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 flex items-center justify-center">
      {/* Simple Loading Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.h2
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-3xl font-bold text-white"
        >
          Loading...
        </motion.h2>
      </motion.div>
    </div>
  )
}
