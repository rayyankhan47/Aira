'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  NodeTypes,
  MarkerType,
  Handle,
  Position,
} from '@reactflow/core'
import { Controls } from '@reactflow/controls'
import { Background, BackgroundVariant } from '@reactflow/background'
import { Plus, Settings, Camera, Download } from 'lucide-react'
import EnhancedTaskCard from './EnhancedTaskCard'
import EnhancedUMLCard from './EnhancedUMLCard'
import { FirebaseService } from '@/lib/firebase-service'
import '@reactflow/core/dist/style.css'

// Minimal CSS for touch performance
const styles = `
  .react-flow__pane {
    touch-action: none;
  }
`

// React Flow Node Components - Defined outside component to prevent recreation
const TaskNode = ({ data, newComponentId, setNewComponentId, onDelete, onUpdate }: { data: any; newComponentId: string | null; setNewComponentId: (id: string | null) => void; onDelete: (id: string) => void; onUpdate: (id: string, updates: any) => void }) => (
    <div className="relative" style={{ overflow: 'visible' }}>
      <EnhancedTaskCard
        id={data.id}
        title={data.title}
        description={data.description}
        priority={data.priority}
        assignees={data.assignees}
        techStack={data.techStack}
        dueDate={data.dueDate}
        isCompleted={data.isCompleted}
        isNew={data.id === newComponentId}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onGithubAction={data.onGithubAction}
        onDiscordAction={data.onDiscordAction}
        onInteraction={() => setNewComponentId(null)}
      />
    
    {/* Connection Handles - Positioned to extend beyond component */}
    <Handle
      type="source"
      position={Position.Right}
      style={{ 
        background: '#3B82F6', 
        width: 14, 
        height: 14, 
        top: '50%',
        right: -7,
        transform: 'translateY(-50%)',
        border: '2px solid white',
        borderRadius: '50%',
        zIndex: 10
      }}
    />
    <Handle
      type="target"
      position={Position.Left}
      style={{ 
        background: '#10B981', 
        width: 14, 
        height: 14, 
        top: '50%',
        left: -7,
        transform: 'translateY(-50%)',
        border: '2px solid white',
        borderRadius: '50%',
        zIndex: 10
      }}
    />
  </div>
)

const UMLNode = ({ data, newComponentId, setNewComponentId, onDelete, onUpdate }: { data: any; newComponentId: string | null; setNewComponentId: (id: string | null) => void; onDelete: (id: string) => void; onUpdate: (id: string, updates: any) => void }) => (
  <div className="relative" style={{ overflow: 'visible' }}>
    <EnhancedUMLCard
      id={data.id}
      title={data.name}
      attributes={data.attributes}
      methods={data.methods}
      isNew={data.id === newComponentId}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onInteraction={() => setNewComponentId(null)}
    />
    
    {/* Connection Handles - Positioned to extend beyond component */}
    <Handle
      type="source"
      position={Position.Right}
      style={{ 
        background: '#8B5CF6', 
        width: 14, 
        height: 14, 
        top: '50%',
        right: -7,
        transform: 'translateY(-50%)',
        border: '2px solid white',
        borderRadius: '50%',
        zIndex: 10
      }}
    />
    <Handle
      type="target"
      position={Position.Left}
      style={{ 
        background: '#10B981', 
        width: 14, 
        height: 14, 
        top: '50%',
        left: -7,
        transform: 'translateY(-50%)',
        border: '2px solid white',
        borderRadius: '50%',
        zIndex: 10
      }}
    />
  </div>
)

