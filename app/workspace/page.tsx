'use client'

import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Button } from '@/components/ui/Button'
import AiraWorkspace from '@/components/AiraWorkspace'
import { 
  Brain, 
  Settings, 
  Save, 
  FolderOpen
} from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  createdAt: string
}

export default function Workspace() {
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
      <div className="h-screen bg-white flex flex-col">
        {/* Top Header */}
        <header className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900 font-notion">Aira</span>
            </div>
            
            {/* Project Selector */}
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4 text-gray-400" />
              <select 
                value={activeProject}
                onChange={(e) => setActiveProject(e.target.value)}
                className="bg-transparent border-none text-gray-600 font-medium font-notion focus:outline-none"
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
            <Button variant="outline" size="sm" className="font-notion bg-transparent border-gray-300 text-gray-600 hover:bg-gray-200 hover:text-gray-900">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="font-notion bg-transparent border-gray-300 text-gray-600 hover:bg-gray-200 hover:text-gray-900">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Main Workspace */}
        <div className="flex-1">
          <AiraWorkspace />
        </div>
      </div>
    </DndProvider>
  )
}