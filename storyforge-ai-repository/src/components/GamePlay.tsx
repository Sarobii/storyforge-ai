import React, { useEffect, useRef, useState } from 'react'
import { GameEngine } from '../game/GameEngine'
import { GameTemplate, GameCustomization, GameState, MathProblem, MathRPGPlayer, MathRPGEnemy, MathRPGShopItem } from '../types/game'
import { MathProblemOverlay } from './math-rpg/MathProblemOverlay'
import { ShopOverlay } from './math-rpg/ShopOverlay'
import { HUD } from './math-rpg/HUD'
import { toast } from 'sonner'

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

  // Math RPG specific state
  const [mathProblemVisible, setMathProblemVisible] = useState(false)
  const [shopVisible, setShopVisible] = useState(false)
  const [hudVisible, setHudVisible] = useState(false)
  const [currentMathProblem, setCurrentMathProblem] = useState<MathProblem | null>(null)
  const [currentEnemy, setCurrentEnemy] = useState<any>(null)
  const [playerStats, setPlayerStats] = useState<MathRPGPlayer | null>(null)
  const [enemyStats, setEnemyStats] = useState<any>(null)
  const [shopItems, setShopItems] = useState<MathRPGShopItem[]>([])
  const [battleNumber, setBattleNumber] = useState(1)

  // Math RPG Event Setup
  const setupMathRPGEvents = (gameEngine: GameEngine) => {
    const scene = gameEngine.getCurrentScene() as any
    if (!scene || !scene.getGameEvents) return

    const gameEvents = scene.getGameEvents()

    // Show Math Problem Overlay
    gameEvents.on('OPEN_MATH_OVERLAY', (data: any) => {
      setCurrentMathProblem(data.problem)
      setCurrentEnemy(data.enemy)
      setMathProblemVisible(true)
      toast.info('🧮 Solve the math problem to attack!')
    })

    // Update HUD
    gameEvents.on('UPDATE_HUD', (data: any) => {
      setPlayerStats(data.player)
      setEnemyStats(data.enemy)
      setHudVisible(true)
      setBattleNumber(data.player?.currentBattle || 1)
    })

    // Combat Result
    gameEvents.on('COMBAT_RESULT', (data: any) => {
      setMathProblemVisible(false)
      if (data.success) {
        toast.success(`✅ ${data.message}`, {
          duration: 3000,
          style: { background: '#10b981', color: 'white' }
        })
      } else {
        toast.error(`❌ ${data.message}`, {
          duration: 3000,
          style: { background: '#ef4444', color: 'white' }
        })
      }
    })

    // Enemy Attack
    gameEvents.on('ENEMY_ATTACK', (data: any) => {
      toast.warning(`⚔️ ${data.enemyName} attacks for ${data.damage} damage!`, {
        duration: 2000,
        style: { background: '#f59e0b', color: 'white' }
      })
    })

    // Enemy Defeated
    gameEvents.on('ENEMY_DEFEATED', (data: any) => {
      const message = data.isBoss
        ? `👑 Boss ${data.enemy} defeated! +${data.expGained} EXP, +${data.goldGained} Gold!`
        : `⚔️ ${data.enemy} defeated! +${data.expGained} EXP, +${data.goldGained} Gold!`

      toast.success(message, {
        duration: 4000,
        style: { background: '#10b981', color: 'white' }
      })
    })

    // Level Up
    gameEvents.on('LEVEL_UP', (data: any) => {
      toast.success(`🌟 Level Up! You're now level ${data.newLevel}!`, {
        duration: 4000,
        style: { background: '#8b5cf6', color: 'white' }
      })

      setTimeout(() => {
        toast.info(`📈 Stats increased! HP +${data.hpIncrease}, ATK +${data.attackIncrease}, DEF +${data.defenseIncrease}`, {
          duration: 3000
        })
      }, 1000)
    })

    // Player Defeated
    gameEvents.on('PLAYER_DEFEATED', (data: any) => {
      setHudVisible(false)
      toast.error(`💀 Game Over! Final Score: ${data.finalScore}`, {
        duration: 5000,
        style: { background: '#ef4444', color: 'white' }
      })
    })

    // Shop Overlay
    gameEvents.on('OPEN_SHOP_OVERLAY', (data: any) => {
      setShopItems(data.items)
      setShopVisible(true)
      toast.info('🛒 Welcome to the shop! Buy items to aid your journey.')
    })

    // Item Purchased
    gameEvents.on('ITEM_PURCHASED', (data: any) => {
      const effects = []
      if (data.effect.hp) effects.push(`+${data.effect.hp} HP`)
      if (data.effect.attack) effects.push(`+${data.effect.attack} ATK`)
      if (data.effect.defense) effects.push(`+${data.effect.defense} DEF`)

      toast.success(`🛍️ Purchased ${data.item}! ${effects.join(', ')}`, {
        duration: 3000,
        style: { background: '#10b981', color: 'white' }
      })
    })

    // Game Completed
    gameEvents.on('GAME_COMPLETED', (data: any) => {
      setHudVisible(false)
      const message = data.victory
        ? `🎉 Victory! You completed the Math RPG! Final Score: ${data.finalScore}`
        : `💀 Game Over! Final Score: ${data.finalScore}`

      toast.success(message, {
        duration: 6000,
        style: { background: data.victory ? '#10b981' : '#ef4444', color: 'white' }
      })
    })
  }

  // Math RPG Event Handlers
  const handleMathAnswer = (answer: number) => {
    const scene = gameEngineRef.current?.getCurrentScene() as any
    if (scene && scene.getGameEvents) {
      scene.getGameEvents().emit('MATH_ANSWER_SUBMITTED', answer)
    }
  }

  const handleShopPurchase = (itemId: string) => {
    const scene = gameEngineRef.current?.getCurrentScene() as any
    if (scene && scene.getGameEvents) {
      scene.getGameEvents().emit('SHOP_PURCHASE', itemId)
    }
  }

  const handleMathOverlayClose = () => {
    setMathProblemVisible(false)
  }

  const handleShopOverlayClose = () => {
    setShopVisible(false)
    const scene = gameEngineRef.current?.getCurrentScene() as any
    if (scene && scene.getGameEvents) {
      scene.getGameEvents().emit('OVERLAY_CLOSED')
    }
  }

  useEffect(() => {
    let mounted = true
    
    const initializeGame = async () => {
      try {
        // Simulate loading progress first
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
        
        // Set loading to false to render the game container
        if (mounted) {
          setIsLoading(false)
        }

        // Wait a bit for the DOM to render the game container
        await new Promise(resolve => setTimeout(resolve, 100))

        // Now check for the game container
        const gameContainer = document.getElementById('game-container')
        if (!gameContainer) {
          throw new Error('Game container not found')
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
        
        // Setup Math RPG event listeners if this is a Math RPG game
        if (template.id === 'math-rpg') {
          setupMathRPGEvents(gameEngine)
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

      {/* Math RPG Overlays and HUD */}
      {template.id === 'math-rpg' && (
        <>
          <HUD
            player={playerStats!}
            enemy={enemyStats}
            battleNumber={battleNumber}
            isVisible={hudVisible && playerStats !== null}
          />

          <MathProblemOverlay
            problem={currentMathProblem!}
            enemy={currentEnemy}
            onAnswer={handleMathAnswer}
            onClose={handleMathOverlayClose}
            isVisible={mathProblemVisible && currentMathProblem !== null}
          />

          <ShopOverlay
            items={shopItems}
            playerGold={playerStats?.gold || 0}
            onPurchase={handleShopPurchase}
            onClose={handleShopOverlayClose}
            isVisible={shopVisible}
          />
        </>
      )}
    </div>
  )
}