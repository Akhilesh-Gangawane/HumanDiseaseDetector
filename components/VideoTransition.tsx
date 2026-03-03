'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function VideoTransition() {
  const [videoError, setVideoError] = useState(false)

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 flex items-center justify-center overflow-hidden">
      {!videoError ? (
        <video
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          onError={() => {
            setVideoError(true)
          }}
        >
          <source src="/loadanimation.mp4" type="video/mp4" />
        </video>
      ) : (
        // Fallback animation if video doesn't exist
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-20 h-20 mx-auto mb-6 border-4 border-white border-t-transparent rounded-full"
          />
          <motion.h2
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-3xl font-bold text-white"
          >
            Loading...
          </motion.h2>
        </motion.div>
      )}
    </div>
  )
}
