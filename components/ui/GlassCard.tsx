'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function GlassCard({ children, className = '', hover = true }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -10, scale: 1.02 } : {}}
      transition={{ duration: 0.3 }}
      className={`
        backdrop-blur-lg bg-white/10 
        border border-white/20 
        rounded-2xl shadow-xl 
        hover:shadow-2xl 
        transition-all duration-300
        ${className}
      `}
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {children}
    </motion.div>
  )
}
