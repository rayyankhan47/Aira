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
      offset = (offset + 0.5) % 20  // Slower animation
      path.style.strokeDashoffset = `${offset}`
      requestAnimationFrame(animate)
    }

    const animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [])

  // Create orthogonal path with 90-degree turns
  const dx = toX - fromX
  const dy = toY - fromY
  
  // Determine the best routing strategy based on distance and direction
  let pathData = ''
  
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal routing: go horizontal first, then vertical
    const midX = fromX + dx * 0.5
    pathData = `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`
  } else {
    // Vertical routing: go vertical first, then horizontal
    const midY = fromY + dy * 0.5
    pathData = `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`
  }

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

  // Create orthogonal path with adjusted coordinates
  let adjustedPathData = ''
  const adjustedDx = adjustedToX - adjustedFromX
  const adjustedDy = adjustedToY - adjustedFromY
  
  if (Math.abs(adjustedDx) > Math.abs(adjustedDy)) {
    // Horizontal routing: go horizontal first, then vertical
    const midX = adjustedFromX + adjustedDx * 0.5
    adjustedPathData = `M ${adjustedFromX} ${adjustedFromY} L ${midX} ${adjustedFromY} L ${midX} ${adjustedToY} L ${adjustedToX} ${adjustedToY}`
  } else {
    // Vertical routing: go vertical first, then horizontal
    const midY = adjustedFromY + adjustedDy * 0.5
    adjustedPathData = `M ${adjustedFromX} ${adjustedFromY} L ${adjustedFromX} ${midY} L ${adjustedToX} ${midY} L ${adjustedToX} ${adjustedToY}`
  }

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
      {/* Arrow marker definition */}
      <defs>
        <marker
          id={`arrowhead-${id}`}
          markerWidth="6"
          markerHeight="4"
          refX="5"
          refY="2"
          orient="auto"
        >
          <polygon
            points="0 0, 6 2, 0 4"
            fill="#3B82F6"
          />
        </marker>
      </defs>
      
      <path
        ref={pathRef}
        d={adjustedPathData}
        stroke="#3B82F6"
        strokeWidth="3"
        fill="none"
        strokeDasharray="10 5"
        strokeLinecap="round"
        markerEnd={`url(#arrowhead-${id})`}
      />
    </svg>
  )
}