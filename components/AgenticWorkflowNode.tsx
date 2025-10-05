'use client'

import { Handle, Position, NodeProps } from 'reactflow'
import { Bot, Zap, FileText, MessageSquare, Brain, Filter, X } from 'lucide-react'

const nodeIcons = {
  'task-created': FileText,
  'task-completed': FileText,
  'ai-analyze': Brain,
  'ai-generate': Zap,
  'ai-categorize': Filter,
  'update-notion': FileText,
  'post-discord': MessageSquare,
}

const nodeColors = {
  'task-created': 'bg-blue-500',
  'task-completed': 'bg-blue-500',
  'ai-analyze': 'bg-purple-500',
  'ai-generate': 'bg-purple-500',
  'ai-categorize': 'bg-purple-500',
  'update-notion': 'bg-green-500',
  'post-discord': 'bg-green-500',
}

interface AgenticWorkflowNodeProps extends NodeProps {
  data: {
    type: string
    title: string
    description: string
    nodeType: 'input' | 'processing' | 'output'
    label: string
  }
  onDelete?: (nodeId: string) => void
}

export default function AgenticWorkflowNode({ data, selected, id, onDelete }: AgenticWorkflowNodeProps) {
  const Icon = nodeIcons[data.type as keyof typeof nodeIcons] || Bot
  const colorClass = nodeColors[data.type as keyof typeof nodeColors] || 'bg-gray-500'

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(id)
    }
  }

  return (
    <div className={`px-4 py-2 shadow-md rounded-md border-2 min-w-[200px] bg-white relative ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400"
      />
      
      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow-lg hover:shadow-xl transition-all z-10"
        title="Delete node"
        style={{ zIndex: 1000 }}
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-center space-x-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${colorClass} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">
            {data.title}
          </div>
          <div className="text-xs text-gray-500">
            {data.description}
          </div>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-400"
      />
    </div>
  )
}
