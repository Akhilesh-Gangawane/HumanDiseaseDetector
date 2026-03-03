'use client'

import { useEffect, useRef } from 'react'

type AnimatedBackgroundProps = {
  /**
   * When true the background is fixed to the viewport.
   * Set to false to confine the animation inside a relative parent div.
   */
  fullScreen?: boolean
}

export default function AnimatedBackground({ fullScreen = true }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()
    window.addEventListener('resize', setCanvasSize)

    // Particle system for floating elements
    let mouseX = canvas.width / 2
    let mouseY = canvas.height / 2

    // update mouse coordinates relative to canvas
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }

    canvas.addEventListener('mousemove', onMouseMove)

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      color: string

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.3
        this.speedY = (Math.random() - 0.5) * 0.3
        this.opacity = Math.random() * 0.3 + 0.1
        
        const colors = ['#0ea5a4', '#2563eb', '#06b6d4']
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        // subtle attraction/repulsion toward mouse
        const dxm = mouseX - this.x
        const dym = mouseY - this.y
        const distm = Math.sqrt(dxm * dxm + dym * dym)
        if (distm < 150) {
          // move a tiny amount toward the cursor
          this.x += dxm * 0.001
          this.y += dym * 0.001
        }

        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.globalAlpha = this.opacity
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    // Create particles
    const particles: Particle[] = []
    const particleCount = 50
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Animation loop
    let animationFrameId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw particles
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      // Draw connections between nearby particles
      particles.forEach((particleA, indexA) => {
        particles.slice(indexA + 1).forEach(particleB => {
          const dx = particleA.x - particleB.x
          const dy = particleA.y - particleB.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.beginPath()
            ctx.strokeStyle = '#0ea5a4'
            ctx.globalAlpha = (1 - distance / 150) * 0.1
            ctx.lineWidth = 0.5
            ctx.moveTo(particleA.x, particleA.y)
            ctx.lineTo(particleB.x, particleB.y)
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        })
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', setCanvasSize)
      canvas.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // choose wrapper class based on prop
  const wrapperClass = fullScreen
    ? 'fixed inset-0 -z-10 overflow-hidden'
    : 'absolute inset-0 -z-10 overflow-hidden'

  return (
    <div className={wrapperClass}>
      {/* Animated Gradient Mesh Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/50" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0">
        {/* Teal Blob */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-3xl animate-blob"
          style={{
            background: 'radial-gradient(circle, #0ea5a4 0%, transparent 70%)',
            top: '10%',
            left: '10%',
            animationDelay: '0s'
          }}
        />
        
        {/* Blue Blob */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl animate-blob"
          style={{
            background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)',
            top: '40%',
            right: '10%',
            animationDelay: '2s'
          }}
        />
        
        {/* Cyan Blob */}
        <div 
          className="absolute w-[450px] h-[450px] rounded-full opacity-20 blur-3xl animate-blob"
          style={{
            background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
            bottom: '10%',
            left: '30%',
            animationDelay: '4s'
          }}
        />
      </div>

      {/* Neural Network Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-40"
      />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(#0ea5a4 1px, transparent 1px),
            linear-gradient(90deg, #0ea5a4 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Radial Gradient Overlay for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(255,255,255,0.3) 100%)'
        }}
      />
    </div>
  )
}
