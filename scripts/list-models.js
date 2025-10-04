const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config({ path: '.env.local' })

async function listModels() {
  try {
    console.log('API Key available:', !!process.env.GEMINI_API_KEY)
    console.log('API Key length:', process.env.GEMINI_API_KEY?.length || 0)
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    console.log('\nFetching available models...')
    // Try different method names
    let models = null
    try {
      models = await genAI.listModels()
    } catch (e1) {
      try {
        models = await genAI.getModels()
      } catch (e2) {
        try {
          models = await genAI.listAvailableModels()
        } catch (e3) {
          console.log('Trying alternative approach...')
          // Try to create a model and see what happens
          try {
            const testModel = genAI.getGenerativeModel({ model: 'gemini-pro' })
            console.log('gemini-pro model created successfully')
            models = [{ name: 'gemini-pro', supportedGenerationMethods: ['generateContent'] }]
          } catch (e4) {
            try {
              const testModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
              console.log('gemini-1.5-flash model created successfully')
              models = [{ name: 'gemini-1.5-flash', supportedGenerationMethods: ['generateContent'] }]
            } catch (e5) {
              throw new Error(`All model attempts failed. Last error: ${e5.message}`)
            }
          }
        }
      }
    }
    
    console.log('\n=== AVAILABLE MODELS ===')
    models.forEach((model, index) => {
      console.log(`${index + 1}. Model Name: ${model.name}`)
      console.log(`   Display Name: ${model.displayName || 'N/A'}`)
      console.log(`   Description: ${model.description || 'N/A'}`)
      console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`)
      console.log('')
    })
    
    // Find models that support generateContent
    const generateContentModels = models.filter(model => 
      model.supportedGenerationMethods?.includes('generateContent')
    )
    
    console.log('\n=== MODELS SUPPORTING generateContent ===')
    if (generateContentModels.length > 0) {
      generateContentModels.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name}`)
      })
    } else {
      console.log('No models found that support generateContent')
    }
    
  } catch (error) {
    console.error('Error listing models:', error.message)
    console.error('Full error:', error)
  }
}

listModels()
