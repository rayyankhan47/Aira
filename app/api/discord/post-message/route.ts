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
    const embed = {
      title: `📋 Task Update: ${task.title || 'Untitled Task'}`,
      description: task.description || 'No description',
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
    
    // Add assignees if present
    if (task.assignees && task.assignees.length > 0) {
      embed.fields.push({
        name: 'Assignees',
        value: task.assignees.join(', '),
        inline: true
      })
    }
    
    // Add tech stack if present
    if (task.techStack && task.techStack.length > 0) {
      embed.fields.push({
        name: 'Tech Stack',
        value: task.techStack.join(', '),
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
    
    // Add AI summary if available
    if (summary) {
      embed.fields.push({
        name: '🤖 AI Analysis',
        value: summary,
        inline: false
      })
    }
    
    const discordPayload = {
      embeds: [embed],
      username: 'Aira Bot',
      avatar_url: 'https://cdn.discordapp.com/attachments/placeholder/bot-avatar.png'
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
      throw new Error(`Discord API error: ${response.statusText} - ${errorText}`)
    }
    
    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      messageId: result.id || 'unknown',
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
