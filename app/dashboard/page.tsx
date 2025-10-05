'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Plus, Users, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import FirebaseTest from '@/components/FirebaseTest'
import { useAuth } from '@/components/providers/AuthProvider'
import { FirebaseService } from '@/lib/firebase-service'
import { useRouter } from 'next/navigation'

interface AiraBoard {
  id: string
  name: string
  description: string
  owner: string
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const [boards, setBoards] = useState<AiraBoard[]>([])
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
    }
  }, [user])

  const [showCreateProject, setShowCreateProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')

  const loadUserProjects = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const projects = await FirebaseService.getUserProjects(user.uid)
      setBoards(projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        owner: user.displayName || user.email || 'Unknown'
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
        <div className="flex items-center">
          <div className="w-6 h-6 mr-3">
            <div className="w-full h-full bg-gray-800 rounded-sm flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
          </div>
          <span className="text-xl font-medium text-gray-900">
            Aira
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Your Aira Boards
        </h1>

        {/* Firebase Test Component */}
        <div className="mb-8">
          <FirebaseTest />
        </div>

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

        {/* Board Card */}
        {boards.map((board) => (
          <div key={board.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm max-w-md">
            {/* Board Header */}
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {board.name}
              </h2>
              <div className="w-8 h-8 bg-gray-800 rounded-md flex items-center justify-center">
                <LinkIcon className="h-4 w-4 text-white" />
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

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link href={`/workspace?project=${board.id}`}>
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium">
                  Open Project
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
