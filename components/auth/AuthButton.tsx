'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export default function AuthButton() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <Button variant="outline" className="font-notion bg-transparent border-gray-300 text-gray-600">
        Loading...
      </Button>
    )
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-gray-600 font-notion">
            {user.displayName || user.email}
          </span>
        </div>
        <Button 
          onClick={handleLogout} 
          className="font-notion bg-red-600 hover:bg-red-700 border-0"
        >
          Logout
        </Button>
      </div>
    )
  }

  return (
    <Button 
      onClick={() => router.push('/login')}
      className="font-notion bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0"
    >
      Login
    </Button>
  )
}
