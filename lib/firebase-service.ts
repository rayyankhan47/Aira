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
  workspaceData: {
    tasks: any[]
    umlDiagrams: any[]
    connections: any[]
  }
  createdAt: Date
  updatedAt: Date
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
}
