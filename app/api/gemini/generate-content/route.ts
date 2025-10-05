import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { task, contentType } = body
    
    console.log('Gemini Generate Content API called with task:', task?.title, 'contentType:', contentType)
    
    const geminiApiKey = process.env.GEMINI_API_KEY
    
    console.log('Gemini API Key exists:', !!geminiApiKey)
    console.log('Gemini API Key starts with:', geminiApiKey?.substring(0, 10) + '...')
    
    if (!geminiApiKey) {
      console.error('Missing Gemini API key')
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const prompt = `Generate ${contentType} for this task:
      
Task Title: ${task.title || 'Untitled Task'}
Description: ${task.description || 'No description'}
Assignee: ${task.assignees?.join(', ') || 'Unassigned'}
Tech Stack: ${task.techStack?.join(', ') || 'Not specified'}

Please generate appropriate ${contentType} content that would be useful for this task.`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
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

    const result = await response.json()

    if (!response.ok) {
      console.error('Gemini API error:', result)
      return NextResponse.json(
        { success: false, error: result.error?.message || 'Failed to generate content' },
        { status: response.status }
      )
    }

    const content = result.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) {
      console.error('No content generated:', result)
      return NextResponse.json(
        { success: false, error: 'No content generated' },
        { status: 500 }
      )
    }

    console.log('Successfully generated content for task:', task.title)

    return NextResponse.json({
      success: true,
      content,
      message: 'Content generated successfully'
    })

  } catch (error) {
    console.error('Error in generate-content API:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
}
