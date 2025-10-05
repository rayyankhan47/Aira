import { FirebaseService, AgenticWorkflow, AgenticAction } from './firebase-service'
import { GeminiService } from './gemini-service'
import { NotionService } from './notion-service'
import { DiscordService } from './discord-service'

export interface WorkflowExecutionContext {
  projectId: string
  projectName: string
  projectData: {
    tasks: any[]
    umlDiagrams: any[]
    connections: any[]
  }
  triggerEvents: {
    taskCreated?: boolean
    taskCompleted?: boolean
    taskUpdated?: boolean
  }
}

export interface WorkflowNode {
  id: string
  type: string
  data: {
    type: string
    label: string
    nodeType: 'input' | 'processing' | 'output'
    title: string
    description: string
  }
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export class WorkflowExecutionService {
  // Track executions to prevent spam
  private static executionTracker = new Map<string, number>()
  
  /**
   * Main execution function - called when user navigates back from workspace
   */
  static async executeCoupledWorkflows(projectId: string, projectData: any): Promise<void> {
    console.log('🚀 WorkflowExecutionService.executeCoupledWorkflows called')
    console.log('📊 Project ID:', projectId)
    console.log('📊 Project Data:', projectData)
    
    // Prevent spam executions - only allow one execution per project per minute
    const now = Date.now()
    const lastExecution = this.executionTracker.get(projectId) || 0
    const timeSinceLastExecution = now - lastExecution
    
    if (timeSinceLastExecution < 5000) { // 5 seconds - much shorter for testing
      console.log('🚫 Skipping workflow execution - too recent (spam prevention)')
      return
    }
    
    this.executionTracker.set(projectId, now)
    console.log('✅ Throttling passed, proceeding with workflow execution')
    
    try {
      // Get the project to find coupled workflows
      const project = await FirebaseService.getProject(projectId)
      console.log('📊 Retrieved project:', project)
      
      if (!project || !project.coupledAgenticWorkflowIds || project.coupledAgenticWorkflowIds.length === 0) {
        console.log('❌ No coupled workflows found for project:', projectId)
        return // No coupled workflows
      }
      
      console.log('✅ Found coupled workflows:', project.coupledAgenticWorkflowIds)

      // Create execution context
      const taskCreated = this.detectTaskCreated(projectData)
      const taskCompleted = this.detectTaskCompleted(projectData)
      const taskUpdated = this.detectTaskUpdated(projectData)
      
      console.log('🔍 Trigger Events Detection:')
      console.log('  - Task Created:', taskCreated)
      console.log('  - Task Completed:', taskCompleted)
      console.log('  - Task Updated:', taskUpdated)
      
      const context: WorkflowExecutionContext = {
        projectId: project.id,
        projectName: project.name,
        projectData: projectData,
        triggerEvents: {
          taskCreated: taskCreated,
          taskCompleted: taskCompleted,
          taskUpdated: taskUpdated
        }
      }

      // Execute each coupled workflow independently
      for (const workflowId of project.coupledAgenticWorkflowIds) {
        try {
          await this.executeWorkflow(workflowId, context)
        } catch (error) {
          console.error(`Error executing workflow ${workflowId}:`, error)
          // Log error action
          await FirebaseService.createAgenticAction(
            projectId,
            workflowId,
            'Workflow Execution Failed',
            'System Error',
            'error',
            { error: error instanceof Error ? error.message : String(error) }
          )
        }
      }
    } catch (error) {
      console.error('Error in executeCoupledWorkflows:', error)
    }
  }

  /**
   * Execute a single workflow
   */
  private static async executeWorkflow(workflowId: string, context: WorkflowExecutionContext): Promise<void> {
    console.log('🔄 Executing workflow:', workflowId)
    
    const workflow = await FirebaseService.getAgenticWorkflow(workflowId)
    console.log('📊 Retrieved workflow:', workflow)
    
    if (!workflow) {
      console.log('❌ Workflow not found:', workflowId)
      return
    }

    console.log('📊 Workflow nodes:', workflow.nodes)
    console.log('📊 Workflow edges:', workflow.edges)

    // Check if any input nodes are triggered
    const shouldExecute = this.shouldExecuteWorkflow(workflow, context)
    if (!shouldExecute) return

    // Create loading action
    const action = await FirebaseService.createAgenticAction(
      context.projectId,
      workflowId,
      'Workflow Executing...',
      workflow.name,
      'loading'
    )

    try {
      // Execute workflow nodes in sequence
      const result = await this.executeWorkflowNodes(workflow, context)
      
      // Update action with result
      await FirebaseService.updateAgenticActionStatus(
        action.id,
        'completed',
        result
      )
      
      console.log('✅ Workflow execution completed successfully')
    } catch (error) {
      console.error(`Error executing workflow ${workflowId}:`, error)
      await FirebaseService.updateAgenticActionStatus(
        action.id,
        'error',
        { error: error instanceof Error ? error.message : String(error) }
      )
    }
  }

  /**
   * Check if workflow should execute based on input nodes and trigger events
   */
  private static shouldExecuteWorkflow(workflow: AgenticWorkflow, context: WorkflowExecutionContext): boolean {
    const inputNodes = workflow.nodes.filter(node => node.data?.nodeType === 'input')
    console.log('🔍 Input nodes found:', inputNodes.length)
    console.log('🔍 Input nodes:', inputNodes)
    
    for (const node of inputNodes) {
      console.log('🔍 Checking input node:', node.type, 'data.type:', node.data?.type)
      // Check the actual node type from data.type, not the React Flow node type
      const nodeDataType = node.data?.type
      switch (nodeDataType) {
        case 'task-created':
          console.log('🔍 Task created trigger:', context.triggerEvents.taskCreated)
          if (context.triggerEvents.taskCreated) return true
          break
        case 'task-completed':
          console.log('🔍 Task completed trigger:', context.triggerEvents.taskCompleted)
          if (context.triggerEvents.taskCompleted) return true
          break
        case 'task-updated':
          console.log('🔍 Task updated trigger:', context.triggerEvents.taskUpdated)
          if (context.triggerEvents.taskUpdated) return true
          break
      }
    }
    
    return false
  }

  /**
   * Execute workflow nodes in sequence
   */
  private static async executeWorkflowNodes(workflow: AgenticWorkflow, context: WorkflowExecutionContext): Promise<any> {
    const nodes = workflow.nodes
    const edges = workflow.edges
    
    // Find starting nodes (input nodes)
    const inputNodes = nodes.filter(node => node.data?.nodeType === 'input')
    const executionResults: { [nodeId: string]: any } = {}
    
    // Execute each input node
    for (const inputNode of inputNodes) {
      if (this.shouldExecuteInputNode(inputNode, context)) {
        executionResults[inputNode.id] = await this.executeNode(inputNode, context, executionResults)
      }
    }
    
    // Execute processing and output nodes in topological order
    const visited = new Set<string>()
    const inProgress = new Set<string>()
    
    const executeNodeRecursive = async (nodeId: string): Promise<any> => {
      if (visited.has(nodeId)) return executionResults[nodeId]
      if (inProgress.has(nodeId)) {
        throw new Error(`Circular dependency detected: ${nodeId}`)
      }
      
      inProgress.add(nodeId)
      const node = nodes.find(n => n.id === nodeId)
      if (!node) throw new Error(`Node not found: ${nodeId}`)
      
      // Execute dependencies first
      const incomingEdges = edges.filter(edge => edge.target === nodeId)
      for (const edge of incomingEdges) {
        if (!visited.has(edge.source)) {
          await executeNodeRecursive(edge.source)
        }
      }
      
      // Execute current node
      executionResults[nodeId] = await this.executeNode(node, context, executionResults)
      visited.add(nodeId)
      inProgress.delete(nodeId)
      
      return executionResults[nodeId]
    }
    
    // Execute all nodes
    for (const node of nodes) {
      if (!visited.has(node.id) && node.data?.nodeType !== 'input') {
        await executeNodeRecursive(node.id)
      }
    }
    
    return executionResults
  }

  /**
   * Execute a single node
   */
  private static async executeNode(node: WorkflowNode, context: WorkflowExecutionContext, previousResults: any): Promise<any> {
    const nodeDataType = node.data?.type
    console.log('🔧 Executing node:', nodeDataType, 'for node:', node.id)
    
    let result: any
    
    switch (nodeDataType) {
      case 'task-created':
        // Input nodes don't need execution, just return success
        result = { success: true, message: 'Task created event detected', eventType: 'task-created' }
        break
      case 'task-completed':
        // Input nodes don't need execution, just return success
        result = { success: true, message: 'Task completed event detected', eventType: 'task-completed' }
        break
      case 'task-updated':
        // Input nodes don't need execution, just return success
        result = { success: true, message: 'Task updated event detected', eventType: 'task-updated' }
        break
      case 'ai-analyze':
        result = await this.executeAIAnalyze(node, context, previousResults)
        break
      case 'ai-generate':
        result = await this.executeAIGenerate(node, context, previousResults)
        break
      case 'ai-categorize':
        result = await this.executeAICategorize(node, context, previousResults)
        break
      case 'update-notion':
        result = await this.executeUpdateNotion(node, context, previousResults)
        break
      case 'post-discord':
        result = await this.executePostDiscord(node, context, previousResults)
        break
      default:
        console.warn(`Unknown node type: ${nodeDataType}`)
        result = { success: false, message: `Unknown node type: ${nodeDataType}` }
        break
    }
    
    // Check if the node execution failed
    if (!result.success) {
      console.error(`❌ Node ${nodeDataType} failed:`, result.error || result.message)
      throw new Error(result.error || result.message || `Node ${nodeDataType} failed`)
    }
    
    console.log(`✅ Node ${nodeDataType} succeeded:`, result.message)
    return result
  }

  /**
   * Event detection methods
   */
  private static detectTaskCreated(projectData: any): boolean {
    // For now, we'll use a simple heuristic: if there are tasks and this is a fresh save
    // In a production system, you'd track creation timestamps or use a more sophisticated method
    const hasTasks = projectData.tasks && projectData.tasks.length > 0
    console.log('🔍 Detecting task creation - Tasks found:', projectData.tasks?.length || 0)
    
    // Always trigger if tasks exist - this is for testing purposes
    // TODO: Implement proper task creation tracking with timestamps
    return hasTasks
  }

  private static detectTaskCompleted(projectData: any): boolean {
    // TODO: Implement task completion detection
    // For now, we'll check if any tasks are marked as completed
    return projectData.tasks?.some((task: any) => task.completed === true) || false
  }

  private static detectTaskUpdated(projectData: any): boolean {
    // TODO: Implement task update detection
    // For now, we'll assume tasks were updated if there are any tasks
    return projectData.tasks && projectData.tasks.length > 0
  }

  /**
   * AI Processing Node Executors
   */
  private static async executeAIAnalyze(node: WorkflowNode, context: WorkflowExecutionContext, previousResults: any): Promise<any> {
    console.log('Executing AI Analyze:', node, context)
    
    // Get the most recent task data from context
    const tasks = context.projectData.tasks || []
    const latestTask = tasks[tasks.length - 1]
    
    if (!latestTask) {
      return {
        success: false,
        message: 'No tasks found to analyze'
      }
    }

    const result = await GeminiService.analyzeTask(latestTask)
    
    if (result.success) {
      return {
        success: true,
        analysis: result.content,
        message: 'Task analyzed successfully',
        taskId: latestTask.id
      }
    } else {
      return {
        success: false,
        message: `AI analysis failed: ${result.error}`,
        fallback: 'Mock AI analysis result'
      }
    }
  }

  private static async executeAIGenerate(node: WorkflowNode, context: WorkflowExecutionContext, previousResults: any): Promise<any> {
    console.log('Executing AI Generate:', node, context)
    
    // Get the most recent task data from context
    const tasks = context.projectData.tasks || []
    const latestTask = tasks[tasks.length - 1]
    
    if (!latestTask) {
      return {
        success: false,
        message: 'No tasks found to generate content for'
      }
    }

    // Determine content type from node data or default to 'documentation'
    const contentType = (node.data as any)?.contentType || 'documentation'
    
    const result = await GeminiService.generateContent(latestTask, contentType)
    
    if (result.success) {
      return {
        success: true,
        content: result.content,
        message: 'Content generated successfully',
        contentType,
        taskId: latestTask.id
      }
    } else {
      return {
        success: false,
        message: `Content generation failed: ${result.error}`,
        fallback: 'Mock AI generated content'
      }
    }
  }

  private static async executeAICategorize(node: WorkflowNode, context: WorkflowExecutionContext, previousResults: any): Promise<any> {
    console.log('Executing AI Categorize:', node, context)
    
    // Get the most recent task data from context
    const tasks = context.projectData.tasks || []
    const latestTask = tasks[tasks.length - 1]
    
    if (!latestTask) {
      return {
        success: false,
        message: 'No tasks found to categorize'
      }
    }

    const result = await GeminiService.categorizeTask(latestTask)
    
    if (result.success) {
      return {
        success: true,
        categories: result.content,
        message: 'Tasks categorized successfully',
        taskId: latestTask.id
      }
    } else {
      return {
        success: false,
        message: `Categorization failed: ${result.error}`,
        fallback: ['Development', 'High Priority']
      }
    }
  }

  /**
   * Output Node Executors
   */
  private static async executeUpdateNotion(node: WorkflowNode, context: WorkflowExecutionContext, previousResults: any): Promise<any> {
    console.log('Executing Update Notion:', node, context)
    
    // Get the most recent task data from context
    const tasks = context.projectData.tasks || []
    const latestTask = tasks[tasks.length - 1]
    
    if (!latestTask) {
      return {
        success: false,
        message: 'No tasks found to update in Notion'
      }
    }

    // Check if we have AI-generated content from previous processing nodes
    let summary: string | undefined = undefined
    for (const result of Object.values(previousResults)) {
      if (result && typeof result === 'object' && 'content' in result) {
        summary = result.content as string
        break
      }
    }

    const result = await NotionService.updateTaskPage(latestTask, summary)
    
    if (result.success) {
      return {
        success: true,
        notionPageUrl: result.pageUrl,
        pageId: result.pageId,
        message: 'Notion page updated successfully',
        taskId: latestTask.id
      }
    } else {
      return {
        success: false,
        message: `Notion update failed: ${result.error}`,
        fallback: 'Mock Notion page updated'
      }
    }
  }

  private static async executePostDiscord(node: WorkflowNode, context: WorkflowExecutionContext, previousResults: any): Promise<any> {
    console.log('Executing Post Discord:', node, context)
    
    // Get the most recent task data from context
    const tasks = context.projectData.tasks || []
    const latestTask = tasks[tasks.length - 1]
    
    if (!latestTask) {
      return {
        success: false,
        message: 'No tasks found to post to Discord'
      }
    }

    // Check if we have AI-generated content from previous processing nodes
    let summary: string | undefined = undefined
    for (const result of Object.values(previousResults)) {
      if (result && typeof result === 'object' && 'content' in result) {
        summary = result.content as string
        break
      }
    }

    const result = await DiscordService.postTaskUpdate(latestTask, summary)
    
    if (result.success) {
      return {
        success: true,
        discordMessageId: result.messageId,
        message: 'Discord message posted successfully',
        taskId: latestTask.id
      }
    } else {
      return {
        success: false,
        message: `Discord post failed: ${result.error}`,
        fallback: 'Mock Discord message posted'
      }
    }
  }

  /**
   * Helper method to check if input node should execute
   */
  private static shouldExecuteInputNode(node: WorkflowNode, context: WorkflowExecutionContext): boolean {
    const nodeDataType = node.data?.type
    switch (nodeDataType) {
      case 'task-created':
        return context.triggerEvents.taskCreated || false
      case 'task-completed':
        return context.triggerEvents.taskCompleted || false
      case 'task-updated':
        return context.triggerEvents.taskUpdated || false
      default:
        return false
    }
  }
}
