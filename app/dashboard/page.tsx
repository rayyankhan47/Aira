'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Plus, Users, Link as LinkIcon, ArrowLeft, Settings, Trash2, Bot, Activity, CheckCircle, Clock, Zap } from 'lucide-react'
import Link from 'next/link'
import FirebaseTest from '@/components/FirebaseTest'
import { useAuth } from '@/components/providers/AuthProvider'
import { FirebaseService, AgenticWorkflow, AgenticAction } from '@/lib/firebase-service'
import { useRouter } from 'next/navigation'

interface AiraBoard {
  id: string
  name: string
  description: string
  owner: string
  coupledAgenticAira?: string
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const [boards, setBoards] = useState<AiraBoard[]>([])
  const [agenticAiras, setAgenticAiras] = useState<AgenticWorkflow[]>([])
  const [agenticActions, setAgenticActions] = useState<AgenticAction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Load user's projects when user is authenticated
  useEffect(() => {
    if (user) {
      loadUserProjects()
      loadAgenticAiras()
      loadAgenticActions()
    }
  }, [user])

  const [showCreateProject, setShowCreateProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [showFirebaseTest, setShowFirebaseTest] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showCoupleModal, setShowCoupleModal] = useState<string | null>(null)

  const loadUserProjects = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const projects = await FirebaseService.getUserProjects(user.uid)
      setBoards(projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description || '',
        owner: user.displayName || user.email || 'Unknown',
        coupledAgenticAira: project.coupledAgenticWorkflowId || undefined
      })))
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim() || !user) return

    try {
      const project = await FirebaseService.createProject(
        user.uid,
        newProjectName.trim(),
        newProjectDescription.trim()
      )
      
      setNewProjectName('')
      setNewProjectDescription('')
      setShowCreateProject(false)
      loadUserProjects() // Reload projects
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!user) return

    try {
      await FirebaseService.deleteProject(projectId)
      setShowDeleteConfirm(null)
      loadUserProjects() // Reload projects
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const loadAgenticAiras = async () => {
    if (!user) return
    
    try {
      const workflows = await FirebaseService.getUserAgenticWorkflows(user.uid)
      setAgenticAiras(workflows)
    } catch (error) {
      console.error('Error loading agentic workflows:', error)
    }
  }

  const loadAgenticActions = async () => {
    if (!user) return
    
    try {
      const actions = await FirebaseService.getUserAgenticActions(user.uid)
      setAgenticActions(actions)
    } catch (error) {
      console.error('Error loading agentic actions:', error)
    }
  }

  const handleCoupleAgenticAira = async (projectId: string, agenticAiraId: string) => {
    try {
      await FirebaseService.coupleProjectWithWorkflow(projectId, agenticAiraId)
      setShowCoupleModal(null)
      loadUserProjects() // Reload to show coupled status
    } catch (error) {
      console.error('Error coupling agentic workflow:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="outline" size="sm" className="font-notion bg-transparent border-gray-300 text-gray-600 hover:bg-gray-200 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          
          {/* Debug Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFirebaseTest(!showFirebaseTest)}
            className="font-notion bg-transparent border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            title="Toggle Firebase Debug Panel"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8 max-w-7xl mx-auto">
        {/* Your Airas Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Your Airas
            </h1>
          </div>

        {/* Firebase Test Component - Hidden by default */}
        {showFirebaseTest && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Firebase Debug Panel</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFirebaseTest(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            <FirebaseTest />
          </div>
        )}

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <Button 
              onClick={() => setShowCreateProject(true)}
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Project
            </Button>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div key={board.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                {/* Board Header */}
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {board.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-800 rounded-md flex items-center justify-center">
                      <LinkIcon className="h-4 w-4 text-white" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(board.id)}
                      className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                      title="Delete Project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Board Description */}
                <p className="text-gray-600 mb-4">
                  {board.description}
                </p>

                {/* Owner Info */}
                <div className="flex items-center text-gray-500 mb-6">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Owner: {board.owner}</span>
                </div>

                {/* Coupling Status */}
                {board.coupledAgenticAira && (
                  <div className="flex items-center text-green-600 mb-4">
                    <Bot className="h-4 w-4 mr-2" />
                    <span className="text-sm">Coupled with AI Assistant</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Link href={`/workspace?project=${board.id}`}>
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium">
                      Open Project
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCoupleModal(board.id)}
                    className={`px-3 py-2 rounded-lg font-medium text-sm ${
                      board.coupledAgenticAira 
                        ? 'border-green-300 text-green-600 hover:bg-green-50' 
                        : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    {board.coupledAgenticAira ? 'Reconfigure' : 'Couple with Agentic Aira'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Create Project Modal */}
        {showCreateProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Project</h3>
              <form onSubmit={handleCreateProject}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                      Project Name
                    </label>
                    <input
                      id="projectName"
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700">
                      Description (Optional)
                    </label>
                    <textarea
                      id="projectDescription"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter project description"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateProject(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Your Agentic Airas Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Agentic Airas
            </h2>
            <Button 
              onClick={() => router.push('/agentic-workspace')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Agentic Workflow
            </Button>
          </div>

          {/* Agentic Airas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agenticAiras.map((agenticAira) => (
              <div key={agenticAira.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Bot className="h-5 w-5 mr-2 text-purple-600" />
                    {agenticAira.name}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  {agenticAira.description}
                </p>
                <div className="flex items-center text-gray-500 mb-4">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Owner: {user?.displayName || user?.email || 'Unknown'}</span>
                </div>
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg font-medium"
                  onClick={() => router.push(`/agentic-workspace?workflow=${agenticAira.id}`)}
                >
                  Edit Workflow
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Agentic Actions Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Agentic Actions
            </h2>
            <div className="flex items-center text-gray-500">
              <Activity className="h-5 w-5 mr-2" />
              <span className="text-sm">Recent AI Activity</span>
            </div>
          </div>

          {/* Actions Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {agenticActions.map((action) => (
                    <tr key={action.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {action.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                            {action.status === 'loading' && <Clock className="h-5 w-5 text-yellow-500 animate-spin" />}
                            {action.status === 'error' && <div className="h-5 w-5 rounded-full bg-red-500" />}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {action.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Bot className="h-4 w-4 mr-2 text-purple-600" />
                          <span className="text-sm text-gray-900">{action.agent}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          action.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : action.status === 'loading'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {action.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {action.timestamp.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Couple Agentic Aira Modal */}
        {showCoupleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Couple with Agentic Aira</h3>
              <p className="text-gray-600 mb-6">
                Select an agentic workflow to automatically run when tasks are created or completed in this project.
              </p>
              <div className="space-y-3">
                {agenticAiras.map((agenticAira) => (
                  <label key={agenticAira.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="agenticAira"
                      value={agenticAira.id}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{agenticAira.name}</div>
                      <div className="text-sm text-gray-600">{agenticAira.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCoupleModal(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const selectedRadio = document.querySelector('input[name="agenticAira"]:checked') as HTMLInputElement
                    if (selectedRadio) {
                      handleCoupleAgenticAira(showCoupleModal, selectedRadio.value)
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Couple Workflow
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Project</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this project? This action cannot be undone and will permanently remove all tasks, UML diagrams, and connections.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProject(showDeleteConfirm)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
