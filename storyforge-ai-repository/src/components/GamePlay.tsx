import React, { useEffect, useRef, useState } from 'react'
import { GameEngine } from '../game/GameEngine'
import { GameTemplate, GameCustomization, GameState } from '../types/game'

interface GamePlayProps {
  template: GameTemplate
  customization: GameCustomization
  onGameComplete: (score: number, achievements: string[], gameTime: number) => void
  onGameExit: () => void
  userId: string | null
}

export const GamePlay: React.FC<GamePlayProps> = ({
  template,
  customization,
  onGameComplete,
  onGameExit,
  userId
}) => {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const gameEngineRef = useRef<GameEngine | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [gameStartTime] = useState(Date.now())
  const [isPaused, setIsPaused] = useState(false)
  const [lastSave, setLastSave] = useState<Date | null>(null)

  useEffect(() => {
    let mounted = true
    
    const initializeGame = async () => {
      try {
        if (!gameContainerRef.current) return
        
        // Simulate loading progress
        const loadingSteps = [
          { message: 'Loading game engine...', progress: 20 },
          { message: 'Preparing assets...', progress: 40 },
          { message: 'Creating game world...', progress: 60 },
          { message: 'Applying customizations...', progress: 80 },
          { message: 'Starting game...', progress: 100 }
        ]
        
        for (const step of loadingSteps) {
          if (!mounted) return
          setLoadingProgress(step.progress)
          await new Promise(resolve => setTimeout(resolve, 300))
        }
        
        const gameEngine = new GameEngine({
          gameTemplate: template,
          customization,
          onGameComplete: (score: number, achievements: string[], gameTime?: number) => {
            const totalTime = gameTime || Math.floor((Date.now() - gameStartTime) / 1000)
            onGameComplete(score, achievements, totalTime)
          },
          onGameSave: (gameState: GameState) => {
            setLastSave(new Date())
          },
          onGameExit,
          userId: userId || undefined
        })
        
        gameEngineRef.current = gameEngine
        await gameEngine.initialize('game-container')
        
        if (mounted) {
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Failed to initialize game:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load game')
          setIsLoading(false)
        }
      }
    }
    
    initializeGame()
    
    return () => {
      mounted = false
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy()
        gameEngineRef.current = null
      }
    }
  }, [template, customization, onGameComplete, onGameExit, userId, gameStartTime])

  const handlePause = () => {
    if (gameEngineRef.current) {
      if (isPaused) {
        gameEngineRef.current.resume()
      } else {
        gameEngineRef.current.pause()
      }
      setIsPaused(!isPaused)
    }
  }

  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit? Your progress will be saved.')) {
      onGameExit()
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-white mb-4">Game Failed to Load</h3>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={onGameExit}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Back to Selection
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center max-w-md">
          <div className="text-4xl mb-4">{template.icon}</div>
          <h3 className="text-xl font-bold text-white mb-4">
            Loading {template.title}...
          </h3>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-3 mb-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          
          <p className="text-white/70 text-sm">{loadingProgress}%</p>
          
          {/* Loading Tips */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg">
            <p className="text-white/60 text-xs mb-2">💡 Pro Tip:</p>
            <p className="text-white/80 text-sm">
              {template.id === 'pixel-quest' && 'Use WASD to move and SPACE to attack!'}
              {template.id === 'platform-hero' && 'Master the double-jump for tricky platforms!'}
              {template.id === 'math-rpg' && 'Correct answers deal more damage!'}
              {template.id === 'reveal-adventure' && 'Explore everywhere to find all mini-games!'}
              {template.id === 'puzzle-solver' && 'Use hints wisely - you only get 3!'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Game Header */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-2xl">{template.icon}</span>
            <div>
              <h3 className="text-lg font-bold text-white">
                {template.title}
              </h3>
              <p className="text-sm text-white/60">
                Playing as: <span className="text-white">{customization.characterName}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {lastSave && (
              <div className="text-xs text-green-400">
                💾 Saved {lastSave.toLocaleTimeString()}
              </div>
            )}
            
            <button
              onClick={handlePause}
              className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 rounded-lg transition-colors text-sm border border-yellow-600/30"
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
            
            <button
              onClick={handleExit}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors text-sm border border-red-600/30"
            >
              🚪 Exit
            </button>
          </div>
        </div>
      </div>

      {/* Game Container */}
      <div className="relative">
        <div 
          ref={gameContainerRef}
          id="game-container"
          className="bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl mx-auto"
          style={{ maxWidth: '100%' }}
        />
        
        {isPaused && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <div className="text-center space-y-4">
              <div className="text-6xl">⏸️</div>
              <h3 className="text-2xl font-bold text-white">Game Paused</h3>
              <p className="text-white/70">Your progress is automatically saved</p>
              <button
                onClick={handlePause}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
              >
                ▶️ Resume Game
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Controls Info */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 md:hidden">
        <h4 className="text-white font-semibold mb-2">📱 Mobile Controls</h4>
        <div className="text-sm text-white/70 space-y-1">
          <p>• Use the virtual joystick to move</p>
          <p>• Tap the action button to interact/attack</p>
          <p>• The game auto-saves your progress</p>
        </div>
      </div>

      {/* Desktop Controls Info */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hidden md:block">
        <h4 className="text-white font-semibold mb-2">⌨️ Keyboard Controls</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/70">
          <div>
            <span className="font-medium text-white">Movement:</span>
            <br />WASD or Arrow Keys
          </div>
          <div>
            <span className="font-medium text-white">Action:</span>
            <br />SPACE or ENTER
          </div>
          <div>
            <span className="font-medium text-white">Pause:</span>
            <br />P or ESC
          </div>
          <div>
            <span className="font-medium text-white">Menu:</span>
            <br />M or TAB
          </div>
        </div>
      </div>
    </div>
  )
}