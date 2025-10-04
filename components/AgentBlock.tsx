'use client'

import { useDrag } from 'react-dnd'
import { LucideIcon } from 'lucide-react'

interface AgentBlockProps {
  id: string
  name: string
  icon: LucideIcon
  color: string
  description: string
}

export default function AgentBlock({ id, name, icon: Icon, color, description }: AgentBlockProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'agent',
    item: { id, name, icon: Icon, color, description },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag as any}
      className={`flex items-center space-x-2 p-2 rounded cursor-move transition-all duration-200 hover:scale-105 ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{ backgroundColor: `${color}20` }}
    >
      <Icon className={`h-4 w-4 ${color}`} />
      <span className="text-sm font-medium text-gray-300 font-notion">{name}</span>
    </div>
  )
}
