/**
 * Gemini API Service for AI processing in agentic workflows
 */

export interface GeminiResponse {
  success: boolean
  content?: string
  error?: string
}

export class GeminiService {
  private static readonly API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  private static readonly API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

  /**
   * Check if Gemini API is configured
   */
  static isConfigured(): boolean {
    return !!this.API_KEY
  }

  /**
   * Analyze task data and provide insights
   */
  static async analyzeTask(taskData: any): Promise<GeminiResponse> {
    try {
      // Use server-side API route instead of direct API calls to avoid CORS
      const response = await fetch('/api/gemini/analyze-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task: taskData })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to analyze task'
        }
      }
      
      return result
    } catch (error) {
      console.error('Error analyzing task:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Generate content based on task data
   */
  static async generateContent(taskData: any, contentType: string): Promise<GeminiResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Gemini API key not configured'
      }
    }

    try {
      const prompt = `Generate ${contentType} for this task:
      
Task Title: ${taskData.title || 'Untitled Task'}
Description: ${taskData.description || 'No description'}
Assignee: ${taskData.assignees?.join(', ') || 'Unassigned'}
Tech Stack: ${taskData.techStack?.join(', ') || 'Not specified'}

Please generate appropriate ${contentType} content that would be useful for this task.`

      const response = await this.callGeminiAPI(prompt)
      return response
    } catch (error) {
      console.error('Error generating content:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Categorize tasks based on their content
   */
  static async categorizeTask(taskData: any): Promise<GeminiResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Gemini API key not configured'
      }
    }

    try {
      const prompt = `Categorize this task into appropriate categories:
      
Task Title: ${taskData.title || 'Untitled Task'}
Description: ${taskData.description || 'No description'}
Tech Stack: ${taskData.techStack?.join(', ') || 'Not specified'}

Please provide:
1. Primary category (e.g., Frontend, Backend, Design, Testing, Documentation)
2. Secondary category (e.g., Feature, Bug Fix, Refactor, Research)
3. Priority level (High, Medium, Low)
4. Estimated effort (Small, Medium, Large)
5. Required skills/tools

Format your response as a JSON object with these fields.`

      const response = await this.callGeminiAPI(prompt)
      return response
    } catch (error) {
      console.error('Error categorizing task:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Generate a summary for external platforms (Notion, Discord)
   */
  static async generateSummary(taskData: any, platform: 'notion' | 'discord'): Promise<GeminiResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Gemini API key not configured'
      }
    }

    try {
      const prompt = `Generate a ${platform} summary for this task:
      
Task Title: ${taskData.title || 'Untitled Task'}
Description: ${taskData.description || 'No description'}
Assignee: ${taskData.assignees?.join(', ') || 'Unassigned'}
Tech Stack: ${taskData.techStack?.join(', ') || 'Not specified'}
Due Date: ${taskData.dueDate || 'No due date'}
Completed: ${taskData.completed ? 'Yes' : 'No'}

Generate a ${platform}-appropriate summary that:
${platform === 'notion' 
  ? '- Uses rich formatting with headers, bullet points, and emphasis\n- Includes actionable next steps\n- Has a professional tone'
  : '- Is concise and engaging\n- Uses appropriate emojis\n- Fits in a Discord message\n- Highlights key information'
}`

      const response = await this.callGeminiAPI(prompt)
      return response
    } catch (error) {
      console.error('Error generating summary:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Make API call to Gemini
   */
  private static async callGeminiAPI(prompt: string): Promise<GeminiResponse> {
    try {
      const response = await fetch(`${this.API_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!generatedText) {
        throw new Error('No content generated by Gemini API')
      }

      return {
        success: true,
        content: generatedText
      }
    } catch (error) {
      console.error('Gemini API call failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'API call failed'
      }
    }
  }
}
