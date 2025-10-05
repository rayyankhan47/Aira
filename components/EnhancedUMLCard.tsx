'use client'

import { useState } from 'react'
import { X, Plus, Eye } from 'lucide-react'

interface Attribute {
  id: string
  name: string
  type: string
}

interface Method {
  id: string
  name: string
  parameters: string
  returnType: string
  visibility: 'public' | 'private' | 'protected'
}

interface EnhancedUMLCardProps {
  id: string
  title: string
  attributes?: Attribute[]
  methods?: Method[]
  onUpdate?: (id: string, updates: any) => void
  onDelete?: (id: string) => void
}

export default function EnhancedUMLCard({
  id,
  title,
  attributes = [],
  methods = [],
  onUpdate,
  onDelete
}: EnhancedUMLCardProps) {
  const [newAttributeName, setNewAttributeName] = useState('')
  const [newAttributeType, setNewAttributeType] = useState('')
  const [newMethodName, setNewMethodName] = useState('')
  const [newMethodParameters, setNewMethodParameters] = useState('')
  const [newMethodReturnType, setNewMethodReturnType] = useState('')
  const [newMethodVisibility, setNewMethodVisibility] = useState<'public' | 'private' | 'protected'>('public')

  const addAttribute = () => {
    if (newAttributeName.trim() && newAttributeType.trim()) {
      const newAttribute: Attribute = {
        id: `attr-${Date.now()}`,
        name: newAttributeName.trim(),
        type: newAttributeType.trim()
      }
      const updatedAttributes = [...attributes, newAttribute]
      onUpdate?.(id, { attributes: updatedAttributes })
      setNewAttributeName('')
      setNewAttributeType('')
    }
  }

  const removeAttribute = (attributeId: string) => {
    const updatedAttributes = attributes.filter(attr => attr.id !== attributeId)
    onUpdate?.(id, { attributes: updatedAttributes })
  }

  const addMethod = () => {
    if (newMethodName.trim()) {
      const newMethod: Method = {
        id: `method-${Date.now()}`,
        name: newMethodName.trim(),
        parameters: newMethodParameters.trim(),
        returnType: newMethodReturnType.trim(),
        visibility: newMethodVisibility
      }
      const updatedMethods = [...methods, newMethod]
      onUpdate?.(id, { methods: updatedMethods })
      setNewMethodName('')
      setNewMethodParameters('')
      setNewMethodReturnType('')
      setNewMethodVisibility('public')
    }
  }

  const removeMethod = (methodId: string) => {
    const updatedMethods = methods.filter(method => method.id !== methodId)
    onUpdate?.(id, { methods: updatedMethods })
  }

  const getVisibilitySymbol = (visibility: string) => {
    switch (visibility) {
      case 'public': return '+'
      case 'private': return '-'
      case 'protected': return '#'
      default: return '+'
    }
  }

  return (
    <div className="bg-white text-gray-900 rounded-lg shadow-md border border-gray-200 w-80 cursor-move select-none relative">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="font-medium text-sm">{title}</h3>
        <button
          onClick={() => onDelete?.(id)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Attributes */}
      <div className="p-3 border-b border-gray-200">
        <h4 className="text-xs font-bold text-gray-700 mb-2">Attributes</h4>
        
        {/* Existing Attributes */}
        {attributes.map((attribute) => (
          <div key={attribute.id} className="flex items-center space-x-2 mb-1">
            <Eye className="h-3 w-3 text-gray-400" />
            <div className="flex-1 flex items-center space-x-1">
              <span className="text-xs text-gray-600">{attribute.name}:</span>
              <span className="text-xs text-purple-600">{attribute.type}</span>
            </div>
            <button
              onClick={() => removeAttribute(attribute.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Add New Attribute */}
        <div className="flex space-x-1 mt-2">
          <input
            type="text"
            value={newAttributeName}
            onChange={(e) => setNewAttributeName(e.target.value)}
            placeholder="Name"
            className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            value={newAttributeType}
            onChange={(e) => setNewAttributeType(e.target.value)}
            placeholder="Type"
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={addAttribute}
            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 flex-shrink-0"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Methods */}
      <div className="p-3">
        <h4 className="text-xs font-bold text-gray-700 mb-2">Methods</h4>
        
        {/* Existing Methods */}
        {methods.map((method) => (
          <div key={method.id} className="flex items-center space-x-2 mb-1">
            <Eye className="h-3 w-3 text-gray-400" />
            <div className="flex-1 flex items-center space-x-1">
              <span className="text-xs text-gray-600">{getVisibilitySymbol(method.visibility)}</span>
              <span className="text-xs text-gray-600">{method.name}({method.parameters}):</span>
              <span className="text-xs text-purple-600">{method.returnType}</span>
            </div>
            <button
              onClick={() => removeMethod(method.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Add New Method */}
        <div className="space-y-1 mt-2">
          <div className="flex space-x-1">
            <select
              value={newMethodVisibility}
              onChange={(e) => setNewMethodVisibility(e.target.value as 'public' | 'private' | 'protected')}
              className="w-16 px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 flex-shrink-0"
            >
              <option value="public">public</option>
              <option value="private">private</option>
              <option value="protected">protected</option>
            </select>
            <input
              type="text"
              value={newMethodName}
              onChange={(e) => setNewMethodName(e.target.value)}
              placeholder="Method name"
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-1">
            <input
              type="text"
              value={newMethodParameters}
              onChange={(e) => setNewMethodParameters(e.target.value)}
              placeholder="Parameters"
              className="w-24 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newMethodReturnType}
              onChange={(e) => setNewMethodReturnType(e.target.value)}
              placeholder="Return type"
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={addMethod}
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 flex-shrink-0"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
