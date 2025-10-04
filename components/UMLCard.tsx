'use client'

import { useState, useEffect } from 'react'
import { X, ChevronDown, ChevronRight, Plus, Eye, User } from 'lucide-react'

interface Attribute {
  id: string
  name: string
  type: string
  isVisible: boolean
}

interface Method {
  id: string
  name: string
  parameters: string
  returnType: string
  isVisible: boolean
}

interface UMLCardProps {
  id: string
  name: string
  attributes: Attribute[]
  methods: Method[]
  x: number
  y: number
  onMove: (id: string, x: number, y: number) => void
  onUpdate: (id: string, updates: Partial<UMLCardProps>) => void
  onConnectionPointMouseDown?: (agentId: string, x: number, y: number, pointType: 'left' | 'right') => void
  onConnectionPointMouseUp?: (agentId: string, x: number, y: number, pointType: 'left' | 'right') => void
}

export default function UMLCard({
  id,
  name,
  attributes,
  methods,
  x,
  y,
  onMove,
  onUpdate,
  onConnectionPointMouseDown,
  onConnectionPointMouseUp
}: UMLCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [newAttribute, setNewAttribute] = useState({ name: '', type: '' })
  const [newMethod, setNewMethod] = useState({ name: '', parameters: '', returnType: '' })

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

  const addAttribute = () => {
    if (newAttribute.name && newAttribute.type) {
      const attribute: Attribute = {
        id: Date.now().toString(),
        name: newAttribute.name,
        type: newAttribute.type,
        isVisible: true
      }
      onUpdate(id, { attributes: [...attributes, attribute] })
      setNewAttribute({ name: '', type: '' })
    }
  }

  const addMethod = () => {
    if (newMethod.name && newMethod.returnType) {
      const method: Method = {
        id: Date.now().toString(),
        name: newMethod.name,
        parameters: newMethod.parameters,
        returnType: newMethod.returnType,
        isVisible: true
      }
      onUpdate(id, { methods: [...methods, method] })
      setNewMethod({ name: '', parameters: '', returnType: '' })
    }
  }

  const removeAttribute = (attributeId: string) => {
    onUpdate(id, { attributes: attributes.filter(a => a.id !== attributeId) })
  }

  const removeMethod = (methodId: string) => {
    onUpdate(id, { methods: methods.filter(m => m.id !== methodId) })
  }

  return (
    <div
      className={`absolute bg-white text-gray-900 rounded-lg shadow-md border border-gray-200 w-56 cursor-move select-none ${
        isDragging ? 'z-50' : 'z-10'
      }`}
      style={{ left: x, top: y }}
      onMouseDown={handleMouseDown}
      data-card-id={id}
      data-card-type="uml"
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
          <button 
            className="no-drag text-gray-400 hover:text-gray-600"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
          <h3 className="font-semibold text-sm">{name}</h3>
        </div>
        <button className="no-drag text-gray-400 hover:text-gray-600">
          <X className="h-3 w-3" />
        </button>
      </div>

      {isExpanded && (
        <div className="p-2 space-y-2">
          {/* Attributes Section */}
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-1">Attributes</h4>
            <div className="space-y-1">
              {attributes.map((attr) => (
                <div key={attr.id} className="flex items-center space-x-1 bg-gray-50 rounded px-1.5 py-0.5">
                  <button className="no-drag text-gray-400 hover:text-gray-600">
                    <Eye className="h-2 w-2" />
                  </button>
                  <span className="text-xs text-gray-700">{attr.name}: {attr.type}</span>
                </div>
              ))}
              <button className="no-drag text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                <Plus className="h-2 w-2" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Methods Section */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-medium text-gray-600">Methods</h4>
              <button className="no-drag text-gray-400 hover:text-gray-600">
                <ChevronDown className="h-2 w-2" />
              </button>
            </div>
            <div className="space-y-1">
              {methods.map((method) => (
                <div key={method.id} className="bg-gray-50 rounded px-1.5 py-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <button className="no-drag text-gray-400 hover:text-gray-600">
                        <Eye className="h-2 w-2" />
                      </button>
                      <span className="text-xs text-gray-700">{method.name}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 ml-3">
                    <div>{method.parameters || 'no params'} → {method.returnType}</div>
                  </div>
                </div>
              ))}
              
              <button className="no-drag text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                <Plus className="h-2 w-2" />
                <span>Add Method</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