export default function AiraWorkspace({ projectId, initialWorkspaceData }: { 
  projectId?: string
  initialWorkspaceData?: {
    tasks: any[]
    umlDiagrams: any[]
    connections: any[]
  }
} = {}) {
  const [newComponentId, setNewComponentId] = useState<string | null>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)

  // Define custom edge types for better animations
  const edgeTypes = useMemo(() => ({}), [])

  // Convert our tasks and UMLs to React Flow nodes
  const initialNodes: Node[] = useMemo(() => [
    // Task nodes
    {
      id: 'task-1',
      type: 'taskNode',
      position: { x: 500, y: 300 },
      data: {
      id: 'task-1',
      title: 'Authentication and Database',
      description: 'Setup OAuth login and a fast CRUD database.',
        priority: 'high',
        assignees: ['Rayyan'],
        techStack: ['Next.js', 'Supabase'],
        dueDate: '2025-01-25',
      isCompleted: true,
      },
    },
    {
      id: 'task-2',
      type: 'taskNode',
      position: { x: 1200, y: 300 },
      data: {
      id: 'task-2',
      title: 'Github and Discord integration',
      description: 'Link tasks to Github and track them through Discord',
        priority: 'medium',
        assignees: ['Rayyan'],
        techStack: ['GitHub API', 'Discord.js'],
        dueDate: '2025-01-25',
      isCompleted: true,
      },
    },
    {
      id: 'task-3',
      type: 'taskNode',
      position: { x: 800, y: 800 },
      data: {
        id: 'task-3',
        title: 'Front-end Development',
        description: 'Build the drag-and-drop interface with React',
        priority: 'low',
        assignees: ['Rayyan'],
        techStack: ['React', 'TypeScript', 'Tailwind'],
        dueDate: '2025-01-26',
        isCompleted: false,
      },
    },
    {
      id: 'task-4',
      type: 'taskNode',
      position: { x: 2000, y: 600 },
      data: {
        title: 'Backend API Design',
        description: 'Design RESTful APIs for the application',
        assignee: 'Rayyan',
        techStacks: ['Node.js', 'Express', 'PostgreSQL'],
        dueDate: 'January 27th, 2025',
        isCompleted: false,
        statusColor: 'green',
      },
    },
    {
      id: 'task-5',
      type: 'taskNode',
      position: { x: 2800, y: 1000 },
      data: {
        title: 'Deployment & DevOps',
        description: 'Set up CI/CD pipeline and cloud deployment',
        assignee: 'Rayyan',
        techStacks: ['Docker', 'AWS', 'GitHub Actions'],
        dueDate: 'January 28th, 2025',
        isCompleted: false,
        statusColor: 'yellow',
      },
    },
    // UML nodes
    {
      id: 'uml-1',
      type: 'umlNode',
      position: { x: 1600, y: 600 },
      data: {
      name: 'User',
      attributes: [
          { id: 'attr-1', name: 'id', type: 'string' },
          { id: 'attr-2', name: 'email', type: 'string' },
          { id: 'attr-3', name: 'name', type: 'string' }
        ],
        methods: [
          { id: 'method-1', name: 'login', parameters: 'email, password', returnType: 'Session', visibility: 'public' },
          { id: 'method-2', name: 'register', parameters: 'email, password, name', returnType: 'User', visibility: 'public' }
        ],
      },
    },
    {
      id: 'uml-2',
      type: 'umlNode',
      position: { x: 2400, y: 400 },
      data: {
        name: 'Project',
        attributes: [
          { id: 'attr-4', name: 'id', type: 'string' },
          { id: 'attr-5', name: 'title', type: 'string' },
          { id: 'attr-6', name: 'description', type: 'string' }
        ],
        methods: [
          { id: 'method-3', name: 'createTask', parameters: 'title, description', returnType: 'Task', visibility: 'public' },
          { id: 'method-4', name: 'addMember', parameters: 'user', returnType: 'void', visibility: 'public' }
        ],
      },
    },
    {
      id: 'uml-3',
      type: 'umlNode',
      position: { x: 3200, y: 800 },
      data: {
        name: 'Task',
        attributes: [
          { id: 'attr-7', name: 'id', type: 'string' },
          { id: 'attr-8', name: 'title', type: 'string' },
          { id: 'attr-9', name: 'status', type: 'TaskStatus' },
          { id: 'attr-10', name: 'priority', type: 'Priority' }
      ],
      methods: [
          { id: 'method-5', name: 'updateStatus', parameters: 'status: TaskStatus', returnType: 'void', visibility: 'public' },
          { id: 'method-6', name: 'assignTo', parameters: 'user: User', returnType: 'void', visibility: 'public' }
        ],
      },
    },
  ], [])

  // Initial edges
  const initialEdges: Edge[] = useMemo(() => [
    {
      id: 'e1-2',
      source: 'task-1',
      target: 'task-2',
      type: 'step',
      animated: true,
      style: { stroke: '#3B82F6', strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3B82F6',
      },
    },
    {
      id: 'e1-uml1',
      source: 'task-1',
      target: 'uml-1',
      type: 'step',
      animated: true,
      style: { stroke: '#3B82F6', strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3B82F6',
      },
    },
    {
      id: 'e3-uml2',
      source: 'task-3',
      target: 'uml-2',
      type: 'step',
      animated: true,
      style: { stroke: '#3B82F6', strokeWidth: 3 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3B82F6',
      },
    },
  ], [])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update node function
  const updateNode = useCallback((nodeId: string, updates: any) => {
    setNodes((nds: Node[]) => 
      nds.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    )
  }, [setNodes])

  // Delete node function
  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds: Node[]) => nds.filter(node => node.id !== nodeId))
    setEdges((eds: Edge[]) => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId))
  }, [setNodes, setEdges])

  // Save workspace data to Firebase
  const saveWorkspaceData = useCallback(async () => {
    if (!projectId) return
    
    try {
      // Convert React Flow nodes and edges to our data format
      const tasks = nodes
        .filter(node => node.type === 'taskNode')
        .map(node => ({
          id: node.id,
          ...node.data,
          position_x: node.position.x,
          position_y: node.position.y
        }))
      
      const umlDiagrams = nodes
        .filter(node => node.type === 'umlNode')
        .map(node => ({
          id: node.id,
          ...node.data,
          position_x: node.position.x,
          position_y: node.position.y
        }))
      
      const connections = edges.map(edge => ({
        id: edge.id,
        source_id: edge.source,
        target_id: edge.target,
        source_handle: edge.sourceHandle,
        target_handle: edge.targetHandle
      }))

      await FirebaseService.saveProjectWorkspaceData(projectId, {
        tasks,
        umlDiagrams,
        connections
      })
    } catch (error) {
      console.error('Error saving workspace data:', error)
    }
  }, [projectId, nodes, edges])

  // Auto-save when nodes or edges change
  useEffect(() => {
    if (projectId && (nodes.length > 0 || edges.length > 0)) {
      const timeoutId = setTimeout(() => {
        saveWorkspaceData()
      }, 1000) // Debounce saves by 1 second
      
      return () => clearTimeout(timeoutId)
    }
  }, [nodes, edges, projectId, saveWorkspaceData])

  // Define custom node types
  const nodeTypes: NodeTypes = useMemo(() => ({
    taskNode: (props: any) => <TaskNode {...props} newComponentId={newComponentId} setNewComponentId={setNewComponentId} onDelete={deleteNode} onUpdate={updateNode} />,
    umlNode: (props: any) => <UMLNode {...props} newComponentId={newComponentId} setNewComponentId={setNewComponentId} onDelete={deleteNode} onUpdate={updateNode} />,
  }), [newComponentId, deleteNode, updateNode])

  // Handle new connections - simplified for debugging
  const onConnect = useCallback((params: Connection) => {
    console.log('onConnect called with:', params)
    
    const newEdge = {
      ...params,
      id: `edge-${Date.now()}`,
      animated: true,
      style: { stroke: '#3B82F6', strokeWidth: 3 },
    }
    
    console.log('Creating edge:', newEdge)
    setEdges((eds: Edge[]) => addEdge(newEdge, eds))
  }, [setEdges])

  // Add new task node
  const addNewTask = useCallback(() => {
    const newId = `task-${Date.now()}`
    
    // Get center position of current view
    let position = { x: 500, y: 300 } // default position
    if (reactFlowInstance) {
      const { x, y, zoom } = reactFlowInstance.getViewport()
      position = {
        x: -x / zoom + window.innerWidth / 2 / zoom,
        y: -y / zoom + window.innerHeight / 2 / zoom
      }
    }
    
    const newNode: Node = {
      id: newId,
      type: 'taskNode',
      position,
      data: {
        id: newId,
        title: '',
        description: '',
        priority: 'medium',
        assignees: [],
        techStack: [],
        dueDate: '',
        isCompleted: false,
      },
    }
    setNodes((nds: Node[]) => [...nds, newNode])
    setNewComponentId(newId)
  }, [setNodes, reactFlowInstance])

  // Add new UML node
  const addNewUML = useCallback(() => {
    const newId = `uml-${Date.now()}`
    
    // Get center position of current view
    let position = { x: 500, y: 300 } // default position
    if (reactFlowInstance) {
      const { x, y, zoom } = reactFlowInstance.getViewport()
      position = {
        x: -x / zoom + window.innerWidth / 2 / zoom,
        y: -y / zoom + window.innerHeight / 2 / zoom
      }
    }
    
    const newNode: Node = {
      id: newId,
      type: 'umlNode',
      position,
      data: {
        id: newId,
        name: '',
      attributes: [],
      methods: [],
      },
    }
    setNodes((nds: Node[]) => [...nds, newNode])
    setNewComponentId(newId)
  }, [setNodes, reactFlowInstance])

  return (
    <>
      {/* Add styles to reduce passive event listener warnings */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="h-full bg-white relative">
        {/* Add Buttons */}
      <div className="absolute top-4 left-4 flex space-x-2 z-10">
          <button
            onClick={addNewTask}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Task
          </button>
          <button
            onClick={addNewUML}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add UML
          </button>
        </div>

      {/* Top Toolbar */}
      <div className="absolute top-4 right-4 flex space-x-2 z-10">
        <button className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg shadow-sm transition-colors">
          <Plus className="h-4 w-4" />
          </button>
        <button className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg shadow-sm transition-colors">
          <Settings className="h-4 w-4" />
          </button>
        <button className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg shadow-sm transition-colors">
          <Camera className="h-4 w-4" />
          </button>
        <button className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg shadow-sm transition-colors">
          <Download className="h-4 w-4" />
          </button>
        </div>

      {/* React Flow */}
      <div style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          attributionPosition="bottom-left"
          deleteKeyCode={null}
          multiSelectionKeyCode={null}
          selectionKeyCode={null}
          onInit={setReactFlowInstance}
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        </ReactFlow>
        </div>
      </div>
    </>
  )
}