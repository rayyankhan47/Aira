import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { task, summary } = body
    
    console.log('Discord API called with task:', task?.title)
    
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL
    
    console.log('Discord Webhook URL exists:', !!discordWebhookUrl)
    console.log('Discord Webhook URL starts with:', discordWebhookUrl?.substring(0, 20) + '...')
    
    if (!discordWebhookUrl) {
      console.error('Missing Discord webhook URL')
      return NextResponse.json(
        { success: false, error: 'Discord webhook URL not configured' },
        { status: 500 }
      )
    }
    
    // Create Discord message
    const description = task.description || 'No description'
    const truncatedDescription = description.length > 4096 ? description.substring(0, 4096) + '...' : description
    
    const embed = {
      title: `📋 Task Update: ${task.title || 'Untitled Task'}`,
      description: truncatedDescription,
      color: task.completed ? 0x00ff00 : 0x0099ff, // Green if completed, blue if in progress
      fields: [
        {
          name: 'Status',
          value: task.completed ? '✅ Completed' : '🔄 In Progress',
          inline: true
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Aira Agentic Workflow'
      }
    }
    
    // Add assignees if present (truncated to fit Discord limits)
    if (task.assignees && task.assignees.length > 0) {
      const assignees = task.assignees.join(', ')
      embed.fields.push({
        name: 'Assignees',
        value: assignees.length > 1024 ? assignees.substring(0, 1024) + '...' : assignees,
        inline: true
      })
    }
    
    // Add tech stack if present (truncated to fit Discord limits)
    if (task.techStack && task.techStack.length > 0) {
      const techStack = task.techStack.join(', ')
      embed.fields.push({
        name: 'Tech Stack',
        value: techStack.length > 1024 ? techStack.substring(0, 1024) + '...' : techStack,
        inline: true
      })
    }
    
    // Add due date if present
    if (task.dueDate) {
      embed.fields.push({
        name: 'Due Date',
        value: new Date(task.dueDate).toLocaleDateString(),
        inline: true
      })
    }
    
    // Add AI summary if available (truncated for Discord's 1024 char limit)
    if (summary) {
      const truncatedSummary = summary.length > 1000 
        ? summary.substring(0, 1000) + '...' 
        : summary
      
      embed.fields.push({
        name: '🤖 AI Analysis',
        value: truncatedSummary,
        inline: false
      })
    }
    
    const discordPayload = {
      embeds: [embed],
      username: 'Aira Bot'
    }
    
    const response = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(discordPayload)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Discord API error response:', errorText)
      throw new Error(`Discord API error: ${response.statusText} - ${errorText}`)
    }
    
    // Discord webhooks might return empty response on success
    let result = null
    try {
      const responseText = await response.text()
      if (responseText) {
        result = JSON.parse(responseText)
      }
    } catch (e) {
      // Discord webhook success responses are often empty
      console.log('Discord webhook response is empty (this is normal)')
    }
    
    return NextResponse.json({
      success: true,
      messageId: result?.id || 'webhook-success',
      message: 'Discord message posted successfully'
    })
    
  } catch (error) {
    console.error('Error posting to Discord:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
