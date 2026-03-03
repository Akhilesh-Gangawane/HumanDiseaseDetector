'use client'

import { motion } from 'framer-motion'

export default function ECGLine() {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2, ease: 'easeInOut' },
        opacity: { duration: 0.5 },
      },
    },
  }

  return (
    <svg
      width="200"
      height="60"
      viewBox="0 0 200 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
    >
      <motion.path
        d="M0 30 L40 30 L45 20 L50 40 L55 10 L60 30 L200 30"
        stroke="url(#gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={pathVariants}
        initial="hidden"
        animate="visible"
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>
      
      {/* Animated dot */}
      <motion.circle
        cx="0"
        cy="30"
        r="3"
        fill="#0EA5E9"
        animate={{
          cx: [0, 200],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </svg>
  )
}
