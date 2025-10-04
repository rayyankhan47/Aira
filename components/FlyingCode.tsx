'use client'

import { useEffect, useRef } from 'react'

interface CodeParticle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  text: string
  color: string
  size: number
  opacity: number
}

export default function FlyingCode() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<CodeParticle[]>([])

  const codeSnippets = [
    'const agent = new AIAgent()',
    'agent.execute()',
    'workflow.run()',
    'task.generate()',
    'if (success) {',
    '  notify.team()',
    '}',
    'async function planSprint() {',
    'return await ai.generateTasks()',
    '}',
    'workflow.connect()',
    'agent.learn()',
    'project.optimize()'
  ]

  const colors = [
    '#3B82F6', // blue
    '#10B981', // green  
    '#F59E0B', // yellow
    '#EF4444', // red
    '#8B5CF6', // purple
    '#06B6D4', // cyan
    '#F97316', // orange
    '#84CC16', // lime
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < 15; i++) {
        particlesRef.current.push({
          id: i,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 4 + 10,
          opacity: Math.random() * 0.6 + 0.2,
        })
      }
    }

    initParticles()

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Draw particle
        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = particle.color
        ctx.font = `${particle.size}px 'Courier New', monospace`
        ctx.fillText(particle.text, particle.x, particle.y)
        ctx.restore()
      })

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
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  )
}
