'use client'

import { ReactNode } from 'react'
import NeuralNetworkBackground from './NeuralNetworkBackground'

interface NeuralNetworkContainerProps {
  children: ReactNode
  className?: string
}

export default function NeuralNetworkContainer({ 
  children, 
  className = '' 
}: NeuralNetworkContainerProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Neural Network Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <NeuralNetworkBackground />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
