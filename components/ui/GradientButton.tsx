'use client'

import { motion } from 'framer-motion'
import { ButtonProps } from '@/lib/types'

export default function GradientButton({ 
  children, 
  variant = 'solid', 
  onClick, 
  disabled = false,
  className = '' 
}: ButtonProps) {
  const baseClasses = 'px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 relative overflow-hidden'
  
  const variantClasses = {
    solid: 'bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 shadow-lg hover:shadow-2xl',
    outline: 'border-2 border-white text-white hover:bg-white hover:text-sky-600 backdrop-blur-sm',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
