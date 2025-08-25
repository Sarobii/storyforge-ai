import Phaser from 'phaser'
import { GameCustomization, GameState } from '../types/game'

export interface GameSceneData {
  customization: GameCustomization
  savedState?: GameState
  onGameComplete?: (score: number, achievements: string[]) => void
  onGameSave?: (gameState: GameState) => void
  onGamePause?: (gameState: GameState) => void
}

export abstract class BaseGameScene extends Phaser.Scene {
  protected gameState: GameState
  protected customization: GameCustomization
  protected controls: any = {}
  protected isMobile: boolean = false
  protected gameCompleteCallback?: (score: number, achievements: string[]) => void
  protected gameSaveCallback?: (gameState: GameState) => void
  protected gamePauseCallback?: (gameState: GameState) => void
  protected isPaused: boolean = false
  protected startTime: number = 0

  constructor(key: string) {
    super({ key })
    
    // Default game state
    this.gameState = {
      level: 1,
      score: 0,
      lives: 3,
      health: 100,
      inventory: [],
      position: { x: 0, y: 0 },
      checkpoints: [],
      customizations: {},
      achievements: [],
      playtime: 0
    }
  }

  init(data: GameSceneData) {
    this.customization = data.customization || {
      characterName: 'Hero',
      theme: 'classic',
      difficulty: 'medium'
    }
    
    if (data.savedState) {
      this.gameState = { ...data.savedState }
    }
    
    this.gameCompleteCallback = data.onGameComplete
    this.gameSaveCallback = data.onGameSave
    this.gamePauseCallback = data.onGamePause
    
    // Detect mobile device
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    this.startTime = Date.now()
  }

  create() {
    this.setupControls()
    this.setupUI()
    this.setupAudio()
    
    // Update playtime every second
    this.time.addEvent({
      delay: 1000,
      callback: this.updatePlaytime,
      callbackScope: this,
      loop: true
    })
  }

  protected setupControls() {
    // Keyboard controls
    this.controls.keys = this.input.keyboard?.addKeys({
      up: ['UP', 'W'],
      down: ['DOWN', 'S'],
      left: ['LEFT', 'A'],
      right: ['RIGHT', 'D'],
      action: ['SPACE', 'ENTER'],
      pause: ['P', 'ESC'],
      menu: ['M', 'TAB']
    })

    // Mobile touch controls
    if (this.isMobile) {
      this.setupMobileControls()
    }

    // Pause functionality
    this.controls.keys?.pause.on('down', () => {
      this.togglePause()
    })
  }

  protected setupMobileControls() {
    // Virtual joystick for movement
    const joystickContainer = this.add.container(100, this.cameras.main.height - 100)
    joystickContainer.setScrollFactor(0)
    joystickContainer.setDepth(1000)
    
    const joystickBase = this.add.circle(0, 0, 40, 0x333333, 0.5)
    const joystickStick = this.add.circle(0, 0, 20, 0x666666, 0.8)
    
    joystickContainer.add([joystickBase, joystickStick])
    
    // Action button
    const actionButton = this.add.circle(this.cameras.main.width - 80, this.cameras.main.height - 100, 35, 0xff6b35, 0.8)
    actionButton.setScrollFactor(0)
    actionButton.setDepth(1000)
    actionButton.setInteractive()
    
    const actionText = this.add.text(actionButton.x, actionButton.y, 'ACT', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    })
    actionText.setOrigin(0.5)
    actionText.setScrollFactor(0)
    actionText.setDepth(1001)
    
    // Touch input handling
    let isDragging = false
    let dragStart = { x: 0, y: 0 }
    
    joystickContainer.setInteractive(new Phaser.Geom.Circle(0, 0, 40), Phaser.Geom.Circle.Contains)
    
