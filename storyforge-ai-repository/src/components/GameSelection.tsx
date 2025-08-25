import React from 'react'
import { GAME_TEMPLATES, GameTemplate } from '../types/game'

interface GameSelectionProps {
  onGameSelect: (template: GameTemplate) => void
}

export const GameSelection: React.FC<GameSelectionProps> = ({ onGameSelect }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/20'
      case 'Medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'Hard': return 'text-red-400 bg-red-400/20'
      default: return 'text-blue-400 bg-blue-400/20'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Adventure': return 'text-purple-400 bg-purple-400/20'
      case 'Educational': return 'text-blue-400 bg-blue-400/20'
      case 'Celebration': return 'text-pink-400 bg-pink-400/20'
      case 'Puzzle': return 'text-orange-400 bg-orange-400/20'
      case 'Action': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white mb-4">
          Create Your Epic <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Retro Game</span>
        </h2>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          Choose from 5 incredible game templates, each with real gameplay mechanics, 
          customizable stories, and engaging challenges. Powered by Phaser.js for authentic retro gaming experience.
        </p>
        
        {/* Stats */}
        <div className="flex justify-center space-x-8 mt-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">5</div>
            <div className="text-sm text-white/60">Game Templates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">100%</div>
            <div className="text-sm text-white/60">Playable Games</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">Mobile</div>
            <div className="text-sm text-white/60">Compatible</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">AI</div>
            <div className="text-sm text-white/60">Powered</div>
          </div>
        </div>
      </div>

      {/* Game Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GAME_TEMPLATES.map((template) => (
          <div
            key={template.id}
            className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
            onClick={() => onGameSelect(template)}
          >
            {/* Featured Badge */}
            {template.featured && (
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                ✨ Featured
              </div>
            )}
            
            {/* Game Icon */}
            <div className="text-4xl mb-4 group-hover:animate-bounce">
              {template.icon}
            </div>
            
            {/* Game Title */}
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
              {template.title}
            </h3>
            
            {/* Game Description */}
            <p className="text-white/70 text-sm mb-4 leading-relaxed">
              {template.description}
            </p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                {template.difficulty}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                {template.category}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-300 bg-gray-600/20">
                {template.estimatedTime}
              </span>
            </div>
            
            {/* Play Button */}
            <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 group-hover:shadow-lg group-hover:shadow-purple-500/25">
              Create Game →
            </button>
            
            {/* Gameplay Features */}
            <div className="mt-3 space-y-1">
              {template.id === 'pixel-quest' && (
                <div className="text-xs text-white/50 space-y-1">
                  <div>• Real-time combat system</div>
                  <div>• Inventory management</div>
                  <div>• NPC dialogue & quests</div>
                </div>
              )}
              {template.id === 'platform-hero' && (
                <div className="text-xs text-white/50 space-y-1">
                  <div>• Physics-based jumping</div>
                  <div>• Power-ups & collectibles</div>
                  <div>• Multiple levels</div>
                </div>
              )}
              {template.id === 'math-rpg' && (
                <div className="text-xs text-white/50 space-y-1">
                  <div>• Turn-based combat</div>
                  <div>• Math problem mechanics</div>
                  <div>• Character progression</div>
                </div>
              )}
              {template.id === 'reveal-adventure' && (
                <div className="text-xs text-white/50 space-y-1">
                  <div>• Interactive mini-games</div>
                  <div>• Customizable announcements</div>
                  <div>• Celebration sequences</div>
                </div>
              )}
              {template.id === 'puzzle-solver' && (
                <div className="text-xs text-white/50 space-y-1">
                  <div>• Drag-and-drop mechanics</div>
                  <div>• Pattern recognition</div>
                  <div>• Progressive difficulty</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Features Section */}
      <div className="mt-16 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          Why StoryForge AI Enhanced?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <div className="text-3xl">🎮</div>
            <h4 className="text-lg font-semibold text-white">Real Game Mechanics</h4>
            <p className="text-white/70 text-sm">Actual playable games with physics, collision detection, and game logic</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-3xl">🎨</div>
            <h4 className="text-lg font-semibold text-white">AI Customization</h4>
            <p className="text-white/70 text-sm">Personalize characters, stories, and themes with AI assistance</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-3xl">📱</div>
            <h4 className="text-lg font-semibold text-white">Mobile Ready</h4>
            <p className="text-white/70 text-sm">Touch controls and responsive design for any device</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-3xl">💾</div>
            <h4 className="text-lg font-semibold text-white">Save Progress</h4>
            <p className="text-white/70 text-sm">Continue your games anytime with cloud save functionality</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-3xl">🏆</div>
            <h4 className="text-lg font-semibold text-white">Achievements</h4>
            <p className="text-white/70 text-sm">Unlock achievements and track your gaming accomplishments</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-3xl">⚡</div>
            <h4 className="text-lg font-semibold text-white">Phaser.js Powered</h4>
            <p className="text-white/70 text-sm">Professional game engine for smooth performance</p>
          </div>
        </div>
      </div>
    </div>
  )
}