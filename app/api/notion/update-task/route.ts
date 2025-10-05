import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { task, summary } = body
    
    console.log('Notion API called with task:', task?.title)
    
    const notionApiKey = process.env.NOTION_API_KEY
    const notionDatabaseId = process.env.NOTION_DATABASE_ID
    
    console.log('Notion API Key exists:', !!notionApiKey)
    console.log('Notion Database ID exists:', !!notionDatabaseId)
    
    if (!notionApiKey || !notionDatabaseId) {
      console.error('Missing Notion credentials:', { hasApiKey: !!notionApiKey, hasDatabaseId: !!notionDatabaseId })
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
      }
    }
    
    // Add AI summary as part of the title to avoid property issues
    if (summary) {
      const truncatedSummary = summary.length > 1500 
        ? summary.substring(0, 1500) + '...' 
        : summary
      
      pageData.properties['Name'] = {
        title: [
          {
            text: {
              content: `${task.title || 'Untitled Task'} - AI Summary: ${truncatedSummary}`
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
