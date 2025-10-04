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
  fromPointType?: 'left' | 'right'
  toPointType?: 'left' | 'right'
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
  const [connectionStart, setConnectionStart] = useState<{agentId: string, x: number, y: number, pointType: 'left' | 'right'} | null>(null)
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

  const handleConnectionPointMouseDown = (agentId: string, x: number, y: number, pointType: 'left' | 'right') => {
    console.log('Mouse down on agent:', agentId, 'position:', x, y, 'pointType:', pointType)
    setIsConnecting(true)
    setConnectionStart({ agentId, x, y, pointType })
    setMousePosition({ x, y })
  }

  const handleConnectionPointMouseUp = (agentId: string, x: number, y: number, pointType: 'left' | 'right') => {
    console.log('Mouse up on agent:', agentId, 'isConnecting:', isConnecting, 'connectionStart:', connectionStart)
    if (isConnecting && connectionStart && connectionStart.agentId !== agentId) {
      // Check if connection already exists between these two agents
      const connectionExists = connections.some(conn => 
        (conn.fromAgentId === connectionStart.agentId && conn.toAgentId === agentId) ||
        (conn.fromAgentId === agentId && conn.toAgentId === connectionStart.agentId)
      )
      
      if (!connectionExists) {
        const newConnection: Connection = {
          id: `conn-${Date.now()}`,
          fromAgentId: connectionStart.agentId,
          toAgentId: agentId,
          fromX: connectionStart.x,
          fromY: connectionStart.y,
          toX: x,
          toY: y,
          fromPointType: connectionStart.pointType,
          toPointType: pointType
        }
        console.log('Creating connection:', newConnection)
        setConnections(prev => [...prev, newConnection])
      } else {
        console.log('Connection already exists between these agents')
      }
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
          // Calculate new connection point positions based on current agent positions
          let newFromX = fromAgent.x
          let newFromY = fromAgent.y + 40
          let newToX = toAgent.x  
          let newToY = toAgent.y + 40

          // Adjust based on connection point types
          if (conn.fromPointType === 'right') {
            // Find the right connection point dynamically
            const fromAgentElement = document.querySelector(`[data-agent-id="${fromAgent.id}"] .connection-point.absolute.-right-2`)
            if (fromAgentElement) {
              const rect = fromAgentElement.getBoundingClientRect()
              const canvasRect = canvasRef.current?.getBoundingClientRect()
              if (canvasRect) {
                newFromX = rect.left + rect.width / 2 - canvasRect.left
                newFromY = rect.top + rect.height / 2 - canvasRect.top
              }
            }
          } else {
            // Find the left connection point dynamically
            const fromAgentElement = document.querySelector(`[data-agent-id="${fromAgent.id}"] .connection-point.absolute.-left-2`)
            if (fromAgentElement) {
              const rect = fromAgentElement.getBoundingClientRect()
              const canvasRect = canvasRef.current?.getBoundingClientRect()
              if (canvasRect) {
                newFromX = rect.left + rect.width / 2 - canvasRect.left
                newFromY = rect.top + rect.height / 2 - canvasRect.top
              }
            }
          }

          if (conn.toPointType === 'right') {
            // Find the right connection point dynamically
            const toAgentElement = document.querySelector(`[data-agent-id="${toAgent.id}"] .connection-point.absolute.-right-2`)
            if (toAgentElement) {
              const rect = toAgentElement.getBoundingClientRect()
              const canvasRect = canvasRef.current?.getBoundingClientRect()
              if (canvasRect) {
                newToX = rect.left + rect.width / 2 - canvasRect.left
                newToY = rect.top + rect.height / 2 - canvasRect.top
              }
            }
          } else {
            // Find the left connection point dynamically
            const toAgentElement = document.querySelector(`[data-agent-id="${toAgent.id}"] .connection-point.absolute.-left-2`)
            if (toAgentElement) {
              const rect = toAgentElement.getBoundingClientRect()
              const canvasRect = canvasRef.current?.getBoundingClientRect()
              if (canvasRect) {
                newToX = rect.left + rect.width / 2 - canvasRect.left
                newToY = rect.top + rect.height / 2 - canvasRect.top
              }
            }
          }

          return {
            ...conn,
            fromX: newFromX,
            fromY: newFromY,
            toX: newToX,
            toY: newToY
          }
        }
        return conn
      })
    )
  }

  return (
    <div className="flex-1 bg-white relative overflow-hidden canvas-container">
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
