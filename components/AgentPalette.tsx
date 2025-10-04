'use client'

import AgentBlock from './AgentBlock'
import { Zap, CheckSquare, Github, MessageSquare } from 'lucide-react'

export default function AgentPalette() {
  const agents = [
    {
      id: 'sprint-planner',
      name: 'Sprint Planner',
      icon: Zap,
      color: 'text-blue-600',
      description: 'Analyzes your project and creates realistic sprint plans'
    },
    {
      id: 'task-generator',
      name: 'Task Generator',
      icon: CheckSquare,
      color: 'text-green-600',
      description: 'Breaks down features into actionable tasks'
    },
    {
      id: 'github-bot',
      name: 'GitHub Bot',
      icon: Github,
      color: 'text-purple-600',
      description: 'Creates and manages GitHub issues automatically'
    },
    {
      id: 'discord-notifier',
      name: 'Discord Notifier',
      icon: MessageSquare,
      color: 'text-orange-600',
      description: 'Sends updates and notifications to Discord channels'
    }
  ]

  return (
    <div className="absolute top-4 left-4 bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
      <h4 className="text-sm font-medium text-gray-300 mb-3 font-notion">AI Agents</h4>
      <div className="space-y-2">
        {agents.map(agent => (
          <AgentBlock
            key={agent.id}
            id={agent.id}
            name={agent.name}
            icon={agent.icon}
            color={agent.color}
            description={agent.description}
          />
        ))}
      </div>
    </div>
  )
}
