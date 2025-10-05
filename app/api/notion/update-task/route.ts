import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { task, summary } = body
    
    const notionApiKey = process.env.NOTION_API_KEY
    const notionDatabaseId = process.env.NOTION_DATABASE_ID
    
    if (!notionApiKey || !notionDatabaseId) {
      return NextResponse.json(
        { success: false, error: 'Notion API credentials not configured' },
        { status: 500 }
      )
    }
    
    // Check if page already exists
    const searchResponse = await fetch(`https://api.notion.com/v1/databases/${notionDatabaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionApiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        filter: {
          property: 'Name',
          title: {
            contains: task.title || 'Untitled Task'
          }
        }
      })
    })
    
    if (!searchResponse.ok) {
      throw new Error(`Notion search failed: ${searchResponse.statusText}`)
    }
    
    const searchResults = await searchResponse.json()
    const existingPages = searchResults.results
    
    let pageData: any = {
      parent: { database_id: notionDatabaseId },
      properties: {
        'Name': {
          title: [
            {
              text: {
                content: task.title || 'Untitled Task'
              }
            }
          ]
        },
        'Description': {
          rich_text: [
            {
              text: {
                content: task.description || 'No description'
              }
            }
          ]
        },
        'Status': {
          select: {
            name: task.completed ? 'Completed' : 'In Progress'
          }
        }
      }
    }
    
    // Add assignees if present
    if (task.assignees && task.assignees.length > 0) {
      pageData.properties['Assignee'] = {
        multi_select: task.assignees.map((assignee: string) => ({
          name: assignee
        }))
      }
    }
    
    // Add tech stack if present
    if (task.techStack && task.techStack.length > 0) {
      pageData.properties['Tech Stack'] = {
        multi_select: task.techStack.map((tech: string) => ({
          name: tech
        }))
      }
    }
    
    // Add due date if present
    if (task.dueDate) {
      pageData.properties['Due Date'] = {
        date: {
          start: task.dueDate
        }
      }
    }
    
    // Add AI summary if available
    if (summary) {
      pageData.properties['AI Summary'] = {
        rich_text: [
          {
            text: {
              content: summary
            }
          }
        ]
      }
    }
    
    let response
    if (existingPages.length > 0) {
      // Update existing page
      const pageId = existingPages[0].id
      response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${notionApiKey}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({ properties: pageData.properties })
      })
    } else {
      // Create new page
      response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${notionApiKey}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify(pageData)
      })
    }
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Notion API error: ${response.statusText} - ${errorText}`)
    }
    
    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      pageUrl: result.url,
      pageId: result.id,
      message: existingPages.length > 0 ? 'Notion page updated' : 'Notion page created'
    })
    
  } catch (error) {
    console.error('Error updating Notion page:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
