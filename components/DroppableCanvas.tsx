'use client'

import { useDrop } from 'react-dnd'
import { useState } from 'react'
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

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'agent',
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset()
      
      if (offset) {
        // Use a simpler positioning approach
        const x = Math.random() * 400 + 50 // Random position for now
        const y = Math.random() * 300 + 50
        
        const newAgent: PlacedAgent = {
          id: `${item.id}-${Date.now()}`,
          name: item.name,
          icon: item.icon,
          color: item.color,
          description: item.description,
          x: Math.max(20, Math.min(x, 600)),
          y: Math.max(20, Math.min(y, 400))
        }
        
        setPlacedAgents(prev => [...prev, newAgent])
        return { left: 0, top: 0 }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [])

  const handleDeleteAgent = (agentId: string) => {
    setPlacedAgents(prev => prev.filter(agent => agent.id !== agentId))
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
        ref={drop as any}
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
