/**
 * Notion API Service for updating Notion pages in agentic workflows
 */

export interface NotionResponse {
  success: boolean
  pageUrl?: string
  pageId?: string
  error?: string
}

export class NotionService {
  private static readonly NOTION_API_KEY = process.env.NEXT_PUBLIC_NOTION_API_KEY
  private static readonly NOTION_DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID
  private static readonly API_URL = 'https://api.notion.com/v1'

  /**
   * Check if Notion API is configured
   */
  static isConfigured(): boolean {
    return !!(this.NOTION_API_KEY && this.NOTION_DATABASE_ID)
  }

  /**
   * Create or update a Notion page with task information
   */
  static async updateTaskPage(taskData: any, summary?: string): Promise<NotionResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Notion API not configured'
      }
    }

    try {
      // First, try to find existing page
      const existingPage = await this.findExistingPage(taskData.title)
      
      if (existingPage) {
        // Update existing page
        return await this.updateExistingPage(existingPage.id, taskData, summary)
      } else {
        // Create new page
        return await this.createNewPage(taskData, summary)
      }
    } catch (error) {
      console.error('Error updating Notion page:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Create a new Notion page
   */
  private static async createNewPage(taskData: any, summary?: string): Promise<NotionResponse> {
    const content = summary || this.generateDefaultContent(taskData)
    
    const pageData = {
      parent: {
        database_id: this.NOTION_DATABASE_ID
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: taskData.title || 'Untitled Task'
              }
            }
          ]
        },
        Status: {
          select: {
            name: taskData.completed ? 'Completed' : 'In Progress'
          }
        },
        Assignee: {
          rich_text: [
            {
              text: {
                content: taskData.assignees?.join(', ') || 'Unassigned'
              }
            }
          ]
        },
        'Tech Stack': {
          multi_select: (taskData.techStack || []).map((tech: string) => ({ name: tech }))
        },
        'Due Date': taskData.dueDate ? {
          date: {
            start: taskData.dueDate
          }
        } : undefined
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: content
                }
              }
            ]
          }
        }
      ]
    }

    // Remove undefined properties
    Object.keys(pageData.properties).forEach(key => {
      if ((pageData.properties as any)[key] === undefined) {
        delete (pageData.properties as any)[key]
      }
    })

    const response = await fetch(`${this.API_URL}/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify(pageData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Notion API error: ${response.status} - ${errorData.message || 'Unknown error'}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      pageUrl: data.url,
      pageId: data.id
    }
  }

  /**
   * Update an existing Notion page
   */
  private static async updateExistingPage(pageId: string, taskData: any, summary?: string): Promise<NotionResponse> {
    const content = summary || this.generateDefaultContent(taskData)
    
    const updateData = {
      properties: {
        Status: {
          select: {
            name: taskData.completed ? 'Completed' : 'In Progress'
          }
        },
        Assignee: {
          rich_text: [
            {
              text: {
                content: taskData.assignees?.join(', ') || 'Unassigned'
              }
            }
          ]
        },
        'Tech Stack': {
          multi_select: (taskData.techStack || []).map((tech: string) => ({ name: tech }))
        },
        'Due Date': taskData.dueDate ? {
          date: {
            start: taskData.dueDate
          }
        } : undefined
      }
    }

    // Remove undefined properties
    Object.keys(updateData.properties).forEach(key => {
      if ((updateData.properties as any)[key] === undefined) {
        delete (updateData.properties as any)[key]
      }
    })

    const response = await fetch(`${this.API_URL}/pages/${pageId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Notion API error: ${response.status} - ${errorData.message || 'Unknown error'}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      pageUrl: data.url,
      pageId: data.id
    }
  }

  /**
   * Find existing page by title
   */
  private static async findExistingPage(title: string): Promise<any> {
    const queryData = {
      filter: {
        property: 'Name',
        title: {
          equals: title
        }
      }
    }

    const response = await fetch(`${this.API_URL}/databases/${this.NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify(queryData)
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.results?.[0] || null
  }

  /**
   * Generate default content for Notion page
   */
  private static generateDefaultContent(taskData: any): string {
    return `# ${taskData.title || 'Untitled Task'}

## Description
${taskData.description || 'No description provided'}

## Details
- **Assignee**: ${taskData.assignees?.join(', ') || 'Unassigned'}
- **Tech Stack**: ${taskData.techStack?.join(', ') || 'Not specified'}
- **Due Date**: ${taskData.dueDate || 'No due date'}
- **Status**: ${taskData.completed ? 'Completed' : 'In Progress'}

## Notes
This page was automatically created by Aira workflow automation.`
  }
}
