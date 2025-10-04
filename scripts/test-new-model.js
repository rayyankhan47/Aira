const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config({ path: '.env.local' })

async function testNewModel() {
  try {
    console.log('Testing gemini-2.5-flash...')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    console.log('✅ Model created successfully')
    
    console.log('Generating content...')
    const result = await model.generateContent("Hello! Please respond with 'Gemini 2.5 Flash is working!'")
    const response = await result.response
    const text = response.text()
    
    console.log('🎉 SUCCESS!')
    console.log('Response:', text)
    
  } catch (error) {
    console.error('❌ ERROR:', error.message)
  }
}

testNewModel()
