'use client'

import { LucideIcon } from 'lucide-react'

interface CanvasAgentProps {
  id: string
  name: string
  icon: LucideIcon
  color: string
  description: string
  x: number
  y: number
  onDelete?: () => void
}

export default function CanvasAgent({ 
  id, 
  name, 
  icon: Icon, 
  color, 
  description, 
  x, 
  y, 
  onDelete 
}: CanvasAgentProps) {
  return (
    <div
      className="absolute bg-white rounded-lg shadow-lg border border-gray-200 p-4 cursor-move hover:shadow-xl transition-shadow"
      style={{ 
        left: x, 
        top: y,
        minWidth: '200px'
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon className={`h-5 w-5 ${color}`} />
          <span className="font-medium text-gray-900 font-notion">{name}</span>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            ×
          </button>
        )}
      </div>
      <p className="text-sm text-gray-600 font-notion">{description}</p>
      
      {/* Connection Points */}
      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
    </div>
  )
}
