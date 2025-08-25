import Phaser from 'phaser'
import { BaseGameScene, GameSceneData } from '../BaseGameScene'

interface MiniGame {
  id: string
  title: string
  description: string
  completed: boolean
  rewardClue: string
}

interface Clue {
  id: string
  text: string
  found: boolean
}

export class RevealAdventureScene extends BaseGameScene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private currentArea: 'garden' | 'house' | 'celebration' = 'garden'
  private miniGames: MiniGame[] = []
  private clues: Clue[] = []
  private revealType: 'boy' | 'girl' = 'boy' // This would be customizable
  private interactiveObjects!: Phaser.Physics.Arcade.Group
  private npcs!: Phaser.Physics.Arcade.Group
  private currentMiniGame: MiniGame | null = null
  private miniGameContainer: Phaser.GameObjects.Container | null = null
  private celebrationStarted = false
  
  private balloonPuzzle: { balloons: Phaser.GameObjects.Sprite[], poppedCount: number } | null = null
  private treasureHunt: { treasures: Phaser.GameObjects.Sprite[], foundCount: number } | null = null
  private colorMatch: { cards: Phaser.GameObjects.Sprite[], matches: number, firstCard: Phaser.GameObjects.Sprite | null, secondCard: Phaser.GameObjects.Sprite | null } | null = null

  constructor(data: GameSceneData) {
    super('RevealAdventureScene')
    this.init(data)
  }

  preload() {
    console.log('RevealAdventureScene: Starting preload...')
    
    // Create colored shapes for celebration theme
    const graphics = this.add.graphics()
    
    // Hero sprite (colorful character)
    graphics.fillStyle(0x9932CC)
    graphics.fillRect(0, 0, 32, 32)
    graphics.generateTexture('hero', 32, 32)
    
    // Environment (party decorations)
    graphics.clear()
    graphics.fillStyle(0xFF69B4)
    graphics.fillRect(0, 0, 32, 32)
    graphics.generateTexture('environment', 32, 32)
    
    // Items (celebration items - using diamond)
    graphics.clear()
    graphics.fillStyle(0xFFD700)
    graphics.fillCircle(8, 8, 6)
    graphics.generateTexture('items', 16, 16)
    
    graphics.destroy()
    
    console.log('RevealAdventureScene: Preload complete!')
  }

  create() {
    super.create()
    
    // Set reveal type from customization
    this.revealType = this.customization.specialMessage?.toLowerCase().includes('girl') ? 'girl' : 'boy'
    
    this.setupMiniGames()
    this.setupClues()
    this.createArea()
    this.createPlayer()
    this.createInteractives()
    this.setupCollisions()
    this.setupCamera()
    
    this.showWelcomeMessage()
  }

  private setupMiniGames() {
    this.miniGames = [
      {
        id: 'balloon_pop',
        title: 'Balloon Pop Challenge',
        description: 'Pop all the balloons to find the hidden clue!',
        completed: false,
        rewardClue: 'The answer lies in the colors of nature...'
      },
      {
        id: 'treasure_hunt',
        title: 'Treasure Hunt',
        description: 'Find all hidden treasures around the garden!',
        completed: false,
        rewardClue: 'Pink roses bloom for little princesses...'
      },
      {
        id: 'color_match',
        title: 'Color Memory Game',
        description: 'Match the colored cards to unlock the secret!',
        completed: false,
        rewardClue: 'Blue skies welcome little princes...'
      }
    ]
  }

  private setupClues() {
    this.clues = [
      { id: 'clue1', text: 'Something special is coming...', found: false },
      { id: 'clue2', text: 'The color holds the secret...', found: false },
      { id: 'clue3', text: 'Love is growing in our hearts...', found: false }
    ]
  }

  private createArea() {
    // Create background based on current area
    switch (this.currentArea) {
      case 'garden':
        this.createGarden()
        break
      case 'house':
        this.createHouse()
        break
      case 'celebration':
        this.createCelebration()
        break
    }
  }

  private createGarden() {
    // Garden background
    this.add.rectangle(400, 300, 800, 600, 0x90EE90, 0.5)
    
    // Add trees and flowers
    const treePositions = [
      { x: 100, y: 150 },
      { x: 700, y: 120 },
      { x: 150, y: 450 },
      { x: 650, y: 480 }
    ]
    
    treePositions.forEach(pos => {
      const tree = this.add.circle(pos.x, pos.y, 40, 0x228B22)
      const trunk = this.add.rectangle(pos.x, pos.y + 40, 15, 30, 0x8B4513)
    })
    
    // Flower patches
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(50, 750)
      const y = Phaser.Math.Between(200, 550)
      const flower = this.add.circle(x, y, 8, this.revealType === 'girl' ? 0xFFC0CB : 0x87CEEB)
    }
    
    // Garden path
    this.add.rectangle(400, 300, 100, 600, 0xD2B48C, 0.7)
  }

  private createHouse() {
    // House background
    this.add.rectangle(400, 300, 800, 600, 0xF5DEB3, 0.8)
    
    // House structure
    const house = this.add.rectangle(400, 350, 400, 200, 0xDDA0DD)
    const roof = this.add.triangle(400, 250, 0, 100, 200, 0, 400, 100, 0x8B0000)
    const door = this.add.rectangle(400, 420, 60, 80, 0x654321)
    
    // Windows
    const leftWindow = this.add.rectangle(330, 350, 40, 40, 0x87CEEB)
    const rightWindow = this.add.rectangle(470, 350, 40, 40, 0x87CEEB)
  }

  private createCelebration() {
    // Celebration background with party decorations
    this.add.rectangle(400, 300, 800, 600, this.revealType === 'girl' ? 0xFFC0CB : 0x87CEEB, 0.3)
    
    // Balloons
    const balloonColors = this.revealType === 'girl' ? [0xFF69B4, 0xFFC0CB, 0xFF1493] : [0x4169E1, 0x87CEEB, 0x0000FF]
    
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, 750)
      const y = Phaser.Math.Between(50, 200)
      const balloon = this.add.circle(x, y, 15, Phaser.Utils.Array.GetRandom(balloonColors))
      
      // Floating animation
      this.tweens.add({
        targets: balloon,
        y: y - 20,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
    }
    
    // Confetti
    this.createConfetti()
  }

  private createConfetti() {
    const confettiColors = this.revealType === 'girl' 
      ? [0xFF69B4, 0xFFC0CB, 0xFF1493, 0xFFD700]
      : [0x4169E1, 0x87CEEB, 0x0000FF, 0xFFD700]
    
    for (let i = 0; i < 50; i++) {
      const confetti = this.add.rectangle(
        Phaser.Math.Between(0, 800),
        Phaser.Math.Between(-100, 0),
        4, 8,
        Phaser.Utils.Array.GetRandom(confettiColors)
      )
      
      this.tweens.add({
        targets: confetti,
        y: 700,
        rotation: Math.PI * 4,
        duration: Phaser.Math.Between(3000, 6000),
        ease: 'Linear',
        repeat: -1
      })
    }
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(400, 500, 'hero')
    this.player.setSize(24, 32)
    this.player.setBounce(0.1)
    this.player.setCollideWorldBounds(true)
    this.player.setTint(0x4169E1)
    
    if (this.gameState.position) {
      this.player.setPosition(this.gameState.position.x, this.gameState.position.y)
    }
  }

  private createInteractives() {
    this.interactiveObjects = this.physics.add.group()
    this.npcs = this.physics.add.group()
    
    // Create interactive objects based on current area
    switch (this.currentArea) {
      case 'garden':
        this.createGardenInteractives()
        break
      case 'house':
        this.createHouseInteractives()
        break
    }
  }

  private createGardenInteractives() {
    // Balloon pop game trigger
    const balloonGame = this.physics.add.sprite(200, 200, 'items')
    balloonGame.setTint(0xFF69B4)
    balloonGame.setData('type', 'minigame')
    balloonGame.setData('gameId', 'balloon_pop')
    this.interactiveObjects.add(balloonGame)
    
    // Treasure hunt game trigger
    const treasureGame = this.physics.add.sprite(600, 400, 'items')
    treasureGame.setTint(0xFFD700)
    treasureGame.setData('type', 'minigame')
    treasureGame.setData('gameId', 'treasure_hunt')
    this.interactiveObjects.add(treasureGame)
    
    // NPC helper
    const npc = this.physics.add.sprite(400, 150, 'hero')
    npc.setTint(0x90EE90)
    npc.setData('type', 'npc')
    npc.setData('dialogue', [
      `Welcome to the Gender Reveal Adventure, ${this.customization.characterName}!`,
      'Complete the mini-games to collect clues!',
      'Each clue will help reveal the big surprise!'
    ])
    this.npcs.add(npc)
  }

  private createHouseInteractives() {
    // Color matching game
    const colorGame = this.physics.add.sprite(400, 350, 'items')
    colorGame.setTint(0x9370DB)
    colorGame.setData('type', 'minigame')
    colorGame.setData('gameId', 'color_match')
    this.interactiveObjects.add(colorGame)
  }

  private setupCollisions() {
    // Player vs interactives
    this.physics.add.overlap(this.player, this.interactiveObjects, (player, obj) => {
      this.handleInteraction(obj as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody)
    })
    
    // Player vs NPCs
    this.physics.add.overlap(this.player, this.npcs, (player, npc) => {
      this.handleNPCInteraction(npc as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody)
    })
  }

  private setupCamera() {
    this.cameras.main.startFollow(this.player)
    this.cameras.main.setBounds(0, 0, 800, 600)
  }

  private showWelcomeMessage() {
    const message = this.add.text(400, 100, 
      `Welcome, ${this.customization.characterName}!\nA special surprise awaits...\nComplete mini-games to discover clues!`, 
      {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'monospace',
        align: 'center',
        backgroundColor: '#000000',
        padding: { x: 12, y: 8 }
      }
    )
    message.setOrigin(0.5)
    
    this.time.delayedCall(4000, () => {
      message.destroy()
    })
  }

  private handleInteraction(obj: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
    const type = obj.getData('type')
    
    if (type === 'minigame') {
      const gameId = obj.getData('gameId')
      const miniGame = this.miniGames.find(mg => mg.id === gameId)
      
      if (miniGame && !miniGame.completed) {
        this.startMiniGame(miniGame)
      } else if (miniGame?.completed) {
        this.showMessage('This mini-game is already completed!', '#4ade80')
      }
    }
  }

  private handleNPCInteraction(npc: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
    const dialogue = npc.getData('dialogue')
    if (dialogue && dialogue.length > 0) {
      this.showDialogue(dialogue)
    }
  }

  private showDialogue(dialogue: string[]) {
    const dialogueText = dialogue.join('\n\n')
    
    const dialogueBox = this.add.text(400, 450, dialogueText, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 15, y: 10 },
      wordWrap: { width: 600 }
    })
    dialogueBox.setOrigin(0.5)
    
    this.time.delayedCall(4000, () => {
      dialogueBox.destroy()
    })
  }

  private startMiniGame(miniGame: MiniGame) {
    this.currentMiniGame = miniGame
    
    switch (miniGame.id) {
      case 'balloon_pop':
        this.startBalloonPop()
        break
      case 'treasure_hunt':
        this.startTreasureHunt()
        break
      case 'color_match':
        this.startColorMatch()
        break
    }
  }

  private startBalloonPop() {
    this.miniGameContainer = this.add.container(400, 300)
    
    // Background
    const bg = this.add.rectangle(0, 0, 700, 500, 0x000000, 0.8)
    bg.setStrokeStyle(3, 0xFFFFFF)
    
    // Title
    const title = this.add.text(0, -200, 'Balloon Pop Challenge!\nClick all balloons!', {
      fontSize: '18px',
      color: '#FFD700',
      fontFamily: 'monospace',
      align: 'center',
      fontStyle: 'bold'
    })
    title.setOrigin(0.5)
    
    this.miniGameContainer.add([bg, title])
    
    // Create balloons
    const balloons: Phaser.GameObjects.Sprite[] = []
    const balloonPositions = [
      { x: -150, y: -80 }, { x: 0, y: -100 }, { x: 150, y: -70 },
      { x: -100, y: 0 }, { x: 100, y: 20 },
      { x: -50, y: 100 }, { x: 80, y: 80 }
    ]
    
    balloonPositions.forEach((pos, index) => {
      const balloon = this.add.sprite(pos.x, pos.y, 'items')
      const colors = [0xFF69B4, 0x87CEEB, 0xFFD700, 0x90EE90, 0xFF6B6B]
      balloon.setTint(colors[index % colors.length])
      balloon.setInteractive()
      balloon.setScale(1.5)
      
      balloon.on('pointerdown', () => {
        // Pop animation
        this.tweens.add({
          targets: balloon,
          scaleX: 0,
          scaleY: 0,
          alpha: 0,
          duration: 200,
          onComplete: () => {
            balloon.destroy()
            balloons.splice(balloons.indexOf(balloon), 1)
            
            if (balloons.length === 0) {
              this.completeBalloonPop()
            }
          }
        })
      })
      
      // Floating animation
      this.tweens.add({
        targets: balloon,
        y: pos.y - 10,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
      
      balloons.push(balloon)
      this.miniGameContainer.add(balloon)
    })
    
    this.balloonPuzzle = { balloons, poppedCount: 0 }
  }

  private completeBalloonPop() {
    this.showMessage('All balloons popped! Clue discovered!', '#4ade80')
    this.completeMiniGame('balloon_pop')
  }

  private startTreasureHunt() {
    this.miniGameContainer = this.add.container(400, 300)
    
    const bg = this.add.rectangle(0, 0, 700, 500, 0x000000, 0.8)
    bg.setStrokeStyle(3, 0xFFFFFF)
    
    const title = this.add.text(0, -200, 'Treasure Hunt!\nFind all hidden treasures!', {
      fontSize: '18px',
      color: '#FFD700',
      fontFamily: 'monospace',
      align: 'center',
      fontStyle: 'bold'
    })
    title.setOrigin(0.5)
    
    this.miniGameContainer.add([bg, title])
    
    // Create treasures
    const treasures: Phaser.GameObjects.Sprite[] = []
    for (let i = 0; i < 5; i++) {
      const treasure = this.add.sprite(
        Phaser.Math.Between(-300, 300),
        Phaser.Math.Between(-150, 150),
        'items'
      )
      treasure.setTint(0xFFD700)
      treasure.setInteractive()
      treasure.setAlpha(0.7) // Slightly transparent to show they're hidden
      
      treasure.on('pointerdown', () => {
        // Collection effect
        this.tweens.add({
          targets: treasure,
          scale: 2,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            treasure.destroy()
            treasures.splice(treasures.indexOf(treasure), 1)
            
            if (treasures.length === 0) {
              this.completeTreasureHunt()
            }
          }
        })
      })
      
      // Sparkle effect
      this.tweens.add({
        targets: treasure,
        alpha: 0.3,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
      
      treasures.push(treasure)
      this.miniGameContainer.add(treasure)
    }
    
    this.treasureHunt = { treasures, foundCount: 0 }
  }

  private completeTreasureHunt() {
    this.showMessage('All treasures found! Another clue unlocked!', '#4ade80')
    this.completeMiniGame('treasure_hunt')
  }

  private startColorMatch() {
    this.miniGameContainer = this.add.container(400, 300)
    
    const bg = this.add.rectangle(0, 0, 700, 500, 0x000000, 0.8)
    bg.setStrokeStyle(3, 0xFFFFFF)
    
    const title = this.add.text(0, -200, 'Color Memory Game!\nMatch pairs of colors!', {
      fontSize: '18px',
      color: '#FFD700',
      fontFamily: 'monospace',
      align: 'center',
      fontStyle: 'bold'
    })
    title.setOrigin(0.5)
    
    this.miniGameContainer.add([bg, title])
    
    // Create memory cards
    const colors = [0xFF69B4, 0x87CEEB, 0x90EE90, 0xFFD700]
    const cardColors = [...colors, ...colors] // Duplicate for pairs
    Phaser.Utils.Array.Shuffle(cardColors)
    
    const cards: Phaser.GameObjects.Sprite[] = []
    const cardPositions = [
      { x: -150, y: -80 }, { x: -50, y: -80 }, { x: 50, y: -80 }, { x: 150, y: -80 },
      { x: -150, y: 20 }, { x: -50, y: 20 }, { x: 50, y: 20 }, { x: 150, y: 20 }
    ]
    
    cardPositions.forEach((pos, index) => {
      const card = this.add.sprite(pos.x, pos.y, 'items')
      card.setTint(0x666666) // Face down
      card.setInteractive()
      card.setData('color', cardColors[index])
      card.setData('revealed', false)
      card.setData('matched', false)
      
      card.on('pointerdown', () => {
        this.handleCardClick(card)
      })
      
      cards.push(card)
      this.miniGameContainer.add(card)
    })
    
    this.colorMatch = {
      cards,
      matches: 0,
      firstCard: null,
      secondCard: null
    }
  }

  private handleCardClick(card: Phaser.GameObjects.Sprite) {
    if (!this.colorMatch) return
    if (card.getData('revealed') || card.getData('matched')) return
    
    // Reveal card
    card.setTint(card.getData('color'))
    card.setData('revealed', true)
    
    if (!this.colorMatch.firstCard) {
      this.colorMatch.firstCard = card
    } else if (!this.colorMatch.secondCard) {
      this.colorMatch.secondCard = card
      
      // Check for match
      this.time.delayedCall(500, () => {
        this.checkColorMatch()
      })
    }
  }

  private checkColorMatch() {
    if (!this.colorMatch) return
    
    const first = this.colorMatch.firstCard
    const second = this.colorMatch.secondCard
    
    if (first.getData('color') === second.getData('color')) {
      // Match!
      first.setData('matched', true)
      second.setData('matched', true)
      this.colorMatch.matches++
      
      if (this.colorMatch.matches === 4) {
        this.completeColorMatch()
      }
    } else {
      // No match - flip back
      first.setTint(0x666666)
      second.setTint(0x666666)
      first.setData('revealed', false)
      second.setData('revealed', false)
    }
    
    this.colorMatch.firstCard = null
    this.colorMatch.secondCard = null
  }

  private completeColorMatch() {
    this.showMessage('All pairs matched! Final clue revealed!', '#4ade80')
    this.completeMiniGame('color_match')
  }

  private completeMiniGame(gameId: string) {
    if (this.miniGameContainer) {
      this.miniGameContainer.destroy()
      this.miniGameContainer = null
    }
    
    const miniGame = this.miniGames.find(mg => mg.id === gameId)
    if (miniGame) {
      miniGame.completed = true
      
      // Add clue
      const clue = this.clues.find(c => !c.found)
      if (clue) {
        clue.found = true
        this.showMessage(`Clue: ${miniGame.rewardClue}`, '#FFD700')
      }
      
      this.gameState.score += 500
      this.addToInventory({
        id: `clue_${gameId}`,
        name: `Clue from ${miniGame.title}`,
        type: 'key',
        description: miniGame.rewardClue
      })
    }
    
    // Check if all mini-games are complete
    if (this.miniGames.every(mg => mg.completed)) {
      this.time.delayedCall(2000, () => {
        this.startReveal()
      })
    }
    
    this.updateUI()
  }

  private startReveal() {
    if (this.celebrationStarted) return
    this.celebrationStarted = true
    
    // Clear the scene
    this.children.removeAll()
    
    // Create celebration area
    this.currentArea = 'celebration'
    this.createArea()
    
    // Show the big reveal
    this.showGenderReveal()
  }

  private showGenderReveal() {
    const revealColor = this.revealType === 'girl' ? 0xFF69B4 : 0x4169E1
    const revealText = this.revealType === 'girl' ? "It's a GIRL!" : "It's a BOY!"
    const message = this.customization.specialMessage || `${this.customization.characterName || 'Our'} bundle of joy`
    
    // Big reveal text
    const reveal = this.add.text(400, 200, revealText, {
      fontSize: '48px',
      color: Phaser.Display.Color.IntegerToColor(revealColor).rgba,
      fontFamily: 'monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    })
    reveal.setOrigin(0.5)
    reveal.setScale(0)
    
    // Animate reveal
    this.tweens.add({
      targets: reveal,
      scale: 1,
      duration: 1000,
      ease: 'Back.easeOut'
    })
    
    // Secondary message
    this.time.delayedCall(1500, () => {
      const subText = this.add.text(400, 300, message, {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'monospace',
        align: 'center',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      })
      subText.setOrigin(0.5)
      
      // Fireworks effect
      this.createFireworks()
      
      // Complete the game
      this.time.delayedCall(5000, () => {
        this.addAchievement('gender_revealed')
        this.addAchievement('celebration_complete')
        this.completeGame(this.gameState.score, this.gameState.achievements)
      })
    })
  }

  private createFireworks() {
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 800, () => {
        const x = Phaser.Math.Between(100, 700)
        const y = Phaser.Math.Between(100, 300)
        
        // Create firework burst
        for (let j = 0; j < 20; j++) {
          const particle = this.add.circle(x, y, 3, this.revealType === 'girl' ? 0xFF69B4 : 0x4169E1)
          
          const angle = (j / 20) * Math.PI * 2
          const speed = Phaser.Math.Between(50, 150)
          
          this.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * speed,
            y: y + Math.sin(angle) * speed,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => particle.destroy()
          })
        }
      })
    }
  }

  private showMessage(text: string, color: string = '#ffffff') {
    const message = this.add.text(400, 100, text, {
      fontSize: '16px',
      color: color,
      fontFamily: 'monospace',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 12, y: 6 }
    })
    message.setOrigin(0.5)
    message.setDepth(1000)
    
    this.time.delayedCall(3000, () => {
      message.destroy()
    })
  }

  update() {
    // Player movement
    let velocityX = 0
    let velocityY = 0
    const speed = 160
    
    // Keyboard controls
    if (this.controls.keys?.left.isDown) velocityX = -speed
    if (this.controls.keys?.right.isDown) velocityX = speed
    if (this.controls.keys?.up.isDown) velocityY = -speed
    if (this.controls.keys?.down.isDown) velocityY = speed
    
    // Mobile controls
    if (this.controls.mobile) {
      if (this.controls.mobile.left) velocityX = -speed
      if (this.controls.mobile.right) velocityX = speed
      if (this.controls.mobile.up) velocityY = -speed
      if (this.controls.mobile.down) velocityY = speed
    }
    
    if (this.player && this.player.body) {
      this.player.body.setVelocity(velocityX, velocityY)
    }
    
    // Update game state
    if (this.player) {
      this.gameState.position = { x: this.player.x, y: this.player.y }
    }
    
    // Auto-save
    if (this.time.now % 12000 < 16) {
      this.saveGame()
    }
  }
}