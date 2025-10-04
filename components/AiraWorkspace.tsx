'use client'

import { useState, useEffect } from 'react'
import { Plus, Settings, Camera, Download, Printer, ZoomIn, ZoomOut, Maximize, Lock } from 'lucide-react'
import TaskCard from './TaskCard'
import UMLCard from './UMLCard'
import ConnectionLine from './ConnectionLine'

interface Task {
  id: string
  title: string
  description: string
  assignee?: string
  techStacks: string[]
  dueDate?: string
  isCompleted: boolean
  statusColor: 'yellow' | 'red' | 'green' | 'blue'
  x: number
  y: number
}

interface UML {
  id: string
  name: string
  attributes: Array<{
    id: string
    name: string
    type: string
    isVisible: boolean
  }>
  methods: Array<{
    id: string
    name: string
    parameters: string
    returnType: string
    isVisible: boolean
  }>
  x: number
  y: number
}

interface Connection {
  id: string
  fromId: string
  toId: string
  fromX: number
  fromY: number
  toX: number
  toY: number
}

export default function AiraWorkspace() {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState<{ cardId: string; x: number; y: number; pointType: 'left' | 'right' } | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      title: 'Authentication and Database',
      description: 'Setup OAuth login and a fast CRUD database.',
      assignee: 'Rayyan',
      techStacks: ['Next.js', 'Supabase'],
      dueDate: 'January 25th, 2025',
      isCompleted: true,
      statusColor: 'yellow',
      x: 100,
      y: 100
    },
    {
      id: 'task-2',
      title: 'Github and Discord integration',
      description: 'Link tasks to Github and track them through Discord',
      assignee: 'Rayyan',
      techStacks: ['GitHub API', 'Discord.js'],
      dueDate: 'January 25th, 2025',
      isCompleted: true,
      statusColor: 'red',
      x: 500,
      y: 100
    },
    {
      id: 'task-3',
      title: 'Front-end Development',
      description: 'Build the drag-and-drop interface with React',
      assignee: 'Rayyan',
      techStacks: ['React', 'TypeScript', 'Tailwind'],
      dueDate: 'January 26th, 2025',
      isCompleted: false,
      statusColor: 'blue',
      x: 300,
      y: 300
    }
  ])

  const [umls, setUMLs] = useState<UML[]>([
    {
      id: 'uml-1',
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
      x: 700,
      y: 200
    },
    {
      id: 'uml-2',
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
      x: 900,
      y: 400
    }
  ])

  const [connections, setConnections] = useState<Connection[]>([
    {
      id: 'conn-1',
      fromId: 'task-1',
      toId: 'task-2',
      fromX: 180,
      fromY: 100,
      toX: 500,
      toY: 100
    },
    {
      id: 'conn-2',
      fromId: 'task-1',
      toId: 'uml-1',
      fromX: 180,
      fromY: 100,
      toX: 700,
      toY: 200
    },
    {
      id: 'conn-3',
      fromId: 'task-3',
      toId: 'uml-2',
      fromX: 380,
      fromY: 300,
      toX: 900,
      toY: 400
    }
  ])


  const handleTaskMove = (id: string, x: number, y: number) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, x, y } : task
    ))
    setTimeout(() => updateConnectionPositions(id), 0)
  }

  const handleUMLMove = (id: string, x: number, y: number) => {
    setUMLs(prev => prev.map(uml => 
      uml.id === id ? { ...uml, x, y } : uml
    ))
    setTimeout(() => updateConnectionPositions(id), 0)
  }

  const handleTaskUpdate = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ))
  }

  const handleUMLUpdate = (id: string, updates: Partial<UML>) => {
    setUMLs(prev => prev.map(uml => 
      uml.id === id ? { ...uml, ...updates } : uml
    ))
  }

  const addNewTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: 'New Task',
      description: 'Task description...',
      techStacks: [],
      isCompleted: false,
      statusColor: 'blue',
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100
    }
    setTasks(prev => [...prev, newTask])
  }

  const addNewUML = () => {
    const newUML: UML = {
      id: `uml-${Date.now()}`,
      name: 'New Entity',
      attributes: [],
      methods: [],
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 400
    }
    setUMLs(prev => [...prev, newUML])
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3))
  }

  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!isConnecting) {
      setIsDragging(true)
      setDragStart({ 
        x: e.clientX - pan.x, 
        y: e.clientY - pan.y 
      })
      e.preventDefault()
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !isConnecting) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
      e.preventDefault()
    }
  }

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      setIsDragging(false)
      e.preventDefault()
    }
  }

  const handleCanvasMouseLeave = () => {
    setIsDragging(false)
  }

  const handleConnectionPointMouseDown = (cardId: string, x: number, y: number, pointType: 'left' | 'right') => {
    setIsConnecting(true)
    setConnectionStart({ cardId, x, y, pointType })
  }

  const handleConnectionPointMouseUp = (targetCardId: string, x: number, y: number, targetPointType: 'left' | 'right') => {
    if (isConnecting && connectionStart && connectionStart.cardId !== targetCardId) {
      // Check if a connection already exists between these two cards
      const existingConnection = connections.find(
        (conn) =>
          (conn.fromId === connectionStart.cardId && conn.toId === targetCardId) ||
          (conn.fromId === targetCardId && conn.toId === connectionStart.cardId)
      )

      if (!existingConnection) {
        setConnections(prevConnections => [
          ...prevConnections,
          {
            id: `conn-${Date.now()}`,
            fromId: connectionStart.cardId,
            toId: targetCardId,
            fromX: connectionStart.x,
            fromY: connectionStart.y,
            toX: x,
            toY: y,
          },
        ])
      }
    }
    setIsConnecting(false)
    setConnectionStart(null)
  }

  const handleMouseMoveForConnection = (e: MouseEvent) => {
    if (isConnecting) {
      const canvasElement = document.querySelector('.canvas-container') as HTMLElement
      if (canvasElement) {
        const canvasRect = canvasElement.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - canvasRect.left,
          y: e.clientY - canvasRect.top,
        })
      }
    }
  }

  const updateConnectionPositions = (movedCardId: string) => {
    setConnections(prevConnections =>
      prevConnections.map(conn => {
        const fromCard = [...tasks, ...umls].find(c => c.id === conn.fromId)
        const toCard = [...tasks, ...umls].find(c => c.id === conn.toId)

        let updatedConn = { ...conn }

        if (conn.fromId === movedCardId && fromCard) {
          const cardElement = document.querySelector(`[data-card-id="${movedCardId}"]`)
          if (cardElement) {
            const rect = cardElement.getBoundingClientRect()
            const canvasRect = document.querySelector('.canvas-container')?.getBoundingClientRect() || { left: 0, top: 0 }
            updatedConn.fromX = rect.right - canvasRect.left
            updatedConn.fromY = rect.top - canvasRect.top + rect.height / 2
          }
        }

        if (conn.toId === movedCardId && toCard) {
          const cardElement = document.querySelector(`[data-card-id="${movedCardId}"]`)
          if (cardElement) {
            const rect = cardElement.getBoundingClientRect()
            const canvasRect = document.querySelector('.canvas-container')?.getBoundingClientRect() || { left: 0, top: 0 }
            updatedConn.toX = rect.left - canvasRect.left
            updatedConn.toY = rect.top - canvasRect.top + rect.height / 2
          }
        }
        return updatedConn
      })
    )
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMoveForConnection)
    return () => {
      document.removeEventListener('mousemove', handleMouseMoveForConnection)
    }
  }, [isConnecting])

  return (
    <div className="h-full bg-white relative overflow-hidden">
      {/* Top Toolbar */}
      <div className="absolute top-4 right-4 flex space-x-2 z-20">
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

      {/* Main Canvas */}
      <div className="absolute inset-0 canvas-container">
        {/* Dotted Grid Background - Clickable for panning */}
        <div 
          className={`absolute inset-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{
            backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            zIndex: 1
          }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseLeave}
        />

        {/* Zoomed and Panned Container for Components */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            zIndex: 2
          }}
        >
          {/* Task Cards */}
          {tasks.map(task => (
            <div key={task.id} className="pointer-events-auto">
              <TaskCard
                {...task}
                onMove={handleTaskMove}
                onUpdate={handleTaskUpdate}
                onConnectionPointMouseDown={handleConnectionPointMouseDown}
                onConnectionPointMouseUp={handleConnectionPointMouseUp}
              />
            </div>
          ))}

          {/* UML Cards */}
          {umls.map(uml => (
            <div key={uml.id} className="pointer-events-auto">
              <UMLCard
                {...uml}
                onMove={handleUMLMove}
                onUpdate={handleUMLUpdate}
                onConnectionPointMouseDown={handleConnectionPointMouseDown}
                onConnectionPointMouseUp={handleConnectionPointMouseUp}
              />
            </div>
          ))}

          {/* Connections */}
          {connections.map(connection => (
            <ConnectionLine
              key={connection.id}
              id={connection.id}
              fromX={connection.fromX}
              fromY={connection.fromY}
              toX={connection.toX}
              toY={connection.toY}
            />
          ))}

          {/* Temporary connection line while dragging */}
          {isConnecting && connectionStart && (
            <ConnectionLine
              id="temp-connection"
              fromX={connectionStart.x}
              fromY={connectionStart.y}
              toX={mousePosition.x}
              toY={mousePosition.y}
            />
          )}
        </div>
      </div>

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

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-4 bg-gray-100 border border-gray-200 rounded-lg p-2 flex items-center space-x-2 z-20">
        <button 
          onClick={handleZoomOut}
          className="p-2 bg-white hover:bg-gray-50 text-gray-600 rounded-lg shadow-sm transition-colors"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="text-sm text-gray-600 px-2 min-w-12 text-center">{Math.round(zoom * 100)}%</span>
        <button 
          onClick={handleZoomIn}
          className="p-2 bg-white hover:bg-gray-50 text-gray-600 rounded-lg shadow-sm transition-colors"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button 
          onClick={handleResetView}
          className="p-2 bg-white hover:bg-gray-50 text-gray-600 rounded-lg shadow-sm transition-colors"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      {/* Mini-map */}
      <div className="absolute bottom-4 right-4 w-32 h-16 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center z-20">
        <span className="text-xs text-gray-500">Aira</span>
      </div>
    </div>
  )
}
