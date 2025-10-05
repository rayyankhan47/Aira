'use client'

import { Button } from '@/components/ui/Button'
import FloatingBubbles from '@/components/FloatingBubbles'
import AuthButton from '@/components/auth/AuthButton'
import { Brain, GitBranch, MessageSquare, Zap, Users, BarChart3, Github, Slack, Code2, CheckSquare } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Bubbles */}
      <section className="relative min-h-screen flex flex-col">
        {/* Background Animation - Only in header section */}
        <FloatingBubbles />
        
        {/* Header */}
        <header className="relative z-20 p-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-black font-notion">
                Aira
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-notion">Features</a>
              <a href="#integrations" className="text-gray-600 hover:text-gray-900 transition-colors font-notion">Integrations</a>
              <a href="#ai-power" className="text-gray-600 hover:text-gray-900 transition-colors font-notion">AI Power</a>
            </nav>
            <div className="flex items-center space-x-4">
              <AuthButton />
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-6xl md:text-8xl font-bold mb-8 font-notion leading-tight">
              <span className="text-red-500">
                Notion
              </span>
              <span className="text-gray-900"> meets </span>
              <span className="text-blue-500">
                Jira
              </span>
              <span className="text-gray-900"> meets </span>
              <span className="text-purple-500">
                Agentic AI
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-notion leading-relaxed">
              The all-in-one agentic AI workspace for software engineers and project managers. 
              Drag, drop, and watch AI agents automate your entire workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-10 py-5 font-notion bg-black hover:bg-gray-800 border-0 shadow-2xl shadow-gray-500/25 text-white">
                  Get Started Free →
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-10 py-5 font-notion bg-transparent border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-400">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-notion bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Powerful Features for Seamless Planning
            </h2>
            <p className="text-xl text-gray-600 font-notion max-w-2xl mx-auto">
              Everything you need to build intelligent, automated workflows
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200/20 hover:border-blue-500/30 transition-all duration-300">
              <div className="p-3 bg-purple-600/20 rounded-2xl w-fit mb-6">
                <Brain className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 font-notion text-gray-900">Agentic AI Workflows</h3>
              <p className="text-gray-600 font-notion leading-relaxed">
                Create intelligent workflows by connecting AI agents. Each agent understands your project context 
                and executes complex tasks automatically with natural language reasoning.
              </p>
            </div>
            
            <div className="bg-white backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200/20 hover:border-blue-500/30 transition-all duration-300">
              <div className="p-3 bg-blue-600/20 rounded-2xl w-fit mb-6">
                <Users className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 font-notion text-gray-900">Multi-Project Management</h3>
              <p className="text-gray-600 font-notion leading-relaxed">
                Organize multiple projects with dedicated task boards. Apply the same AI workflows across 
                different projects for maximum efficiency and consistency.
              </p>
            </div>
            
            <div className="bg-white backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200/20 hover:border-blue-500/30 transition-all duration-300">
              <div className="p-3 bg-green-600/20 rounded-2xl w-fit mb-6">
                <BarChart3 className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 font-notion text-gray-900">Visual Task Canvas</h3>
              <p className="text-gray-600 font-notion leading-relaxed">
                Drag and drop tasks, create UML diagrams, and visualize project dependencies in an 
                intuitive canvas-based interface with real-time collaboration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-notion bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Powerful Integrations
            </h2>
            <p className="text-xl text-gray-600 font-notion max-w-2xl mx-auto">
              Connect with your favorite tools and watch AI agents work across all platforms
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-100/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/20 hover:border-gray-300/30 transition-all duration-300 group">
              <Github className="h-12 w-12 text-gray-600 group-hover:text-gray-900 mx-auto mb-4 transition-colors" />
              <span className="font-semibold text-gray-600 group-hover:text-gray-900 font-notion block text-center transition-colors">GitHub</span>
            </div>
            <div className="bg-gray-100/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/20 hover:border-indigo-500/30 transition-all duration-300 group">
              <MessageSquare className="h-12 w-12 text-indigo-500 group-hover:text-indigo-600 mx-auto mb-4 transition-colors" />
              <span className="font-semibold text-gray-600 group-hover:text-gray-900 font-notion block text-center transition-colors">Discord</span>
            </div>
            <div className="bg-gray-100/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/20 hover:border-green-500/30 transition-all duration-300 group">
              <Slack className="h-12 w-12 text-green-500 group-hover:text-green-600 mx-auto mb-4 transition-colors" />
              <span className="font-semibold text-gray-600 group-hover:text-gray-900 font-notion block text-center transition-colors">Slack</span>
              <span className="text-xs text-gray-500 font-notion block text-center mt-1">(coming soon!)</span>
            </div>
            <div className="bg-gray-100/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200/20 hover:border-orange-500/30 transition-all duration-300 group">
              <Code2 className="h-12 w-12 text-orange-500 group-hover:text-orange-600 mx-auto mb-4 transition-colors" />
              <span className="font-semibold text-gray-600 group-hover:text-gray-900 font-notion block text-center transition-colors">VS Code</span>
              <span className="text-xs text-gray-500 font-notion block text-center mt-1">(coming soon!)</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI Power Section */}
      <section id="ai-power" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-notion bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Powered by Advanced AI
            </h2>
            <p className="text-xl text-gray-600 font-notion max-w-3xl mx-auto">
              Aira leverages cutting-edge AI to understand your project context, generate intelligent tasks, 
              and automate complex workflows. Watch as AI agents work together to transform your ideas into reality.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-blue-500/20">
              <div className="p-3 bg-blue-600/20 rounded-2xl w-fit mb-6 mx-auto">
                <Zap className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4 font-notion text-center">Smart Automation</h3>
              <p className="text-gray-600 font-notion leading-relaxed text-center">
                AI agents automatically create tasks, assign priorities, and coordinate team communication 
                based on project context and team dynamics.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-green-500/20">
              <div className="p-3 bg-green-600/20 rounded-2xl w-fit mb-6 mx-auto">
                <Brain className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4 font-notion text-center">Context Awareness</h3>
              <p className="text-gray-600 font-notion leading-relaxed text-center">
                Understands your codebase, team dynamics, and project history to make intelligent decisions 
                and suggest optimal workflows.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-purple-500/20">
              <div className="p-3 bg-purple-600/20 rounded-2xl w-fit mb-6 mx-auto">
                <GitBranch className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4 font-notion text-center">Seamless Integration</h3>
              <p className="text-gray-600 font-notion leading-relaxed text-center">
                Connects with your existing tools to create a unified workflow across all platforms 
                with intelligent data synchronization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-notion bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-gray-600 mb-10 font-notion">
            Join thousands of teams already using Aira to build intelligent, automated workflows
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-12 py-5 font-notion bg-black hover:bg-gray-800 border-0 shadow-2xl shadow-gray-500/25 text-white">
              Start Building Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <span className="text-xl font-bold text-black font-notion">
              Aira
            </span>
          </div>
          <p className="text-gray-600 font-notion">
            2025 Aira. Built by Rayyan Ahmed Khan as submission for Hack The Valley X.
          </p>
        </div>
      </footer>
    </div>
  )
}