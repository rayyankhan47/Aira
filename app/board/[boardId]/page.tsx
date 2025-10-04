'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Brain, Plus, FolderOpen, Users, Calendar, ArrowLeft, Settings, Share2 } from 'lucide-react'
import Link from 'next/link'

interface Schema {
  id: string
  name: string
  description: string
  type: 'agentic-workflow' | 'task-management' | 'mixed'
  created_at: string
  updated_at: string
  workflow_count: number
  task_count: number
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
        description: 'The world famous McHacks Hackathon! Building Aira - the agentic AI workspace for seamless project management.',
        is_public: false,
        member_count: 1,
        created_at: '2025-01-26T00:00:00Z'
      })
      
      setSchemas([
        {
          id: 'agentic-workflows',
          name: 'Agentic Workflows',
          description: 'AI-powered workflow automation and orchestration',
          type: 'agentic-workflow',
          created_at: '2025-01-26T10:00:00Z',
          updated_at: '2025-01-26T15:30:00Z',
          workflow_count: 3,
          task_count: 0
        },
        {
          id: 'task-management',
          name: 'Task Management',
          description: 'Traditional task tracking and project management',
          type: 'task-management',
          created_at: '2025-01-26T11:00:00Z',
          updated_at: '2025-01-26T14:20:00Z',
          workflow_count: 0,
          task_count: 8
        },
        {
          id: 'development-pipeline',
          name: 'Development Pipeline',
          description: 'Mixed workflow combining AI agents with task management',
          type: 'mixed',
          created_at: '2025-01-26T12:00:00Z',
          updated_at: '2025-01-26T16:45:00Z',
          workflow_count: 1,
          task_count: 5
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
      case 'agentic-workflow':
        return <Brain className="h-5 w-5 text-purple-400" />
      case 'task-management':
        return <FolderOpen className="h-5 w-5 text-green-400" />
      case 'mixed':
        return <Brain className="h-5 w-5 text-blue-400" />
      default:
        return <FolderOpen className="h-5 w-5 text-gray-400" />
    }
  }

  const getSchemaColor = (type: string) => {
    switch (type) {
      case 'agentic-workflow':
        return 'bg-purple-600/20 border-purple-700'
      case 'task-management':
        return 'bg-green-600/20 border-green-700'
      case 'mixed':
        return 'bg-blue-600/20 border-blue-700'
      default:
        return 'bg-gray-600/20 border-gray-700'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-300 font-notion">Loading board...</p>
        </div>
      </div>
    )
  }

  if (!boardInfo) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white font-notion mb-2">Board not found</h1>
          <p className="text-gray-400 font-notion mb-4">The board you're looking for doesn't exist.</p>
          <Link href="/dashboard">
            <Button className="font-notion">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 mb-4">
            <Link href="/dashboard" className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-notion">Dashboard</span>
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-white font-notion">{boardInfo.name}</span>
          </div>

          {/* Board Info */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white font-notion mb-2">
                {boardInfo.name}
              </h1>
              <p className="text-gray-400 font-notion mb-4 max-w-2xl">
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
                    ? 'bg-green-900/30 text-green-400 border border-green-700' 
                    : 'bg-gray-700 text-gray-300 border border-gray-600'
                }`}>
                  {boardInfo.is_public ? 'Public' : 'Private'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" className="font-notion bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" className="font-notion bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button className="font-notion bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0">
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
            <h2 className="text-2xl font-bold text-white font-notion">Schemas</h2>
            <p className="text-gray-400 font-notion">
              {schemas.length} schema{schemas.length !== 1 ? 's' : ''} in this board
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemas.map((schema) => (
              <Link 
                key={schema.id} 
                href={`/board/${boardId}/schema/${schema.id}`}
                className="block"
              >
                <div className={`bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors border ${getSchemaColor(schema.type)}`}>
                  {/* Schema Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getSchemaColor(schema.type)}`}>
                        {getSchemaIcon(schema.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white font-notion">
                          {schema.name}
                        </h3>
                        <span className="text-xs text-gray-400 font-notion capitalize">
                          {schema.type.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Schema Description */}
                  <p className="text-gray-400 font-notion text-sm mb-4 line-clamp-2">
                    {schema.description}
                  </p>

                  {/* Schema Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      {schema.workflow_count > 0 && (
                        <div className="flex items-center space-x-1">
                          <Brain className="h-4 w-4" />
                          <span>{schema.workflow_count} workflow{schema.workflow_count !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {schema.task_count > 0 && (
                        <div className="flex items-center space-x-1">
                          <FolderOpen className="h-4 w-4" />
                          <span>{schema.task_count} task{schema.task_count !== 1 ? 's' : ''}</span>
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
            <div className="bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-xl p-6 hover:border-gray-500 transition-colors cursor-pointer">
              <div className="text-center">
                <div className="p-3 bg-gray-700 rounded-lg w-fit mx-auto mb-4">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-300 font-notion mb-2">
                  Create New Schema
                </h3>
                <p className="text-gray-500 font-notion text-sm">
                  Start a new workflow or task management schema
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State (if no schemas) */}
        {schemas.length === 0 && (
          <div className="text-center py-12">
            <Brain className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 font-notion mb-2">
              No schemas yet
            </h3>
            <p className="text-gray-500 font-notion mb-6">
              Create your first schema to start building workflows and managing tasks
            </p>
            <Button className="font-notion bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Schema
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
