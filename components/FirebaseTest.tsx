'use client'

import { useState } from 'react'
import { FirebaseService } from '@/lib/firebase-service'
import { Button } from '@/components/ui/Button'

export default function FirebaseTest() {
  const [status, setStatus] = useState<string>('Ready to test')
  const [loading, setLoading] = useState(false)

  const testFirebase = async () => {
    setLoading(true)
    setStatus('Testing Firebase connection...')
    
    try {
      // Test creating a project
      const testProject = await FirebaseService.createProject(
        'test-user-123',
        'Test Project',
        'This is a test project to verify Firebase is working'
      )
      
      setStatus(`✅ Success! Created project: ${testProject.name}`)
      
      // Test getting user projects
      const projects = await FirebaseService.getUserProjects('test-user-123')
      setStatus(`✅ Success! Found ${projects.length} projects for user`)
      
    } catch (error) {
      console.error('Firebase test error:', error)
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold mb-4">Firebase Connection Test</h3>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Status: {status}</p>
        <Button 
          onClick={testFirebase} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? 'Testing...' : 'Test Firebase Connection'}
        </Button>
      </div>
    </div>
  )
}
