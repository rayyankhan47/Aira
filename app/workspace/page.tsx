'use client'

import { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Button } from '@/components/ui/Button'
import AiraWorkspace from '@/components/AiraWorkspace'
import { useAuth } from '@/components/providers/AuthProvider'
import { FirebaseService } from '@/lib/firebase-service'
import { WorkflowExecutionService } from '@/lib/workflow-execution-service'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Brain, 
  Settings, 
  Save, 
  FolderOpen,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

export default function Workspace() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('project')
  
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Redirect to dashboard if no project specified
  useEffect(() => {
    if (!projectId) {
      router.push('/dashboard')
    }
  }, [projectId, router])

  // Load project data
  useEffect(() => {
    if (projectId && user) {
      loadProject()
    }
  }, [projectId, user])

  const loadProject = async () => {
    if (!projectId) return
    
    setLoading(true)
    try {
      const projectData = await FirebaseService.getProject(projectId)
      if (projectData) {
        setProject(projectData)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error loading project:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h1>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-white flex flex-col">
        {/* Top Header */}
        <header className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {saveStatus === 'saving' ? (
              <Button 
                variant="outline" 
                size="sm" 
                disabled
                className="font-notion bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <Link href="/dashboard">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="font-notion bg-transparent border-gray-300 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
            )}
            
            {/* Project Info */}
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 font-medium font-notion">{project.name}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="font-notion bg-transparent border-gray-300 text-gray-600 hover:bg-gray-200 hover:text-gray-900">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Main Workspace */}
        <div className="flex-1">
          <AiraWorkspace 
            projectId={projectId!}
            initialWorkspaceData={project.workspaceData}
            onSaveStatusChange={setSaveStatus}
          />
        </div>
      </div>
    </DndProvider>
  )
}