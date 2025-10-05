'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  NodeTypes,
  MarkerType,
  Handle,
  Position,
} from '@reactflow/core'
import { Controls } from '@reactflow/controls'
import { Background, BackgroundVariant } from '@reactflow/background'
import { Plus, Settings, Camera, Download } from 'lucide-react'
import EnhancedTaskCard from './EnhancedTaskCard'
import EnhancedUMLCard from './EnhancedUMLCard'
import { FirebaseService } from '@/lib/firebase-service'
import '@reactflow/core/dist/style.css'

// Minimal CSS for touch performance
const styles = `
  .react-flow__pane {
    touch-action: none;
  }
`

// React Flow Node Components - Defined outside component to prevent recreation
const TaskNode = ({ data, newComponentId, setNewComponentId, onDelete, onUpdate }: { data: any; newComponentId: string | null; setNewComponentId: (id: string | null) => void; onDelete: (id: string) => void; onUpdate: (id: string, updates: any) => void }) => {
  // Safety check for missing or malformed data
  if (!data || !data.id) {
    console.error('TaskNode: Missing or invalid data:', data)
    return (
      <div className="relative bg-red-100 border border-red-300 rounded-lg p-4">
        <p className="text-red-600 text-sm">Error: Invalid task data</p>
      </div>
    )
  }

  return (
    <div className="relative" style={{ overflow: 'visible' }}>
      <EnhancedTaskCard
        id={data.id}
        title={data.title || ''}
        description={data.description || ''}
        priority={data.priority || 'medium'}
        assignees={data.assignees || []}
        techStack={data.techStack || []}
        dueDate={data.dueDate || ''}
        isCompleted={data.isCompleted || false}
        isNew={data.id === newComponentId}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onGithubAction={data.onGithubAction}
        onDiscordAction={data.onDiscordAction}
        onInteraction={() => setNewComponentId(null)}
      />
    
    {/* Connection Handles - Positioned to extend beyond component */}
    <Handle
      type="source"
      position={Position.Right}
      style={{ 
        background: '#3B82F6', 
        width: 14, 
        height: 14, 
        top: '50%',
        right: -7,
        transform: 'translateY(-50%)',
        border: '2px solid white',
        borderRadius: '50%',
        zIndex: 10
      }}
    />
    <Handle
      type="target"
      position={Position.Left}
      style={{ 
        background: '#10B981', 
        width: 14, 
        height: 14, 
        top: '50%',
        left: -7,
        transform: 'translateY(-50%)',
        border: '2px solid white',
        borderRadius: '50%',
        zIndex: 10
      }}
    />
  </div>
  )
}

const UMLNode = ({ data, newComponentId, setNewComponentId, onDelete, onUpdate }: { data: any; newComponentId: string | null; setNewComponentId: (id: string | null) => void; onDelete: (id: string) => void; onUpdate: (id: string, updates: any) => void }) => {
  // Safety check for missing or malformed data
  if (!data || !data.id) {
    console.error('UMLNode: Missing or invalid data:', data)
    return (
      <div className="relative bg-red-100 border border-red-300 rounded-lg p-4">
        <p className="text-red-600 text-sm">Error: Invalid UML data</p>
      </div>
    )
  }

  return (
    <div className="relative" style={{ overflow: 'visible' }}>
      <EnhancedUMLCard
        id={data.id}
        title={data.title || data.name || ''}
        attributes={data.attributes || []}
        methods={data.methods || []}
        isNew={data.id === newComponentId}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onInteraction={() => setNewComponentId(null)}
      />
    
    {/* Connection Handles - Positioned to extend beyond component */}
    <Handle
      type="source"
      position={Position.Right}
      style={{ 
        background: '#8B5CF6', 
        width: 14, 
        height: 14, 
        top: '50%',
        right: -7,
        transform: 'translateY(-50%)',
        border: '2px solid white',
        borderRadius: '50%',
        zIndex: 10
      }}
    />
    <Handle
      type="target"
      position={Position.Left}
      style={{ 
        background: '#10B981', 
        width: 14, 
        height: 14, 
        top: '50%',
        left: -7,
        transform: 'translateY(-50%)',
        border: '2px solid white',
        borderRadius: '50%',
        zIndex: 10
      }}
    />
  </div>
  )
}

