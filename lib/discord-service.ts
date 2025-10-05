/**
 * Discord Webhook Service for posting messages in agentic workflows
 */

export interface DiscordResponse {
  success: boolean
  messageId?: string
  error?: string
}

export class DiscordService {
  private static readonly DISCORD_WEBHOOK_URL = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL

  /**
   * Check if Discord webhook is configured
   */
  static isConfigured(): boolean {
    return !!this.DISCORD_WEBHOOK_URL
  }

  /**
   * Post a message to Discord about task updates
   */
  static async postTaskUpdate(taskData: any, summary?: string): Promise<DiscordResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Discord webhook not configured'
      }
    }

    try {
      const content = summary || this.generateDefaultMessage(taskData)
      
      const webhookData = {
        content: content,
        embeds: [
          {
            title: taskData.title || 'Untitled Task',
            description: taskData.description || 'No description provided',
            color: this.getStatusColor(taskData.completed),
            fields: [
              {
                name: 'Assignee',
                value: taskData.assignees?.join(', ') || 'Unassigned',
                inline: true
              },
              {
                name: 'Tech Stack',
                value: taskData.techStack?.join(', ') || 'Not specified',
                inline: true
              },
              {
                name: 'Due Date',
                value: taskData.dueDate || 'No due date',
                inline: true
              },
              {
                name: 'Status',
                value: taskData.completed ? '✅ Completed' : '🔄 In Progress',
                inline: true
              }
            ],
            footer: {
              text: 'Automated by Aira Workflow',
              icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png'
            },
            timestamp: new Date().toISOString()
          }
        ]
      }

      const response = await fetch(this.DISCORD_WEBHOOK_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Discord webhook error: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        messageId: data.id
      }
    } catch (error) {
      console.error('Error posting to Discord:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Post a simple text message to Discord
   */
  static async postMessage(message: string): Promise<DiscordResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Discord webhook not configured'
      }
    }

    try {
      const webhookData = {
        content: message
      }

      const response = await fetch(this.DISCORD_WEBHOOK_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Discord webhook error: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        messageId: data.id
      }
    } catch (error) {
      console.error('Error posting to Discord:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Generate default Discord message
   */
  private static generateDefaultMessage(taskData: any): string {
    const statusEmoji = taskData.completed ? '✅' : '🔄'
    const statusText = taskData.completed ? 'completed' : 'updated'
    
    return `**${statusEmoji} Task ${statusText}: ${taskData.title || 'Untitled Task'}**

${taskData.description || 'No description provided'}

**Assignee:** ${taskData.assignees?.join(', ') || 'Unassigned'}
**Tech Stack:** ${taskData.techStack?.join(', ') || 'Not specified'}
**Due Date:** ${taskData.dueDate || 'No due date'}

*Automated by Aira Workflow*`
  }

  /**
   * Get color for Discord embed based on task status
   */
  private static getStatusColor(completed: boolean): number {
    return completed ? 0x00ff00 : 0x0099ff // Green for completed, Blue for in progress
  }
}
