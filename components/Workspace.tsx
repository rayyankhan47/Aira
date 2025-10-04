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

interface WorkspaceProps {
  schemaId: string
  schemaType: 'agentic-workflow' | 'task-management' | 'mixed'
  boardId: string
}

export default function Workspace({ schemaId, schemaType, boardId }: WorkspaceProps) {
  const [activeView, setActiveView] = useState<ViewType>('split')
  const [activeProject, setActiveProject] = useState('current-schema')
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResults, setExecutionResults] = useState<any[]>([])
  const [workflowAgents, setWorkflowAgents] = useState<any[]>([])
  const [workflowConnections, setWorkflowConnections] = useState<any[]>([])
  
  const projects: Project[] = [
    {
      id: 'current-schema',
      name: 'Current Schema',
      description: `Active ${schemaType.replace('-', ' ')} schema`,
      createdAt: new Date().toISOString()
    }
  ]

  const handleWorkflowChange = (agents: any[], connections: any[]) => {
    setWorkflowAgents(agents)
    setWorkflowConnections(connections)
  }

  const handleRunWorkflow = async () => {
    setIsExecuting(true)
    setExecutionResults([])
    
    try {
      // For now, we'll use a simple test input
      // In a real implementation, you'd get this from user input or form
      const testInput = "Create a new feature for user authentication with login, signup, and password reset functionality"
      
      const response = await fetch('/api/execute-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connections: workflowConnections,
          agents: workflowAgents,
          initialInput: testInput,
          workflowGoal: "Build user authentication system",
          executeSingle: false
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setExecutionResults(data.results)
        console.log('Workflow executed successfully:', data.results)
      } else {
        console.error('Workflow execution failed:', data.error)
      }
    } catch (error) {
      console.error('Error running workflow:', error)
    } finally {
      setIsExecuting(false)
    }
  }

  // Determine default view based on schema type
  const getDefaultView = () => {
    switch (schemaType) {
      case 'agentic-workflow':
        return 'agentic'
      case 'task-management':
        return 'tasks'
      case 'mixed':
        return 'split'
      default:
        return 'split'
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full bg-gray-900 flex flex-col">
        {/* View Tabs */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveView('agentic')}
              className={`px-6 py-3 font-medium font-notion border-b-2 transition-colors ${
                activeView === 'agentic' 
                  ? 'border-purple-500 text-purple-400 bg-purple-900/20' 
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Brain className="h-4 w-4 inline mr-2" />
              Agentic Canvas
            </button>
            <button
              onClick={() => setActiveView('tasks')}
              className={`px-6 py-3 font-medium font-notion border-b-2 transition-colors ${
                activeView === 'tasks' 
                  ? 'border-green-500 text-green-400 bg-green-900/20' 
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <CheckSquare className="h-4 w-4 inline mr-2" />
              Task Canvas
            </button>
            <button
              onClick={() => setActiveView('split')}
              className={`px-6 py-3 font-medium font-notion border-b-2 transition-colors ${
                activeView === 'split' 
                  ? 'border-blue-500 text-blue-400 bg-blue-900/20' 
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700'
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
              <div className="flex-1 flex flex-col border-r border-gray-700">
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                  <h3 className="text-sm font-medium text-gray-300 font-notion flex items-center">
                    <Brain className="h-4 w-4 mr-2 text-purple-400" />
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
                  onWorkflowChange={handleWorkflowChange}
                />
              </div>

              {/* Bottom Panel - Task Canvas */}
              <div className="flex-1 flex flex-col">
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-300 font-notion flex items-center">
                      <CheckSquare className="h-4 w-4 mr-2 text-green-400" />
                      Task Management Canvas
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="font-notion bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Task
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 bg-white relative overflow-hidden">
                  {/* Canvas with black dots pattern */}
                  <div 
                    className="absolute inset-0 "
                    style={{
                      backgroundImage: `radial-gradient(circle, #000000 1px, transparent 1px)`,
                      backgroundSize: '20px 20px'
                    }}
                  />
                  
                  {/* Task Canvas Content */}
                  <div className="absolute inset-0 p-8">
                    {executionResults.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 font-notion mb-4">
                          Workflow Execution Results
                        </h3>
                        {executionResults.map((result, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 font-notion">
                                {result.data?.agentName || `Agent ${index + 1}`}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                result.success 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {result.success ? 'Success' : 'Error'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 font-notion whitespace-pre-wrap">
                              {result.output}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="bg-gray-100 rounded-lg p-8 max-w-md text-center shadow-sm border border-gray-200">
                          <CheckSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                          <p className="text-lg text-gray-700 font-notion mb-2">Tasks will appear here</p>
                          <p className="text-sm text-gray-600 font-notion">Run agentic workflows to auto-generate tasks, or add them manually</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Single View Modes */}
          {activeView === 'agentic' && (
            <div className="flex-1 flex flex-col">
              <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                <h3 className="text-sm font-medium text-gray-300 font-notion flex items-center">
                  <Brain className="h-4 w-4 mr-2 text-purple-400" />
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
                onWorkflowChange={handleWorkflowChange}
              />
            </div>
          )}

          {activeView === 'tasks' && (
            <div className="flex-1 flex flex-col">
              <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                <h3 className="text-sm font-medium text-gray-300 font-notion flex items-center">
                  <CheckSquare className="h-4 w-4 mr-2 text-green-400" />
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
                  <div className="flex items-center justify-center h-full">
                    <div className="bg-gray-100 rounded-lg p-8 max-w-md text-center shadow-sm border border-gray-200">
                      <CheckSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg text-gray-700 font-notion mb-2">Tasks will appear here</p>
                      <p className="text-sm text-gray-600 font-notion">Run agentic workflows to auto-generate tasks, or add them manually</p>
                    </div>
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
