import Phaser from 'phaser'
import { BaseGameScene, GameSceneData } from '../BaseGameScene'

interface MathProblem {
  question: string
  options: number[]
  correctAnswer: number
  difficulty: number
  type: 'addition' | 'subtraction' | 'multiplication' | 'division'
}

interface Character {
  name: string
  hp: number
  maxHp: number
  attack: number
  defense: number
  level: number
  exp: number
  expToNext: number
  sprite: Phaser.GameObjects.Sprite
}

interface Enemy {
  name: string
  hp: number
  maxHp: number
  attack: number
  defense: number
  sprite: Phaser.GameObjects.Sprite
  rewards: { exp: number; gold: number }
}

interface Equipment {
  id: string
  name: string
  type: 'weapon' | 'armor'
  attackBonus?: number
  defenseBonus?: number
  description: string
}

export class MathRPGScene extends BaseGameScene {
  private player!: Character
  private currentEnemy!: Enemy
  private battleState: 'selecting' | 'question' | 'result' | 'enemy_turn' | 'victory' | 'defeat' = 'selecting'
  
  private mathProblem: MathProblem | null = null
  private selectedAnswer: number | null = null
  private questionContainer!: Phaser.GameObjects.Container
  private battleUI!: Phaser.GameObjects.Container
  private currentBattle = 1
  private maxBattles = 5
  
  private equipment: Equipment[] = []
  private equippedWeapon: Equipment | null = null
  private equippedArmor: Equipment | null = null
  
  private backgroundMusic: Phaser.Sound.BaseSound | null = null

  constructor(data: GameSceneData) {
    super('MathRPGScene')
    this.init(data)
  }

  preload() {
    console.log('MathRPGScene: Starting preload...')
    
    // Create colored shapes for game sprites
    const graphics = this.add.graphics()
    
    // Hero sprite (blue knight)
    graphics.fillStyle(0x4169E1)
    graphics.fillRect(0, 0, 32, 32)
    graphics.generateTexture('hero', 32, 32)
    
    // Enemy sprites (red monsters)
    graphics.clear()
    graphics.fillStyle(0xFF4444)
    graphics.fillRect(0, 0, 32, 32)
    graphics.generateTexture('enemies', 32, 32)
    
    // Items (golden treasures)
    graphics.clear()
    graphics.fillStyle(0xFFD700)
    graphics.fillCircle(8, 8, 8)
    graphics.generateTexture('items', 16, 16)
    
    graphics.destroy()
    
    console.log('MathRPGScene: Preload complete!')
  }

  create() {
    super.create()
    
    this.createBackground()
    this.initializePlayer()
    this.initializeEquipment()
    this.createBattleUI()
    this.startNextBattle()
  }

