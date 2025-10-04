// Database schema and types for Aira
// This will work with Supabase PostgreSQL

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface AiraBoard {
  id: string
  name: string
  description: string
  owner_id: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface BoardMember {
  id: string
  board_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
}

export interface Schema {
  id: string
  board_id: string
  name: string
  description: string
  type: 'agentic-workflow' | 'task-management' | 'mixed'
  created_by: string
  created_at: string
  updated_at: string
}

export interface AgentTemplate {
  id: string
  name: string
  type: 'sprint-planner' | 'task-generator' | 'github-bot' | 'discord-notifier' | 'custom'
  prompt: string
  parameters: Record<string, any>
  is_global: boolean
  created_by: string
  board_id?: string // null for global templates
  created_at: string
  updated_at: string
}

export interface Workflow {
  id: string
  schema_id: string
  name: string
  description: string
  agents: AgentInstance[]
  connections: Connection[]
  is_template: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface AgentInstance {
  id: string
  template_id: string
  name: string
  custom_prompt?: string
  parameters: Record<string, any>
  position: { x: number; y: number }
}

export interface Connection {
  id: string
  from_agent_id: string
  to_agent_id: string
  from_point: 'left' | 'right'
  to_point: 'left' | 'right'
}

export interface Task {
  id: string
  schema_id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assignee_id?: string
  due_date?: string
  tech_stacks: string[]
  created_by: string
  created_at: string
  updated_at: string
}

// Database operations (will be implemented with Supabase)
export class DatabaseService {
  // User operations
  async getUser(id: string): Promise<User | null> { throw new Error('Not implemented') }
  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> { throw new Error('Not implemented') }
  
  // Board operations
  async getBoardsForUser(userId: string): Promise<AiraBoard[]> { throw new Error('Not implemented') }
  async createBoard(board: Omit<AiraBoard, 'id' | 'created_at' | 'updated_at'>): Promise<AiraBoard> { throw new Error('Not implemented') }
  async updateBoard(id: string, updates: Partial<AiraBoard>): Promise<AiraBoard> { throw new Error('Not implemented') }
  async deleteBoard(id: string): Promise<void> { throw new Error('Not implemented') }
  
  // Schema operations
  async getSchemasForBoard(boardId: string): Promise<Schema[]> { throw new Error('Not implemented') }
  async createSchema(schema: Omit<Schema, 'id' | 'created_at' | 'updated_at'>): Promise<Schema> { throw new Error('Not implemented') }
  
  // Agent template operations
  async getAgentTemplates(userId: string, boardId?: string): Promise<AgentTemplate[]> { throw new Error('Not implemented') }
  async createAgentTemplate(template: Omit<AgentTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<AgentTemplate> { throw new Error('Not implemented') }
  
  // Workflow operations
  async getWorkflowsForSchema(schemaId: string): Promise<Workflow[]> { throw new Error('Not implemented') }
  async saveWorkflow(workflow: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>): Promise<Workflow> { throw new Error('Not implemented') }
  
  // Task operations
  async getTasksForSchema(schemaId: string): Promise<Task[]> { throw new Error('Not implemented') }
  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> { throw new Error('Not implemented') }
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> { throw new Error('Not implemented') }
}
