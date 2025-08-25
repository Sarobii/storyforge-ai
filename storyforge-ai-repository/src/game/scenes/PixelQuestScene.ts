import Phaser from 'phaser'
import { BaseGameScene, GameSceneData } from '../BaseGameScene'

interface Enemy {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  health: number
  type: string
  lastAttack: number
}

interface NPC {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithStaticBody
  dialogue: string[]
  currentDialogue: number
  hasQuest: boolean
  questCompleted: boolean
}

export class PixelQuestScene extends BaseGameScene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private enemies: Enemy[] = []
  private npcs: NPC[] = []
  private collectibles!: Phaser.Physics.Arcade.Group
  private doors!: Phaser.Physics.Arcade.Group
  private walls!: Phaser.Physics.Arcade.StaticGroup
  private lastAttack = 0
  private attackCooldown = 500
  private currentRoom = 0
  private totalRooms = 3
  private dialogueBox: Phaser.GameObjects.Container | null = null
  private currentNPC: NPC | null = null

  constructor(data: GameSceneData) {
    super('PixelQuestScene')
    this.init(data)
  }

  preload() {
    console.log('PixelQuestScene: Starting preload...')
    
    // Create simple graphics instead of loading external images to avoid loading issues
    this.load.image('wall', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    
    // Create colored rectangles for game sprites as fallback
    const graphics = this.add.graphics()
    
    // Hero sprite (blue square)
    graphics.fillStyle(0x4169E1)
    graphics.fillRect(0, 0, 32, 32)
    graphics.generateTexture('hero', 32, 32)
    
    // Enemy sprite (red square)
    graphics.clear()
    graphics.fillStyle(0xFF6666)
    graphics.fillRect(0, 0, 24, 24)
    graphics.generateTexture('enemy_sprites', 24, 24)
    
    // Environment tile (green square)
    graphics.clear()
    graphics.fillStyle(0x228B22)
    graphics.fillRect(0, 0, 32, 32)
    graphics.generateTexture('environment', 32, 32)
    
    // Items (yellow circle)
    graphics.clear()
    graphics.fillStyle(0xFFD700)
    graphics.fillCircle(8, 8, 8)
    graphics.generateTexture('items', 16, 16)
    
    graphics.destroy()
    
    console.log('PixelQuestScene: Preload complete!')
  }

  create() {
    super.create()
    
    this.createRoom()
    this.createPlayer()
    this.createEnemies()
    this.createNPCs()
    this.createCollectibles()
    this.setupCollisions()
    this.setupCamera()
    
    // Update game state position
    this.gameState.position = { x: this.player.x, y: this.player.y }
  }

  private createRoom() {
    // Create walls around the room
    this.walls = this.physics.add.staticGroup()
    
    const roomWidth = 800
    const roomHeight = 600
    const wallThickness = 32
    
    // Room boundaries
    const topWall = this.add.rectangle(roomWidth/2, wallThickness/2, roomWidth, wallThickness, 0x8B4513)
    const bottomWall = this.add.rectangle(roomWidth/2, roomHeight - wallThickness/2, roomWidth, wallThickness, 0x8B4513)
    const leftWall = this.add.rectangle(wallThickness/2, roomHeight/2, wallThickness, roomHeight, 0x8B4513)
    const rightWall = this.add.rectangle(roomWidth - wallThickness/2, roomHeight/2, wallThickness, roomHeight, 0x8B4513)
    
    this.walls.addMultiple([topWall, bottomWall, leftWall, rightWall])
    
    // Add some obstacles
    for (let i = 0; i < 3; i++) {
      const obstacleX = 150 + i * 200
      const obstacleY = 200 + (i % 2) * 200
      const obstacle = this.add.rectangle(obstacleX, obstacleY, 64, 64, 0x654321)
      this.walls.add(obstacle)
    }
    
    // Create doors
    this.doors = this.physics.add.group()
    if (this.currentRoom < this.totalRooms - 1) {
      const door = this.physics.add.sprite(roomWidth - 50, roomHeight/2, 'wall')
      door.setTint(0x8B4513)
      door.setSize(32, 64)
      if (door.body) {
        door.body.immovable = true
      }
      this.doors.add(door)
    }
    
    // Background
    this.add.rectangle(roomWidth/2, roomHeight/2, roomWidth, roomHeight, 0x228B22, 0.3)
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(100, 300, 'hero')
    this.player.setTint(0xFFFFFF)
    this.player.setSize(24, 32)
    this.player.setCollideWorldBounds(true)
    
    // Set player position from saved state
    if (this.gameState.position) {
      this.player.setPosition(this.gameState.position.x, this.gameState.position.y)
    }
  }

  private createEnemies() {
    this.enemies = []
    
    // Create 3 enemies per room
    for (let i = 0; i < 3; i++) {
      const x = 200 + i * 200
      const y = 150 + (i % 2) * 300
      
      const enemySprite = this.physics.add.sprite(x, y, 'enemy_sprites')
      enemySprite.setTint(0xFF6666)
      enemySprite.setSize(24, 24)
      enemySprite.body?.setCollideWorldBounds(true)
      
      // Random movement
      enemySprite.body?.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      )
      
      const enemy: Enemy = {
        sprite: enemySprite,
        health: 30,
        type: 'goblin',
        lastAttack: 0
      }
      
      this.enemies.push(enemy)
      
      // Bounce off walls
      enemySprite.body?.setBounce(1, 1)
    }
  }

  private createNPCs() {
    this.npcs = []
    
    // Create a quest giver NPC
    const npcSprite = this.physics.add.sprite(400, 100, 'hero') as Phaser.Types.Physics.Arcade.SpriteWithStaticBody
    npcSprite.setTint(0x4169E1)
    npcSprite.setSize(24, 32)
    if (npcSprite.body) {
      npcSprite.body.immovable = true
    }
    
    const npc: NPC = {
      sprite: npcSprite,
      dialogue: [
        `Greetings, ${this.customization.characterName}!`,
        "Monsters have invaded our realm!",
        "Defeat all enemies to unlock the door.",
        "Collect coins and potions along the way!"
      ],
      currentDialogue: 0,
      hasQuest: true,
      questCompleted: false
    }
    
    this.npcs.push(npc)
  }

  private createCollectibles() {
    this.collectibles = this.physics.add.group()
    
    // Create coins
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(100, 700)
      const y = Phaser.Math.Between(100, 500)
      
      const coin = this.physics.add.sprite(x, y, 'items')
      coin.setTint(0xFFD700)
      coin.setSize(16, 16)
      coin.setData('type', 'coin')
      coin.setData('value', 10)
      
      this.collectibles.add(coin)
    }
    
    // Create health potions
    for (let i = 0; i < 2; i++) {
      const x = Phaser.Math.Between(100, 700)
      const y = Phaser.Math.Between(100, 500)
      
      const potion = this.physics.add.sprite(x, y, 'items')
      potion.setTint(0xFF4444)
      potion.setSize(16, 16)
      potion.setData('type', 'potion')
      potion.setData('value', 25)
      
      this.collectibles.add(potion)
    }
  }

  private setupCollisions() {
    // Player vs walls
    this.physics.add.collider(this.player, this.walls)
    
    // Enemies vs walls
    this.enemies.forEach(enemy => {
      this.physics.add.collider(enemy.sprite, this.walls)
    })
    
    // Player vs enemies
    this.enemies.forEach(enemy => {
      this.physics.add.overlap(this.player, enemy.sprite, () => {
        this.handlePlayerEnemyCollision(enemy)
      })
    })
    
    // Player vs NPCs
    this.npcs.forEach(npc => {
      this.physics.add.overlap(this.player, npc.sprite, () => {
        this.handlePlayerNPCInteraction(npc)
      })
    })
    
    // Player vs collectibles
    this.physics.add.overlap(this.player, this.collectibles, (player, collectible) => {
      this.handleCollectible(collectible as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody)
    })
    
    // Player vs doors
    this.physics.add.overlap(this.player, this.doors, () => {
      this.handleDoor()
    })
  }

  private setupCamera() {
    this.cameras.main.startFollow(this.player)
    this.cameras.main.setBounds(0, 0, 800, 600)
  }

  private handlePlayerEnemyCollision(enemy: Enemy) {
    const now = this.time.now
    
    // Damage player
    if (now - enemy.lastAttack > 1000) {
      this.gameState.health -= 10
      enemy.lastAttack = now
      
      // Knockback effect
      const angle = Phaser.Math.Angle.Between(enemy.sprite.x, enemy.sprite.y, this.player.x, this.player.y)
      this.player.body?.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200)
      
      // Flash effect
      this.player.setTint(0xFF0000)
      this.time.delayedCall(200, () => {
        this.player.setTint(0xFFFFFF)
      })
      
      if (this.gameState.health <= 0) {
        this.handlePlayerDeath()
      }
      
      this.updateUI()
    }
  }

  private handlePlayerNPCInteraction(npc: NPC) {
    if (!this.dialogueBox) {
      this.showDialogue(npc)
    }
  }

  private showDialogue(npc: NPC) {
    this.currentNPC = npc
    
    // Create dialogue box
    this.dialogueBox = this.add.container(400, 500)
    this.dialogueBox.setScrollFactor(0)
    this.dialogueBox.setDepth(1000)
    
    const dialogueBg = this.add.rectangle(0, 0, 600, 100, 0x000000, 0.8)
    const dialogueText = this.add.text(0, 0, npc.dialogue[npc.currentDialogue], {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      align: 'center',
      wordWrap: { width: 550 }
    })
    dialogueText.setOrigin(0.5)
    
    this.dialogueBox.add([dialogueBg, dialogueText])
    
    // Advance dialogue on key press
    const advanceDialogue = () => {
      npc.currentDialogue++
      if (npc.currentDialogue >= npc.dialogue.length) {
        this.hideDialogue()
        this.controls.keys?.action.off('down', advanceDialogue)
      } else {
        dialogueText.setText(npc.dialogue[npc.currentDialogue])
      }
    }
    
    this.controls.keys?.action.on('down', advanceDialogue)
  }

  private hideDialogue() {
    if (this.dialogueBox) {
      this.dialogueBox.destroy()
      this.dialogueBox = null
      this.currentNPC = null
    }
  }

  private handleCollectible(collectible: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
    const type = collectible.getData('type')
    const value = collectible.getData('value')
    
    switch (type) {
      case 'coin':
        this.gameState.score += value
        this.addToInventory({ id: 'coin', name: 'Gold Coin', type: 'coin', quantity: 1 })
        break
      
      case 'potion':
        this.gameState.health = Math.min(100, this.gameState.health + value)
        this.addToInventory({ id: 'potion', name: 'Health Potion', type: 'potion', quantity: 1 })
        break
    }
    
    // Visual effect
    const effect = this.add.circle(collectible.x, collectible.y, 20, 0xFFFFFF, 0.8)
    this.tweens.add({
      targets: effect,
      alpha: 0,
      scale: 2,
      duration: 300,
      ease: 'Power2',
      onComplete: () => effect.destroy()
    })
    
    collectible.destroy()
    this.updateUI()
  }

  private handleDoor() {
    // Check if all enemies are defeated
    const aliveEnemies = this.enemies.filter(enemy => enemy.health > 0)
    
    if (aliveEnemies.length === 0) {
      this.currentRoom++
      
      if (this.currentRoom >= this.totalRooms) {
        this.addAchievement('completed_quest')
        this.completeGame(this.gameState.score, this.gameState.achievements)
      } else {
        // Go to next room
        this.scene.restart()
      }
    } else {
      // Show message
      const message = this.add.text(400, 300, 'Defeat all enemies first!', {
        fontSize: '18px',
        color: '#ff0000',
        fontFamily: 'monospace',
        fontStyle: 'bold'
      })
      message.setOrigin(0.5)
      
      this.time.delayedCall(2000, () => message.destroy())
    }
  }

  private handlePlayerDeath() {
    this.gameState.lives--
    
    if (this.gameState.lives <= 0) {
      // Game Over
      const gameOverText = this.add.text(400, 300, 'GAME OVER', {
        fontSize: '32px',
        color: '#ff0000',
        fontFamily: 'monospace',
        fontStyle: 'bold'
      })
      gameOverText.setOrigin(0.5)
      
      this.time.delayedCall(3000, () => {
        this.completeGame(this.gameState.score, this.gameState.achievements)
      })
    } else {
      // Respawn
      this.gameState.health = 100
      this.player.setPosition(100, 300)
      this.updateUI()
    }
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
    
    this.player.body?.setVelocity(velocityX, velocityY)
    
    // Player attack
    const now = this.time.now
    const canAttack = now - this.lastAttack > this.attackCooldown
    const attackPressed = this.controls.keys?.action.isDown || this.controls.mobile?.action
    
    if (attackPressed && canAttack) {
      this.performAttack()
      this.lastAttack = now
    }
    
    // Update enemy AI
    this.updateEnemies()
    
    // Update game state position
    this.gameState.position = { x: this.player.x, y: this.player.y }
    
    // Auto-save every 10 seconds
    if (now % 10000 < 16) { // approximately every 10 seconds
      this.saveGame()
    }
  }

  private performAttack() {
    // Create attack effect
    const attackRange = 60
    const attackEffect = this.add.circle(this.player.x, this.player.y, attackRange, 0xFFFFFF, 0.3)
    
    this.tweens.add({
      targets: attackEffect,
      alpha: 0,
      scale: 1.5,
      duration: 200,
      ease: 'Power2',
      onComplete: () => attackEffect.destroy()
    })
    
    // Check for enemies in range
    this.enemies.forEach(enemy => {
      if (enemy.health <= 0) return
      
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.sprite.x, enemy.sprite.y
      )
      
      if (distance <= attackRange) {
        enemy.health -= 15
        
        // Knockback
        const angle = Phaser.Math.Angle.Between(
          this.player.x, this.player.y,
          enemy.sprite.x, enemy.sprite.y
        )
        enemy.sprite.body?.setVelocity(
          Math.cos(angle) * 300,
          Math.sin(angle) * 300
        )
        
        // Damage effect
        enemy.sprite.setTint(0xFF0000)
        this.time.delayedCall(200, () => {
          if (enemy.health <= 0) {
            enemy.sprite.setTint(0x666666)
            enemy.sprite.body?.setVelocity(0, 0)
            this.gameState.score += 50
            this.addToInventory({ id: 'exp', name: 'Experience', type: 'powerup', quantity: 1 })
          } else {
            enemy.sprite.setTint(0xFF6666)
          }
        })
        
        this.updateUI()
      }
    })
  }

  private updateEnemies() {
    this.enemies.forEach(enemy => {
      if (enemy.health <= 0) return
      
      // Simple AI: move towards player occasionally
      if (Math.random() < 0.005) {
        const angle = Phaser.Math.Angle.Between(
          enemy.sprite.x, enemy.sprite.y,
          this.player.x, this.player.y
        )
        
        enemy.sprite.body?.setVelocity(
          Math.cos(angle) * 30,
          Math.sin(angle) * 30
        )
      }
    })
  }
}