  private createBackground() {
    // Create battle arena background
    const bg = this.add.rectangle(400, 300, 800, 600, 0x2c3e50)
    
    // Add some atmospheric elements
    for (let i = 0; i < 50; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, 800),
        Phaser.Math.Between(0, 300),
        1,
        0xFFFFFF,
        0.8
      )
    }
    
    // Battle arena floor
    const floor = this.add.rectangle(400, 550, 800, 100, 0x8B4513, 0.7)
  }

  private initializePlayer() {
    this.player = {
      name: this.customization.characterName || 'Hero',
      hp: this.gameState.health || 100,
      maxHp: 100,
      attack: 10,
      defense: 5,
      level: this.gameState.level || 1,
      exp: 0,
      expToNext: 100,
      sprite: this.add.sprite(200, 400, 'hero')
    }
    
    this.player.sprite.setScale(2)
    this.player.sprite.setTint(0x4169E1)
  }

  private initializeEquipment() {
    this.equipment = [
      {
        id: 'wooden_sword',
        name: 'Wooden Sword',
        type: 'weapon',
        attackBonus: 5,
        description: 'A simple wooden sword. Better than fists!'
      },
      {
        id: 'iron_sword',
        name: 'Iron Sword',
        type: 'weapon',
        attackBonus: 12,
        description: 'A sturdy iron sword. Deals good damage.'
      },
      {
        id: 'leather_armor',
        name: 'Leather Armor',
        type: 'armor',
        defenseBonus: 3,
        description: 'Basic leather armor. Provides some protection.'
      },
      {
        id: 'chainmail',
        name: 'Chainmail',
        type: 'armor',
        defenseBonus: 8,
        description: 'Heavy chainmail armor. Excellent protection.'
      }
    ]
    
    // Start with basic equipment
    this.equippedWeapon = this.equipment.find(e => e.id === 'wooden_sword') || null
    this.equippedArmor = this.equipment.find(e => e.id === 'leather_armor') || null
    
    this.updatePlayerStats()
  }

  private updatePlayerStats() {
    this.player.attack = 10 + (this.equippedWeapon?.attackBonus || 0)
    this.player.defense = 5 + (this.equippedArmor?.defenseBonus || 0)
  }

  private createBattleUI() {
    this.battleUI = this.add.container(0, 0)
    
    // Player health bar
    const playerHpBg = this.add.rectangle(150, 50, 200, 20, 0x333333)
    const playerHpBar = this.add.rectangle(150, 50, 200, 20, 0x4ade80)
    playerHpBar.setOrigin(0, 0.5)
    
    // Player info
    const playerInfo = this.add.text(50, 80, this.getPlayerInfoText(), {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace'
    })
    
    // Enemy health bar (will be updated per enemy)
    const enemyHpBg = this.add.rectangle(650, 50, 200, 20, 0x333333)
    const enemyHpBar = this.add.rectangle(650, 50, 200, 20, 0xff6b6b)
    enemyHpBar.setOrigin(1, 0.5)
    
    this.battleUI.add([playerHpBg, playerHpBar, playerInfo, enemyHpBg, enemyHpBar])
    
    // Store references
    this.data.set('playerHpBar', playerHpBar)
    this.data.set('playerInfo', playerInfo)
    this.data.set('enemyHpBar', enemyHpBar)
  }

  private getPlayerInfoText(): string {
    return `${this.player.name} (Lv.${this.player.level})\nHP: ${this.player.hp}/${this.player.maxHp}\nATK: ${this.player.attack} | DEF: ${this.player.defense}\nEXP: ${this.player.exp}/${this.player.expToNext}`
  }

  private startNextBattle() {
    if (this.currentBattle > this.maxBattles) {
      this.completeGame(this.gameState.score, this.gameState.achievements)
      return
    }
    
    this.createEnemy()
    this.battleState = 'selecting'
    this.showBattleOptions()
  }

  private createEnemy() {
    // Remove previous enemy sprite if exists
    if (this.currentEnemy?.sprite) {
      this.currentEnemy.sprite.destroy()
    }
    
    const enemyTypes = [
      { name: 'Goblin', hp: 40, attack: 8, defense: 2, rewards: { exp: 25, gold: 15 } },
      { name: 'Orc', hp: 60, attack: 12, defense: 4, rewards: { exp: 40, gold: 25 } },
      { name: 'Troll', hp: 100, attack: 15, defense: 8, rewards: { exp: 60, gold: 40 } },
      { name: 'Dragon', hp: 150, attack: 20, defense: 12, rewards: { exp: 100, gold: 75 } },
      { name: 'Dark Lord', hp: 200, attack: 25, defense: 15, rewards: { exp: 150, gold: 100 } }
    ]
    
    const enemyData = enemyTypes[this.currentBattle - 1] || enemyTypes[enemyTypes.length - 1]
    
    this.currentEnemy = {
      ...enemyData,
      maxHp: enemyData.hp,
      sprite: this.add.sprite(600, 350, 'enemies')
    }
    
    // Style enemy based on type
    const enemyColors = [0xFF6666, 0xFF4444, 0x8B4513, 0xFF0000, 0x4B0082]
    this.currentEnemy.sprite.setScale(2.5)
    this.currentEnemy.sprite.setTint(enemyColors[this.currentBattle - 1] || 0x666666)
    
    this.updateBattleUI()
  }

  private showBattleOptions() {
    // Remove existing question container
    if (this.questionContainer) {
      this.questionContainer.destroy()
    }
    
    this.questionContainer = this.add.container(400, 450)
    
    const optionBg = this.add.rectangle(0, 0, 700, 200, 0x000000, 0.8)
    optionBg.setStrokeStyle(2, 0xFFFFFF)
    
    const attackButton = this.createButton(-150, -50, 'ATTACK', () => this.startMathChallenge('attack'))
    const defendButton = this.createButton(150, -50, 'DEFEND', () => this.defend())
    const itemButton = this.createButton(-150, 50, 'ITEMS', () => this.useItem())
    const runButton = this.createButton(150, 50, 'RUN', () => this.attemptRun())
    
    this.questionContainer.add([optionBg, attackButton, defendButton, itemButton, runButton])
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y)
    
    const buttonBg = this.add.rectangle(0, 0, 120, 40, 0x4169E1, 0.8)
    buttonBg.setStrokeStyle(2, 0xFFFFFF)
    buttonBg.setInteractive()
    
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    })
    buttonText.setOrigin(0.5)
    
    button.add([buttonBg, buttonText])
    
    buttonBg.on('pointerdown', callback)
    buttonBg.on('pointerover', () => buttonBg.setFillStyle(0x5179F1))
    buttonBg.on('pointerout', () => buttonBg.setFillStyle(0x4169E1))
    
    return button
  }

  private startMathChallenge(action: 'attack' | 'spell') {
    this.battleState = 'question'
    this.mathProblem = this.generateMathProblem()
    this.showMathProblem()
  }

  private generateMathProblem(): MathProblem {
    const difficulty = Math.min(this.currentBattle, 5)
    const types: ('addition' | 'subtraction' | 'multiplication' | 'division')[] = 
      ['addition', 'subtraction', 'multiplication', 'division']
    const type = types[Math.floor(Math.random() * types.length)]
    
    let a: number, b: number, correctAnswer: number, question: string
    
    switch (type) {
      case 'addition':
        a = Phaser.Math.Between(1 + difficulty * 2, 20 + difficulty * 5)
        b = Phaser.Math.Between(1 + difficulty * 2, 20 + difficulty * 5)
        correctAnswer = a + b
        question = `${a} + ${b} = ?`
        break
        
      case 'subtraction':
        a = Phaser.Math.Between(10 + difficulty * 5, 50 + difficulty * 10)
        b = Phaser.Math.Between(1 + difficulty * 2, a - 1)
        correctAnswer = a - b
        question = `${a} - ${b} = ?`
        break
        
      case 'multiplication':
        a = Phaser.Math.Between(2 + difficulty, 12)
        b = Phaser.Math.Between(2 + difficulty, 12)
        correctAnswer = a * b
        question = `${a} × ${b} = ?`
        break
        
      case 'division':
        correctAnswer = Phaser.Math.Between(2 + difficulty, 15)
        b = Phaser.Math.Between(2 + difficulty, 10)
        a = correctAnswer * b
        question = `${a} ÷ ${b} = ?`
        break
        
      default:
        a = 5
        b = 3
        correctAnswer = 8
        question = '5 + 3 = ?'
    }
    
    // Generate wrong options
    const options = [correctAnswer]
    while (options.length < 4) {
      const wrongAnswer = correctAnswer + Phaser.Math.Between(-10, 10)
      if (wrongAnswer !== correctAnswer && wrongAnswer > 0 && !options.includes(wrongAnswer)) {
        options.push(wrongAnswer)
      }
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[options[i], options[j]] = [options[j], options[i]]
    }
    
    return {
      question,
      options,
      correctAnswer,
      difficulty,
      type
    }
  }

  private showMathProblem() {
    if (!this.mathProblem) return
    
    // Clear previous content
    if (this.questionContainer) {
      this.questionContainer.destroy()
    }
    
    this.questionContainer = this.add.container(400, 450)
    
    const questionBg = this.add.rectangle(0, 0, 700, 200, 0x000000, 0.9)
    questionBg.setStrokeStyle(3, 0xFFD700)
    
    const questionText = this.add.text(0, -60, this.mathProblem.question, {
      fontSize: '24px',
      color: '#FFD700',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    })
    questionText.setOrigin(0.5)
    
    this.questionContainer.add([questionBg, questionText])
    
    // Create answer buttons
    const buttonPositions = [
      { x: -150, y: 20 },
      { x: 50, y: 20 },
      { x: -150, y: 70 },
      { x: 50, y: 70 }
    ]
    
    this.mathProblem.options.forEach((option, index) => {
      const pos = buttonPositions[index]
      const button = this.createAnswerButton(pos.x, pos.y, option.toString(), option)
      this.questionContainer.add(button)
    })
    
    // Add timer
    const timeLimit = 15 // seconds
    const timerText = this.add.text(0, -20, `Time: ${timeLimit}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace'
    })
    timerText.setOrigin(0.5)
    this.questionContainer.add(timerText)
    
    // Start countdown
    let timeLeft = timeLimit
    const timer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        timeLeft--
        timerText.setText(`Time: ${timeLeft}`)
        
        if (timeLeft <= 0) {
          timer.remove()
          this.handleAnswer(null) // Time's up!
        }
      },
      repeat: timeLimit - 1
    })
    
    this.data.set('mathTimer', timer)
  }

  private createAnswerButton(x: number, y: number, text: string, value: number): Phaser.GameObjects.Container {
    const button = this.add.container(x, y)
    
    const buttonBg = this.add.rectangle(0, 0, 80, 30, 0x4169E1, 0.8)
    buttonBg.setStrokeStyle(2, 0xFFFFFF)
    buttonBg.setInteractive()
    
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    })
    buttonText.setOrigin(0.5)
    
    button.add([buttonBg, buttonText])
    
    buttonBg.on('pointerdown', () => this.handleAnswer(value))
    buttonBg.on('pointerover', () => buttonBg.setFillStyle(0x5179F1))
    buttonBg.on('pointerout', () => buttonBg.setFillStyle(0x4169E1))
    
    return button
  }

  private handleAnswer(answer: number | null) {
    if (!this.mathProblem) return
    
    // Clear timer
    const timer = this.data.get('mathTimer')
    if (timer) timer.remove()
    
    const isCorrect = answer === this.mathProblem.correctAnswer
    this.battleState = 'result'
    
    // Show result
    this.showResult(isCorrect, answer)
    
    // Apply damage after showing result
    this.time.delayedCall(1500, () => {
      this.applyBattleResult(isCorrect)
    })
  }

  private showResult(isCorrect: boolean, playerAnswer: number | null) {
    if (!this.mathProblem) return
    
    const resultText = isCorrect 
      ? 'CORRECT! Critical Hit!' 
      : `WRONG! The answer was ${this.mathProblem.correctAnswer}`
    
    const color = isCorrect ? '#4ade80' : '#ff6b6b'
    
    const result = this.add.text(400, 200, resultText, {
      fontSize: '18px',
      color: color,
      fontFamily: 'monospace',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    })
    result.setOrigin(0.5)
    
    // Animate result
    result.setScale(0)
    this.tweens.add({
      targets: result,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    })
    
    this.time.delayedCall(1500, () => {
      result.destroy()
    })
  }

  private applyBattleResult(isCorrect: boolean) {
    if (isCorrect) {
      // Player attacks
      let damage = this.player.attack + Phaser.Math.Between(-2, 5)
      damage = Math.max(1, damage - this.currentEnemy.defense)
      
      // Critical hit for correct answers
      damage = Math.floor(damage * 1.5)
      
      this.currentEnemy.hp = Math.max(0, this.currentEnemy.hp - damage)
      
      // Visual effect
      this.createDamageEffect(this.currentEnemy.sprite.x, this.currentEnemy.sprite.y, damage, '#ff0000')
      
      if (this.currentEnemy.hp <= 0) {
        this.handleEnemyDefeat()
        return
      }
    }
    
    // Enemy's turn (if still alive)
    this.time.delayedCall(800, () => {
      this.enemyAttack()
    })
  }

  private enemyAttack() {
    const damage = Math.max(1, this.currentEnemy.attack - this.player.defense)
    this.player.hp = Math.max(0, this.player.hp - damage)
    
    // Visual effect
    this.createDamageEffect(this.player.sprite.x, this.player.sprite.y, damage, '#ff6b6b')
    
    // Flash player sprite
    this.player.sprite.setTint(0xFF0000)
    this.time.delayedCall(200, () => {
      this.player.sprite.setTint(0x4169E1)
    })
    
    this.updateBattleUI()
    
    if (this.player.hp <= 0) {
      this.handlePlayerDefeat()
    } else {
      // Next turn
      this.time.delayedCall(1000, () => {
        this.battleState = 'selecting'
        this.showBattleOptions()
      })
    }
  }

  private createDamageEffect(x: number, y: number, damage: number, color: string) {
    const damageText = this.add.text(x, y - 30, `-${damage}`, {
      fontSize: '20px',
      color: color,
      fontFamily: 'monospace',
      fontStyle: 'bold'
    })
    damageText.setOrigin(0.5)
    
    this.tweens.add({
      targets: damageText,
      y: y - 80,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => damageText.destroy()
    })
  }

  private handleEnemyDefeat() {
    // Gain experience and gold
    this.player.exp += this.currentEnemy.rewards.exp
    this.gameState.score += this.currentEnemy.rewards.gold
    
    // Check for level up
    if (this.player.exp >= this.player.expToNext) {
      this.levelUp()
    }
    
    // Achievement
    this.addAchievement(`defeated_${this.currentEnemy.name.toLowerCase()}`)
    
    // Victory message
    const victoryText = this.add.text(400, 200, `Victory!\n+${this.currentEnemy.rewards.exp} EXP\n+${this.currentEnemy.rewards.gold} Gold`, {
      fontSize: '18px',
      color: '#4ade80',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 10, y: 8 }
    })
    victoryText.setOrigin(0.5)
    
    this.time.delayedCall(3000, () => {
      victoryText.destroy()
      this.currentBattle++
      this.startNextBattle()
    })
    
    this.updateBattleUI()
  }

  private levelUp() {
    this.player.level++
    this.player.exp = this.player.exp - this.player.expToNext
    this.player.expToNext = Math.floor(this.player.expToNext * 1.5)
    this.player.maxHp += 20
    this.player.hp = this.player.maxHp // Full heal on level up
    this.player.attack += 3
    this.player.defense += 2
    
    // Level up effect
    const levelUpText = this.add.text(400, 150, `LEVEL UP!\nLevel ${this.player.level}`, {
      fontSize: '24px',
      color: '#FFD700',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      align: 'center'
    })
    levelUpText.setOrigin(0.5)
    
    // Sparkle effect
    for (let i = 0; i < 20; i++) {
      const sparkle = this.add.circle(
        this.player.sprite.x + Phaser.Math.Between(-40, 40),
        this.player.sprite.y + Phaser.Math.Between(-40, 40),
        2,
        0xFFD700
      )
      
      this.tweens.add({
        targets: sparkle,
        alpha: 0,
        scale: 2,
        duration: 1000,
        onComplete: () => sparkle.destroy()
      })
    }
    
    this.time.delayedCall(2000, () => {
      levelUpText.destroy()
    })
    
    this.addAchievement('level_up')
  }

  private handlePlayerDefeat() {
    this.gameState.lives--
    
    if (this.gameState.lives <= 0) {
      const gameOverText = this.add.text(400, 300, 'GAME OVER\nYour mathematical journey ends here...', {
        fontSize: '24px',
        color: '#ff0000',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        align: 'center'
      })
      gameOverText.setOrigin(0.5)
      
      this.time.delayedCall(3000, () => {
        this.completeGame(this.gameState.score, this.gameState.achievements)
      })
    } else {
      // Respawn with half health
      this.player.hp = Math.floor(this.player.maxHp / 2)
      this.updateBattleUI()
      
      this.time.delayedCall(1000, () => {
        this.battleState = 'selecting'
        this.showBattleOptions()
      })
    }
  }

  private defend() {
    // Defending reduces incoming damage and restores some HP
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + 10)
    
    const defendText = this.add.text(400, 200, 'Defending!\n+10 HP', {
      fontSize: '16px',
      color: '#4ade80',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    })
    defendText.setOrigin(0.5)
    
    this.time.delayedCall(1500, () => {
      defendText.destroy()
      // Reduce enemy damage for this turn
      const originalDefense = this.player.defense
      this.player.defense += 5
      this.enemyAttack()
      this.player.defense = originalDefense
    })
  }

  private useItem() {
    // Simple item usage - heal potion
    const potions = this.gameState.inventory.filter(item => item.type === 'potion')
    
    if (potions.length > 0) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 30)
      
      // Remove potion from inventory
      potions[0].quantity--
      if (potions[0].quantity <= 0) {
        this.gameState.inventory = this.gameState.inventory.filter(item => item !== potions[0])
      }
      
      const itemText = this.add.text(400, 200, 'Used Health Potion!\n+30 HP', {
        fontSize: '16px',
        color: '#4ade80',
        fontFamily: 'monospace',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
      })
      itemText.setOrigin(0.5)
      
      this.time.delayedCall(1500, () => {
        itemText.destroy()
        this.enemyAttack()
      })
    } else {
      const noItemText = this.add.text(400, 200, 'No items available!', {
        fontSize: '16px',
        color: '#ff6b6b',
        fontFamily: 'monospace',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
      })
      noItemText.setOrigin(0.5)
      
      this.time.delayedCall(1000, () => {
        noItemText.destroy()
        this.showBattleOptions()
      })
    }
    
    this.updateBattleUI()
  }

  private attemptRun() {
    const runChance = 0.7
    
    if (Math.random() < runChance) {
      const runText = this.add.text(400, 200, 'Successfully ran away!', {
        fontSize: '16px',
        color: '#4ade80',
        fontFamily: 'monospace',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
      })
      runText.setOrigin(0.5)
      
      this.time.delayedCall(2000, () => {
        runText.destroy()
        this.currentBattle++
        this.startNextBattle()
      })
    } else {
      const failText = this.add.text(400, 200, "Can't escape!", {
        fontSize: '16px',
        color: '#ff6b6b',
        fontFamily: 'monospace',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
      })
      failText.setOrigin(0.5)
      
      this.time.delayedCall(1500, () => {
        failText.destroy()
        this.enemyAttack()
      })
    }
  }

  private updateBattleUI() {
    const playerHpBar = this.data.get('playerHpBar')
    const playerInfo = this.data.get('playerInfo')
    const enemyHpBar = this.data.get('enemyHpBar')
    
    if (playerHpBar) {
      const hpPercentage = this.player.hp / this.player.maxHp
      playerHpBar.scaleX = hpPercentage
    }
    
    if (playerInfo) {
      playerInfo.setText(this.getPlayerInfoText())
    }
    
    if (enemyHpBar && this.currentEnemy) {
      const enemyHpPercentage = this.currentEnemy.hp / this.currentEnemy.maxHp
      enemyHpBar.scaleX = enemyHpPercentage
    }
    
    // Update inherited UI
    this.gameState.health = this.player.hp
    this.updateUI()
  }

  update() {
    // Handle any continuous updates if needed
    // Most logic is event-driven in this turn-based game
  }
}