'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Plus, Users, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'

interface AiraBoard {
  id: string
  name: string
  description: string
  owner: string
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
          id: 'hack-the-valley-x',
          name: 'Hack The Valley X',
          description: 'The world famous Hack The Valley Hackathon!',
          owner: 'Rayyan'
        }
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

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

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Button className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium">
            <Plus className="h-4 w-4 mr-2" />
            Create Aira Board
          </Button>
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-medium">
            <Users className="h-4 w-4 mr-2" />
            Join Aira Board
          </Button>
        </div>

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
              <Link href={`/board/${board.id}`}>
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium">
                  Open Project
                </Button>
              </Link>
              <Button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium">
                Leave Project
              </Button>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
