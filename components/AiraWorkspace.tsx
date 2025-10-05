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
import EnhancedTaskCard from './EnhancedTaskCard'
import EnhancedUMLCard from './EnhancedUMLCard'
import '@reactflow/core/dist/style.css'

// Minimal CSS for touch performance
const styles = `
  .react-flow__pane {
    touch-action: none;
  }
`

// React Flow Node Components - Defined outside component to prevent recreation
const TaskNode = ({ data }: { data: any }) => (
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
      onUpdate={data.onUpdate}
      onDelete={data.onDelete}
      onGithubAction={data.onGithubAction}
      onDiscordAction={data.onDiscordAction}
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

const UMLNode = ({ data }: { data: any }) => (
  <div className="relative" style={{ overflow: 'visible' }}>
    <EnhancedUMLCard
      id={data.id}
      title={data.name}
      attributes={data.attributes}
      methods={data.methods}
      onUpdate={data.onUpdate}
      onDelete={data.onDelete}
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