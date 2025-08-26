import Phaser from 'phaser'
import { BaseGameScene, GameSceneData } from '../BaseGameScene'

export interface MathProblem {
  question: string
  answer: number
  difficulty: number
  type: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed'
  options?: number[]
}

export interface MathRPGPlayer {
  name: string
  hp: number
  maxHp: number
  attack: number
  defense: number
  level: number
  exp: number
  expToNext: number
  gold: number
  sprite: Phaser.GameObjects.Sprite
}

export interface MathRPGEnemy {
  name: string
  hp: number
  maxHp: number
  attack: number
  defense: number
  sprite: Phaser.GameObjects.Sprite
  rewards: { exp: number; gold: number }
  isBoss: boolean
}

export interface ShopItem {
  id: string
  name: string
  type: 'potion' | 'weapon' | 'armor'
  cost: number
  effect: {
    hp?: number
    attack?: number
    defense?: number
  }
  description: string
}

export class MathRPGScene extends BaseGameScene {
  private player!: MathRPGPlayer
  private currentEnemy!: MathRPGEnemy
  private battleState: 'player_turn' | 'waiting_answer' | 'enemy_turn' | 'victory' | 'defeat' | 'shopping' = 'player_turn'
  private currentBattle = 1
  private maxBattles = 10
  private mathProblem: MathProblem | null = null
  private shopItems: ShopItem[] = []
  
  // Event emitters for React integration
  private gameEvents = new Phaser.Events.EventEmitter()
  
  constructor(data: GameSceneData) {
    super('MathRPGScene')
    this.init(data)
  }

  preload() {
    console.log('MathRPGScene: Starting preload...')
    
    // Load sprite sheets
    this.load.spritesheet('hero', '/images/hero_sprite_sheet.png', {
      frameWidth: 32,
      frameHeight: 32
    })
    
    this.load.spritesheet('enemies', '/images/enemy_sprites_v2.png', {
      frameWidth: 32,
      frameHeight: 32
    })
    
    this.load.spritesheet('items', '/images/game_items_ui.png', {
      frameWidth: 32,
      frameHeight: 32
    })
    
    console.log('MathRPGScene: Preload complete!')
  }

  create() {
    super.create()
    
    this.createAnimations()
    this.createBackground()
    this.initializePlayer()
    this.initializeShop()
    this.startBattle()

    // Setup React communication
    this.setupEventCommunication()
  }

  private setupEventCommunication() {
    // Make game events available to React components via the scene
    (this as any).gameEvents = this.gameEvents

    // Listen for answers from React overlay
    this.gameEvents.on('MATH_ANSWER_SUBMITTED', (answer: number) => {
      this.handleMathAnswer(answer)
    })

    // Listen for shop purchases
    this.gameEvents.on('SHOP_PURCHASE', (itemId: string) => {
      this.handleShopPurchase(itemId)
    })

    // Listen for overlay close events
    this.gameEvents.on('OVERLAY_CLOSED', () => {
      this.handleOverlayClosed()
    })
  }

  private createAnimations() {
    // Hero animations
    if (!this.anims.exists('hero_idle')) {
      this.anims.create({
        key: 'hero_idle',
        frames: this.anims.generateFrameNumbers('hero', { start: 0, end: 1 }),
        frameRate: 4,
        repeat: -1
      })
    }

    if (!this.anims.exists('hero_attack')) {
      this.anims.create({
        key: 'hero_attack',
        frames: this.anims.generateFrameNumbers('hero', { start: 2, end: 4 }),
        frameRate: 8,
        repeat: 0
      })
    }

    // Enemy animations
    if (!this.anims.exists('enemy_idle')) {
      this.anims.create({
        key: 'enemy_idle',
        frames: this.anims.generateFrameNumbers('enemies', { start: 0, end: 1 }),
        frameRate: 3,
        repeat: -1
      })
    }

    if (!this.anims.exists('enemy_attack')) {
      this.anims.create({
        key: 'enemy_attack',
        frames: this.anims.generateFrameNumbers('enemies', { start: 2, end: 3 }),
        frameRate: 6,
        repeat: 0
      })
    }
  }

  private createBackground() {
    // Battle arena background
    const bg = this.add.rectangle(400, 300, 800, 600, 0x1a1a2e)
    
    // Stars
    for (let i = 0; i < 100; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, 800),
        Phaser.Math.Between(0, 300),
        Phaser.Math.Between(1, 2),
        0xFFFFFF,
        0.8
      )

