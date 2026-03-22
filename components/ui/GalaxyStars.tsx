'use client'

import { useEffect, useRef } from 'react'

interface GalaxyStarsProps {
  speed?: number
  density?: number
  hueShift?: number
  glowIntensity?: number
  saturation?: number
  mouseRepulsion?: boolean
  repulsionStrength?: number
  twinkleIntensity?: number
  rotationSpeed?: number
  transparent?: boolean
  className?: string
}

interface Star {
  x: number
  y: number
  z: number
  size: number
  hue: number
  twinkleOffset: number
  twinkleSpeed: number
  vx: number
  vy: number
}

export default function GalaxyStars({
  speed = 0.5,
  density = 1,
  hueShift = 210,
  glowIntensity = 0.3,
  saturation = 70,
  mouseRepulsion = true,
  repulsionStrength = 2,
  twinkleIntensity = 0.3,
  rotationSpeed = 0.1,
  transparent = true,
  className = '',
}: GalaxyStarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const starsRef = useRef<Star[]>([])
  const rafRef = useRef<number>(0)
  const timeRef = useRef(0)
  const angleRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: transparent })
    if (!ctx) return

    // Size canvas to match its own bounding rect (CSS makes it fill parent)
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const w = rect.width || window.innerWidth
      const h = rect.height || window.innerHeight
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        buildStars(w, h)
      }
    }

    const buildStars = (w: number, h: number) => {
      const count = Math.min(Math.floor((w * h) / 1800 * density), 1200)
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(),
        size: Math.random() * 2 + 0.4,
        hue: hueShift + (Math.random() - 0.5) * 60,
        twinkleOffset: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.5 + Math.random() * 1.5,
        vx: 0,
        vy: 0,
      }))
    }

    // Initial size — defer one frame so CSS layout is done
    requestAnimationFrame(resize)

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Mouse
    let lastMouse = 0
    const onMouse = (e: MouseEvent) => {
      const now = performance.now()
      if (now - lastMouse < 32) return
      lastMouse = now
      const r = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    window.addEventListener('mousemove', onMouse, { passive: true })

    const draw = () => {
      timeRef.current += 0.016
      angleRef.current += rotationSpeed * 0.001

      const W = canvas.width
      const H = canvas.height

      ctx.clearRect(0, 0, W, H)

      if (!transparent) {
        ctx.fillStyle = '#f8fafc'
        ctx.fillRect(0, 0, W, H)
      }

      const cx = W / 2
      const cy = H / 2
      const mouse = mouseRef.current
      const stars = starsRef.current
      const t = timeRef.current

      for (const s of stars) {
        // Slow galaxy rotation
        const dx0 = s.x - cx
        const dy0 = s.y - cy
        const cosA = Math.cos(angleRef.current * (1 - s.z * 0.5))
        const sinA = Math.sin(angleRef.current * (1 - s.z * 0.5))
        const rx = dx0 * cosA - dy0 * sinA + cx
        const ry = dx0 * sinA + dy0 * cosA + cy

        // Z-axis drift (fly-through)
        s.z -= speed * 0.0006
        if (s.z <= 0) {
          s.x = Math.random() * W
          s.y = Math.random() * H
          s.z = 1
        }

        // Mouse repulsion
        if (mouseRepulsion) {
          const mdx = rx - mouse.x
          const mdy = ry - mouse.y
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
          const repRadius = 130
          if (mdist < repRadius && mdist > 0) {
            const force = ((repRadius - mdist) / repRadius) * repulsionStrength * 0.5
            s.vx += (mdx / mdist) * force
            s.vy += (mdy / mdist) * force
          }
        }

        s.vx *= 0.91
        s.vy *= 0.91
        s.x += s.vx
        s.y += s.vy

        // Twinkle
        const twinkle = 1 - twinkleIntensity * 0.5 +
          twinkleIntensity * 0.5 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset)

        // Depth scale
        const depthScale = 0.3 + s.z * 0.7
        const radius = s.size * depthScale * twinkle
        const alpha = (0.5 + s.z * 0.5) * twinkle

        const px = rx + s.vx
        const py = ry + s.vy

        // Glow halo
        if (glowIntensity > 0 && radius > 0.6) {
          const glow = ctx.createRadialGradient(px, py, 0, px, py, radius * 5)
          glow.addColorStop(0, `hsla(${s.hue},${saturation}%,75%,${alpha * glowIntensity})`)
          glow.addColorStop(1, `hsla(${s.hue},${saturation}%,75%,0)`)
          ctx.beginPath()
          ctx.arc(px, py, radius * 5, 0, Math.PI * 2)
          ctx.fillStyle = glow
          ctx.fill()
        }

        // Star core
        ctx.beginPath()
        ctx.arc(px, py, Math.max(radius, 0.4), 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${s.hue},${saturation}%,85%,${alpha})`
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      ro.disconnect()
      window.removeEventListener('mousemove', onMouse)
      cancelAnimationFrame(rafRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  )
}
