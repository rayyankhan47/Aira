import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore'
import { db } from './firebase'

export interface Project {
  id: string
  name: string
  description?: string
  userId: string
  coupledAgenticWorkflowId?: string
  workspaceData: {
    tasks: any[]
    umlDiagrams: any[]
    connections: any[]
  }
  createdAt: Date
  updatedAt: Date
}

export interface AgenticWorkflow {
  id: string
  name: string
  description?: string
  userId: string
  nodes: any[]
  edges: any[]
  createdAt: Date
  updatedAt: Date
}

export interface AgenticAction {
  id: string
  projectId: string
  workflowId: string
  title: string
  agent: string
  status: 'completed' | 'loading' | 'error'
  timestamp: Date
  details?: any
}

export class FirebaseService {
  // Create a new project
  static async createProject(userId: string, name: string, description?: string): Promise<Project> {
    const projectData = {
      name,
      description: description || '',
      userId,
      workspaceData: {
        tasks: [],
        umlDiagrams: [],
        connections: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const docRef = await addDoc(collection(db, 'projects'), projectData)
    
    return {
      id: docRef.id,
      ...projectData
    }
  }

  // Get all projects for a user
  static async getUserProjects(userId: string): Promise<Project[]> {
    const q = query(
      collection(db, 'projects'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const projects: Project[] = []
    
    querySnapshot.forEach((doc) => {
      projects.push({
        id: doc.id,
        ...doc.data()
      } as Project)
    })
    
    return projects
  }

  // Get a specific project
  static async getProject(projectId: string): Promise<Project | null> {
    const docRef = doc(db, 'projects', projectId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Project
    }
    
    return null
  }

  // Update a project
  static async updateProject(projectId: string, data: Partial<Project>): Promise<void> {
    const docRef = doc(db, 'projects', projectId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    })
  }

  // Delete a project
  static async deleteProject(projectId: string): Promise<void> {
    const docRef = doc(db, 'projects', projectId)
    await deleteDoc(docRef)
  }

  // Save workspace data for a project
  static async saveProjectWorkspaceData(projectId: string, workspaceData: {
    tasks: any[]
    umlDiagrams: any[]
    connections: any[]
  }): Promise<void> {
    const docRef = doc(db, 'projects', projectId)
    await updateDoc(docRef, {
      workspaceData,
      updatedAt: new Date()
    })
  }

  // Load workspace data for a project
  static async getProjectWorkspaceData(projectId: string): Promise<{
    tasks: any[]
    umlDiagrams: any[]
    connections: any[]
  } | null> {
    const docRef = doc(db, 'projects', projectId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      return data.workspaceData || {
        tasks: [],
        umlDiagrams: [],
        connections: []
      }
    }
    
    return null
  }

  // ===== AGENTIC WORKFLOW METHODS =====

  // Create a new agentic workflow
  static async createAgenticWorkflow(userId: string, name: string, description?: string): Promise<AgenticWorkflow> {
    const workflowData = {
      name,
      description: description || '',
      userId,
      nodes: [],
      edges: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const docRef = await addDoc(collection(db, 'agenticWorkflows'), workflowData)
    
    return {
      id: docRef.id,
      ...workflowData
    }
  }

  // Get all agentic workflows for a user
  static async getUserAgenticWorkflows(userId: string): Promise<AgenticWorkflow[]> {
    const q = query(
      collection(db, 'agenticWorkflows'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const workflows: AgenticWorkflow[] = []
    
    querySnapshot.forEach((doc) => {
      workflows.push({
        id: doc.id,
        ...doc.data()
      } as AgenticWorkflow)
    })
    
    return workflows
  }

  // Get a specific agentic workflow
  static async getAgenticWorkflow(workflowId: string): Promise<AgenticWorkflow | null> {
    const docRef = doc(db, 'agenticWorkflows', workflowId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as AgenticWorkflow
    }
    
    return null
  }

  // Update an agentic workflow
  static async updateAgenticWorkflow(workflowId: string, data: Partial<AgenticWorkflow>): Promise<void> {
    const docRef = doc(db, 'agenticWorkflows', workflowId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    })
  }

  // Delete an agentic workflow
  static async deleteAgenticWorkflow(workflowId: string): Promise<void> {
    const docRef = doc(db, 'agenticWorkflows', workflowId)
    await deleteDoc(docRef)
  }

  // Save agentic workflow data (nodes and edges)
  static async saveAgenticWorkflowData(workflowId: string, nodes: any[], edges: any[]): Promise<void> {
    const docRef = doc(db, 'agenticWorkflows', workflowId)
    await updateDoc(docRef, {
      nodes,
      edges,
      updatedAt: new Date()
    })
  }

  // Couple a project with an agentic workflow
  static async coupleProjectWithWorkflow(projectId: string, workflowId: string): Promise<void> {
    const docRef = doc(db, 'projects', projectId)
    await updateDoc(docRef, {
      coupledAgenticWorkflowId: workflowId,
      updatedAt: new Date()
    })
  }

  // Uncouple a project from its agentic workflow
  static async uncoupleProjectFromWorkflow(projectId: string): Promise<void> {
    const docRef = doc(db, 'projects', projectId)
    await updateDoc(docRef, {
      coupledAgenticWorkflowId: null,
      updatedAt: new Date()
    })
  }

  // ===== AGENTIC ACTION METHODS =====

  // Create a new agentic action
  static async createAgenticAction(projectId: string, workflowId: string, title: string, agent: string, status: 'completed' | 'loading' | 'error' = 'loading', details?: any): Promise<AgenticAction> {
    const actionData = {
      projectId,
      workflowId,
      title,
      agent,
      status,
      timestamp: new Date(),
      details: details || null
    }

    const docRef = await addDoc(collection(db, 'agenticActions'), actionData)
    
    return {
      id: docRef.id,
      ...actionData
    }
  }

  // Get agentic actions for a user (across all their projects)
  static async getUserAgenticActions(userId: string): Promise<AgenticAction[]> {
    // First get all user's projects
    const projects = await this.getUserProjects(userId)
    const projectIds = projects.map(p => p.id)
    
    if (projectIds.length === 0) return []
    
    // Get actions for all user's projects
    const q = query(
      collection(db, 'agenticActions'),
      where('projectId', 'in', projectIds),
      orderBy('timestamp', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const actions: AgenticAction[] = []
    
    querySnapshot.forEach((doc) => {
      actions.push({
        id: doc.id,
        ...doc.data()
      } as AgenticAction)
    })
    
    return actions
  }

  // Update agentic action status
  static async updateAgenticActionStatus(actionId: string, status: 'completed' | 'loading' | 'error', details?: any): Promise<void> {
    const docRef = doc(db, 'agenticActions', actionId)
    await updateDoc(docRef, {
      status,
      details: details || null
    })
  }
}
