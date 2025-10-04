'use client'

import { useDrop } from 'react-dnd'
import { useState } from 'react'
import * as React from 'react'
import CanvasAgent from './CanvasAgent'
import { LucideIcon } from 'lucide-react'

interface PlacedAgent {
  id: string
  name: string
  icon: LucideIcon
  color: string
  description: string
  x: number
  y: number
}

interface DroppableCanvasProps {
  title: string
  emptyStateIcon: LucideIcon
  emptyStateTitle: string
  emptyStateDescription: string
}

export default function DroppableCanvas({ 
  title, 
  emptyStateIcon: EmptyStateIcon, 
  emptyStateTitle, 
  emptyStateDescription 
}: DroppableCanvasProps) {
  const [placedAgents, setPlacedAgents] = useState<PlacedAgent[]>([])

  const canvasRef = React.useRef<HTMLDivElement>(null)
  
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'agent',
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset()
      const canvasElement = canvasRef.current
      
      if (offset && canvasElement) {
        const canvasRect = canvasElement.getBoundingClientRect()
        const x = offset.x - canvasRect.left - 100 // Center the agent
        const y = offset.y - canvasRect.top - 40
        
        const newAgent: PlacedAgent = {
          id: `${item.id}-${Date.now()}`,
          name: item.name,
          icon: item.icon,
          color: item.color,
          description: item.description,
          x: Math.max(20, x),
          y: Math.max(20, y)
        }
        
        setPlacedAgents(prev => [...prev, newAgent])
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [])

  const handleDeleteAgent = (agentId: string) => {
    setPlacedAgents(prev => prev.filter(agent => agent.id !== agentId))
  }

  const handleMoveAgent = (agentId: string, x: number, y: number) => {
    setPlacedAgents(prev =>
      prev.map(agent =>
        agent.id === agentId ? { ...agent, x, y } : agent
      )
    )
  }

  return (
    <div className="flex-1 bg-white relative overflow-hidden">
      {/* Canvas with dots pattern */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, #000000 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Drop Zone */}
      <div
        ref={(node) => {
          if (node) {
            (canvasRef as any).current = node
            drop(node)
          }
        }}
        className={`absolute inset-0 transition-colors ${
          isOver ? 'bg-blue-50 bg-opacity-50' : ''
        }`}
      >
        {/* Placed Agents */}
        {placedAgents.map(agent => (
          <CanvasAgent
            key={agent.id}
            id={agent.id}
            name={agent.name}
            icon={agent.icon}
            color={agent.color}
            description={agent.description}
            x={agent.x}
            y={agent.y}
            onDelete={() => handleDeleteAgent(agent.id)}
            onMove={handleMoveAgent}
          />
        ))}

        {/* Empty State */}
        {placedAgents.length === 0 && (
          <div className="absolute inset-0 p-8">
            <div className="text-center text-gray-400 mt-20 font-notion">
              <EmptyStateIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">{emptyStateTitle}</p>
              <p className="text-sm mt-2">{emptyStateDescription}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
