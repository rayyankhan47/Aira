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
    try {
      // Use server-side API route instead of direct API calls to avoid CORS
      const response = await fetch('/api/discord/post-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task: taskData, summary })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to post to Discord'
        }
      }
      
      return result
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
