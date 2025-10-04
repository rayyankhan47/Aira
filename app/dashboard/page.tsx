'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Plus, FolderOpen, Users, Calendar, Settings } from 'lucide-react'
import Link from 'next/link'

interface AiraBoard {
  id: string
  name: string
  description: string
  is_public: boolean
  member_count: number
  schema_count: number
  last_updated: string
}

export default function Dashboard() {
  const [boards, setBoards] = useState<AiraBoard[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for now - will be replaced with database calls
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setBoards([
        {
          id: 'mchacks-2025',
          name: 'McHacks 2025',
          description: 'The world famous McHacks Hackathon! Building Aira - the visual workspace for project management.',
          is_public: false,
          member_count: 1,
          schema_count: 3,
          last_updated: '2025-01-26T10:30:00Z'
        },
        {
          id: 'portfolio-project',
          name: 'Portfolio Website',
          description: 'Personal portfolio and resume site with modern design and animations.',
          is_public: true,
          member_count: 1,
          schema_count: 2,
          last_updated: '2025-01-25T15:45:00Z'
        },
        {
          id: 'ai-research',
          name: 'AI Research Paper',
          description: 'Academic research on visual project management systems and their applications.',
          is_public: false,
          member_count: 2,
          schema_count: 1,
          last_updated: '2025-01-24T09:20:00Z'
        }
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} days ago`
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 bg-blue-100 rounded-full mx-auto mb-4 animate-pulse flex items-center justify-center">
            <FolderOpen className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-gray-600 font-notion">Loading your Aira Boards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <FolderOpen className="h-8 w-8 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900 font-notion">
              Aira
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="font-notion bg-transparent border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button className="font-notion bg-blue-600 hover:bg-blue-700 text-white border-0">
              <Plus className="h-4 w-4 mr-2" />
              Create Board
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-notion mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 font-notion">
            Manage your projects and workflows with visual task management
          </p>
        </div>

        {/* Boards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <Link 
              key={board.id} 
              href={`/board/${board.id}`}
              className="block"
            >
              <div className="bg-white rounded-xl p-6 hover:bg-gray-50 transition-colors border border-gray-200 hover:border-gray-300 shadow-sm">
                {/* Board Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FolderOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 font-notion">
                        {board.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {board.is_public ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full border border-green-200">
                            Public
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
                            Private
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Board Description */}
                <p className="text-gray-600 font-notion text-sm mb-4 line-clamp-2">
                  {board.description}
                </p>

                {/* Board Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{board.member_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FolderOpen className="h-4 w-4" />
                      <span>{board.schema_count} schemas</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(board.last_updated)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Create New Board Card */}
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-gray-400 transition-colors cursor-pointer">
            <div className="text-center">
              <div className="p-3 bg-gray-200 rounded-lg w-fit mx-auto mb-4">
                <Plus className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 font-notion mb-2">
                Create New Board
              </h3>
              <p className="text-gray-500 font-notion text-sm">
                Start a new project with visual task management
              </p>
            </div>
          </div>
        </div>

        {/* Empty State (if no boards) */}
        {boards.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 font-notion mb-2">
              No Aira Boards yet
            </h3>
            <p className="text-gray-500 font-notion mb-6">
              Create your first board to start managing your projects
            </p>
            <Button className="font-notion bg-blue-600 hover:bg-blue-700 text-white border-0">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Board
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
