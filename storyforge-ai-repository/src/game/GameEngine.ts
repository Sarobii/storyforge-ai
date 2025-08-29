import Phaser from 'phaser'
import { GameTemplate, GameCustomization, GameState } from '../types/game'
import { saveGameState, loadGameState } from '../config/supabase'

export interface GameEngineProps {
  gameTemplate: GameTemplate
  customization: GameCustomization
  onGameComplete: (score: number, achievements: string[], gameTime: number) => void
  onGameSave: (gameState: GameState) => void
  onGameExit: () => void
  userId?: string
}

export class GameEngine {
  /**
   * Returns the current active Phaser scene (the main game scene).
   */
  public getCurrentScene(): Phaser.Scene | null {
    if (this.game && this.game.scene) {
      // Return the first running scene (should be the main game scene)
      const scenes = this.game.scene.getScenes(true)
      return scenes.length > 0 ? scenes[0] : null
    }
    return null
  }
  private game: Phaser.Game | null = null
  private gameContainer: HTMLDivElement | null = null
  private props: GameEngineProps

  constructor(props: GameEngineProps) {
    this.props = props
  }

  async initialize(containerId: string): Promise<void> {
    try {
      console.log('GameEngine: Starting initialization for', this.props.gameTemplate.id)

      this.gameContainer = document.getElementById(containerId) as HTMLDivElement

      if (!this.gameContainer) {
        throw new Error(`Game container with id '${containerId}' not found`)
      }

      console.log('GameEngine: Loading saved game state...')
      // Load saved game state with timeout
      const savedState = await Promise.race([
        loadGameState(this.props.gameTemplate.id, this.props.userId),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Load timeout')), 5000))
      ]).catch(error => {
        console.warn('GameEngine: Failed to load saved state:', error)
        return null
      })

      console.log('GameEngine: Creating Phaser config...')
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: containerId,
        backgroundColor: '#2c3e50',
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          min: {
            width: 400,
            height: 300
          },
          max: {
            width: 1200,
            height: 900
          }
        },
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 300, x: 0 },
            debug: false
          }
        },
        audio: {
          disableWebAudio: false
        },
        input: {
          gamepad: true,
          keyboard: true,
          mouse: true,
          touch: true
        },
        render: {
          pixelArt: true,
          antialias: false
        }
      }

      console.log('GameEngine: Getting game scene...')
      // Add the appropriate game scene based on template
      config.scene = await this.getGameScene(this.props.gameTemplate.id, savedState as any)

      console.log('GameEngine: Creating Phaser game...')
      this.game = new Phaser.Game(config)

      // Add scene monitoring
      this.game.events.on('ready', () => {
        console.log('GameEngine: Phaser game ready')
        console.log('GameEngine: Active scenes:', this.game!.scene.getScenes().map(s => s.scene.key))
      })

      console.log('GameEngine: Initialization complete!')
    } catch (error) {
      console.error('GameEngine: Initialization failed:', error)
      throw error
    }
  }

  private async getGameScene(templateId: string, savedState?: GameState) {
    console.log('GameEngine: Loading scene for template ID:', templateId)

    const sceneData = {
      customization: this.props.customization,
      savedState,
      onGameComplete: this.handleGameComplete.bind(this),
      onGameSave: this.handleGameSave.bind(this),
      onGamePause: this.handleGameSave.bind(this) // Auto-save on pause
    }

    switch (templateId) {
      case 'pixel-quest': {
        console.log('GameEngine: Loading PixelQuestScene')
        const { PixelQuestScene } = await import('./scenes/PixelQuestScene');
        return new PixelQuestScene(sceneData);
      }
      case 'platform-hero': {
        console.log('GameEngine: Loading PlatformHeroScene')
        const { PlatformHeroScene } = await import('./scenes/PlatformHeroScene');
        return new PlatformHeroScene(sceneData);
      }
      case 'math-rpg': {
        console.log('GameEngine: Loading MathRPGScene')
        const { MathRPGScene } = await import('./scenes/MathRPGScene');
        return new MathRPGScene(sceneData);
      }
      case 'reveal-adventure': {
        console.log('GameEngine: Loading RevealAdventureScene')
        const { RevealAdventureScene } = await import('./scenes/RevealAdventureScene');
        return new RevealAdventureScene(sceneData);
      }
      case 'puzzle-solver': {
        console.log('GameEngine: Loading PuzzleSolverScene')
        const { PuzzleSolverScene } = await import('./scenes/PuzzleSolverScene');
        return new PuzzleSolverScene(sceneData);
      }
      default:
        console.error('GameEngine: Unknown template ID:', templateId)
        throw new Error(`Unknown game template: ${templateId}`);
    }
  }

  private async handleGameComplete(score: number, achievements: string[], gameTime?: number) {
    // Clear saved game state
    if (this.props.userId) {
      await saveGameState(this.props.gameTemplate.id, null, this.props.userId)
    } else {
      localStorage.removeItem(`${this.props.gameTemplate.id}_guest`)
    }

    this.props.onGameComplete(score, achievements, gameTime || 0)
  }

  private async handleGameSave(gameState: GameState) {
    await saveGameState(this.props.gameTemplate.id, gameState, this.props.userId)
    this.props.onGameSave(gameState)
  }

  public pause() {
    if (this.game && this.game.scene) {
      const scenes = this.game.scene.getScenes()
      scenes.forEach(scene => this.game!.scene.pause(scene.scene.key))
    }
  }

  public resume() {
    if (this.game && this.game.scene) {
      const scenes = this.game.scene.getScenes()
      scenes.forEach(scene => this.game!.scene.resume(scene.scene.key))
    }
  }

  public destroy() {
    if (this.game) {
      this.game.destroy(true)
      this.game = null
    }
  }

  public resize(width: number, height: number) {
    if (this.game) {
      this.game.scale.resize(width, height)
    }
  }
}