      // Twinkling effect
      this.tweens.add({
        targets: star,
        alpha: 0.3,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1
      })
    }
    
    // Battle platform
    const platform = this.add.rectangle(400, 500, 700, 120, 0x4a4a68, 0.8)
    platform.setStrokeStyle(3, 0x6c6c8a)
  }

  private initializePlayer() {
    this.player = {
      name: this.customization.characterName || 'Hero',
      hp: 100,
      maxHp: 100,
      attack: 15,
      defense: 8,
      level: 1,
      exp: 0,
      expToNext: 100,
      gold: 50,
      sprite: this.add.sprite(200, 400, 'hero', 0)
    }
    
    this.player.sprite.setScale(3)
    this.player.sprite.anims.play('hero_idle', true)

    // Update game state
    this.gameState.health = this.player.hp
    this.gameState.level = this.player.level
    this.gameState.score = this.player.exp
  }

  private initializeShop() {
    this.shopItems = [
      {
        id: 'health_potion',
        name: 'Health Potion',
        type: 'potion',
        cost: 20,
        effect: { hp: 30 },
        description: 'Restores 30 HP'
      },
      {
        id: 'super_potion',
        name: 'Super Potion',
        type: 'potion',
        cost: 50,
        effect: { hp: 75 },
        description: 'Restores 75 HP'
      },
      {
        id: 'iron_sword',
        name: 'Iron Sword',
        type: 'weapon',
        cost: 100,
        effect: { attack: 10 },
        description: 'Increases attack by 10'
      },
      {
        id: 'steel_armor',
        name: 'Steel Armor',
        type: 'armor',
        cost: 120,
        effect: { defense: 8 },
        description: 'Increases defense by 8'
      },
      {
        id: 'legendary_sword',
        name: 'Legendary Sword',
        type: 'weapon',
        cost: 300,
        effect: { attack: 25 },
        description: 'Increases attack by 25'
      }
    ]
  }

  private startBattle() {
    if (this.currentBattle > this.maxBattles) {
      this.gameWon()
      return
    }
    
    this.createEnemy()
    this.battleState = 'player_turn'
    this.emitHUDUpdate()

    // Small delay before showing battle options
    this.time.delayedCall(1000, () => {
      this.playerTurn()
    })
  }

  private createEnemy() {
    // Remove previous enemy
    if (this.currentEnemy?.sprite) {
      this.currentEnemy.sprite.destroy()
    }
    
    const isBoss = this.currentBattle % 3 === 0
    const enemyLevel = Math.floor(this.currentBattle / 3) + 1

    const baseEnemies = [
      { name: 'Goblin', hp: 40, attack: 12, defense: 3, exp: 25, gold: 20 },
      { name: 'Orc', hp: 60, attack: 16, defense: 5, exp: 40, gold: 35 },
      { name: 'Troll', hp: 90, attack: 20, defense: 8, exp: 60, gold: 50 },
      { name: 'Dragon', hp: 120, attack: 25, defense: 12, exp: 100, gold: 80 }
    ]

    const bossEnemies = [
      { name: 'Goblin King', hp: 80, attack: 18, defense: 6, exp: 75, gold: 100 },
      { name: 'Orc Chieftain', hp: 120, attack: 24, defense: 10, exp: 120, gold: 150 },
      { name: 'Ancient Troll', hp: 180, attack: 30, defense: 15, exp: 180, gold: 200 },
      { name: 'Elder Dragon', hp: 250, attack: 35, defense: 20, exp: 300, gold: 300 }
    ]
    
    const enemyData = isBoss
      ? bossEnemies[Math.min(Math.floor(this.currentBattle / 3) - 1, bossEnemies.length - 1)]
      : baseEnemies[Math.min(enemyLevel - 1, baseEnemies.length - 1)]
    
    this.currentEnemy = {
      name: enemyData.name,
      hp: enemyData.hp,
      maxHp: enemyData.hp,
      attack: enemyData.attack,
      defense: enemyData.defense,
      sprite: this.add.sprite(600, 400, 'enemies'),
      rewards: { exp: enemyData.exp, gold: enemyData.gold },
      isBoss
    }
    
    // Scale and tint based on type
    if (isBoss) {
      this.currentEnemy.sprite.setScale(4)
      this.currentEnemy.sprite.setTint(0xff4444)
    } else {
      this.currentEnemy.sprite.setScale(2.5)
      const tints = [0xff8888, 0x88ff88, 0x8888ff, 0xffff88]
      this.currentEnemy.sprite.setTint(tints[this.currentBattle % 4])
    }
    
    this.currentEnemy.sprite.anims.play('enemy_idle', true)
  }

  private playerTurn() {
    this.battleState = 'player_turn'
    
    // Generate math problem based on player level
    this.mathProblem = this.generateMathProblem()
    
    // Emit event to show math overlay in React
    this.gameEvents.emit('OPEN_MATH_OVERLAY', {
      problem: this.mathProblem,
      enemy: {
        name: this.currentEnemy.name,
        hp: this.currentEnemy.hp,
        maxHp: this.currentEnemy.maxHp,
        isBoss: this.currentEnemy.isBoss
      }
    })
    
    this.battleState = 'waiting_answer'
  }

  private generateMathProblem(): MathProblem {
    const level = this.player.level
    let problem: MathProblem
    
    if (level <= 3) {
      // Addition and Subtraction (1-20)
      const type = Math.random() < 0.5 ? 'addition' : 'subtraction'
      if (type === 'addition') {
        const a = Phaser.Math.Between(1, 20)
        const b = Phaser.Math.Between(1, 20)
        problem = {
          question: `${a} + ${b}`,
          answer: a + b,
          difficulty: 1,
          type: 'addition'
        }
      } else {
        const a = Phaser.Math.Between(10, 30)
        const b = Phaser.Math.Between(1, a)
        problem = {
          question: `${a} - ${b}`,
          answer: a - b,
          difficulty: 1,
          type: 'subtraction'
        }
      }
    } else if (level <= 6) {
      // Multiplication (up to 12x12)
      const a = Phaser.Math.Between(2, 12)
      const b = Phaser.Math.Between(2, 12)
      problem = {
        question: `${a} × ${b}`,
        answer: a * b,
        difficulty: 2,
        type: 'multiplication'
      }
    } else {
      // Division and mixed problems
      if (Math.random() < 0.7) {
        // Division
        const b = Phaser.Math.Between(2, 12)
        const answer = Phaser.Math.Between(2, 15)
        const a = b * answer
        problem = {
          question: `${a} ÷ ${b}`,
          answer: answer,
          difficulty: 3,
          type: 'division'
        }
      } else {
        // Mixed multi-step
        const a = Phaser.Math.Between(5, 15)
        const b = Phaser.Math.Between(2, 8)
        const c = Phaser.Math.Between(3, 10)
        problem = {
          question: `(${a} + ${b}) × ${c}`,
          answer: (a + b) * c,
          difficulty: 4,
          type: 'mixed'
        }
      }
    }
    
    return problem
  }

  private handleMathAnswer(answer: number) {
    if (!this.mathProblem) return
    
    const isCorrect = answer === this.mathProblem.answer
    
    // Play attack animation
    this.player.sprite.anims.play('hero_attack', true)
    
    if (isCorrect) {
      // Calculate damage based on attack and problem difficulty
      const baseDamage = this.player.attack
      const difficultyBonus = this.mathProblem.difficulty * 5
      const damage = Math.max(1, baseDamage + difficultyBonus - this.currentEnemy.defense)
      
      this.currentEnemy.hp = Math.max(0, this.currentEnemy.hp - damage)
      
      // Emit success event
      this.gameEvents.emit('COMBAT_RESULT', {
        success: true,
        damage: damage,
        message: `Correct! You dealt ${damage} damage!`
      })
      
      // Check if enemy defeated
      if (this.currentEnemy.hp <= 0) {
        this.enemyDefeated()
      } else {
        this.time.delayedCall(2000, () => this.enemyTurn())
      }
    } else {
      // Wrong answer
      this.gameEvents.emit('COMBAT_RESULT', {
        success: false,
        damage: 0,
        message: `Wrong! The answer was ${this.mathProblem.answer}`
      })

      this.time.delayedCall(2000, () => this.enemyTurn())
    }
    
    this.emitHUDUpdate()
  }

  private enemyTurn() {
    this.battleState = 'enemy_turn'

    // Play enemy attack animation
    this.currentEnemy.sprite.anims.play('enemy_attack', true)

    // Calculate enemy damage
    const damage = Math.max(1, this.currentEnemy.attack - this.player.defense)
    this.player.hp = Math.max(0, this.player.hp - damage)
    
    this.gameEvents.emit('ENEMY_ATTACK', {
      damage: damage,
      enemyName: this.currentEnemy.name
    })
    
    this.emitHUDUpdate()
    
    // Check if player defeated
    if (this.player.hp <= 0) {
      this.playerDefeated()
    } else {
      this.time.delayedCall(2000, () => this.playerTurn())
    }
  }

  private enemyDefeated() {
    this.battleState = 'victory'
    
    // Award experience and gold
    this.player.exp += this.currentEnemy.rewards.exp
    this.player.gold += this.currentEnemy.rewards.gold
    
    // Check for level up
    if (this.player.exp >= this.player.expToNext) {
      this.levelUp()
    }
    
    this.gameEvents.emit('ENEMY_DEFEATED', {
      enemy: this.currentEnemy.name,
      expGained: this.currentEnemy.rewards.exp,
      goldGained: this.currentEnemy.rewards.gold,
      isBoss: this.currentEnemy.isBoss
    })
    
    this.emitHUDUpdate()
    
    // Show shop after boss battles or every few battles
    if (this.currentEnemy.isBoss || this.currentBattle % 4 === 0) {
      this.time.delayedCall(3000, () => this.openShop())
    } else {
      this.time.delayedCall(3000, () => this.nextBattle())
    }
  }

  private levelUp() {
    this.player.level++
    this.player.exp -= this.player.expToNext
    this.player.expToNext = Math.floor(this.player.expToNext * 1.5)
    
    // Increase stats
    const hpIncrease = 20
    const attackIncrease = 3
    const defenseIncrease = 2
    
    this.player.maxHp += hpIncrease
    this.player.hp += hpIncrease
    this.player.attack += attackIncrease
    this.player.defense += defenseIncrease
    
    this.gameEvents.emit('LEVEL_UP', {
      newLevel: this.player.level,
      hpIncrease,
      attackIncrease,
      defenseIncrease
    })
  }

  private playerDefeated() {
    this.battleState = 'defeat'
    
    this.gameEvents.emit('PLAYER_DEFEATED', {
      finalScore: this.player.exp,
      level: this.player.level,
      battlesWon: this.currentBattle - 1
    })
    
    // Game over after delay
    this.time.delayedCall(3000, () => {
      this.completeGame(this.player.exp, [`Reached Level ${this.player.level}`, `Defeated ${this.currentBattle - 1} enemies`])
    })
  }

  private openShop() {
    this.battleState = 'shopping'
    
    this.gameEvents.emit('OPEN_SHOP_OVERLAY', {
      items: this.shopItems,
      playerGold: this.player.gold
    })
  }

  private handleShopPurchase(itemId: string) {
    const item = this.shopItems.find(i => i.id === itemId)
    if (!item || this.player.gold < item.cost) return
    
    this.player.gold -= item.cost

    // Apply item effects
    if (item.effect.hp) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + item.effect.hp)
    }
    if (item.effect.attack) {
      this.player.attack += item.effect.attack
    }
    if (item.effect.defense) {
      this.player.defense += item.effect.defense
    }

    this.gameEvents.emit('ITEM_PURCHASED', {
      item: item.name,
      effect: item.effect
    })
    
    this.emitHUDUpdate()
  }

  private handleOverlayClosed() {
    if (this.battleState === 'shopping') {
      this.nextBattle()
    }
  }

  private nextBattle() {
    this.currentBattle++
    this.startBattle()
  }

  private gameWon() {
    const achievements = [
      'Math Master',
      `Reached Level ${this.player.level}`,
      'Defeated All Enemies',
      `Earned ${this.player.gold} Gold`
    ]
    
    this.gameEvents.emit('GAME_COMPLETED', {
      victory: true,
      finalScore: this.player.exp + this.player.gold,
      achievements
    })
    
    this.time.delayedCall(3000, () => {
      this.completeGame(this.player.exp + this.player.gold, achievements)
    })
  }

  private emitHUDUpdate() {
    this.gameEvents.emit('UPDATE_HUD', {
      player: {
        name: this.player.name,
        hp: this.player.hp,
        maxHp: this.player.maxHp,
        level: this.player.level,
        exp: this.player.exp,
        expToNext: this.player.expToNext,
        gold: this.player.gold,
        attack: this.player.attack,
        defense: this.player.defense
      },
      enemy: this.currentEnemy ? {
        name: this.currentEnemy.name,
        hp: this.currentEnemy.hp,
        maxHp: this.currentEnemy.maxHp,
        isBoss: this.currentEnemy.isBoss
      } : null
    })
    
    // Update base game state
    this.gameState.health = this.player.hp
    this.gameState.level = this.player.level
    this.gameState.score = this.player.exp
  }

  // Public method to get game events emitter for React integration
  public getGameEvents(): Phaser.Events.EventEmitter {
    return this.gameEvents
  }

  update() {
    // Handle continuous updates if needed
  }
}
