'use client'

import { ReactNode } from 'react'
import NeuralNetworkBackground from './NeuralNetworkBackground'

interface NeuralNetworkContainerProps {
  children: ReactNode
  className?: string
}

export default function NeuralNetworkContainer({
  children,
  className = '',
}: NeuralNetworkContainerProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Background — position:absolute, inset-0 fills the relative parent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <NeuralNetworkBackground />
      </div>

      {/* Page content sits above the background */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
