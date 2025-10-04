'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Plus, FolderOpen, Users, Calendar, ArrowLeft, Settings, Share2, CheckSquare, Database } from 'lucide-react'
import Link from 'next/link'

interface Schema {
  id: string
  name: string
  description: string
  type: 'task-management' | 'uml-design' | 'project-planning'
  created_at: string
  updated_at: string
  task_count: number
  diagram_count: number
}

interface BoardInfo {
  id: string
  name: string
  description: string
  is_public: boolean
  member_count: number
  created_at: string
}

export default function BoardPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.boardId as string
  
  const [boardInfo, setBoardInfo] = useState<BoardInfo | null>(null)
  const [schemas, setSchemas] = useState<Schema[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data - will be replaced with database calls
    setTimeout(() => {
      setBoardInfo({
        id: boardId,
        name: 'McHacks 2025',
        description: 'The world famous McHacks Hackathon! Building Aira - the visual workspace for seamless project management.',
        is_public: false,
        member_count: 1,
        created_at: '2025-01-26T00:00:00Z'
      })
      
      setSchemas([
        {
          id: 'task-management',
          name: 'Task Management',
          description: 'Visual task tracking and project management with drag-and-drop interface',
          type: 'task-management',
          created_at: '2025-01-26T10:00:00Z',
          updated_at: '2025-01-26T15:30:00Z',
          task_count: 8,
          diagram_count: 0
        },
        {
          id: 'uml-design',
          name: 'UML Design',
          description: 'System architecture and UML diagram design',
          type: 'uml-design',
          created_at: '2025-01-26T11:00:00Z',
          updated_at: '2025-01-26T14:20:00Z',
          task_count: 3,
          diagram_count: 5
        },
        {
          id: 'project-planning',
          name: 'Project Planning',
          description: 'Mixed workspace combining task management with system design',
          type: 'project-planning',
          created_at: '2025-01-26T12:00:00Z',
          updated_at: '2025-01-26T16:45:00Z',
          task_count: 12,
          diagram_count: 2
        }
      ])
      
      setIsLoading(false)
    }, 1000)
  }, [boardId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSchemaIcon = (type: string) => {
    switch (type) {
      case 'task-management':
        return <CheckSquare className="h-5 w-5 text-green-600" />
      case 'uml-design':
        return <Database className="h-5 w-5 text-blue-600" />
      case 'project-planning':
        return <FolderOpen className="h-5 w-5 text-purple-600" />
      default:
        return <FolderOpen className="h-5 w-5 text-gray-500" />
    }
  }

  const getSchemaColor = (type: string) => {
    switch (type) {
      case 'task-management':
        return 'bg-green-100 border-green-200'
      case 'uml-design':
        return 'bg-blue-100 border-blue-200'
      case 'project-planning':
        return 'bg-purple-100 border-purple-200'
      default:
        return 'bg-gray-100 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 bg-blue-100 rounded-full mx-auto mb-4 animate-pulse flex items-center justify-center">
            <FolderOpen className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-gray-600 font-notion">Loading board...</p>
        </div>
      </div>
    )
  }

  if (!boardInfo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 font-notion mb-2">Board not found</h1>
          <p className="text-gray-600 font-notion mb-4">The board you're looking for doesn't exist.</p>
          <Link href="/dashboard">
            <Button className="font-notion bg-blue-600 hover:bg-blue-700 text-white">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 mb-4">
            <Link href="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-notion">Dashboard</span>
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-notion">{boardInfo.name}</span>
          </div>

          {/* Board Info */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-notion mb-2">
                {boardInfo.name}
              </h1>
              <p className="text-gray-600 font-notion mb-4 max-w-2xl">
                {boardInfo.description}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{boardInfo.member_count} member{boardInfo.member_count !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDate(boardInfo.created_at)}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  boardInfo.is_public 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  {boardInfo.is_public ? 'Public' : 'Private'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" className="font-notion bg-transparent border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" className="font-notion bg-transparent border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button className="font-notion bg-blue-600 hover:bg-blue-700 text-white border-0">
                <Plus className="h-4 w-4 mr-2" />
                New Schema
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Schemas Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 font-notion">Schemas</h2>
            <p className="text-gray-600 font-notion">
              {schemas.length} schema{schemas.length !== 1 ? 's' : ''} in this board
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemas.map((schema) => (
              <Link 
                key={schema.id} 
                href={`/workspace`}
                className="block"
              >
                <div className={`bg-white rounded-xl p-6 hover:bg-gray-50 transition-colors border shadow-sm ${getSchemaColor(schema.type)}`}>
                  {/* Schema Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getSchemaColor(schema.type)}`}>
                        {getSchemaIcon(schema.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 font-notion">
                          {schema.name}
                        </h3>
                        <span className="text-xs text-gray-500 font-notion capitalize">
                          {schema.type.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Schema Description */}
                  <p className="text-gray-600 font-notion text-sm mb-4 line-clamp-2">
                    {schema.description}
                  </p>

                  {/* Schema Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      {schema.task_count > 0 && (
                        <div className="flex items-center space-x-1">
                          <CheckSquare className="h-4 w-4" />
                          <span>{schema.task_count} task{schema.task_count !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {schema.diagram_count > 0 && (
                        <div className="flex items-center space-x-1">
                          <Database className="h-4 w-4" />
                          <span>{schema.diagram_count} diagram{schema.diagram_count !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs">
                      {formatDate(schema.updated_at)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Create New Schema Card */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-gray-400 transition-colors cursor-pointer">
              <div className="text-center">
                <div className="p-3 bg-gray-200 rounded-lg w-fit mx-auto mb-4">
                  <Plus className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 font-notion mb-2">
                  Create New Schema
                </h3>
                <p className="text-gray-500 font-notion text-sm">
                  Start a new workspace for tasks and diagrams
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State (if no schemas) */}
        {schemas.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 font-notion mb-2">
              No schemas yet
            </h3>
            <p className="text-gray-500 font-notion mb-6">
              Create your first schema to start managing tasks and designing diagrams
            </p>
            <Button className="font-notion bg-blue-600 hover:bg-blue-700 text-white border-0">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Schema
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
