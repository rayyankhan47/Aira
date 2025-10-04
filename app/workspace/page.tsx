'use client'

import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Button } from '@/components/ui/Button'
import AgentPalette from '@/components/AgentPalette'
import DroppableCanvas from '@/components/DroppableCanvas'
import { 
  Brain, 
  CheckSquare, 
  Plus, 
  Settings, 
  Play, 
  Save, 
  FolderOpen
} from 'lucide-react'

type ViewType = 'agentic' | 'tasks' | 'split'

interface Project {
  id: string
  name: string
  description: string
  createdAt: string
}

export default function Workspace() {
  const [activeView, setActiveView] = useState<ViewType>('split')
  const [activeProject, setActiveProject] = useState('mchacks-2025')
  
  const projects: Project[] = [
    {
      id: 'mchacks-2025',
      name: 'McHacks 2025',
      description: 'The world famous McHacks Hackathon!',
      createdAt: '2025-01-26'
    },
    {
      id: 'portfolio',
      name: 'Portfolio Website',
      description: 'Personal portfolio and resume site',
      createdAt: '2025-01-25'
    },
    {
      id: 'ai-research',
      name: 'AI Research Paper',
      description: 'Academic research on agentic AI systems',
      createdAt: '2025-01-24'
    }
  ]

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900 font-notion">Aira</span>
          </div>
          
          {/* Project Selector */}
          <div className="flex items-center space-x-2">
            <FolderOpen className="h-4 w-4 text-gray-500" />
            <select 
              value={activeProject}
              onChange={(e) => setActiveProject(e.target.value)}
              className="bg-transparent border-none text-gray-700 font-medium font-notion focus:outline-none"
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="font-notion">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm" className="font-notion">
            <Play className="h-4 w-4 mr-2" />
            Run Workflow
          </Button>
          <Button variant="outline" size="sm" className="font-notion">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* View Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveView('agentic')}
            className={`px-6 py-3 font-medium font-notion border-b-2 transition-colors ${
              activeView === 'agentic' 
                ? 'border-blue-600 text-blue-600 bg-blue-50' 
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
          >
            <Brain className="h-4 w-4 inline mr-2" />
            Agentic Canvas
          </button>
          <button
            onClick={() => setActiveView('tasks')}
            className={`px-6 py-3 font-medium font-notion border-b-2 transition-colors ${
              activeView === 'tasks' 
                ? 'border-green-600 text-green-600 bg-green-50' 
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
          >
            <CheckSquare className="h-4 w-4 inline mr-2" />
            Task Canvas
          </button>
          <button
            onClick={() => setActiveView('split')}
            className={`px-6 py-3 font-medium font-notion border-b-2 transition-colors ${
              activeView === 'split' 
                ? 'border-purple-600 text-purple-600 bg-purple-50' 
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
          >
            Split View
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {activeView === 'split' && (
          <>
            {/* Top Panel - Agentic Canvas */}
            <div className="flex-1 flex flex-col border-r border-gray-200">
              <div className="bg-white px-4 py-2 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 font-notion flex items-center">
                  <Brain className="h-4 w-4 mr-2 text-blue-600" />
                  Agentic Workflow Canvas
                </h3>
              </div>
              {/* Agent Palette */}
              <AgentPalette />
              
              {/* Droppable Canvas */}
              <DroppableCanvas
                title="Agentic Workflow Canvas"
                emptyStateIcon={Brain}
                emptyStateTitle="Drag AI agents here to build workflows"
                emptyStateDescription="Connect agents to create intelligent automation pipelines"
              />
            </div>

            {/* Bottom Panel - Task Canvas */}
            <div className="flex-1 flex flex-col">
              <div className="bg-white px-4 py-2 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700 font-notion flex items-center">
                    <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                    Task Management Canvas
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="font-notion">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Task
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Project Tabs */}
              <div className="bg-white border-b border-gray-200">
                <div className="flex">
                  {projects.map(project => (
                    <button
                      key={project.id}
                      onClick={() => setActiveProject(project.id)}
                      className={`px-4 py-2 text-sm font-medium font-notion border-b-2 transition-colors ${
                        activeProject === project.id
                          ? 'border-green-600 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {project.name}
                    </button>
                  ))}
                  <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 font-notion">
                    <Plus className="h-3 w-3 mr-1 inline" />
                    New Project
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-white relative overflow-hidden">
                {/* Canvas with dots pattern */}
                <div 
                  className="absolute inset-0 "
                  style={{
                    backgroundImage: `radial-gradient(circle, #000000 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                  }}
                />
                
                {/* Task Canvas Content */}
                <div className="absolute inset-0 p-8">
                  <div className="text-center text-gray-400 mt-20 font-notion">
                    <CheckSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Tasks will appear here</p>
                    <p className="text-sm mt-2">Run agentic workflows to auto-generate tasks, or add them manually</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Single View Modes */}
        {activeView === 'agentic' && (
          <div className="flex-1 flex flex-col">
            <div className="bg-white px-4 py-2 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 font-notion flex items-center">
                <Brain className="h-4 w-4 mr-2 text-blue-600" />
                Agentic Workflow Canvas
              </h3>
            </div>
            {/* Agent Palette */}
            <AgentPalette />
            
            {/* Droppable Canvas */}
            <DroppableCanvas
              title="Agentic Workflow Canvas"
              emptyStateIcon={Brain}
              emptyStateTitle="Drag AI agents here to build workflows"
              emptyStateDescription="Connect agents to create intelligent automation pipelines"
            />
          </div>
        )}

        {activeView === 'tasks' && (
          <div className="flex-1 flex flex-col">
            <div className="bg-white px-4 py-2 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 font-notion flex items-center">
                <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                Task Management Canvas
              </h3>
            </div>
            <div className="flex-1 bg-white relative overflow-hidden">
              <div 
                className="absolute inset-0 "
                style={{
                  backgroundImage: `radial-gradient(circle, #000000 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}
              />
              <div className="absolute inset-0 p-8">
                <div className="text-center text-gray-400 mt-20 font-notion">
                  <CheckSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Tasks will appear here</p>
                  <p className="text-sm mt-2">Run agentic workflows to auto-generate tasks, or add them manually</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </DndProvider>
  )
}
