import { NextRequest, NextResponse } from 'next/server'
import { executeWorkflow, executeAgent, AgentContext } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    // Debug: Check if API key is available
    console.log('GEMINI_API_KEY available:', !!process.env.GEMINI_API_KEY)
    console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0)
    
    const body = await request.json()
    const { 
      connections, 
      agents, 
      initialInput, 
      workflowGoal,
      executeSingle = false,
      singleAgentName = null 
    } = body

    if (!initialInput) {
      return NextResponse.json(
        { error: 'Initial input is required' },
        { status: 400 }
      )
    }

    const context: AgentContext = {
      input: initialInput,
      workflowGoal
    }

    let results

    if (executeSingle && singleAgentName) {
      // Execute single agent
      results = await executeAgent(singleAgentName, context)
    } else {
      // Execute full workflow
      results = await executeWorkflow(connections, agents, initialInput)
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Workflow execution error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to execute workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
