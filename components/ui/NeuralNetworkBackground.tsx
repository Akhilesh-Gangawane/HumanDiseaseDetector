'use client'

import { useEffect, useRef } from 'react'
import GalaxyStars from './GalaxyStars'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  originalX: number
  originalY: number
}

export default function NeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // Use the grandparent (the overflow-hidden div in NeuralNetworkContainer)
    const container = canvas.parentElement
    if (!container) return

    const setCanvasSize = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width || window.innerWidth
      canvas.height = rect.height || window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      particlesRef.current = []
      const particleCount = Math.min(60, Math.floor((canvas.width * canvas.height) / 20000))
      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        particlesRef.current.push({
          x, y,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.5 + 0.5,
          originalX: x,
          originalY: y,
        })
      }
    }

    setCanvasSize()

    const resizeObserver = new ResizeObserver(setCanvasSize)
    resizeObserver.observe(container)

    let lastMouseUpdate = 0
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now()
      if (now - lastMouseUpdate < 32) return
      lastMouseUpdate = now
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const particles = particlesRef.current
      const mouse = mouseRef.current

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const distSq = dx * dx + dy * dy
        const maxDist = 100

        if (distSq < maxDist * maxDist) {
          const dist = Math.sqrt(distSq)
          const force = (maxDist - dist) / maxDist
          const angle = Math.atan2(dy, dx)
          p.vx -= Math.cos(angle) * force * 0.15
          p.vy -= Math.sin(angle) * force * 0.15
        }

        p.vx += (p.originalX - p.x) * 0.008
        p.vy += (p.originalY - p.y) * 0.008
        p.vx *= 0.94
        p.vy *= 0.94
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) { p.vx *= -1; p.x = Math.max(0, Math.min(canvas.width, p.x)) }
        if (p.y < 0 || p.y > canvas.height) { p.vy *= -1; p.y = Math.max(0, Math.min(canvas.height, p.y)) }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(14,165,233,0.5)'
        ctx.fill()

        const limit = Math.min(i + 10, particles.length)
        for (let j = i + 1; j < limit; j++) {
          const o = particles[j]
          const cx = p.x - o.x
          const cy = p.y - o.y
          const dist = Math.sqrt(cx * cx + cy * cy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(14,165,233,${(1 - dist / 120) * 0.2})`
            ctx.lineWidth = 0.5
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(o.x, o.y)
            ctx.stroke()
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    /* This wrapper fills the parent absolutely — both canvases size off it */
    <div className="absolute inset-0 w-full h-full">
      {/* Layer 1 — Galaxy stars */}
      <GalaxyStars
        speed={0.5}
        density={2.5}
        hueShift={200}
        glowIntensity={0.35}
        saturation={70}
        mouseRepulsion
        repulsionStrength={2}
        twinkleIntensity={0.4}
        rotationSpeed={0.08}
        transparent
      />
      {/* Layer 2 — Neural network nodes */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
