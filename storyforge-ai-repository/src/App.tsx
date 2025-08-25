import React, { useState, useEffect } from 'react'
import { GameSelection } from './components/GameSelection'
import { GameCustomization } from './components/GameCustomization'
import { GamePlay } from './components/GamePlay'
import { GameComplete } from './components/GameComplete'
import { GameTemplate, GameCustomization as GameCustomizationType, GameState } from './types/game'
import { loadGameState } from './config/supabase'

type AppState = 'selection' | 'customization' | 'playing' | 'complete'

interface GameResult {
  score: number
  achievements: string[]
  gameTime: number
  template: GameTemplate
}

function App() {
  const [currentState, setCurrentState] = useState<AppState>('selection')
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null)
  const [gameCustomization, setGameCustomization] = useState<GameCustomizationType | null>(null)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [hasExistingSave, setHasExistingSave] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Check for existing user session
    // In a real implementation, this would check Supabase auth
    const guestId = localStorage.getItem('storyforge_guest_id')
    if (!guestId) {
      const newGuestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('storyforge_guest_id', newGuestId)
      setUserId(newGuestId)
    } else {
      setUserId(guestId)
    }
  }, [])

  const handleGameSelect = async (template: GameTemplate) => {
    setSelectedTemplate(template)
    
    // Check for existing save
    const savedState = await loadGameState(template.id, userId)
    setHasExistingSave(!!savedState)
    
    setCurrentState('customization')
  }

  const handleCustomizationComplete = (customization: GameCustomizationType) => {
    setGameCustomization(customization)
    setCurrentState('playing')
  }

  const handleGameComplete = (score: number, achievements: string[], gameTime: number) => {
    if (selectedTemplate) {
      setGameResult({
        score,
        achievements,
        gameTime,
        template: selectedTemplate
      })
      setCurrentState('complete')
    }
  }

  const handleGameExit = () => {
    setSelectedTemplate(null)
    setGameCustomization(null)
    setGameResult(null)
    setHasExistingSave(false)
    setCurrentState('selection')
  }

  const handlePlayAgain = () => {
    setGameResult(null)
    setCurrentState('customization')
  }

  const handleNewGame = () => {
    setSelectedTemplate(null)
    setGameCustomization(null)
    setGameResult(null)
    setHasExistingSave(false)
    setCurrentState('selection')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="text-2xl font-bold text-white">
                StoryForge AI <span className="text-purple-300">Enhanced</span>
              </h1>
            </div>
            
            {currentState !== 'selection' && (
              <button
                onClick={handleGameExit}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200 border border-white/20"
              >
                ← Back to Games
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentState === 'selection' && (
          <GameSelection onGameSelect={handleGameSelect} />
        )}
        
        {currentState === 'customization' && selectedTemplate && (
          <GameCustomization
            template={selectedTemplate}
            hasExistingSave={hasExistingSave}
            onCustomizationComplete={handleCustomizationComplete}
            onBack={() => setCurrentState('selection')}
          />
        )}
        
        {currentState === 'playing' && selectedTemplate && gameCustomization && (
          <GamePlay
            template={selectedTemplate}
            customization={gameCustomization}
            onGameComplete={handleGameComplete}
            onGameExit={handleGameExit}
            userId={userId}
          />
        )}
        
        {currentState === 'complete' && gameResult && (
          <GameComplete
            result={gameResult}
            onPlayAgain={handlePlayAgain}
            onNewGame={handleNewGame}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-white/60">
            <p>StoryForge AI Enhanced - Create Amazing Retro Games with AI</p>
            <p className="mt-2 text-sm">
              Now featuring real playable games with Phaser.js engine • 
              Math RPG • Platform Hero • Pixel Quest • Gender Reveal • Puzzle Solver
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App