'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function usePageTransition() {
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)

  const transitionToPage = (url: string) => {
    setIsTransitioning(true)
    
    // Wait for animation to complete before navigating
    setTimeout(() => {
      router.push(url)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 500)
    }, 300)
  }

  return { transitionToPage, isTransitioning }
}
