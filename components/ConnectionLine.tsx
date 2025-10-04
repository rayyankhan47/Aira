'use client'

import { useEffect, useRef } from 'react'

interface ConnectionLineProps {
  fromX: number
  fromY: number
  toX: number
  toY: number
  id: string
}

export default function ConnectionLine({ fromX, fromY, toX, toY, id }: ConnectionLineProps) {
  const pathRef = useRef<SVGPathElement>(null)

  // Create animated dashed line effect - marching ants
  useEffect(() => {
    const path = pathRef.current
    if (!path) return

    let offset = 0
    const animate = () => {
      offset = (offset + 1) % 20
      path.style.strokeDashoffset = `${offset}`
      requestAnimationFrame(animate)
    }

    const animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [])

  // Calculate control points for smooth bezier curve
  const dx = toX - fromX
  const dy = toY - fromY
  const controlX1 = fromX + dx * 0.5
  const controlY1 = fromY
  const controlX2 = toX - dx * 0.5
  const controlY2 = toY

  const pathData = `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`

  // Calculate SVG dimensions
  const minX = Math.min(fromX, toX) - 10
  const minY = Math.min(fromY, toY) - 10
  const maxX = Math.max(fromX, toX) + 10
  const maxY = Math.max(fromY, toY) + 10
  const width = maxX - minX
  const height = maxY - minY

  // Adjust path coordinates relative to SVG
  const adjustedFromX = fromX - minX
  const adjustedFromY = fromY - minY
  const adjustedToX = toX - minX
  const adjustedToY = toY - minY

  const adjustedPathData = `M ${adjustedFromX} ${adjustedFromY} C ${adjustedFromX + width * 0.5} ${adjustedFromY}, ${adjustedToX - width * 0.5} ${adjustedToY}, ${adjustedToX} ${adjustedToY}`

  return (
    <svg
      className="absolute pointer-events-none"
      style={{ 
        left: minX, 
        top: minY, 
        width: width, 
        height: height, 
        zIndex: 1 
      }}
    >
      <path
        ref={pathRef}
        d={adjustedPathData}
        stroke="#3B82F6"
        strokeWidth="3"
        fill="none"
        strokeDasharray="10 5"
        strokeLinecap="round"
      />
    </svg>
  )
}