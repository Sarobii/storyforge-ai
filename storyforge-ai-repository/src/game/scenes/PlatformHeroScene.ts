import Phaser from 'phaser'
import { BaseGameScene, GameSceneData } from '../BaseGameScene'

interface Platform {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  isMoving: boolean
  startX?: number
  endX?: number
  speed?: number
}

interface Powerup {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  type: 'speed' | 'jump' | 'invincible' | 'life'
  duration?: number
}

export class PlatformHeroScene extends BaseGameScene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private movingPlatforms: Platform[] = []
  private enemies!: Phaser.Physics.Arcade.Group
  private collectibles!: Phaser.Physics.Arcade.Group
  private powerups: Powerup[] = []
  private spikes!: Phaser.Physics.Arcade.StaticGroup
  private checkpoint!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private goalFlag!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  
  private isGrounded = false
  private canDoubleJump = false
  private hasDoubleJumped = false
  private jumpPower = 400
  private moveSpeed = 160
  private activePowerups: Map<string, number> = new Map()
  private currentLevel = 1
  private maxLevels = 3
  
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter

  constructor(data: GameSceneData) {
    super('PlatformHeroScene')
    this.init(data)
  }

  preload() {
    console.log('PlatformHeroScene: Starting preload...')
    
    // Create simple graphics instead of loading external images
    this.load.image('platform', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    
    // Create colored shapes for game sprites
    const graphics = this.add.graphics()
    
    // Hero sprite (blue square)
    graphics.fillStyle(0x4169E1)
    graphics.fillRect(0, 0, 32, 32)
    graphics.generateTexture('hero', 32, 32)
    
    // Enemy sprite (red triangle)
    graphics.clear()
    graphics.fillStyle(0xFF4444)
    graphics.fillTriangle(12, 0, 0, 24, 24, 24)
    graphics.generateTexture('enemy_sprites', 24, 24)
    
    // Environment tile (brown square)
    graphics.clear()
    graphics.fillStyle(0x8B4513)
    graphics.fillRect(0, 0, 32, 32)
    graphics.generateTexture('environment', 32, 32)
    
    // Items (gold star - using polygon)
    graphics.clear()
    graphics.fillStyle(0xFFD700)
    graphics.fillCircle(8, 8, 6)
    graphics.generateTexture('items', 16, 16)
    
    graphics.destroy()
    
    console.log('PlatformHeroScene: Preload complete!')
  }

  create() {
    super.create()
    
    // Set world bounds for current level
    this.physics.world.setBounds(0, 0, 2400, 600)
    
    this.createLevel()
    this.createPlayer()
    this.createEnemies()
    this.createCollectibles()
    this.createPowerups()
    this.createParticleSystem()
    this.setupCollisions()
    this.setupCamera()
    
    // Update difficulty based on customization
    this.adjustDifficulty()
  }

  private createLevel() {
    // Background
    this.add.rectangle(1200, 300, 2400, 600, 0x87CEEB, 0.5) // Sky blue
    
    // Create platform groups
    this.platforms = this.physics.add.staticGroup()
    this.spikes = this.physics.add.staticGroup()
    
    // Ground platforms
    for (let x = 0; x < 2400; x += 200) {
      if (x < 600 || x > 800) { // Gap for difficulty
        const ground = this.add.rectangle(x, 580, 200, 40, 0x8B4513)
        this.platforms.add(ground)
      }
    }
    
    // Floating platforms
    const platformPositions = [
      { x: 300, y: 450 },
      { x: 600, y: 350 },
      { x: 900, y: 400 },
      { x: 1200, y: 300 },
      { x: 1500, y: 250 },
      { x: 1800, y: 200 },
      { x: 2100, y: 350 }
    ]
    
    platformPositions.forEach(pos => {
      const platform = this.add.rectangle(pos.x, pos.y, 150, 20, 0x654321)
      this.platforms.add(platform)
    })
    
    // Moving platforms
    this.createMovingPlatforms()
    
    // Hazards (spikes)
    const spikePositions = [800, 1000, 1400, 1700]
    spikePositions.forEach(x => {
      const spike = this.add.triangle(x, 560, 0, 20, 10, 0, 20, 20, 0xFF0000)
      spike.setOrigin(0.5, 1)
      this.spikes.add(spike)
    })
    
    // Checkpoint
    this.checkpoint = this.physics.add.sprite(1200, 250, 'items')
    this.checkpoint.setTint(0x00FF00)
    this.checkpoint.setSize(32, 64)
    if (this.checkpoint.body) {
      this.checkpoint.body.immovable = true
    }
    
    // Goal flag
    this.goalFlag = this.physics.add.sprite(2300, 500, 'items')
    this.goalFlag.setTint(0xFFD700)
    this.goalFlag.setSize(32, 64)
    if (this.goalFlag.body) {
      this.goalFlag.body.immovable = true
    }
  }

  private createMovingPlatforms() {
    // Horizontal moving platform
    const movingPlatform1 = this.physics.add.sprite(700, 400, 'platform')
    movingPlatform1.setTint(0x9966CC)
    movingPlatform1.setSize(120, 20)
    if (movingPlatform1.body) {
      movingPlatform1.body.immovable = true
    }
    
    const platform1: Platform = {
      sprite: movingPlatform1,
      isMoving: true,
      startX: 600,
      endX: 800,
      speed: 50
    }
    this.movingPlatforms.push(platform1)
    
    // Vertical moving platform
    const movingPlatform2 = this.physics.add.sprite(1600, 300, 'platform')
    movingPlatform2.setTint(0x9966CC)
    movingPlatform2.setSize(120, 20)
    if (movingPlatform2.body) {
      movingPlatform2.body.immovable = true
    }
    
    const platform2: Platform = {
      sprite: movingPlatform2,
      isMoving: true,
      startX: 200, // Using X for Y position tracking
      endX: 400,
      speed: 30
    }
    this.movingPlatforms.push(platform2)
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(100, 450, 'hero')
    this.player.setSize(24, 32)
    this.player.setBounce(0.1)
    this.player.setCollideWorldBounds(true)
    
    // Load position from save
    if (this.gameState.position) {
      this.player.setPosition(this.gameState.position.x, this.gameState.position.y)
    }
    
    // Player animations would go here if we had sprite sheets
    this.player.setTint(0x4169E1)
  }

  private createEnemies() {
    this.enemies = this.physics.add.group()
    
    const enemyPositions = [
      { x: 400, y: 400 },
      { x: 1000, y: 350 },
      { x: 1400, y: 200 },
      { x: 1900, y: 150 }
    ]
    
    enemyPositions.forEach(pos => {
      const enemy = this.physics.add.sprite(pos.x, pos.y, 'enemy_sprites')
      enemy.setTint(0xFF4444)
      enemy.setSize(20, 20)
      enemy.setBounce(1)
      enemy.setCollideWorldBounds(true)
      
      // Set random velocity
      enemy.body?.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-100, -200)
      )
      
      this.enemies.add(enemy)
    })
  }

  private createCollectibles() {
    this.collectibles = this.physics.add.group()
    
    // Coins scattered throughout level
    const coinPositions = [
      { x: 200, y: 500 },
      { x: 450, y: 400 },
      { x: 750, y: 350 },
      { x: 1050, y: 250 },
      { x: 1350, y: 200 },
      { x: 1650, y: 150 },
      { x: 1950, y: 300 },
      { x: 2200, y: 400 }
    ]
    
    coinPositions.forEach(pos => {
      const coin = this.physics.add.sprite(pos.x, pos.y, 'items')
      coin.setTint(0xFFD700)
      coin.setSize(16, 16)
      coin.setBounce(0.3)
      coin.setCollideWorldBounds(true)
      coin.setData('type', 'coin')
      coin.setData('value', 100)
      
      // Floating animation
      this.tweens.add({
        targets: coin,
        y: pos.y - 10,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
      
      this.collectibles.add(coin)
    })
  }

  private createPowerups() {
    const powerupData = [
      { x: 500, y: 300, type: 'speed' as const },
      { x: 1100, y: 200, type: 'jump' as const },
      { x: 1700, y: 100, type: 'invincible' as const }
    ]
    
    powerupData.forEach(data => {
      const powerup = this.physics.add.sprite(data.x, data.y, 'items')
      
      // Color code powerups
      switch (data.type) {
        case 'speed':
          powerup.setTint(0x00FFFF)
          break
        case 'jump':
          powerup.setTint(0xFF00FF)
          break
        case 'invincible':
          powerup.setTint(0xFFFFFF)
          break
      }
      
      powerup.setSize(20, 20)
      powerup.setData('type', data.type)
      
      // Pulsing animation
      this.tweens.add({
        targets: powerup,
        scale: 1.2,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
      
      const powerupObj: Powerup = {
        sprite: powerup,
        type: data.type,
        duration: data.type === 'invincible' ? 5000 : 10000
      }
      
      this.powerups.push(powerupObj)
    })
  }

  private createParticleSystem() {
    // Create particle system for effects
    this.particles = this.add.particles(0, 0, 'items', {
      scale: { start: 0.1, end: 0 },
      speed: { min: 50, max: 100 },
      lifespan: 300,
      tint: 0xFFFFFF
    })
  }

  private setupCollisions() {
    // Player vs platforms
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true
      this.hasDoubleJumped = false
    })
    
    // Player vs moving platforms
    this.movingPlatforms.forEach(platform => {
      this.physics.add.collider(this.player, platform.sprite, () => {
        this.isGrounded = true
        this.hasDoubleJumped = false
        
        // Move player with platform
        if (platform.isMoving) {
          this.player.x += platform.sprite.body?.velocity.x || 0
        }
      })
    })
    
    // Enemies vs platforms
    this.physics.add.collider(this.enemies, this.platforms)
    this.movingPlatforms.forEach(platform => {
      this.physics.add.collider(this.enemies, platform.sprite)
    })
    
    // Player vs enemies
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      this.handleEnemyCollision(enemy as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody)
    })
    
    // Player vs spikes
    this.physics.add.overlap(this.player, this.spikes, () => {
      this.handleHazard()
    })
    
    // Player vs collectibles
    this.physics.add.overlap(this.player, this.collectibles, (player, collectible) => {
      this.handleCollectible(collectible as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody)
    })
    
    // Player vs powerups
    this.powerups.forEach(powerup => {
      this.physics.add.overlap(this.player, powerup.sprite, () => {
        this.handlePowerup(powerup)
      })
    })
    
    // Player vs checkpoint
    this.physics.add.overlap(this.player, this.checkpoint, () => {
      this.handleCheckpoint()
    })
    
    // Player vs goal
    this.physics.add.overlap(this.player, this.goalFlag, () => {
      this.handleGoal()
    })
  }

  private setupCamera() {
    this.cameras.main.startFollow(this.player)
    this.cameras.main.setBounds(0, 0, 2400, 600)
    this.cameras.main.setDeadzone(200, 200)
  }

  private adjustDifficulty() {
    const difficulty = this.customization.difficulty
    
    switch (difficulty) {
      case 'easy':
        this.jumpPower = 450
        this.moveSpeed = 180
        this.canDoubleJump = true
        break
      case 'medium':
        this.jumpPower = 400
        this.moveSpeed = 160
        this.canDoubleJump = false
        break
      case 'hard':
        this.jumpPower = 350
        this.moveSpeed = 140
        this.canDoubleJump = false
        // Add more enemies
        this.createAdditionalEnemies()
        break
    }
  }

  private createAdditionalEnemies() {
    const extraPositions = [
      { x: 600, y: 300 },
      { x: 1300, y: 150 },
      { x: 2000, y: 250 }
    ]
    
    extraPositions.forEach(pos => {
      const enemy = this.physics.add.sprite(pos.x, pos.y, 'enemy_sprites')
      enemy.setTint(0xFF0000)
      enemy.setSize(20, 20)
      enemy.setBounce(1)
      enemy.setCollideWorldBounds(true)
      enemy.body?.setVelocity(Phaser.Math.Between(-70, 70), -150)
      this.enemies.add(enemy)
    })
  }

  private handleEnemyCollision(enemy: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
    if (this.activePowerups.has('invincible')) {
      // Destroy enemy if invincible
      this.particles.emitParticleAt(enemy.x, enemy.y, 10)
      enemy.destroy()
      this.gameState.score += 200
      this.updateUI()
      return
    }
    
    // Check if player is falling on enemy (stomp)
    if (this.player.body && enemy.body && this.player.body.velocity.y > 0 && this.player.y < enemy.y) {
      // Stomp enemy
      this.particles.emitParticleAt(enemy.x, enemy.y, 10)
      enemy.destroy()
      this.player.body.setVelocityY(-200) // Bounce
      this.gameState.score += 200
      this.addToInventory({ id: 'enemy_defeat', name: 'Enemy Defeated', type: 'powerup', quantity: 1 })
    } else {
      // Take damage
      this.gameState.health -= 20
      
      // Knockback
      const knockbackX = this.player.x < enemy.x ? -200 : 200
      this.player.body?.setVelocity(knockbackX, -150)
      
      // Flash effect
      this.player.setTint(0xFF0000)
      this.time.delayedCall(300, () => {
        this.player.setTint(0x4169E1)
      })
      
      if (this.gameState.health <= 0) {
        this.handleDeath()
      }
    }
    
    this.updateUI()
  }

  private handleHazard() {
    if (this.activePowerups.has('invincible')) return
    
    this.gameState.health -= 30
    
    // Knockback from spike
    this.player.body?.setVelocity(0, -300)
    
    // Visual effect
    this.particles.emitParticleAt(this.player.x, this.player.y, 15)
    
    if (this.gameState.health <= 0) {
      this.handleDeath()
    }
    
    this.updateUI()
  }

  private handleCollectible(collectible: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
    const type = collectible.getData('type')
    const value = collectible.getData('value')
    
    this.gameState.score += value
    this.addToInventory({ id: 'coin', name: 'Coin', type: 'coin', quantity: 1 })
    
    // Particle effect
    this.particles.emitParticleAt(collectible.x, collectible.y, 5)
    
    collectible.destroy()
    this.updateUI()
  }

  private handlePowerup(powerup: Powerup) {
    // Apply powerup effect
    this.activePowerups.set(powerup.type, this.time.now + (powerup.duration || 10000))
    
    switch (powerup.type) {
      case 'speed':
        this.moveSpeed = 240
        this.addToInventory({ id: 'speed_boost', name: 'Speed Boost', type: 'powerup', quantity: 1 })
        break
      case 'jump':
        this.jumpPower = 500
        this.canDoubleJump = true
        this.addToInventory({ id: 'jump_boost', name: 'Jump Boost', type: 'powerup', quantity: 1 })
        break
      case 'invincible':
        this.player.setTint(0xFFFFFF)
        this.addToInventory({ id: 'invincible', name: 'Invincibility', type: 'powerup', quantity: 1 })
        break
    }
    
    // Particle effect
    this.particles.emitParticleAt(powerup.sprite.x, powerup.sprite.y, 20)
    
    powerup.sprite.destroy()
    this.powerups = this.powerups.filter(p => p !== powerup)
    
    this.gameState.score += 300
    this.updateUI()
  }

  private handleCheckpoint() {
    // Save checkpoint
    this.gameState.checkpoints = [{
      level: this.currentLevel,
      position: { x: this.player.x, y: this.player.y }
    }]
    
    // Visual feedback
    this.checkpoint.setTint(0x00FF00)
    this.particles.emitParticleAt(this.checkpoint.x, this.checkpoint.y, 10)
    
    this.addAchievement('checkpoint_reached')
    this.saveGame()
  }

  private handleGoal() {
    this.addAchievement('level_complete')
    
    if (this.currentLevel < this.maxLevels) {
      // Go to next level
      this.currentLevel++
      this.gameState.level = this.currentLevel
      this.scene.restart()
    } else {
      // Complete game
      this.addAchievement('game_complete')
      this.completeGame(this.gameState.score, this.gameState.achievements)
    }
  }

  private handleDeath() {
    this.gameState.lives--
    
    if (this.gameState.lives <= 0) {
      // Game over
      const gameOverText = this.add.text(this.player.x, this.player.y - 50, 'GAME OVER', {
        fontSize: '24px',
        color: '#ff0000',
        fontFamily: 'monospace',
        fontStyle: 'bold'
      })
      gameOverText.setOrigin(0.5)
      
      this.time.delayedCall(3000, () => {
        this.completeGame(this.gameState.score, this.gameState.achievements)
      })
    } else {
      // Respawn at checkpoint or start
      const spawnPoint = this.gameState.checkpoints.length > 0 
        ? this.gameState.checkpoints[this.gameState.checkpoints.length - 1].position
        : { x: 100, y: 450 }
      
      this.gameState.health = 100
      this.player.setPosition(spawnPoint.x, spawnPoint.y)
      this.player.body?.setVelocity(0, 0)
      this.updateUI()
    }
  }

  update() {
    // Handle input
    let velocityX = 0
    const currentSpeed = this.activePowerups.has('speed') ? 240 : this.moveSpeed
    
    // Keyboard controls
    if (this.controls.keys?.left.isDown) {
      velocityX = -currentSpeed
    } else if (this.controls.keys?.right.isDown) {
      velocityX = currentSpeed
    }
    
    // Mobile controls
    if (this.controls.mobile) {
      if (this.controls.mobile.left) velocityX = -currentSpeed
      if (this.controls.mobile.right) velocityX = currentSpeed
    }
    
    this.player.body?.setVelocityX(velocityX)
    
    // Jumping
    const jumpPressed = this.controls.keys?.up.isDown || this.controls.keys?.action.isDown || this.controls.mobile?.action
    
    if (jumpPressed) {
      if (this.isGrounded) {
        this.player.body?.setVelocityY(-this.jumpPower)
        this.isGrounded = false
      } else if (this.canDoubleJump && !this.hasDoubleJumped) {
        this.player.body?.setVelocityY(-this.jumpPower * 0.8)
        this.hasDoubleJumped = true
        this.particles.emitParticleAt(this.player.x, this.player.y + 16, 5)
      }
    }
    
    // Check if still grounded
    if (this.player.body?.velocity.y !== 0) {
      this.isGrounded = false
    }
    
    // Update moving platforms
    this.updateMovingPlatforms()
    
    // Update powerups
    this.updatePowerups()
    
    // Update game state
    this.gameState.position = { x: this.player.x, y: this.player.y }
    
    // Auto-save
    if (this.time.now % 15000 < 16) {
      this.saveGame()
    }
  }

  private updateMovingPlatforms() {
    this.movingPlatforms.forEach(platform => {
      if (!platform.isMoving || !platform.startX || !platform.endX || !platform.speed) return
      
      const sprite = platform.sprite
      
      // Horizontal movement
      if (platform === this.movingPlatforms[0]) {
        if (sprite.x <= platform.startX) {
          if (sprite.body && 'setVelocity' in sprite.body) {
            (sprite.body as any).setVelocity(platform.speed, 0)
          }
        } else if (sprite.x >= platform.endX) {
          if (sprite.body && 'setVelocity' in sprite.body) {
            (sprite.body as any).setVelocity(-platform.speed, 0)
          }
        }
      }
      
      // Vertical movement
      if (platform === this.movingPlatforms[1]) {
        if (sprite.y <= platform.startX) { // Using startX as startY
          if (sprite.body && 'setVelocity' in sprite.body) {
            (sprite.body as any).setVelocity(0, platform.speed)
          }
        } else if (sprite.y >= platform.endX) { // Using endX as endY
          if (sprite.body && 'setVelocity' in sprite.body) {
            (sprite.body as any).setVelocity(0, -platform.speed)
          }
        }
      }
    })
  }

  private updatePowerups() {
    const now = this.time.now
    
    // Check expired powerups
    this.activePowerups.forEach((expireTime, type) => {
      if (now > expireTime) {
        this.activePowerups.delete(type)
        
        // Reset effects
        switch (type) {
          case 'speed':
            this.moveSpeed = 160
            break
          case 'jump':
            this.jumpPower = 400
            this.canDoubleJump = this.customization.difficulty === 'easy'
            break
          case 'invincible':
            this.player.setTint(0x4169E1)
            break
        }
      }
    })
  }
}