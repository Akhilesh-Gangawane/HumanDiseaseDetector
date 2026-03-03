'use client'

import { motion } from 'framer-motion'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'solid' | 'outline'
  onClick?: () => void
}

export default function Button({ children, variant = 'solid', onClick }: ButtonProps) {
  const baseClasses = 'px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300'
  
  const variantClasses = {
    solid: 'bg-sky-500 text-white hover:bg-sky-600 hover:shadow-xl hover:scale-105',
    outline: 'border-2 border-white text-white hover:bg-white hover:text-sky-600 hover:scale-105',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
    >
      {children}
    </motion.button>
  )
}