export default function AiraWorkspace({ 
  projectId, 
  initialWorkspaceData,
  onSaveStatusChange
}: { 
  projectId?: string
  initialWorkspaceData?: {
    tasks: any[]
    umlDiagrams: any[]
    connections: any[]
  }
  onSaveStatusChange?: (status: 'saved' | 'saving' | 'error') => void
} = {}) {
  const [newComponentId, setNewComponentId] = useState<string | null>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const lastSavedRef = useRef<string>('')
  const positionSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Notify parent component when save status changes
  useEffect(() => {
    onSaveStatusChange?.(saveStatus)
  }, [saveStatus, onSaveStatusChange])

  // Define custom edge types for better animations
  const edgeTypes = useMemo(() => ({}), [])

  // Convert Firebase data or default data to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    console.log('Loading initial workspace data:', initialWorkspaceData)
    const tasks = initialWorkspaceData?.tasks || []
    console.log('Raw tasks from Firebase:', tasks)
    if (tasks.length > 0) {
      console.log('First task structure:', JSON.stringify(tasks[0], null, 2))
    }
    
    if (tasks.length === 0) {
      // Return default tasks if no data
      const defaultTasks = [
      // Default Task nodes
      {
        id: 'task-1',
        type: 'taskNode',
        position: { x: 500, y: 300 },
        data: {
      id: 'task-1',
      title: 'Authentication and Database',
      description: 'Setup OAuth login and a fast CRUD database.',
          priority: 'high',
          assignees: ['Rayyan'],
          techStack: ['Next.js', 'Firebase'],
          dueDate: '2025-01-25',
      isCompleted: true,
        },
    },
    {
      id: 'task-2',
        type: 'taskNode',
        position: { x: 1200, y: 300 },
        data: {
          id: 'task-2',
          title: 'Workspace UI/UX',
          description: 'Implement drag-and-drop, connections, and zoom functionality.',
          priority: 'high',
          assignees: ['Rayyan'],
          techStack: ['React Flow', 'Tailwind CSS'],
          dueDate: '2025-01-26',
      isCompleted: true,
        },
      },
      {
        id: 'task-3',
        type: 'taskNode',
        position: { x: 500, y: 700 },
        data: {
          id: 'task-3',
          title: 'Agentic AI Integration',
          description: 'Integrate Gemini API for AI agent task generation and execution.',
          priority: 'medium',
          assignees: ['Rayyan'],
          techStack: ['Gemini API', 'Next.js API Routes'],
          dueDate: '2025-01-27',
          isCompleted: false,
        },
      },
      {
        id: 'task-4',
        type: 'taskNode',
        position: { x: 1200, y: 700 },
        data: {
          id: 'task-4',
          title: 'Discord Notifications',
          description: 'Send task updates and summaries to Discord channels.',
          priority: 'low',
          assignees: ['Rayyan'],
          techStack: ['Discord API', 'Next.js API Routes'],
          dueDate: '2025-01-28',
          isCompleted: false,
        },
      },
      {
        id: 'task-5',
        type: 'taskNode',
        position: { x: 1900, y: 300 },
        data: {
          id: 'task-5',
          title: 'GitHub PR Summaries',
          description: 'Automatically summarize GitHub Pull Requests using AI.',
          priority: 'low',
          assignees: ['Rayyan'],
          techStack: ['GitHub API', 'Gemini API'],
          dueDate: '2025-01-28',
          isCompleted: false,
        },
      },
      {
        id: 'task-6',
        type: 'taskNode',
        position: { x: 1900, y: 700 },
        data: {
          id: 'task-6',
          title: 'Deployment to Vercel',
          description: 'Deploy the Next.js application to Vercel for public access.',
          priority: 'high',
          assignees: ['Rayyan'],
          techStack: ['Vercel', 'Next.js'],
          dueDate: '2025-01-29',
          isCompleted: false,
        },
      },
    ]
    console.log('Using default tasks:', defaultTasks)
    return defaultTasks
    }
    
    // Process loaded tasks from Firebase
    const umlDiagrams = initialWorkspaceData?.umlDiagrams || []
    
    if (umlDiagrams.length === 0) {
      // Return default UMLs if no data
      const defaultUMLs = [
      // Default UML nodes
    {
      id: 'uml-1',
        type: 'umlNode',
        position: { x: 850, y: 100 },
        data: {
          id: 'uml-1',
          title: 'User Authentication Flow',
      attributes: [
            { id: 'attr-1', name: 'username', type: 'string' },
            { id: 'attr-2', name: 'password', type: 'string' },
            { id: 'attr-3', name: 'email', type: 'string' },
      ],
      methods: [
            { id: 'meth-1', name: 'login', parameters: 'email, password', return_type: 'User', visibility: 'public' },
            { id: 'meth-2', name: 'register', parameters: 'email, password, username', return_type: 'User', visibility: 'public' },
          ],
        },
      },
      {
        id: 'uml-2',
        type: 'umlNode',
        position: { x: 1550, y: 100 },
        data: {
          id: 'uml-2',
          title: 'Task Management Module',
          attributes: [
            { id: 'attr-4', name: 'title', type: 'string' },
            { id: 'attr-5', name: 'description', type: 'string' },
            { id: 'attr-6', name: 'dueDate', type: 'Date' },
          ],
          methods: [
            { id: 'meth-3', name: 'createTask', parameters: 'title, description', return_type: 'Task', visibility: 'public' },
            { id: 'meth-4', name: 'assignUser', parameters: 'taskId, userId', return_type: 'void', visibility: 'public' },
          ],
        },
      },
      {
        id: 'uml-3',
        type: 'umlNode',
        position: { x: 850, y: 900 },
        data: {
          id: 'uml-3',
          title: 'AI Agent Orchestration',
          attributes: [
            { id: 'attr-7', name: 'agentName', type: 'string' },
            { id: 'attr-8', name: 'model', type: 'string' },
          ],
          methods: [
            { id: 'meth-5', name: 'executeAgent', parameters: 'agentId, input', return_type: 'Output', visibility: 'public' },
            { id: 'meth-6', name: 'chainAgents', parameters: 'agentIds, initialInput', return_type: 'Output[]', visibility: 'public' },
          ],
        },
      },
    ]
    console.log('Using default UMLs:', defaultUMLs)
    return defaultUMLs
    }

    const convertedNodes = [
      ...tasks.filter(task => task && task.id).map(task => {
        console.log('Processing task:', task)
        const node = {
          id: task.id,
          type: 'taskNode',
          position: { 
            x: task.position?.x || task.position_x || Math.random() * 1000 + 100, 
            y: task.position?.y || task.position_y || Math.random() * 600 + 100 
          },
          data: task.data || task,
        }
        console.log('Converting task node:', task.id, 'position:', node.position, 'data:', node.data)
        return node
      }),
      ...umlDiagrams.filter(uml => uml && uml.id).map(uml => {
        console.log('Processing UML:', uml)
        const node = {
          id: uml.id,
          type: 'umlNode',
          position: { 
            x: uml.position?.x || uml.position_x || Math.random() * 1000 + 100, 
            y: uml.position?.y || uml.position_y || Math.random() * 600 + 100 
          },
          data: uml.data || uml,
        }
        console.log('Converting UML node:', uml.id, 'position:', node.position, 'data:', node.data)
        return node
      }),
    ]
    console.log('Final converted nodes:', convertedNodes)
    return convertedNodes
  }, [initialWorkspaceData])

  const initialEdges: Edge[] = useMemo(() => {
    console.log('Loading initial connections:', initialWorkspaceData?.connections)
    const loadedConnections = initialWorkspaceData?.connections || []
    console.log('Raw connections from Firebase:', loadedConnections)
    
    if (loadedConnections.length > 0) {
      console.log('First connection structure:', JSON.stringify(loadedConnections[0], null, 2))
    }
    
    const defaultConnections = [
      // Default edges
      { id: 'e1-2', source: 'task-1', target: 'task-2', animated: true, markerEnd: { type: MarkerType.ArrowClosed, width: 6, height: 4, color: '#3B82F6' }, style: { stroke: '#3B82F6', strokeWidth: 2 } },
      { id: 'e2-3', source: 'task-2', target: 'task-3', animated: true, markerEnd: { type: MarkerType.ArrowClosed, width: 6, height: 4, color: '#3B82F6' }, style: { stroke: '#3B82F6', strokeWidth: 2 } },
      { id: 'e3-4', source: 'task-3', target: 'task-4', animated: true, markerEnd: { type: MarkerType.ArrowClosed, width: 6, height: 4, color: '#3B82F6' }, style: { stroke: '#3B82F6', strokeWidth: 2 } },
      { id: 'e4-5', source: 'task-4', target: 'task-5', animated: true, markerEnd: { type: MarkerType.ArrowClosed, width: 6, height: 4, color: '#3B82F6' }, style: { stroke: '#3B82F6', strokeWidth: 2 } },
      { id: 'e5-6', source: 'task-5', target: 'task-6', animated: true, markerEnd: { type: MarkerType.ArrowClosed, width: 6, height: 4, color: '#3B82F6' }, style: { stroke: '#3B82F6', strokeWidth: 2 } },
      { id: 'e1-uml1', source: 'task-1', target: 'uml-1', animated: true, markerEnd: { type: MarkerType.ArrowClosed, width: 6, height: 4, color: '#3B82F6' }, style: { stroke: '#3B82F6', strokeWidth: 2 } },
      { id: 'e2-uml2', source: 'task-2', target: 'uml-2', animated: true, markerEnd: { type: MarkerType.ArrowClosed, width: 6, height: 4, color: '#3B82F6' }, style: { stroke: '#3B82F6', strokeWidth: 2 } },
      { id: 'e3-uml3', source: 'task-3', target: 'uml-3', animated: true, markerEnd: { type: MarkerType.ArrowClosed, width: 6, height: 4, color: '#3B82F6' }, style: { stroke: '#3B82F6', strokeWidth: 2 } },
    ]
    
    // Use loaded connections if available, otherwise use defaults
    const connectionsToUse = loadedConnections.length > 0 ? loadedConnections : defaultConnections
    
    const convertedConnections = connectionsToUse.map(connection => {
      // Handle both loaded connection format and default format
      const edge = {
        id: connection.id,
        source: connection.source_id || connection.source,
        target: connection.target_id || connection.target,
        animated: connection.animated !== undefined ? connection.animated : true,
        markerEnd: connection.markerEnd || { type: MarkerType.ArrowClosed, width: 6, height: 4, color: '#3B82F6' },
        style: connection.style || { stroke: '#3B82F6', strokeWidth: 2 },
        sourceHandle: connection.source_handle || connection.sourceHandle || 'right-source',
        targetHandle: connection.target_handle || connection.targetHandle || 'left-target'
      }
      console.log('Converting connection:', connection, 'to edge:', edge)
      return edge
    })
    
    console.log('Final converted edges:', convertedConnections)
    return convertedConnections
  }, [initialWorkspaceData])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update node function
  const updateNode = useCallback((nodeId: string, updates: any) => {
    console.log('updateNode called:', nodeId, updates)
    setNodes((nds: Node[]) => 
      nds.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    )
    console.log('Node updated, nodes state will change')
  }, [setNodes])

  // Delete node function
  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds: Node[]) => nds.filter(node => node.id !== nodeId))
    setEdges((eds: Edge[]) => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId))
  }, [setNodes, setEdges])

  // Save position changes after dragging stops (debounced)
  const savePositionChanges = useCallback(async () => {
    if (!projectId) return
    
    setSaveStatus('saving')
    try {
      // Helper function to remove undefined values
      const removeUndefinedValues = (obj: any) => {
        const cleaned: any = {}
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              cleaned[key] = value.map(item => 
                typeof item === 'object' && item !== null ? removeUndefinedValues(item) : item
              )
            } else if (typeof value === 'object' && value !== null) {
              cleaned[key] = removeUndefinedValues(value)
            } else {
              cleaned[key] = value
            }
          }
        }
        return cleaned
      }

      // Convert React Flow nodes and edges to our data format
      const tasks = nodes
        .filter(node => node.type === 'taskNode')
        .map(node => removeUndefinedValues({
          id: node.id,
          ...node.data,
          position_x: node.position.x,
          position_y: node.position.y
        }))
      
      const umlDiagrams = nodes
        .filter(node => node.type === 'umlNode')
        .map(node => removeUndefinedValues({
          id: node.id,
          ...node.data,
          position_x: node.position.x,
          position_y: node.position.y
        }))
      
      const connections = edges.map(edge => removeUndefinedValues({
        id: edge.id,
        source_id: edge.source,
        target_id: edge.target,
        source_handle: edge.sourceHandle,
        target_handle: edge.targetHandle
      }))

      const workspaceData = removeUndefinedValues({
        tasks,
        umlDiagrams,
        connections
      })

      await FirebaseService.saveProjectWorkspaceData(projectId, workspaceData)
      setSaveStatus('saved')
    } catch (error) {
      console.error('Error saving position changes:', error)
      setSaveStatus('error')
    }
  }, [projectId, nodes, edges])

  // Debounced position save - only saves after user stops dragging
  const debouncedPositionSave = useCallback(() => {
    if (positionSaveTimeoutRef.current) {
      clearTimeout(positionSaveTimeoutRef.current)
    }
    positionSaveTimeoutRef.current = setTimeout(() => {
      savePositionChanges()
    }, 1000) // Save 1 second after dragging stops
  }, [savePositionChanges])


  // Auto-save when nodes or edges change (but only if we have actual content and it's different from last save)
  useEffect(() => {
    if (projectId && (nodes.length > 0 || edges.length > 0)) {
      // Create a hash of current state to check if it's different from last save
      // NOTE: We don't include position here because dragging triggers too many saves
      const currentState = JSON.stringify({
        nodesCount: nodes.length,
        edgesCount: edges.length,
        nodes: nodes.map(n => ({ 
          id: n.id, 
          type: n.type, 
          title: n.data?.title || '',
          description: n.data?.description || '',
          priority: n.data?.priority || '',
          assignees: n.data?.assignees || [],
          techStack: n.data?.techStack || [],
          dueDate: n.data?.dueDate || '',
          isCompleted: n.data?.isCompleted || false,
          attributes: n.data?.attributes || [],
          methods: n.data?.methods || []
        })),
        edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target }))
      })
      
      if (currentState !== lastSavedRef.current) {
        // Only log in development to avoid performance impact
        if (process.env.NODE_ENV === 'development') {
          console.log('Auto-save triggered (state changed):', { 
            nodesCount: nodes.length, 
            edgesCount: edges.length,
            projectId 
          })
          console.log('Current state:', currentState)
          console.log('Last saved state:', lastSavedRef.current)
        }
        
        const timeoutId = setTimeout(async () => {
          setSaveStatus('saving')
          
          // Inline save logic to avoid dependency issues
          try {
            // Helper function to remove undefined values
            const removeUndefinedValues = (obj: any) => {
              const cleaned: any = {}
              for (const [key, value] of Object.entries(obj)) {
                if (value !== undefined) {
                  if (Array.isArray(value)) {
                    cleaned[key] = value.map(item => 
                      typeof item === 'object' && item !== null ? removeUndefinedValues(item) : item
                    )
                  } else if (typeof value === 'object' && value !== null) {
                    cleaned[key] = removeUndefinedValues(value)
                  } else {
                    cleaned[key] = value
                  }
                }
              }
              return cleaned
            }

            // Convert React Flow nodes and edges to our data format
            const tasks = nodes
              .filter(node => node.type === 'taskNode')
              .map(node => removeUndefinedValues({
                id: node.id,
                ...node.data,
                position_x: node.position.x,
                position_y: node.position.y
              }))
            
            const umlDiagrams = nodes
              .filter(node => node.type === 'umlNode')
              .map(node => removeUndefinedValues({
                id: node.id,
                ...node.data,
                position_x: node.position.x,
                position_y: node.position.y
              }))
            
            const connections = edges.map(edge => removeUndefinedValues({
              id: edge.id,
              source_id: edge.source,
              target_id: edge.target,
              source_handle: edge.sourceHandle,
              target_handle: edge.targetHandle
            }))

            const workspaceData = removeUndefinedValues({
              tasks,
              umlDiagrams,
              connections
            })

            await FirebaseService.saveProjectWorkspaceData(projectId, workspaceData)
            setSaveStatus('saved')
            lastSavedRef.current = currentState
          } catch (error) {
            console.error('Error saving workspace data:', error)
            setSaveStatus('error')
          }
        }, 2000) // Increased debounce to 2 seconds to prevent rapid saves
        
        return () => clearTimeout(timeoutId)
      } else {
        // Remove this log entirely - it's too noisy and not useful
        // console.log('Auto-save skipped (no changes detected)')
      }
    }
  }, [nodes, edges, projectId]) // Removed saveWorkspaceData from dependencies

  // Save immediately when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      if (projectId && (nodes.length > 0 || edges.length > 0)) {
        setSaveStatus('saving')
        // Force immediate save without debounce
        setTimeout(async () => {
          try {
            const removeUndefinedValues = (obj: any) => {
              const cleaned: any = {}
              for (const [key, value] of Object.entries(obj)) {
                if (value !== undefined) {
                  if (Array.isArray(value)) {
                    cleaned[key] = value.map(item => 
                      typeof item === 'object' && item !== null ? removeUndefinedValues(item) : item
                    )
                  } else if (typeof value === 'object' && value !== null) {
                    cleaned[key] = removeUndefinedValues(value)
                  } else {
                    cleaned[key] = value
                  }
                }
              }
              return cleaned
            }

            const tasks = nodes
              .filter(node => node.type === 'taskNode')
              .map(node => removeUndefinedValues({
                id: node.id,
                ...node.data,
                position_x: node.position.x,
                position_y: node.position.y
              }))
            
            const umlDiagrams = nodes
              .filter(node => node.type === 'umlNode')
              .map(node => removeUndefinedValues({
                id: node.id,
                ...node.data,
                position_x: node.position.x,
                position_y: node.position.y
              }))
            
            const connections = edges.map(edge => removeUndefinedValues({
              id: edge.id,
              source_id: edge.source,
              target_id: edge.target,
              source_handle: edge.sourceHandle,
              target_handle: edge.targetHandle
            }))

            const workspaceData = removeUndefinedValues({
              tasks,
              umlDiagrams,
              connections
            })

            await FirebaseService.saveProjectWorkspaceData(projectId, workspaceData)
            setSaveStatus('saved')
          } catch (error) {
            console.error('Error in immediate save on unmount:', error)
            setSaveStatus('error')
          }
        }, 100) // Very short delay to ensure state is stable
      }
    }
  }, [projectId, nodes, edges])

  // Handle node drag end to save position changes
  const onNodeDragStop = useCallback(() => {
    if (projectId) {
      debouncedPositionSave()
    }
  }, [projectId, debouncedPositionSave])

  // Define custom node types - memoized to prevent React Flow warnings
  const nodeTypes: NodeTypes = useMemo(() => ({
    taskNode: (props: any) => <TaskNode {...props} newComponentId={newComponentId} setNewComponentId={setNewComponentId} onDelete={deleteNode} onUpdate={updateNode} />,
    umlNode: (props: any) => <UMLNode {...props} newComponentId={newComponentId} setNewComponentId={setNewComponentId} onDelete={deleteNode} onUpdate={updateNode} />,
  }), [newComponentId, deleteNode, updateNode]) // Stable dependencies only

  // Handle new connections - simplified for debugging
  const onConnect = useCallback((params: Connection) => {
    console.log('onConnect called with:', params)
    
    const newEdge = {
      ...params,
      id: `edge-${Date.now()}`,
      animated: true,
      style: { stroke: '#3B82F6', strokeWidth: 3 },
    }
    
    console.log('Creating edge:', newEdge)
    setEdges((eds: Edge[]) => addEdge(newEdge, eds))
  }, [setEdges])

  // Add new task node
  const addNewTask = useCallback(() => {
    const newId = `task-${Date.now()}`
    
    // Get center position of current view
    let position = { x: 500, y: 300 } // default position
    if (reactFlowInstance) {
      const { x, y, zoom } = reactFlowInstance.getViewport()
      position = {
        x: -x / zoom + window.innerWidth / 2 / zoom,
        y: -y / zoom + window.innerHeight / 2 / zoom
      }
    }
    
    const newNode: Node = {
      id: newId,
      type: 'taskNode',
      position,
      data: {
        id: newId,
        title: '',
        description: '',
        priority: 'medium',
        assignees: [],
        techStack: [],
        dueDate: '',
      isCompleted: false,
      },
    }
    
    console.log('Adding new task node:', newNode)
    setNodes((nds: Node[]) => {
      const newNodes = [...nds, newNode]
      console.log('Updated nodes array:', newNodes)
      return newNodes
    })
    setNewComponentId(newId)
  }, [setNodes, reactFlowInstance])

  // Add new UML node
  const addNewUML = useCallback(() => {
    const newId = `uml-${Date.now()}`
    
    // Get center position of current view
    let position = { x: 500, y: 300 } // default position
    if (reactFlowInstance) {
      const { x, y, zoom } = reactFlowInstance.getViewport()
      position = {
        x: -x / zoom + window.innerWidth / 2 / zoom,
        y: -y / zoom + window.innerHeight / 2 / zoom
      }
    }
    
    const newNode: Node = {
      id: newId,
      type: 'umlNode',
      position,
      data: {
        id: newId,
        title: '',
      attributes: [],
      methods: [],
      },
    }
    
    console.log('Adding new UML node:', newNode)
    setNodes((nds: Node[]) => {
      const newNodes = [...nds, newNode]
      console.log('Updated nodes array:', newNodes)
      return newNodes
    })
    setNewComponentId(newId)
  }, [setNodes, reactFlowInstance])

  return (
    <>
      {/* Add styles to reduce passive event listener warnings */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="h-full bg-white relative">
        {/* Save Status Indicator */}
        <div className="absolute top-4 right-4 z-20">
          <div className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            saveStatus === 'saving' 
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
              : saveStatus === 'error'
              ? 'bg-red-100 text-red-800 border border-red-300'
              : 'bg-green-100 text-green-800 border border-green-300'
          }`}>
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'error' ? 'Save Error' : 'Saved!'}
          </div>
        </div>
        
        {/* Add Buttons */}
      <div className="absolute top-4 left-4 flex space-x-2 z-10">
          <button
            onClick={addNewTask}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Task
          </button>
          <button
            onClick={addNewUML}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add UML
          </button>
        </div>

      {/* Top Toolbar */}
      <div className="absolute top-4 right-4 flex space-x-2 z-10">
        <button className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg shadow-sm transition-colors">
          <Camera className="h-4 w-4" />
          </button>
        <button className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg shadow-sm transition-colors">
          <Download className="h-4 w-4" />
          </button>
      </div>

      {/* React Flow */}
      <div style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          attributionPosition="bottom-left"
          deleteKeyCode={null}
          multiSelectionKeyCode={null}
          selectionKeyCode={null}
          onInit={setReactFlowInstance}
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        </ReactFlow>
        </div>
      </div>
    </>
  )
}