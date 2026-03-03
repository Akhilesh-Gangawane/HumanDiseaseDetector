'use client'

import { useRef, useEffect, useState } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import { useImagePreloader } from '@/hooks/useImagePreloader'

const FRAME_COUNT = 145
const BASE_PATH = '/path-scroll'

interface PathologyScrollProps {
  onScrollComplete?: () => void;
}

export default function PathologyScroll({ onScrollComplete }: PathologyScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 })
  
  const { images, isLoading, progress } = useImagePreloader(FRAME_COUNT, BASE_PATH)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1])

  // Text opacity for "Scroll" indicator
  const scrollTextOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])

  // Force scroll to top on mount - multiple methods for reliability
  useEffect(() => {
    // Method 1: Immediate scroll
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Method 2: After a tiny delay
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);
    
    // Method 3: Disable scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  // Monitor scroll progress to show button at end
  const showButton = useTransform(scrollYProgress, [0.95, 1], [0, 1]);

  // White fade overlay at the end
  const whiteFadeOpacity = useTransform(scrollYProgress, [0.9, 1], [0, 1]);

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
        ctx.clearRect(0, 0, canvas.width, canvas.height)

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
      <div className="h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-blue-900">Loading Pathology Lab...</p>
          <p className="text-sm text-gray-600 mt-2">{progress}%</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative h-[600vh]">
      {/* Sticky Canvas Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="w-full h-full object-cover"
        />

        {/* Scroll Text Indicator */}
        <motion.div 
          style={{ opacity: scrollTextOpacity }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center pointer-events-none z-20"
        >
          <p className="text-white text-sm font-medium mb-2 drop-shadow-lg">Scroll</p>
          <div className="w-6 h-10 border-2 border-white rounded-full mx-auto flex items-start justify-center p-2">
            <motion.div 
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* White Fade Overlay */}
        <motion.div 
          style={{ opacity: whiteFadeOpacity }}
          className="absolute inset-0 bg-white z-30"
        />

        {/* Dashboard Button */}
        <motion.div 
          style={{ opacity: showButton }}
          className="absolute inset-0 flex items-center justify-center z-40"
        >
          <button
            type="button"
            onClick={onScrollComplete}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white text-lg font-semibold rounded-xl shadow-2xl hover:scale-105 transition-transform duration-300"
          >
            Enter Pathology Lab Dashboard
          </button>
        </motion.div>

        {/* Overlay Text */}
        <PathologyOverlayText scrollProgress={scrollYProgress} />
      </div>
    </div>
  )
}

function PathologyOverlayText({ scrollProgress }: { scrollProgress: any }) {
  const textSegments = [
    {
      range: [0.15, 0.25],
      text: 'Advanced Pathology Lab',
      subtext: 'State-of-the-art diagnostic facilities',
    },
    {
      range: [0.45, 0.55],
      text: 'Accurate Test Results',
      subtext: 'Fast and reliable lab reports',
    },
    {
      range: [0.75, 0.85],
      text: 'Book Your Tests',
      subtext: 'Easy online booking and tracking',
    },
  ]

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      {textSegments.map((segment, index) => {
        const opacity = useTransform(
          scrollProgress,
          [segment.range[0] - 0.05, segment.range[0], segment.range[1], segment.range[1] + 0.05],
          [0, 1, 1, 0]
        )

        const y = useTransform(
          scrollProgress,
          [segment.range[0] - 0.05, segment.range[0], segment.range[1], segment.range[1] + 0.05],
          [30, 0, 0, -30]
        )

        return (
          <motion.div
            key={index}
            style={{ opacity, y }}
            className="absolute text-center px-6"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
              {segment.text}
            </h2>
            <p className="text-lg md:text-xl text-gray-200 drop-shadow-lg">
              {segment.subtext}
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}
