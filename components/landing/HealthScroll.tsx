'use client'

import { useRef, useEffect, useState } from 'react'
import { useScroll, useTransform } from 'framer-motion'
import { useImagePreloader } from '@/hooks/useImagePreloader'
import ScrollOverlayText from '../ScrollOverlayText'

const FRAME_COUNT = 128
const BASE_PATH = '/scroll-sequence'

export default function HealthScroll() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 })
  
  const { images, isLoading, progress } = useImagePreloader(FRAME_COUNT, BASE_PATH)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1])

  // Handle canvas resize
  useEffect(() => {
    const updateCanvasSize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  // Render canvas frames
  useEffect(() => {
    if (!canvasRef.current || images.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const render = () => {
      const index = Math.min(Math.floor(frameIndex.get()), images.length - 1)
      const img = images[index]

      if (img) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Calculate aspect ratio fit
        const canvasAspect = canvas.width / canvas.height
        const imgAspect = img.width / img.height

        let drawWidth, drawHeight, offsetX, offsetY

        if (canvasAspect > imgAspect) {
          drawWidth = canvas.width
          drawHeight = canvas.width / imgAspect
          offsetX = 0
          offsetY = (canvas.height - drawHeight) / 2
        } else {
          drawHeight = canvas.height
          drawWidth = canvas.height * imgAspect
          offsetX = (canvas.width - drawWidth) / 2
          offsetY = 0
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
      }
    }

    const unsubscribe = frameIndex.on('change', render)
    render()

    return () => unsubscribe()
  }, [images, frameIndex])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-sky-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-sky-900">Loading Experience...</p>
          <p className="text-sm text-gray-600 mt-2">{progress}%</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative h-[400vh]">
      {/* Sticky Canvas Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="w-full h-full object-cover"
        />

        {/* Overlay Text */}
        <ScrollOverlayText scrollProgress={scrollYProgress} />
      </div>
    </div>
  )
}
