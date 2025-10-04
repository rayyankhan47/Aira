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
  onUpdate
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('.no-drag')) return
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - x,
      y: e.clientY - y
    })
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
      className={`absolute bg-gray-800 text-white rounded-lg shadow-lg border border-gray-600 min-w-64 max-w-80 cursor-move select-none ${
        isDragging ? 'z-50' : 'z-10'
      }`}
      style={{ left: x, top: y }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-600">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
          <button 
            className="no-drag text-gray-400 hover:text-white"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
        <button className="no-drag text-gray-400 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3">
          {/* Title */}
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-gray-300 mt-1">{description}</p>
          </div>

          {/* Assignee */}
          {assignee && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">{assignee}</span>
              </div>
              <button className="no-drag text-gray-400 hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Tech Stacks */}
          <div>
            <div className="flex flex-wrap gap-1 mb-1">
              {techStacks.map((tech, index) => (
                <div key={index} className="flex items-center space-x-1 bg-gray-700 rounded px-2 py-1">
                  <span className="text-xs text-gray-300">{tech}</span>
                  <button className="no-drag text-gray-400 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <button className="no-drag text-xs text-gray-400 hover:text-white flex items-center space-x-1">
              <ChevronDown className="h-3 w-3" />
              <span>Select tech stacks</span>
            </button>
          </div>

          {/* Due Date */}
          {dueDate && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">{dueDate}</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-600">
            <div className="flex items-center space-x-2">
              <button className="no-drag text-gray-400 hover:text-white">
                <User className="h-4 w-4" />
              </button>
              <button className="no-drag text-gray-400 hover:text-white">
                <MessageSquare className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={(e) => onUpdate(id, { isCompleted: e.target.checked })}
                className="no-drag"
              />
              <span className="text-sm text-gray-300">Completed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
