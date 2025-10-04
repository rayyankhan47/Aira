import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface AgentContext {
  input: string
  previousResults?: any[]
  workflowGoal?: string
}

export interface AgentResult {
  success: boolean
  output: string
  data?: any
  nextActions?: string[]
}

// Agent Types and their specific prompts
export const AGENT_PROMPTS = {
  'Sprint Planner': {
    systemPrompt: `You are a Sprint Planning Agent. Your job is to analyze project requirements and create realistic sprint plans with clear goals and timelines.`,
    taskPrompt: (context: AgentContext) => `
Analyze the following project information and create a detailed sprint plan:

Project Context: ${context.input}
Workflow Goal: ${context.workflowGoal || 'Not specified'}

Create a sprint plan that includes:
1. Sprint goal and objectives
2. User stories with acceptance criteria
3. Estimated effort for each story
4. Sprint timeline and milestones
5. Risk assessment and mitigation strategies

Format your response as a structured sprint plan ready for development teams.
    `
  },

  'Task Generator': {
    systemPrompt: `You are a Task Generation Agent. Your job is to break down high-level features and requirements into specific, actionable development tasks.`,
    taskPrompt: (context: AgentContext) => `
Based on the following sprint plan or feature description, generate specific development tasks:

Input: ${context.input}
Previous Results: ${context.previousResults ? JSON.stringify(context.previousResults, null, 2) : 'None'}

Generate tasks that include:
1. Task title and description
2. Acceptance criteria
3. Estimated effort (Story Points: 1-8)
4. Dependencies on other tasks
5. Required skills/technologies
6. Priority level

Format as a structured task list ready for project management tools.
    `
  },

  'GitHub Integration': {
    systemPrompt: `You are a GitHub Integration Agent. Your job is to create GitHub issues, manage repositories, and track development progress.`,
    taskPrompt: (context: AgentContext) => `
Based on the following tasks or requirements, create GitHub issues:

Tasks to Create Issues For: ${context.input}
Previous Context: ${context.previousResults ? JSON.stringify(context.previousResults, null, 2) : 'None'}

For each task, create a GitHub issue that includes:
1. Clear title and description
2. Labels for categorization
3. Assignee suggestions based on skills
4. Milestone assignment
5. Estimated effort
6. Acceptance criteria as a checklist

Format as structured GitHub issue data ready for API creation.
    `
  },

  'Discord Notifier': {
    systemPrompt: `You are a Discord Notification Agent. Your job is to create engaging team updates and announcements for Discord channels.`,
    taskPrompt: (context: AgentContext) => `
Create a Discord notification for the following update:

Update Content: ${context.input}
Context: ${context.previousResults ? JSON.stringify(context.previousResults, null, 2) : 'None'}

Create a Discord message that:
1. Is engaging and team-friendly
2. Highlights key achievements or updates
3. Uses appropriate emojis and formatting
4. Includes relevant links or details
5. Encourages team collaboration
6. Is concise but informative

Format as a Discord-ready message with proper markdown.
    `
  },

  'Progress Analyzer': {
    systemPrompt: `You are a Progress Analysis Agent. Your job is to analyze project progress, identify bottlenecks, and provide actionable insights.`,
    taskPrompt: (context: AgentContext) => `
Analyze the following project progress and provide insights:

Progress Data: ${context.input}
Historical Context: ${context.previousResults ? JSON.stringify(context.previousResults, null, 2) : 'None'}

Provide analysis that includes:
1. Current progress status and metrics
2. Identified bottlenecks or blockers
3. Risk assessment and mitigation strategies
4. Recommendations for improvement
5. Team productivity insights
6. Timeline adjustments if needed

Format as a comprehensive progress report with actionable recommendations.
    `
  }
}

export async function executeAgent(
  agentName: string, 
  context: AgentContext
): Promise<AgentResult> {
  try {
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set')
    }
    
    // Use gemini-2.5-flash (fast and cost-effective model)
    // This is one of the available models from the API
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    
    const agentConfig = AGENT_PROMPTS[agentName as keyof typeof AGENT_PROMPTS]
    if (!agentConfig) {
      throw new Error(`Unknown agent: ${agentName}`)
    }

    const prompt = `${agentConfig.systemPrompt}\n\n${agentConfig.taskPrompt(context)}`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return {
      success: true,
      output: text,
      data: {
        agentName,
        timestamp: new Date().toISOString(),
        input: context.input
      }
    }
  } catch (error) {
    console.error(`Error executing agent ${agentName}:`, error)
    return {
      success: false,
      output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: {
        agentName,
        timestamp: new Date().toISOString(),
        error: error
      }
    }
  }
}

// Workflow execution function
export async function executeWorkflow(
  connections: any[],
  agents: any[],
  initialInput: string
): Promise<AgentResult[]> {
  const results: AgentResult[] = []
  const agentResults = new Map<string, AgentResult>()
  
  // Find starting agents (no incoming connections)
  const startingAgents = agents.filter(agent => 
    !connections.some(conn => conn.toAgentId === agent.id)
  )
  
  // Execute agents in dependency order
  const executeAgentRecursive = async (agentId: string, context: AgentContext): Promise<void> => {
    if (agentResults.has(agentId)) return // Already executed
    
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return
    
    // Get input from previous agents
    const incomingConnections = connections.filter(conn => conn.toAgentId === agentId)
    let agentInput = context.input
    
    if (incomingConnections.length > 0) {
      // Wait for all incoming agents to complete
      await Promise.all(
        incomingConnections.map(conn => 
          executeAgentRecursive(conn.fromAgentId, context)
        )
      )
      
      // Combine outputs from previous agents
      const previousOutputs = incomingConnections
        .map(conn => agentResults.get(conn.fromAgentId)?.output || '')
        .filter(output => output.length > 0)
      
      agentInput = previousOutputs.join('\n\n')
    }
    
    // Execute the agent
    const result = await executeAgent(agent.name, {
      ...context,
      input: agentInput,
      previousResults: results
    })
    
    agentResults.set(agentId, result)
    results.push(result)
    
    // Execute outgoing agents
    const outgoingConnections = connections.filter(conn => conn.fromAgentId === agentId)
    await Promise.all(
      outgoingConnections.map(conn => 
        executeAgentRecursive(conn.toAgentId, context)
      )
    )
  }
  
  // Start execution with all starting agents
  await Promise.all(
    startingAgents.map(agent => 
      executeAgentRecursive(agent.id, { input: initialInput })
    )
  )
  
  return results
}
