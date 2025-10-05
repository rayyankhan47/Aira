import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { task } = body
    
    const geminiApiKey = process.env.GEMINI_API_KEY
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }
    
    const prompt = `Analyze the following task and provide insights:

Task: ${task.title || 'Untitled Task'}
Description: ${task.description || 'No description'}
Assignees: ${task.assignees?.join(', ') || 'None'}
Tech Stack: ${task.techStack?.join(', ') || 'None'}
Due Date: ${task.dueDate || 'Not specified'}
Status: ${task.completed ? 'Completed' : 'In Progress'}

Please provide:
1. A brief summary of what this task involves
2. Key challenges or considerations
3. Suggested priorities or next steps
4. Any potential risks or blockers

Keep the response concise and actionable.`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API error: ${response.statusText} - ${errorText}`)
    }
    
    const result = await response.json()
    
    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
      throw new Error('Invalid response from Gemini API')
    }
    
    const analysis = result.candidates[0].content.parts[0].text
    
    return NextResponse.json({
      success: true,
      content: analysis,
      message: 'Task analyzed successfully'
    })
    
  } catch (error) {
    console.error('Error analyzing task with Gemini:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
