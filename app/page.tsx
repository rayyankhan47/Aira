'use client'

import { Button } from '@/components/ui/Button'
import FlyingCode from '@/components/FlyingCode'
import { Brain, GitBranch, MessageSquare, Zap, Users, BarChart3, Github, Slack, Code2 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <FlyingCode />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-gray-900 font-notion">Aira</span>
        </div>
        
        <nav className="flex items-center space-x-8">
          <a href="#features" className="text-gray-600 hover:text-gray-900 font-notion">Features</a>
          <a href="#integrations" className="text-gray-600 hover:text-gray-900 font-notion">Integrations</a>
          <a href="#ai-power" className="text-gray-600 hover:text-gray-900 font-notion">AI Power</a>
          <Button variant="default" className="bg-gray-900 text-white hover:bg-gray-800 font-notion">
            Log in
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-8 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 font-notion leading-tight">
          <span className="text-red-600">Notion</span> meets <span className="text-blue-600">Jira</span> meets <span className="text-purple-600">Agentic AI</span>
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto font-notion">
          The all-in-one agentic AI workspace for software engineers and project managers. 
          Drag, drop, and watch AI agents automate your entire workflow.
        </p>
        <a href="/workspace">
          <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800 px-12 py-4 text-lg font-notion">
            Get Started Free →
          </Button>
        </a>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-8 py-20">
        <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center font-notion">
          Powerful Features for Seamless Planning
        </h2>
        
        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 font-notion">Agentic AI Workflows</h3>
            <p className="text-gray-600 font-notion">
              Create intelligent workflows by connecting AI agents. Each agent understands your project context 
              and executes complex tasks automatically.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 font-notion">Multi-Project Management</h3>
            <p className="text-gray-600 font-notion">
              Organize multiple projects with dedicated task boards. Apply the same AI workflows across 
              different projects for maximum efficiency.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 font-notion">Visual Task Canvas</h3>
            <p className="text-gray-600 font-notion">
              Drag and drop tasks, create UML diagrams, and visualize project dependencies in an 
              intuitive canvas-based interface.
            </p>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="relative z-10 px-8 py-20 bg-gray-50">
        <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center font-notion">
          Powerful Integrations
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm">
            <Github className="h-12 w-12 text-gray-800 mb-4" />
            <span className="font-semibold text-gray-900 font-notion">GitHub</span>
          </div>
          <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm">
            <MessageSquare className="h-12 w-12 text-indigo-600 mb-4" />
            <span className="font-semibold text-gray-900 font-notion">Discord</span>
          </div>
          <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm">
            <Slack className="h-12 w-12 text-green-600 mb-4" />
            <span className="font-semibold text-gray-900 font-notion">Slack</span>
          </div>
          <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm">
            <Code2 className="h-12 w-12 text-orange-600 mb-4" />
            <span className="font-semibold text-gray-900 font-notion">VS Code</span>
          </div>
        </div>
      </section>

      {/* AI Power Section */}
      <section id="ai-power" className="relative z-10 px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 font-notion">
            Powered by Advanced AI
          </h2>
          <p className="text-xl text-gray-600 mb-12 font-notion">
            Aira leverages cutting-edge AI to understand your project context, generate intelligent tasks, 
            and automate complex workflows. Watch as AI agents work together to transform your ideas into reality.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3 font-notion">Smart Automation</h3>
              <p className="text-gray-600 font-notion">
                AI agents automatically create tasks, assign priorities, and coordinate team communication.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl">
              <Brain className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3 font-notion">Context Awareness</h3>
              <p className="text-gray-600 font-notion">
                Understands your codebase, team dynamics, and project history to make intelligent decisions.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl">
              <GitBranch className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3 font-notion">Seamless Integration</h3>
              <p className="text-gray-600 font-notion">
                Connects with your existing tools to create a unified workflow across all platforms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-8 py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 font-notion">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-gray-300 mb-12 font-notion">
            Join Aira and revolutionize your project management today.
          </p>
          <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-12 py-4 text-lg font-notion">
            Start Building Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="text-xl font-bold text-gray-900 font-notion">Aira</span>
          </div>
          <p className="text-gray-600 font-notion">
            2025 Aira. Built by Rayyan Ahmed Khan as submission for Hack The Valley X.
          </p>
        </div>
      </footer>
    </div>
  )
}