    joystickContainer.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      isDragging = true
      dragStart = { x: pointer.x, y: pointer.y }
    })
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (isDragging) {
        const distance = Phaser.Math.Distance.Between(joystickBase.x, joystickBase.y, pointer.x - joystickContainer.x, pointer.y - joystickContainer.y)
        const angle = Phaser.Math.Angle.Between(joystickBase.x, joystickBase.y, pointer.x - joystickContainer.x, pointer.y - joystickContainer.y)
        
        const maxDistance = 30
        const clampedDistance = Math.min(distance, maxDistance)
        
        joystickStick.x = Math.cos(angle) * clampedDistance
        joystickStick.y = Math.sin(angle) * clampedDistance
        
        // Update controls based on joystick position
        this.controls.mobile = {
          left: joystickStick.x < -10,
          right: joystickStick.x > 10,
          up: joystickStick.y < -10,
          down: joystickStick.y > 10,
          action: false
        }
      }
    })
    
    this.input.on('pointerup', () => {
      isDragging = false
      joystickStick.x = 0
      joystickStick.y = 0
      this.controls.mobile = { left: false, right: false, up: false, down: false, action: false }
    })
    
    actionButton.on('pointerdown', () => {
      if (this.controls.mobile) {
        this.controls.mobile.action = true
      }
    })
    
    actionButton.on('pointerup', () => {
      if (this.controls.mobile) {
        this.controls.mobile.action = false
      }
    })
  }

  protected setupUI() {
    // Create UI container
    const uiContainer = this.add.container(0, 0)
    uiContainer.setScrollFactor(0)
    uiContainer.setDepth(900)
    
    // Health bar
    const healthBarBg = this.add.rectangle(20, 20, 200, 20, 0x333333)
    healthBarBg.setOrigin(0, 0)
    const healthBar = this.add.rectangle(20, 20, (this.gameState.health / 100) * 200, 20, 0x4ade80)
    healthBar.setOrigin(0, 0)
    
    // Score display
    const scoreText = this.add.text(20, 50, `Score: ${this.gameState.score}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    })
    
    // Lives display
    const livesText = this.add.text(20, 80, `Lives: ${this.gameState.lives}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    })
    
    uiContainer.add([healthBarBg, healthBar, scoreText, livesText])
    
    // Store references for updates
    this.data.set('healthBar', healthBar)
    this.data.set('scoreText', scoreText)
    this.data.set('livesText', livesText)
  }

  protected setupAudio() {
    // Enable audio context
    try {
      if ((this.sound as any).context && (this.sound as any).context.state === 'suspended') {
        (this.sound as any).context.resume()
      }
    } catch (error) {
      console.warn('Audio context not available:', error)
    }
  }

  protected updateUI() {
    const healthBar = this.data.get('healthBar')
    const scoreText = this.data.get('scoreText')
    const livesText = this.data.get('livesText')
    
    if (healthBar) {
      healthBar.width = (this.gameState.health / 100) * 200
    }
    
    if (scoreText) {
      scoreText.setText(`Score: ${this.gameState.score}`)
    }
    
    if (livesText) {
      livesText.setText(`Lives: ${this.gameState.lives}`)
    }
  }

  protected updatePlaytime() {
    if (!this.isPaused) {
      this.gameState.playtime += 1
    }
  }

  protected togglePause() {
    this.isPaused = !this.isPaused
    
    if (this.isPaused) {
      this.scene.pause()
      this.gamePauseCallback?.(this.gameState)
      
      // Show pause overlay
      const pauseOverlay = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7)
      pauseOverlay.setScrollFactor(0)
      pauseOverlay.setDepth(1100)
      
      const pauseText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'PAUSED\n\nPress P to Resume', {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        align: 'center'
      })
      pauseText.setOrigin(0.5)
      pauseText.setScrollFactor(0)
      pauseText.setDepth(1101)
      
      this.data.set('pauseOverlay', [pauseOverlay, pauseText])
    } else {
      this.scene.resume()
      
      // Remove pause overlay
      const pauseOverlay = this.data.get('pauseOverlay')
      if (pauseOverlay) {
        pauseOverlay.forEach((obj: any) => obj.destroy())
        this.data.remove('pauseOverlay')
      }
    }
  }

  protected completeGame(score?: number, achievements?: string[]) {
    this.gameCompleteCallback?.(score || this.gameState.score, achievements || this.gameState.achievements)
  }

  protected saveGame() {
    this.gameSaveCallback?.(this.gameState)
  }

  protected addToInventory(item: { id: string; name: string; type: string; quantity?: number; description?: string }) {
    const existingItem = this.gameState.inventory.find(i => i.id === item.id)
    
    if (existingItem) {
      existingItem.quantity += (item.quantity || 1)
    } else {
      this.gameState.inventory.push({
        id: item.id,
        name: item.name,
        type: item.type as any,
        quantity: item.quantity || 1,
        description: item.description || ''
      })
    }
  }

  protected addAchievement(achievementId: string) {
    if (!this.gameState.achievements.includes(achievementId)) {
      this.gameState.achievements.push(achievementId)
    }
  }

  // Abstract methods that must be implemented by each game
  abstract preload(): void
  abstract update(): void
}