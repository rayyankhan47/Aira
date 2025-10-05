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
  coupledAgenticWorkflowIds?: string[]
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
  const [selectedWorkflowIds, setSelectedWorkflowIds] = useState<string[]>([])
  const [originalWorkflowIds, setOriginalWorkflowIds] = useState<string[]>([])
  const [deletingWorkflowId, setDeletingWorkflowId] = useState<string | null>(null)

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
        coupledAgenticWorkflowIds: project.coupledAgenticWorkflowIds || []
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

  const handleOpenCoupleModal = (projectId: string) => {
    const project = boards.find(b => b.id === projectId)
    if (project) {
      const currentWorkflowIds = project.coupledAgenticWorkflowIds || []
      setOriginalWorkflowIds([...currentWorkflowIds])
      setSelectedWorkflowIds([...currentWorkflowIds])
      setShowCoupleModal(projectId)
    }
  }

  const handleWorkflowToggle = (workflowId: string) => {
    setSelectedWorkflowIds(prev => {
      if (prev.includes(workflowId)) {
        return prev.filter(id => id !== workflowId)
      } else {
        return [...prev, workflowId]
      }
    })
  }

  const handleSaveCoupling = async (projectId: string) => {
    try {
      await FirebaseService.updateProjectCoupledWorkflows(projectId, selectedWorkflowIds)
      setShowCoupleModal(null)
      setSelectedWorkflowIds([])
      setOriginalWorkflowIds([])
      loadUserProjects() // Reload to show coupled status
    } catch (error) {
      console.error('Error updating project couplings:', error)
    }
  }

  const hasChanges = () => {
    return JSON.stringify(selectedWorkflowIds.sort()) !== JSON.stringify(originalWorkflowIds.sort())
  }

  const handleDeleteAgenticWorkflow = async (workflowId: string, workflowName: string) => {
    const confirmed = confirm(`Are you sure you want to delete "${workflowName}"? This action cannot be undone.`)
    if (!confirmed) return

    setDeletingWorkflowId(workflowId)
    try {
      await FirebaseService.deleteAgenticWorkflow(workflowId)
      
      // Remove from local state
      setAgenticAiras(prev => prev.filter(workflow => workflow.id !== workflowId))
      
      // Remove from any coupled projects
      const updatedBoards = boards.map((board: any) => {
        if (board.coupledAgenticWorkflowIds?.includes(workflowId)) {
          return {
            ...board,
            coupledAgenticWorkflowIds: board.coupledAgenticWorkflowIds.filter((id: string) => id !== workflowId)
          }
        }
        return board
      })
      setBoards(updatedBoards)
      
      alert('Agentic workflow deleted successfully!')
    } catch (error) {
      console.error('Error deleting agentic workflow:', error)
      alert('Error deleting agentic workflow')
    } finally {
      setDeletingWorkflowId(null)
    }
  }

  const handleClearAgenticActions = async () => {
    const confirmed = confirm('Are you sure you want to clear all agentic actions? This action cannot be undone.')
    if (!confirmed) return

    try {
      await FirebaseService.clearAllAgenticActions()
      setAgenticActions([])
      alert('All agentic actions cleared successfully!')
    } catch (error) {
      console.error('Error clearing agentic actions:', error)
      alert('Error clearing agentic actions')
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
                {board.coupledAgenticWorkflowIds && board.coupledAgenticWorkflowIds.length > 0 && (
                  <div className="flex items-center text-green-600 mb-4">
                    <Bot className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      Coupled with {board.coupledAgenticWorkflowIds.length} AI workflow{board.coupledAgenticWorkflowIds.length > 1 ? 's' : ''}
                    </span>
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
                    onClick={() => handleOpenCoupleModal(board.id)}
                    className={`px-3 py-2 rounded-lg font-medium text-sm ${
                      board.coupledAgenticWorkflowIds && board.coupledAgenticWorkflowIds.length > 0
                        ? 'border-green-300 text-green-600 hover:bg-green-50' 
                        : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    {board.coupledAgenticWorkflowIds && board.coupledAgenticWorkflowIds.length > 0 ? 'Manage Couplings' : 'Couple with Agentic Aira'}
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
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
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
                  <button
                    onClick={() => handleDeleteAgenticWorkflow(agenticAira.id, agenticAira.name)}
                    disabled={deletingWorkflowId === agenticAira.id}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete workflow"
                  >
                    {deletingWorkflowId === agenticAira.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
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
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleClearAgenticActions}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 px-3 py-1 text-sm"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
              <div className="flex items-center text-gray-500">
                <Activity className="h-5 w-5 mr-2" />
                <span className="text-sm">Recent AI Activity</span>
              </div>
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
                        {new Date(action.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Agentic Workflow Couplings</h3>
              <p className="text-gray-600 mb-6">
                Select which agentic workflows should automatically run when tasks are created or completed in this project.
              </p>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {agenticAiras.map((agenticAira) => (
                  <label key={agenticAira.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedWorkflowIds.includes(agenticAira.id)}
                      onChange={() => handleWorkflowToggle(agenticAira.id)}
                      className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center">
                        <Bot className="h-4 w-4 mr-2 text-purple-600" />
                        {agenticAira.name}
                      </div>
                      <div className="text-sm text-gray-600">{agenticAira.description}</div>
                    </div>
                  </label>
                ))}
                {agenticAiras.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No agentic workflows created yet.</p>
                    <Link href="/agentic-workspace">
                      <button className="mt-2 text-purple-600 hover:text-purple-700 font-medium">
                        Create your first workflow →
                      </button>
                    </Link>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCoupleModal(null)
                    setSelectedWorkflowIds([])
                    setOriginalWorkflowIds([])
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (hasChanges()) {
                      const confirmed = confirm(
                        `Are you sure you want to ${selectedWorkflowIds.length > originalWorkflowIds.length ? 'add' : selectedWorkflowIds.length < originalWorkflowIds.length ? 'remove' : 'change'} workflow coupling${Math.abs(selectedWorkflowIds.length - originalWorkflowIds.length) > 1 ? 's' : ''}?`
                      )
                      if (confirmed) {
                        handleSaveCoupling(showCoupleModal)
                      }
                    } else {
                      setShowCoupleModal(null)
                      setSelectedWorkflowIds([])
                      setOriginalWorkflowIds([])
                    }
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    hasChanges() 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!hasChanges()}
                >
                  {hasChanges() ? 'Save Changes' : 'No Changes'}
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
