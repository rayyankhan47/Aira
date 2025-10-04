'use client'

import { useDrop } from 'react-dnd'
import { useState } from 'react'
import * as React from 'react'
import CanvasAgent from './CanvasAgent'
import ConnectionLine from './ConnectionLine'
import { LucideIcon } from 'lucide-react'

interface PlacedAgent {
  id: string
  name: string
  icon: LucideIcon
  color: string
  description: string
  x: number
  y: number
}

interface Connection {
  id: string
  fromAgentId: string
  toAgentId: string
  fromX: number
  fromY: number
  toX: number
  toY: number
}

interface DroppableCanvasProps {
  title: string
  emptyStateIcon: LucideIcon
  emptyStateTitle: string
  emptyStateDescription: string
}

export default function DroppableCanvas({ 
  title, 
  emptyStateIcon: EmptyStateIcon, 
  emptyStateTitle, 
  emptyStateDescription 
}: DroppableCanvasProps) {
  const [placedAgents, setPlacedAgents] = useState<PlacedAgent[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState<{agentId: string, x: number, y: number} | null>(null)
  const [mousePosition, setMousePosition] = useState<{x: number, y: number} | null>(null)

  const canvasRef = React.useRef<HTMLDivElement>(null)
  
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'agent',
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset()
      const canvasElement = canvasRef.current
      
      if (offset && canvasElement) {
        const canvasRect = canvasElement.getBoundingClientRect()
        const x = offset.x - canvasRect.left - 100 // Center the agent
        const y = offset.y - canvasRect.top - 40
        
        const newAgent: PlacedAgent = {
          id: `${item.id}-${Date.now()}`,
          name: item.name,
          icon: item.icon,
          color: item.color,
          description: item.description,
          x: Math.max(20, x),
          y: Math.max(20, y)
        }
        
        setPlacedAgents(prev => [...prev, newAgent])
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [])

  const handleDeleteAgent = (agentId: string) => {
    setPlacedAgents(prev => prev.filter(agent => agent.id !== agentId))
  }

  const handleMoveAgent = (agentId: string, x: number, y: number) => {
    setPlacedAgents(prev =>
      prev.map(agent =>
        agent.id === agentId ? { ...agent, x, y } : agent
      )
    )
    // Update connection positions
    updateConnectionPositions()
  }

  // Track mouse position for connection line
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isConnecting) {
        const canvasElement = canvasRef.current
        if (canvasElement) {
          const canvasRect = canvasElement.getBoundingClientRect()
          setMousePosition({
            x: e.clientX - canvasRect.left,
            y: e.clientY - canvasRect.top
          })
        }
      }
    }

    const handleMouseUp = () => {
      if (isConnecting) {
        setIsConnecting(false)
        setConnectionStart(null)
        setMousePosition(null)
      }
    }

    if (isConnecting) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isConnecting])

  const handleConnectionPointMouseDown = (agentId: string, x: number, y: number) => {
    console.log('Mouse down on agent:', agentId, 'position:', x, y)
    setIsConnecting(true)
    setConnectionStart({ agentId, x, y })
    setMousePosition({ x, y })
  }

  const handleConnectionPointMouseUp = (agentId: string, x: number, y: number) => {
    console.log('Mouse up on agent:', agentId, 'isConnecting:', isConnecting, 'connectionStart:', connectionStart)
    if (isConnecting && connectionStart && connectionStart.agentId !== agentId) {
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        fromAgentId: connectionStart.agentId,
        toAgentId: agentId,
        fromX: connectionStart.x,
        fromY: connectionStart.y,
        toX: x,
        toY: y
      }
      console.log('Creating connection:', newConnection)
      setConnections(prev => [...prev, newConnection])
    }
    setIsConnecting(false)
    setConnectionStart(null)
    setMousePosition(null)
  }

  const updateConnectionPositions = () => {
    setConnections(prev =>
      prev.map(conn => {
        const fromAgent = placedAgents.find(a => a.id === conn.fromAgentId)
        const toAgent = placedAgents.find(a => a.id === conn.toAgentId)
        if (fromAgent && toAgent) {
          return {
            ...conn,
            fromX: fromAgent.x + 200 + 8, // Right connection point
            fromY: fromAgent.y + 40,      // Middle of agent
            toX: toAgent.x - 8,           // Left connection point
            toY: toAgent.y + 40           // Middle of agent
          }
        }
        return conn
      })
    )
  }

  return (
    <div className="flex-1 bg-white relative overflow-hidden">
      {/* Canvas with dots pattern */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, #000000 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Drop Zone */}
      <div
        ref={(node) => {
          if (node) {
            (canvasRef as any).current = node
            drop(node)
          }
        }}
        className={`absolute inset-0 transition-colors ${
          isOver ? 'bg-blue-50 bg-opacity-50' : ''
        }`}
      >
        {/* Connection Lines */}
        {connections.map(connection => (
          <ConnectionLine
            key={connection.id}
            id={connection.id}
            fromX={connection.fromX}
            fromY={connection.fromY}
            toX={connection.toX}
            toY={connection.toY}
          />
        ))}

        {/* Temporary Connection Line (follows mouse) */}
        {isConnecting && connectionStart && mousePosition && (
          <ConnectionLine
            key="temp-connection"
            id="temp-connection"
            fromX={connectionStart.x}
            fromY={connectionStart.y}
            toX={mousePosition.x}
            toY={mousePosition.y}
          />
        )}

        {/* Placed Agents */}
        {placedAgents.map(agent => (
          <CanvasAgent
            key={agent.id}
            id={agent.id}
            name={agent.name}
            icon={agent.icon}
            color={agent.color}
            description={agent.description}
            x={agent.x}
            y={agent.y}
            onDelete={() => handleDeleteAgent(agent.id)}
            onMove={handleMoveAgent}
            onConnectionPointMouseDown={handleConnectionPointMouseDown}
            onConnectionPointMouseUp={handleConnectionPointMouseUp}
          />
        ))}

        {/* Empty State */}
        {placedAgents.length === 0 && (
          <div className="absolute inset-0 p-8">
            <div className="text-center text-gray-400 mt-20 font-notion">
              <EmptyStateIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">{emptyStateTitle}</p>
              <p className="text-sm mt-2">{emptyStateDescription}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
