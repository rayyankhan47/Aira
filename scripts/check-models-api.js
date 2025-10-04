require('dotenv').config({ path: '.env.local' })

async function checkModelsAPI() {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    console.log('API Key available:', !!apiKey)
    
    // Try different API versions and endpoints
    const endpoints = [
      'https://generativelanguage.googleapis.com/v1beta/models',
      'https://generativelanguage.googleapis.com/v1/models',
      'https://generativelanguage.googleapis.com/v1alpha/models'
    ]
    
    for (const endpoint of endpoints) {
      console.log(`\n🔍 Trying endpoint: ${endpoint}`)
      try {
        const response = await fetch(`${endpoint}?key=${apiKey}`)
        console.log(`Status: ${response.status} ${response.statusText}`)
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ SUCCESS! Available models:')
          
          if (data.models) {
            data.models.forEach((model, index) => {
              console.log(`${index + 1}. ${model.name}`)
              console.log(`   Display Name: ${model.displayName || 'N/A'}`)
              console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`)
            })
            
            // Find models that support generateContent
            const generateContentModels = data.models.filter(model => 
              model.supportedGenerationMethods?.includes('generateContent')
            )
            
            console.log('\n🎯 Models supporting generateContent:')
            generateContentModels.forEach(model => {
              console.log(`- ${model.name}`)
            })
            
            return // Found working endpoint, exit
          }
        } else {
          const errorText = await response.text()
          console.log(`❌ Error: ${errorText}`)
        }
      } catch (fetchError) {
        console.log(`❌ Fetch error: ${fetchError.message}`)
      }
    }
    
  } catch (error) {
    console.error('Script error:', error.message)
  }
}

checkModelsAPI()
