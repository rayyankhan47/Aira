'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Brain, ArrowLeft, Settings, Save, Play, FolderOpen } from 'lucide-react'
import Link from 'next/link'
import Workspace from '@/components/Workspace'

interface SchemaInfo {
  id: string
  name: string
  description: string
  type: 'agentic-workflow' | 'task-management' | 'mixed'
  board_id: string
  board_name: string
  created_at: string
  updated_at: string
}

export default function SchemaPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.boardId as string
  const schemaId = params.schemaId as string
  
  const [schemaInfo, setSchemaInfo] = useState<SchemaInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data - will be replaced with database calls
    setTimeout(() => {
      setSchemaInfo({
        id: schemaId,
        name: 'Agentic Workflows',
        description: 'AI-powered workflow automation and orchestration for the McHacks project',
        type: 'agentic-workflow',
        board_id: boardId,
        board_name: 'McHacks 2025',
        created_at: '2025-01-26T10:00:00Z',
        updated_at: '2025-01-26T15:30:00Z'
      })
      setIsLoading(false)
    }, 1000)
  }, [boardId, schemaId])

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-300 font-notion">Loading schema...</p>
        </div>
      </div>
    )
  }

  if (!schemaInfo) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white font-notion mb-2">Schema not found</h1>
          <p className="text-gray-400 font-notion mb-4">The schema you're looking for doesn't exist.</p>
          <Link href={`/board/${boardId}`}>
            <Button className="font-notion">Back to Board</Button>
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
            <Link href={`/board/${boardId}`} className="text-gray-400 hover:text-white transition-colors font-notion">
              {schemaInfo.board_name}
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-white font-notion">{schemaInfo.name}</span>
          </div>

          {/* Schema Info */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  {getSchemaIcon(schemaInfo.type)}
                </div>
                <h1 className="text-3xl font-bold text-white font-notion">
                  {schemaInfo.name}
                </h1>
              </div>
              <p className="text-gray-400 font-notion mb-4 max-w-2xl">
                {schemaInfo.description}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Updated {formatDate(schemaInfo.updated_at)}</span>
                <span className="capitalize">
                  {schemaInfo.type.replace('-', ' ')}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" className="font-notion bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" className="font-notion bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button className="font-notion bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0">
                <Play className="h-4 w-4 mr-2" />
                Run Workflow
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Workspace Content */}
      <div className="h-[calc(100vh-140px)]">
        <Workspace 
          schemaId={schemaId}
          schemaType={schemaInfo.type}
          boardId={boardId}
        />
      </div>
    </div>
  )
}
