'use client'

import { useState, useCallback, useMemo } from 'react'
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
import TaskCard from './TaskCard'
import UMLCard from './UMLCard'
import '@reactflow/core/dist/style.css'

// Minimal CSS for touch performance
const styles = `
  .react-flow__pane {
    touch-action: none;
  }
`

// React Flow Node Components - Defined outside component to prevent recreation
const TaskNode = ({ data }: { data: any }) => (
  <div className="bg-white text-gray-900 rounded-lg shadow-md border border-gray-200 w-48 cursor-move select-none relative">
    {/* Connection Handles - Simplified */}
    <Handle
      type="source"
      position={Position.Right}
      style={{ background: '#3B82F6', width: 10, height: 10 }}
    />
    <Handle
      type="target"
      position={Position.Left}
      style={{ background: '#10B981', width: 10, height: 10 }}
    />
    
    {/* Header */}
    <div className="flex items-center justify-between p-3 border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          data.statusColor === 'yellow' ? 'bg-yellow-400' :
          data.statusColor === 'red' ? 'bg-red-400' :
          data.statusColor === 'blue' ? 'bg-blue-400' :
          data.statusColor === 'green' ? 'bg-green-400' :
          'bg-gray-400'
        }`} />
        <h3 className="font-medium text-sm">{data.title}</h3>
      </div>
      <div className="text-xs text-gray-500">{data.assignee}</div>
    </div>
    
    {/* Content */}
    <div className="p-3">
      <p className="text-xs text-gray-600 mb-2">{data.description}</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {data.techStacks.map((tech: string, index: number) => (
          <span key={index} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
            {tech}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{data.dueDate}</span>
        <div className={`w-4 h-4 border-2 rounded ${
          data.isCompleted ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
        }`} />
      </div>
    </div>
  </div>
)

const UMLNode = ({ data }: { data: any }) => (
  <div className="bg-white text-gray-900 rounded-lg shadow-md border border-gray-200 w-56 cursor-move select-none relative">
    {/* Connection Handles - Simplified */}
    <Handle
      type="source"
      position={Position.Right}
      style={{ background: '#8B5CF6', width: 10, height: 10 }}
    />
    <Handle
      type="target"
      position={Position.Left}
      style={{ background: '#10B981', width: 10, height: 10 }}
    />
    
    {/* Header */}
    <div className="flex items-center justify-between p-2 border-b border-gray-200">
      <h3 className="font-medium text-sm">{data.name}</h3>
    </div>
    
    {/* Attributes */}
    <div className="p-2 border-b border-gray-100">
      <div className="text-xs font-medium text-gray-700 mb-1">Attributes</div>
      {data.attributes.map((attr: any) => (
        <div key={attr.id} className="text-xs text-gray-600">
          {attr.name}: {attr.type}
        </div>
      ))}
    </div>
    
    {/* Methods */}
    <div className="p-2">
      <div className="text-xs font-medium text-gray-700 mb-1">Methods</div>
      {data.methods.map((method: any) => (
        <div key={method.id} className="text-xs text-gray-600">
          {method.name}({method.parameters}): {method.returnType}
        </div>
      ))}
    </div>
  </div>
)

export default function AiraWorkspace() {
  // Define custom node types
  const nodeTypes: NodeTypes = useMemo(() => ({
    taskNode: TaskNode,
    umlNode: UMLNode,
  }), [])

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
      title: 'Authentication and Database',
      description: 'Setup OAuth login and a fast CRUD database.',
        assignee: 'Rayyan',
        techStacks: ['Next.js', 'Supabase'],
      dueDate: 'January 25th, 2025',
      isCompleted: true,
      statusColor: 'yellow',
      },
    },
    {
      id: 'task-2',
      type: 'taskNode',
      position: { x: 1200, y: 300 },
      data: {
      title: 'Github and Discord integration',
      description: 'Link tasks to Github and track them through Discord',
        assignee: 'Rayyan',
        techStacks: ['GitHub API', 'Discord.js'],
      dueDate: 'January 25th, 2025',
      isCompleted: true,
      statusColor: 'red',
      },
    },
    {
      id: 'task-3',
      type: 'taskNode',
      position: { x: 800, y: 800 },
      data: {
        title: 'Front-end Development',
        description: 'Build the drag-and-drop interface with React',
        assignee: 'Rayyan',
        techStacks: ['React', 'TypeScript', 'Tailwind'],
        dueDate: 'January 26th, 2025',
        isCompleted: false,
        statusColor: 'blue',
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
          { id: 'attr-1', name: 'id', type: 'string', isVisible: true },
          { id: 'attr-2', name: 'email', type: 'string', isVisible: true },
          { id: 'attr-3', name: 'name', type: 'string', isVisible: true }
        ],
        methods: [
          { id: 'method-1', name: 'login', parameters: 'email, password', returnType: 'Session', isVisible: true },
          { id: 'method-2', name: 'register', parameters: 'email, password, name', returnType: 'User', isVisible: true }
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
          { id: 'attr-4', name: 'id', type: 'string', isVisible: true },
          { id: 'attr-5', name: 'title', type: 'string', isVisible: true },
          { id: 'attr-6', name: 'description', type: 'string', isVisible: true }
        ],
        methods: [
          { id: 'method-3', name: 'createTask', parameters: 'title, description', returnType: 'Task', isVisible: true },
          { id: 'method-4', name: 'addMember', parameters: 'user', returnType: 'void', isVisible: true }
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
          { id: 'attr-7', name: 'id', type: 'string', isVisible: true },
          { id: 'attr-8', name: 'title', type: 'string', isVisible: true },
          { id: 'attr-9', name: 'status', type: 'TaskStatus', isVisible: true },
          { id: 'attr-10', name: 'priority', type: 'Priority', isVisible: true }
      ],
      methods: [
          { id: 'method-5', name: 'updateStatus', parameters: 'status: TaskStatus', returnType: 'void', isVisible: true },
          { id: 'method-6', name: 'assignTo', parameters: 'user: User', returnType: 'void', isVisible: true }
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
    const newNode: Node = {
      id: `task-${Date.now()}`,
      type: 'taskNode',
      position: { x: Math.random() * 1000 + 100, y: Math.random() * 800 + 100 },
      data: {
      title: 'New Task',
      description: 'Task description...',
      techStacks: [],
      isCompleted: false,
      statusColor: 'blue',
      },
    }
    setNodes((nds: Node[]) => [...nds, newNode])
  }, [setNodes])

  // Add new UML node
  const addNewUML = useCallback(() => {
    const newNode: Node = {
      id: `uml-${Date.now()}`,
      type: 'umlNode',
      position: { x: Math.random() * 1000 + 100, y: Math.random() * 800 + 100 },
      data: {
      name: 'New Entity',
      attributes: [],
      methods: [],
      },
    }
    setNodes((nds: Node[]) => [...nds, newNode])
  }, [setNodes])

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
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
      </div>
    </>
  )
}