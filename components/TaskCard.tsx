'use client'

import { useState, useEffect } from 'react'
import { X, ChevronDown, ChevronRight, Calendar, User, MessageSquare } from 'lucide-react'

interface TaskCardProps {
  id: string
  title: string
  description: string
  assignee?: string
  techStacks: string[]
  dueDate?: string
  isCompleted: boolean
  statusColor: 'yellow' | 'red' | 'green' | 'blue'
  x: number
  y: number
  onMove: (id: string, x: number, y: number) => void
  onUpdate: (id: string, updates: Partial<TaskCardProps>) => void
  onConnectionPointMouseDown?: (agentId: string, x: number, y: number, pointType: 'left' | 'right') => void
  onConnectionPointMouseUp?: (agentId: string, x: number, y: number, pointType: 'left' | 'right') => void
}

export default function TaskCard({
  id,
  title,
  description,
  assignee,
  techStacks,
  dueDate,
  isCompleted,
  statusColor,
  x,
  y,
  onMove,
  onUpdate,
  onConnectionPointMouseDown,
  onConnectionPointMouseUp
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && (e.target.closest('.no-drag') || e.target.closest('.connection-point'))) return
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - x,
      y: e.clientY - y
    })
  }

  const getConnectionPointCoordinates = (pointType: 'left' | 'right') => {
    const cardElement = document.querySelector(`[data-card-id="${id}"]`) as HTMLElement
    if (!cardElement) return { x: 0, y: 0 }
    
    const rect = cardElement.getBoundingClientRect()
    const canvasRect = (cardElement.closest('.canvas-container') as HTMLElement)?.getBoundingClientRect() || { left: 0, top: 0 }
    
    if (pointType === 'left') {
      return {
        x: rect.left - canvasRect.left,
        y: rect.top - canvasRect.top + rect.height / 2,
      }
    } else {
      return {
        x: rect.right - canvasRect.left,
        y: rect.top - canvasRect.top + rect.height / 2,
      }
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    
    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y
    
    onMove(id, newX, newY)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart])

  const getStatusColor = () => {
    switch (statusColor) {
      case 'yellow': return 'bg-yellow-400'
      case 'red': return 'bg-red-400'
      case 'green': return 'bg-green-400'
      case 'blue': return 'bg-blue-400'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div
      className={`absolute bg-white text-gray-900 rounded-lg shadow-md border border-gray-200 w-48 cursor-move select-none ${
        isDragging ? 'z-50' : 'z-10'
      }`}
      style={{ left: x, top: y }}
      onMouseDown={handleMouseDown}
      data-card-id={id}
      data-card-type="task"
    >
      {/* Connection Points */}
      <div 
        className="connection-point absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white cursor-crosshair hover:scale-125 transition-transform"
        onMouseDown={(e) => {
          e.stopPropagation()
          const coords = getConnectionPointCoordinates('left')
          onConnectionPointMouseDown?.(id, coords.x, coords.y, 'left')
        }}
        onMouseUp={(e) => {
          e.stopPropagation()
          const coords = getConnectionPointCoordinates('left')
          onConnectionPointMouseUp?.(id, coords.x, coords.y, 'left')
        }}
      />
      <div 
        className="connection-point absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white cursor-crosshair hover:scale-125 transition-transform"
        onMouseDown={(e) => {
          e.stopPropagation()
          const coords = getConnectionPointCoordinates('right')
          onConnectionPointMouseDown?.(id, coords.x, coords.y, 'right')
        }}
        onMouseUp={(e) => {
          e.stopPropagation()
          const coords = getConnectionPointCoordinates('right')
          onConnectionPointMouseUp?.(id, coords.x, coords.y, 'right')
        }}
      />
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
        <button className="no-drag text-gray-400 hover:text-gray-600">
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Content */}
      <div className="p-2 space-y-2">
        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-2">{description}</p>

        {/* Assignee */}
        {assignee && (
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">{assignee}</span>
          </div>
        )}

        {/* Tech Stacks */}
        {techStacks.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {techStacks.map((tech, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Due Date */}
        {dueDate && (
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">{dueDate}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-200">
          <div className="flex items-center space-x-1">
            <button className="no-drag text-gray-400 hover:text-gray-600">
              <User className="h-3 w-3" />
            </button>
            <button className="no-drag text-gray-400 hover:text-gray-600">
              <MessageSquare className="h-3 w-3" />
            </button>
          </div>
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => onUpdate(id, { isCompleted: e.target.checked })}
            className="no-drag h-3 w-3"
          />
        </div>
      </div>
    </div>
  )
}
