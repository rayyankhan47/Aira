'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Save, Play, Bot, Zap, FileText, MessageSquare, Brain, Filter, Settings } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { FirebaseService, AgenticWorkflow } from '@/lib/firebase-service'
import { useRouter, useSearchParams } from 'next/navigation'
import ReactFlow, { 
  Node, 
  Edge, 
  addEdge, 
  useNodesState, 
  useEdgesState, 
  Controls, 
  Background, 
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  Panel,
  MarkerType
} from 'reactflow'
import 'reactflow/dist/style.css'

interface AgenticNode {
  id: string
  type: 'input' | 'processing' | 'output'
  title: string
  description: string
  icon: any
  color: string
}

import AgenticWorkflowNode from '@/components/AgenticWorkflowNode'

export default function AgenticWorkspace() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const workflowId = searchParams.get('workflow')

  const [workflowName, setWorkflowName] = useState('Untitled Workflow')
  const [workflowDescription, setWorkflowDescription] = useState('')
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Handle connections
  const onConnect = useCallback((params: any) => {
    setEdges((eds) => addEdge(params, eds))
  }, [setEdges])

  // Add node to canvas
  const addNodeToCanvas = useCallback((nodeType: AgenticNode) => {
    const newNode: Node = {
      id: `${nodeType.id}-${Date.now()}`,
      type: 'agenticNode',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: {
        type: nodeType.id,
        title: nodeType.title,
        description: nodeType.description,
        nodeType: nodeType.type,
        label: nodeType.title,
      },
    }
    setNodes((nds) => [...nds, newNode])
  }, [setNodes])

  // Delete node from canvas
  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId))
    // Also remove any edges connected to this node
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
  }, [setNodes, setEdges])

  // Create nodeTypes with delete handler
  const nodeTypes = useMemo(() => ({
    agenticNode: (props: any) => <AgenticWorkflowNode {...props} onDelete={deleteNode} />
  }), [deleteNode])

  // Create edge types with arrowheads
  const edgeTypes = useMemo(() => ({}), [])

  // Available node types for the sidebar
  const availableNodeTypes: AgenticNode[] = [
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
        // Load existing workflow from Firebase
        const workflow = await FirebaseService.getAgenticWorkflow(workflowId)
        if (workflow) {
          setWorkflowName(workflow.name)
          setWorkflowDescription(workflow.description || '')
          setNodes(workflow.nodes || [])
          setEdges(workflow.edges || [])
        } else {
          // Workflow not found, redirect to dashboard
          router.push('/dashboard')
          return
        }
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
      if (workflowId) {
        // Update existing workflow
        await FirebaseService.updateAgenticWorkflow(workflowId, {
          name: workflowName,
          description: workflowDescription
        })
        await FirebaseService.saveAgenticWorkflowData(workflowId, nodes, edges)
      } else {
        // Create new workflow
        const newWorkflow = await FirebaseService.createAgenticWorkflow(
          user.uid,
          workflowName,
          workflowDescription
        )
        
        // Save the workflow data
        await FirebaseService.saveAgenticWorkflowData(newWorkflow.id, nodes, edges)
        
        // Redirect to the new workflow
        router.push(`/agentic-workspace?workflow=${newWorkflow.id}`)
        return
      }
      
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
              {availableNodeTypes.filter(node => node.type === 'input').map((nodeType) => {
                const IconComponent = nodeType.icon
                return (
                  <div
                    key={nodeType.id}
                    onClick={() => addNodeToCanvas(nodeType)}
                    className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
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
              {availableNodeTypes.filter(node => node.type === 'processing').map((nodeType) => {
                const IconComponent = nodeType.icon
                return (
                  <div
                    key={nodeType.id}
                    onClick={() => addNodeToCanvas(nodeType)}
                    className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
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
              {availableNodeTypes.filter(node => node.type === 'output').map((nodeType) => {
                const IconComponent = nodeType.icon
                return (
                  <div
                    key={nodeType.id}
                    onClick={() => addNodeToCanvas(nodeType)}
                    className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
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

        {/* React Flow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            className="bg-gray-50"
            defaultEdgeOptions={{
              type: 'smoothstep',
              style: { stroke: '#3b82f6', strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#3b82f6',
              },
            }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls />
            <MiniMap 
              nodeColor={(node) => {
                const colorMap: { [key: string]: string } = {
                  'task-created': '#3b82f6',
                  'task-completed': '#3b82f6', 
                  'ai-analyze': '#8b5cf6',
                  'ai-generate': '#8b5cf6',
                  'ai-categorize': '#8b5cf6',
                  'update-notion': '#10b981',
                  'post-discord': '#10b981',
                }
                return colorMap[node.data?.type] || '#6b7280'
              }}
              nodeStrokeWidth={3}
              nodeBorderRadius={2}
              zoomable
              pannable
            />
            <Panel position="top-right">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="text-sm font-medium text-gray-900 mb-1">Workflow Stats</div>
                <div className="text-xs text-gray-600">
                  {nodes.length} nodes • {edges.length} connections
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}
