const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config({ path: '.env.local' })

async function testModel() {
  try {
    console.log('Testing Gemini API connection...')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    console.log('Model created successfully')
    
    console.log('Attempting to generate content...')
    const result = await model.generateContent("Hello, this is a test. Please respond with 'Test successful!'")
    const response = await result.response
    const text = response.text()
    
    console.log('✅ SUCCESS!')
    console.log('Response:', text)
    
  } catch (error) {
    console.error('❌ ERROR:', error.message)
    console.error('Full error details:', error)
    
    // Try to extract more details from the error
    if (error.message.includes('404')) {
      console.log('\n🔍 404 Error Analysis:')
      console.log('- The model name might be incorrect')
      console.log('- The API version might be wrong')
      console.log('- There might be a regional restriction')
    }
  }
}

testModel()
