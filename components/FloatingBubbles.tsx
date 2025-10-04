'use client'

import { useEffect, useRef } from 'react'

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 59, g: 130, b: 246 } // Default blue
}

interface Bubble {
  id: number
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  blur: number
  color: string
}

export default function FloatingBubbles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bubblesRef = useRef<Bubble[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create bubbles
    const createBubbles = () => {
      bubblesRef.current = []
      const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'] // Red, Blue, Green, Yellow
      for (let i = 0; i < 15; i++) {
        bubblesRef.current.push({
          id: i,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 80 + 20,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.3 + 0.1,
          blur: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)]
        })
      }
    }
    createBubbles()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      bubblesRef.current.forEach(bubble => {
        // Update position
        bubble.x += bubble.speedX
        bubble.y += bubble.speedY

        // Wrap around edges
        if (bubble.x < -bubble.size) bubble.x = canvas.width + bubble.size
        if (bubble.x > canvas.width + bubble.size) bubble.x = -bubble.size
        if (bubble.y < -bubble.size) bubble.y = canvas.height + bubble.size
        if (bubble.y > canvas.height + bubble.size) bubble.y = -bubble.size

        // Draw bubble with gradient
        const gradient = ctx.createRadialGradient(
          bubble.x - bubble.size * 0.3,
          bubble.y - bubble.size * 0.3,
          0,
          bubble.x,
          bubble.y,
          bubble.size
        )
        
        const color = bubble.color
        const rgb = hexToRgb(color)
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bubble.opacity})`) // Colored center
        gradient.addColorStop(0.7, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bubble.opacity * 0.6})`) // Colored middle
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`) // Transparent edge

        ctx.filter = `blur(${bubble.blur}px)`
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.filter = 'none'
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}
