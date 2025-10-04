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
}

export default function UMLCard({
  id,
  name,
  attributes,
  methods,
  x,
  y,
  onMove,
  onUpdate
}: UMLCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [newAttribute, setNewAttribute] = useState({ name: '', type: '' })
  const [newMethod, setNewMethod] = useState({ name: '', parameters: '', returnType: '' })

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
      className={`absolute bg-gray-800 text-white rounded-lg shadow-lg border border-gray-600 min-w-80 max-w-96 cursor-move select-none ${
        isDragging ? 'z-50' : 'z-10'
      }`}
      style={{ left: x, top: y }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-600">
        <div className="flex items-center space-x-2">
          <button 
            className="no-drag text-gray-400 hover:text-white"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <h3 className="font-semibold text-white">{name}</h3>
        </div>
        <button className="no-drag text-gray-400 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-4">
          {/* Attributes Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Attributes</h4>
            <div className="space-y-2">
              {attributes.map((attr) => (
                <div key={attr.id} className="flex items-center space-x-2 bg-gray-700 rounded px-2 py-1">
                  <button className="no-drag text-gray-400 hover:text-white">
                    <Eye className="h-3 w-3" />
                  </button>
                  <span className="text-xs text-gray-300">{attr.name}: {attr.type}</span>
                  <button 
                    className="no-drag text-gray-400 hover:text-white ml-auto"
                    onClick={() => removeAttribute(attr.id)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={newAttribute.name}
                  onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                  className="no-drag bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Type"
                  value={newAttribute.type}
                  onChange={(e) => setNewAttribute({ ...newAttribute, type: e.target.value })}
                  className="no-drag bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-blue-500"
                />
                <button 
                  className="no-drag bg-blue-600 hover:bg-blue-700 text-white rounded px-2 py-1"
                  onClick={addAttribute}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Methods Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-300">Methods</h4>
              <button className="no-drag text-gray-400 hover:text-white">
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-2">
              {methods.map((method) => (
                <div key={method.id} className="bg-gray-700 rounded px-2 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <button className="no-drag text-gray-400 hover:text-white">
                        <Eye className="h-3 w-3" />
                      </button>
                      <span className="text-xs text-gray-300">{method.name}</span>
                    </div>
                    <button 
                      className="no-drag text-gray-400 hover:text-white"
                      onClick={() => removeMethod(method.id)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 ml-5">
                    <div>Parameters: {method.parameters || 'none'}</div>
                    <div>Return Type: {method.returnType}</div>
                  </div>
                </div>
              ))}
              
              {/* Add New Method */}
              <div className="space-y-2 bg-gray-700 rounded px-2 py-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newMethod.name}
                    onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                    className="no-drag bg-gray-600 text-white text-xs rounded px-2 py-1 border border-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Return Type"
                    value={newMethod.returnType}
                    onChange={(e) => setNewMethod({ ...newMethod, returnType: e.target.value })}
                    className="no-drag bg-gray-600 text-white text-xs rounded px-2 py-1 border border-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <button 
                    className="no-drag bg-blue-600 hover:bg-blue-700 text-white rounded px-2 py-1"
                    onClick={addMethod}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Parameters (e.g., param1: type, param2: type)"
                  value={newMethod.parameters}
                  onChange={(e) => setNewMethod({ ...newMethod, parameters: e.target.value })}
                  className="no-drag bg-gray-600 text-white text-xs rounded px-2 py-1 border border-gray-500 focus:outline-none focus:border-blue-500 w-full"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end pt-2 border-t border-gray-600">
            <User className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      )}
    </div>
  )
}
