'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Save, Play, Bot, Zap, FileText, MessageSquare, Brain, Filter, Settings } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter, useSearchParams } from 'next/navigation'

interface AgenticNode {
  id: string
  type: 'input' | 'processing' | 'output'
  title: string
  description: string
  icon: any
  color: string
}

interface WorkflowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: {
    label: string
    nodeType: 'input' | 'processing' | 'output'
    title: string
    description: string
  }
}

interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export default function AgenticWorkspace() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const workflowId = searchParams.get('workflow')

  const [workflowName, setWorkflowName] = useState('Untitled Workflow')
  const [workflowDescription, setWorkflowDescription] = useState('')
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [edges, setEdges] = useState<WorkflowEdge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Available node types
  const nodeTypes: AgenticNode[] = [
    // Input Nodes
    {
      id: 'task-created',
      type: 'input',
      title: 'Task Created',
      description: 'Triggers when a new task is created',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      id: 'task-completed',
      type: 'input',
      title: 'Task Completed',
      description: 'Triggers when a task is marked as completed',
      icon: FileText,
      color: 'bg-blue-500'
    },
    // Processing Nodes
    {
      id: 'ai-analyze',
      type: 'processing',
      title: 'AI Analyze',
      description: 'Uses Gemini AI to analyze task content',
      icon: Brain,
      color: 'bg-purple-500'
    },
    {
      id: 'ai-generate',
      type: 'processing',
      title: 'AI Generate',
      description: 'Uses Gemini AI to generate summaries and insights',
      icon: Brain,
      color: 'bg-purple-500'
    },
    {
      id: 'ai-categorize',
      type: 'processing',
      title: 'AI Categorize',
      description: 'Uses Gemini AI to categorize and tag tasks',
      icon: Filter,
      color: 'bg-purple-500'
    },
    // Output Nodes
    {
      id: 'update-notion',
      type: 'output',
      title: 'Update Notion',
      description: 'Creates or updates Notion pages',
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      id: 'post-discord',
      type: 'output',
      title: 'Post Discord',
      description: 'Sends messages to Discord channels',
      icon: MessageSquare,
      color: 'bg-green-500'
    }
  ]

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Load workflow data
  useEffect(() => {
    if (user) {
      loadWorkflowData()
    }
  }, [user, workflowId])

  const loadWorkflowData = async () => {
    setIsLoading(true)
    try {
      if (workflowId) {
        // TODO: Load existing workflow from Firebase
        console.log('Loading workflow:', workflowId)
        // For now, load mock data
        setWorkflowName('Smart Task Assistant')
        setWorkflowDescription('Analyzes new tasks and updates Notion automatically')
        setNodes([
          {
            id: '1',
            type: 'task-created',
            position: { x: 100, y: 100 },
            data: {
              label: 'Task Created',
              nodeType: 'input',
              title: 'Task Created',
              description: 'Triggers when a new task is created'
            }
          },
          {
            id: '2',
            type: 'ai-analyze',
            position: { x: 300, y: 100 },
            data: {
              label: 'AI Analyze',
              nodeType: 'processing',
              title: 'AI Analyze',
              description: 'Uses Gemini AI to analyze task content'
            }
          },
          {
            id: '3',
            type: 'update-notion',
            position: { x: 500, y: 100 },
            data: {
              label: 'Update Notion',
              nodeType: 'output',
              title: 'Update Notion',
              description: 'Creates or updates Notion pages'
            }
          }
        ])
        setEdges([
          {
            id: 'e1-2',
            source: '1',
            target: '2',
            sourceHandle: 'right',
            targetHandle: 'left'
          },
          {
            id: 'e2-3',
            source: '2',
            target: '3',
            sourceHandle: 'right',
            targetHandle: 'left'
          }
        ])
      } else {
        // New workflow
        setWorkflowName('Untitled Workflow')
        setWorkflowDescription('')
        setNodes([])
        setEdges([])
      }
    } catch (error) {
      console.error('Error loading workflow:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveWorkflow = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      // TODO: Save workflow to Firebase
      console.log('Saving workflow:', {
        name: workflowName,
        description: workflowDescription,
        nodes,
        edges
      })
      
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show success message
      alert('Workflow saved successfully!')
    } catch (error) {
      console.error('Error saving workflow:', error)
      alert('Error saving workflow')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestWorkflow = async () => {
    // TODO: Implement workflow testing
    alert('Testing workflow... (Feature coming soon!)')
  }

  const handleDragStart = (event: React.DragEvent, nodeType: AgenticNode) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType))
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    
    const nodeType = JSON.parse(event.dataTransfer.getData('application/reactflow'))
    const rect = event.currentTarget.getBoundingClientRect()
    const position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: nodeType.id,
      position,
      data: {
        label: nodeType.title,
        nodeType: nodeType.type,
        title: nodeType.title,
        description: nodeType.description
      }
    }

    setNodes(prev => [...prev, newNode])
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflow...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="font-notion bg-transparent border-gray-300 text-gray-600 hover:bg-gray-200 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            
            {/* Workflow Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-purple-600" />
                <span className="text-gray-900 font-medium font-notion">Agentic Workflow</span>
              </div>
              <div className="h-6 w-px bg-gray-300"></div>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="text-lg font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-0 p-0"
                placeholder="Untitled Workflow"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleTestWorkflow}
              className="font-notion border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              <Play className="h-4 w-4 mr-2" />
              Test
            </Button>
            <Button
              onClick={handleSaveWorkflow}
              disabled={isSaving}
              className="font-notion bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Workflow
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Node Library Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Node Library</h3>
          
          {/* Input Nodes */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">Input Nodes</h4>
            <div className="space-y-2">
              {nodeTypes.filter(node => node.type === 'input').map((nodeType) => {
                const IconComponent = nodeType.icon
                return (
                  <div
                    key={nodeType.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, nodeType)}
                    className="flex items-center p-3 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-8 h-8 ${nodeType.color} rounded-lg flex items-center justify-center mr-3`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{nodeType.title}</div>
                      <div className="text-xs text-gray-500">{nodeType.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Processing Nodes */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">Processing Nodes</h4>
            <div className="space-y-2">
              {nodeTypes.filter(node => node.type === 'processing').map((nodeType) => {
                const IconComponent = nodeType.icon
                return (
                  <div
                    key={nodeType.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, nodeType)}
                    className="flex items-center p-3 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-8 h-8 ${nodeType.color} rounded-lg flex items-center justify-center mr-3`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{nodeType.title}</div>
                      <div className="text-xs text-gray-500">{nodeType.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Output Nodes */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">Output Nodes</h4>
            <div className="space-y-2">
              {nodeTypes.filter(node => node.type === 'output').map((nodeType) => {
                const IconComponent = nodeType.icon
                return (
                  <div
                    key={nodeType.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, nodeType)}
                    className="flex items-center p-3 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-8 h-8 ${nodeType.color} rounded-lg flex items-center justify-center mr-3`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{nodeType.title}</div>
                      <div className="text-xs text-gray-500">{nodeType.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative">
          <div
            className="w-full h-full bg-white"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Canvas Grid */}
            <div className="w-full h-full bg-gray-50" style={{
              backgroundImage: `
                radial-gradient(circle, #e5e7eb 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}>
              {/* Render Nodes */}
              {nodes.map((node) => {
                const nodeType = nodeTypes.find(nt => nt.id === node.type)
                if (!nodeType) return null

                const IconComponent = nodeType.icon
                return (
                  <div
                    key={node.id}
                    className="absolute bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm cursor-move hover:shadow-md transition-shadow"
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                      minWidth: '200px'
                    }}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`w-6 h-6 ${nodeType.color} rounded-lg flex items-center justify-center mr-2`}>
                        <IconComponent className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{node.data.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{node.data.description}</p>
                  </div>
                )
              })}

              {/* Render Edges */}
              <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                {edges.map((edge) => {
                  const sourceNode = nodes.find(n => n.id === edge.source)
                  const targetNode = nodes.find(n => n.id === edge.target)
                  
                  if (!sourceNode || !targetNode) return null

                  const startX = sourceNode.position.x + 200 // Right edge of source
                  const startY = sourceNode.position.y + 50  // Middle of source
                  const endX = targetNode.position.x         // Left edge of target
                  const endY = targetNode.position.y + 50    // Middle of target

                  return (
                    <line
                      key={edge.id}
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke="#3B82F6"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                  )
                })}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#3B82F6"
                    />
                  </marker>
                </defs>
              </svg>

              {/* Empty State */}
              {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Build Your Agentic Workflow</h3>
                    <p className="text-gray-500 mb-6">Drag nodes from the sidebar to create your AI automation workflow</p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        Input
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                        Processing
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        Output
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
