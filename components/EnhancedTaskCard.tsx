'use client'

import { useState } from 'react'
import { X, User, Calendar, Github, MessageSquare, Check, Plus, Edit2 } from 'lucide-react'
import DeleteConfirmationModal from './DeleteConfirmationModal'

interface EnhancedTaskCardProps {
  id: string
  title: string
  description: string
  priority?: 'low' | 'medium' | 'high'
  assignees?: string[]
  techStack?: string[]
  dueDate?: string
  isCompleted?: boolean
  isNew?: boolean
  onUpdate?: (id: string, updates: any) => void
  onDelete?: (id: string) => void
  onGithubAction?: (id: string) => void
  onDiscordAction?: (id: string) => void
  onInteraction?: () => void
}

export default function EnhancedTaskCard({
  id,
  title,
  description,
  priority = 'medium',
  assignees = [],
  techStack = [],
  dueDate,
  isCompleted = false,
  isNew = false,
  onUpdate,
  onDelete,
  onGithubAction,
  onDiscordAction,
  onInteraction
}: EnhancedTaskCardProps) {
  const [newAssignee, setNewAssignee] = useState('')
  const [newTech, setNewTech] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(isNew)
  const [isEditingDescription, setIsEditingDescription] = useState(isNew)
  const [editableTitle, setEditableTitle] = useState(title)
  const [editableDescription, setEditableDescription] = useState(description)

  const handleInteraction = () => {
    if (isNew && onInteraction) {
      onInteraction()
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-yellow-500'
    }
  }

  const addAssignee = () => {
    if (newAssignee.trim() && !assignees.includes(newAssignee.trim())) {
      const updatedAssignees = [...assignees, newAssignee.trim()]
      onUpdate?.(id, { assignees: updatedAssignees })
      setNewAssignee('')
    }
  }

  const removeAssignee = (assigneeToRemove: string) => {
    const updatedAssignees = assignees.filter(a => a !== assigneeToRemove)
    onUpdate?.(id, { assignees: updatedAssignees })
  }

  const addTechStack = () => {
    if (newTech.trim() && !techStack.includes(newTech.trim())) {
      const updatedTechStack = [...techStack, newTech.trim()]
      onUpdate?.(id, { techStack: updatedTechStack })
      setNewTech('')
    }
  }

  const removeTechStack = (techToRemove: string) => {
    const updatedTechStack = techStack.filter(t => t !== techToRemove)
    onUpdate?.(id, { techStack: updatedTechStack })
  }

  return (
    <div className={`bg-white text-gray-900 rounded-lg shadow-md border border-gray-200 w-64 cursor-move select-none relative ${
      isNew ? 'ring-4 ring-blue-400 ring-opacity-50 shadow-lg' : ''
    }`}>
      {/* Header with Priority and Title */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center space-x-2 flex-1">
          <select
            value={priority}
            onChange={(e) => {
              onUpdate?.(id, { priority: e.target.value })
              handleInteraction()
            }}
            className={`w-3 h-3 rounded-full border-2 border-white ${getPriorityColor(priority)} cursor-pointer`}
          >
            <option value="high" className="bg-red-500"></option>
            <option value="medium" className="bg-yellow-500"></option>
            <option value="low" className="bg-green-500"></option>
          </select>
          {isEditingTitle ? (
            <input
              type="text"
              value={editableTitle}
              onChange={(e) => setEditableTitle(e.target.value)}
              onBlur={() => {
                setIsEditingTitle(false)
                onUpdate?.(id, { title: editableTitle })
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingTitle(false)
                  onUpdate?.(id, { title: editableTitle })
                }
              }}
              placeholder="Task title..."
              className="font-medium text-sm bg-transparent border-none outline-none focus:bg-gray-50 px-1 rounded flex-1 placeholder-gray-400"
              autoFocus
            />
          ) : (
            <h3 
              className="font-medium text-sm cursor-pointer hover:bg-gray-50 px-1 rounded flex-1"
              onClick={() => {
                setIsEditingTitle(true)
                handleInteraction()
              }}
            >
              {editableTitle || 'Click to add title...'}
            </h3>
          )}
        </div>
        <button
          onClick={() => {
            setShowDeleteModal(true)
            handleInteraction()
          }}
          className="text-gray-400 hover:text-red-500 transition-colors ml-2"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Description */}
      <div className="p-3 border-b border-gray-200">
        {isEditingDescription ? (
          <textarea
            value={editableDescription}
            onChange={(e) => setEditableDescription(e.target.value)}
            onBlur={() => {
              setIsEditingDescription(false)
              onUpdate?.(id, { description: editableDescription })
            }}
            placeholder="Task description..."
            className="text-sm text-gray-600 bg-transparent border-none outline-none focus:bg-gray-50 px-1 rounded w-full resize-none placeholder-gray-400"
            rows={3}
            autoFocus
          />
        ) : (
          <p 
            className="text-sm text-gray-600 cursor-pointer hover:bg-gray-50 px-1 rounded"
            onClick={() => {
              setIsEditingDescription(true)
              handleInteraction()
            }}
          >
            {editableDescription || 'Click to add description...'}
          </p>
        )}
      </div>

      {/* Assignees */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center space-x-1 mb-2">
          <User className="h-3 w-3 text-gray-500" />
          <span className="text-xs font-medium text-gray-700">Assignees</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {assignees.map((assignee, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {assignee}
              <button
                onClick={() => removeAssignee(assignee)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-1">
          <input
            type="text"
            value={newAssignee}
            onChange={(e) => setNewAssignee(e.target.value)}
            placeholder="Add assignee"
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && addAssignee()}
            onClick={handleInteraction}
          />
          <button
            onClick={addAssignee}
            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="p-3 border-b border-gray-200">
        <span className="text-xs font-medium text-gray-700 mb-2 block">Tech Stack</span>
        <div className="flex flex-wrap gap-1 mb-2">
          {techStack.map((tech, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
            >
              {tech}
              <button
                onClick={() => removeTechStack(tech)}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-1">
          <input
            type="text"
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
            placeholder="Add tech"
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
            onKeyPress={(e) => e.key === 'Enter' && addTechStack()}
            onClick={handleInteraction}
          />
          <button
            onClick={addTechStack}
            className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Due Date */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3 text-gray-500" />
          <input
            type="date"
            value={dueDate || ''}
            onChange={(e) => {
              onUpdate?.(id, { dueDate: e.target.value })
              handleInteraction()
            }}
            onClick={handleInteraction}
            className="text-xs border-none bg-transparent text-gray-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => onGithubAction?.(id)}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-800 text-white text-xs rounded hover:bg-gray-900"
          >
            <Github className="h-3 w-3" />
            <span>GitHub</span>
          </button>
          <button
            onClick={() => onDiscordAction?.(id)}
            className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
          >
            <MessageSquare className="h-3 w-3" />
            <span>Discord</span>
          </button>
        </div>
      </div>

      {/* Completion Checkbox */}
      <div className="p-3">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => {
              onUpdate?.(id, { isCompleted: e.target.checked })
              handleInteraction()
            }}
            onClick={handleInteraction}
            className="rounded border-gray-300"
          />
          <span className="text-xs text-gray-600">Completed</span>
          {isCompleted && <Check className="h-4 w-4 text-green-500" />}
        </label>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        componentName={editableTitle}
        componentType="task"
        onConfirm={() => {
          onDelete?.(id)
          setShowDeleteModal(false)
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  )
}
