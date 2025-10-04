'use client'

import { useState } from 'react'
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
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      title: 'Authentication and Database',
      description: 'Setup OAuth login and a fast CRUD database.',
      assignee: 'Rodolphe Kouyoumdjian',
      techStacks: ['Firebase', 'MongoDB'],
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
      assignee: 'Rodolphe Kouyoumdjian',
      techStacks: ['GitHub Actions'],
      dueDate: 'January 25th, 2025',
      isCompleted: true,
      statusColor: 'red',
      x: 500,
      y: 100
    }
  ])

  const [umls, setUMLs] = useState<UML[]>([
    {
      id: 'uml-1',
      name: 'User',
      attributes: [
        { id: 'attr-1', name: 'name', type: 'string', isVisible: true },
        { id: 'attr-2', name: 'email', type: 'string', isVisible: true }
      ],
      methods: [
        { id: 'method-1', name: 'eatWatermelon', parameters: 'melon: juicy', returnType: 'PS5', isVisible: true }
      ],
      x: 300,
      y: 400
    }
  ])

  const [connections, setConnections] = useState<Connection[]>([
    {
      id: 'conn-1',
      fromId: 'task-1',
      toId: 'task-2',
      fromX: 264, // task-1 center + width/2
      fromY: 200, // task-1 bottom
      toX: 564, // task-2 center
      toY: 150  // task-2 top
    },
    {
      id: 'conn-2',
      fromId: 'task-1',
      toId: 'uml-1',
      fromX: 264, // task-1 center
      fromY: 200, // task-1 bottom
      toX: 464, // uml-1 center
      toY: 400  // uml-1 top
    }
  ])

  const updateConnectionPositions = () => {
    setConnections(prev => prev.map(conn => {
      const fromItem = [...tasks, ...umls].find(item => item.id === conn.fromId)
      const toItem = [...tasks, ...umls].find(item => item.id === conn.toId)
      
      if (fromItem && toItem) {
        return {
          ...conn,
          fromX: fromItem.x + 132, // Approximate center
          fromY: fromItem.y + 100, // Approximate bottom
          toX: toItem.x + 160, // Approximate center
          toY: toItem.y // Top
        }
      }
      return conn
    }))
  }

  const handleTaskMove = (id: string, x: number, y: number) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, x, y } : task
    ))
    setTimeout(updateConnectionPositions, 0)
  }

  const handleUMLMove = (id: string, x: number, y: number) => {
    setUMLs(prev => prev.map(uml => 
      uml.id === id ? { ...uml, x, y } : uml
    ))
    setTimeout(updateConnectionPositions, 0)
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

  return (
    <div className="h-full bg-white relative overflow-hidden">
      {/* Left Sidebar */}
      <div className="absolute left-0 top-0 h-full w-16 bg-gray-800 flex flex-col items-center py-4 space-y-4 z-20">
        <button className="p-2 text-gray-400 hover:text-white transition-colors">
          <Plus className="h-6 w-6" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white transition-colors">
          <Settings className="h-6 w-6" />
        </button>
      </div>

      {/* Right Sidebar */}
      <div className="absolute right-0 top-0 h-full w-16 bg-gray-800 flex flex-col items-center py-4 space-y-4 z-20">
        <button className="p-2 text-gray-400 hover:text-white transition-colors">
          <Camera className="h-6 w-6" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white transition-colors">
          <Download className="h-6 w-6" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white transition-colors">
          <Printer className="h-6 w-6" />
        </button>
      </div>

      {/* Main Canvas */}
      <div className="absolute inset-0 ml-16 mr-16">
        {/* Dotted Grid Background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, #9ca3af 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Add Buttons */}
        <div className="absolute top-4 left-20 flex space-x-2 z-10">
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

        {/* Task Cards */}
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            {...task}
            onMove={handleTaskMove}
            onUpdate={handleTaskUpdate}
          />
        ))}

        {/* UML Cards */}
        {umls.map(uml => (
          <UMLCard
            key={uml.id}
            {...uml}
            onMove={handleUMLMove}
            onUpdate={handleUMLUpdate}
          />
        ))}

        {/* Connections */}
        {connections.map(connection => (
          <ConnectionLine
            key={connection.id}
            fromX={connection.fromX}
            fromY={connection.fromY}
            toX={connection.toX}
            toY={connection.toY}
          />
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-16 right-16 bg-gray-100 border-t border-gray-200 p-2 flex items-center justify-between z-20">
        {/* Left: Zoom Controls */}
        <div className="flex items-center space-x-2">
          <button className="p-1 text-gray-600 hover:text-gray-900">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-600 px-2">100%</span>
          <button className="p-1 text-gray-600 hover:text-gray-900">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button className="p-1 text-gray-600 hover:text-gray-900 ml-2">
            <Maximize className="h-4 w-4" />
          </button>
          <button className="p-1 text-gray-600 hover:text-gray-900">
            <Lock className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Mini-map placeholder */}
        <div className="w-32 h-16 bg-gray-200 border border-gray-300 rounded flex items-center justify-center">
          <span className="text-xs text-gray-500">Plano</span>
        </div>
      </div>
    </div>
  )
}
