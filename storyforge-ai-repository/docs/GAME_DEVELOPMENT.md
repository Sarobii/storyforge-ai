# Game Development Guide - StoryForge AI

Learn how to create new game templates and modify existing ones.

## 🎮 Game Architecture Overview

StoryForge AI uses a modular game architecture built on Phaser.js:

```
Game Structure:
App.tsx → GamePlay.tsx → GameEngine.ts → GameScenes
```

### Core Components

1. **GameEngine.ts** - Main engine that loads and manages game scenes
2. **BaseGameScene.ts** - Base class with common functionality
3. **Game Scenes** - Individual game implementations
4. **Game Templates** - Configuration objects defining game metadata

## 🔧 Creating a New Game Template

### Step 1: Define Game Template

Add your game template to `src/types/game.ts`:

```typescript
export const GAME_TEMPLATES: GameTemplate[] = [
  // ... existing templates
  {
    id: 'space-shooter',
    title: 'Space Shooter',
    description: 'Classic arcade-style space shooter with power-ups',
    icon: '🚀',
    difficulty: 'Hard',
    estimatedTime: '15-20 min',
    category: 'Action',
    featured: true
  }
]
```

### Step 2: Create Game Scene

Create `src/game/scenes/SpaceShooterScene.ts`:

```typescript
import Phaser from 'phaser'
import { BaseGameScene, GameSceneData } from '../BaseGameScene'

export class SpaceShooterScene extends BaseGameScene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private enemies!: Phaser.Physics.Arcade.Group
  private bullets!: Phaser.Physics.Arcade.Group
  private stars!: Phaser.GameObjects.Group
  
  constructor(data: GameSceneData) {
    super('SpaceShooterScene')
    this.init(data)
  }

  preload() {
    console.log('SpaceShooterScene: Starting preload...')
    
    // Create programmatic graphics for performance
    const graphics = this.add.graphics()
    
    // Player ship (blue triangle)
    graphics.fillStyle(0x4169E1)
    graphics.fillTriangle(16, 0, 0, 32, 32, 32)
    graphics.generateTexture('player_ship', 32, 32)
    
    // Enemy ship (red square)
    graphics.clear()
    graphics.fillStyle(0xFF4444)
    graphics.fillRect(0, 0, 24, 24)
    graphics.generateTexture('enemy_ship', 24, 24)
    
    // Bullet (yellow circle)
    graphics.clear()
    graphics.fillStyle(0xFFFF00)
    graphics.fillCircle(4, 4, 4)
    graphics.generateTexture('bullet', 8, 8)
    
    graphics.destroy()
    
    console.log('SpaceShooterScene: Preload complete!')
  }

  create() {
    super.create()
    
    this.createStarField()
    this.createPlayer()
    this.createEnemyGroup()
    this.createBulletGroup()
    this.setupCollisions()
    
    // Start enemy spawning
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    })
  }

  private createStarField() {
    this.stars = this.add.group()
    
    // Create animated star field background
    for (let i = 0; i < 100; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, 800),
        Phaser.Math.Between(0, 600),
        Phaser.Math.Between(1, 3),
        0xFFFFFF,
        Phaser.Math.FloatBetween(0.3, 1)
      )
      this.stars.add(star)
    }
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(400, 500, 'player_ship')
    this.player.setCollideWorldBounds(true)
    this.player.setSize(24, 24)
    
    // Apply customization
    if (this.customization.theme === 'neon') {
      this.player.setTint(0x00FFFF)
    }
  }

  private createEnemyGroup() {
    this.enemies = this.physics.add.group()
  }

  private createBulletGroup() {
    this.bullets = this.physics.add.group()
  }

  private setupCollisions() {
    // Bullets hit enemies
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      undefined,
      this
    )
    
    // Player hits enemies
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitPlayer,
      undefined,
      this
    )
  }

  private spawnEnemy() {
    const enemy = this.enemies.create(
      Phaser.Math.Between(50, 750),
      -50,
      'enemy_ship'
    )
    enemy.setVelocity(0, 100)
    enemy.setSize(20, 20)
  }

  private shootBullet() {
    const bullet = this.bullets.create(
      this.player.x,
      this.player.y - 20,
      'bullet'
    )
    bullet.setVelocity(0, -300)
    bullet.setSize(6, 6)
    
    // Remove bullet when it goes off screen
    bullet.checkWorldBounds = true
    bullet.outOfBoundsKill = true
  }

  private hitEnemy(bullet: any, enemy: any) {
    bullet.destroy()
    enemy.destroy()
    
    this.gameState.score += 100
    this.updateUI()
    
    // Create explosion effect
    const explosion = this.add.circle(enemy.x, enemy.y, 20, 0xFF6600, 0.8)
    this.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => explosion.destroy()
    })
  }

  private hitPlayer(player: any, enemy: any) {
    enemy.destroy()
    
    this.gameState.health -= 20
    this.updateUI()
    
    // Flash effect
    player.setTint(0xFF0000)
    this.time.delayedCall(200, () => {
      player.setTint(0xFFFFFF)
    })
    
    if (this.gameState.health <= 0) {
      this.handleGameOver()
    }
  }

  private handleGameOver() {
    this.physics.pause()
    
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#FF0000',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    
    this.time.delayedCall(3000, () => {
      this.completeGame(this.gameState.score, this.gameState.achievements)
    })
  }

  update() {
    // Player movement
    let velocityX = 0
    let velocityY = 0
    const speed = 200
    
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
    
    this.player.setVelocity(velocityX, velocityY)
    
    // Shooting
    const shootPressed = this.controls.keys?.action.isDown || this.controls.mobile?.action
    const now = this.time.now
    
    if (shootPressed && now - this.lastShot > 200) {
      this.shootBullet()
      this.lastShot = now
    }
    
    // Update star field
    this.stars.children.entries.forEach((star: any) => {
      star.y += 1
      if (star.y > 600) {
        star.y = -10
        star.x = Phaser.Math.Between(0, 800)
      }
    })
    
    // Clean up off-screen enemies
    this.enemies.children.entries.forEach((enemy: any) => {
      if (enemy.y > 650) {
        enemy.destroy()
      }
    })
    
    // Update game state
    this.gameState.position = { x: this.player.x, y: this.player.y }
  }
  
  private lastShot = 0
}
```

### Step 3: Register Scene in GameEngine

Add to `src/game/GameEngine.ts`:

```typescript
private async getGameScene(templateId: string, savedState?: GameState) {
  const sceneData = {
    customization: this.props.customization,
    savedState,
    onGameComplete: this.handleGameComplete.bind(this),
    onGameSave: this.handleGameSave.bind(this),
    onGamePause: this.handleGameSave.bind(this)
  }

  switch (templateId) {
    // ... existing cases
    case 'space-shooter':
      const { SpaceShooterScene } = await import('./scenes/SpaceShooterScene')
      return new SpaceShooterScene(sceneData)
    // ... rest of cases
  }
}
```

### Step 4: Add Template-Specific Customization (Optional)

In `src/components/GameCustomization.tsx`:

```typescript
const getTemplateSpecificFields = () => {
  switch (template.id) {
    case 'space-shooter':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Ship Type
            </label>
            <select
              value={customization.theme}
              onChange={(e) => setCustomization(prev => ({ ...prev, theme: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="classic">Classic Fighter</option>
              <option value="neon">Neon Interceptor</option>
              <option value="stealth">Stealth Bomber</option>
            </select>
          </div>
        </div>
      )
    // ... other templates
  }
}
```

## 🎨 Advanced Game Features

### Animation System

```typescript
// Create sprite animations
create() {
  // Create animation from sprite sheet
  this.anims.create({
    key: 'player_move',
    frames: this.anims.generateFrameNumbers('player_sheet', {
      start: 0,
      end: 3
    }),
    frameRate: 10,
    repeat: -1
  })
  
  // Play animation
  this.player.play('player_move')
}
```

### Particle Effects

```typescript
// Create particle system
create() {
  this.explosionParticles = this.add.particles('spark')
  
  this.explosionEmitter = this.explosionParticles.createEmitter({
    speed: { min: 50, max: 100 },
    scale: { start: 0.5, end: 0 },
    lifespan: 300
  })
}

// Trigger explosion
private explode(x: number, y: number) {
  this.explosionEmitter.explode(10, x, y)
}
```

### Sound Effects

```typescript
preload() {
  // Load audio files
  this.load.audio('shoot', '/audio/shoot.wav')
  this.load.audio('explosion', '/audio/explosion.wav')
}

create() {
  // Create sound objects
  this.shootSound = this.sound.add('shoot', { volume: 0.3 })
  this.explosionSound = this.sound.add('explosion', { volume: 0.5 })
}

// Play sounds
private shootBullet() {
  this.shootSound.play()
  // ... rest of shooting logic
}
```

### Power-up System

```typescript
interface PowerUp {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  type: 'speed' | 'damage' | 'health' | 'shield'
  duration: number
}

private activePowerUps: PowerUp[] = []

private collectPowerUp(player: any, powerup: any) {
  const type = powerup.getData('type')
  const duration = 5000 // 5 seconds
  
  this.activePowerUps.push({
    sprite: powerup,
    type: type,
    duration: duration
  })
  
  powerup.destroy()
  
  // Apply power-up effect
  switch (type) {
    case 'speed':
      this.playerSpeed *= 1.5
      break
    case 'damage':
      this.bulletDamage *= 2
      break
    // ... other power-ups
  }
  
  // Remove power-up after duration
  this.time.delayedCall(duration, () => {
    this.removePowerUp(type)
  })
}
```

### AI Enemies

```typescript
private updateEnemyAI(enemy: any) {
  const playerDistance = Phaser.Math.Distance.Between(
    enemy.x, enemy.y,
    this.player.x, this.player.y
  )
  
  if (playerDistance < 200) {
    // Move toward player
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      this.player.x, this.player.y
    )
    
    enemy.setVelocity(
      Math.cos(angle) * 80,
      Math.sin(angle) * 80
    )
    
    // Shoot at player occasionally
    if (Math.random() < 0.02) {
      this.enemyShoot(enemy)
    }
  }
}
```

### Level System

```typescript
private currentLevel = 1
private enemiesKilled = 0
private enemiesPerLevel = 10

private hitEnemy(bullet: any, enemy: any) {
  // ... existing hit logic
  
  this.enemiesKilled++
  
  if (this.enemiesKilled >= this.enemiesPerLevel) {
    this.nextLevel()
  }
}

private nextLevel() {
  this.currentLevel++
  this.enemiesKilled = 0
  this.enemiesPerLevel += 5
  
  // Show level up message
  const levelText = this.add.text(400, 300, `LEVEL ${this.currentLevel}`, {
    fontSize: '48px',
    color: '#00FF00',
    fontFamily: 'monospace',
    fontStyle: 'bold'
  }).setOrigin(0.5)
  
  this.tweens.add({
    targets: levelText,
    alpha: 0,
    duration: 2000,
    onComplete: () => levelText.destroy()
  })
  
  // Increase difficulty
  this.enemySpeed += 20
  this.enemySpawnRate -= 100
}
```

## 🗺️ Game Template Categories

### Action Games
- Fast-paced gameplay
- Real-time controls
- Score-based progression
- Examples: Space Shooter, Platform Hero

### Educational Games  
- Learning objectives
- Progress tracking
- Adaptive difficulty
- Examples: Math RPG

### Puzzle Games
- Logic-based challenges
- Turn-based or strategic
- Problem-solving focus
- Examples: Puzzle Solver

### Adventure Games
- Exploration and discovery
- Story-driven progression
- Character development
- Examples: Pixel Quest, Gender Reveal

## 🎨 Visual Customization

### Theme System

```typescript
private applyTheme() {
  switch (this.customization.theme) {
    case 'neon':
      this.cameras.main.setPostPipeline('Glow')
      this.player.setTint(0x00FFFF)
      break
      
    case 'retro':
      this.cameras.main.setPixelated(2)
      this.player.setTint(0x8BIT00)
      break
      
    case 'space':
      this.cameras.main.setBackgroundColor(0x000011)
      this.addStarField()
      break
  }
}
```

### Dynamic Color Schemes

```typescript
private applyColorScheme() {
  const colors = this.customization.customColors
  
  if (colors) {
    this.player.setTint(parseInt(colors.primary.replace('#', ''), 16))
    this.enemies.children.entries.forEach((enemy: any) => {
      enemy.setTint(parseInt(colors.secondary.replace('#', ''), 16))
    })
  }
}
```

## 📁 Game Data Management

### Save/Load System

```typescript
// Save game state
private saveProgress() {
  const saveData = {
    level: this.currentLevel,
    score: this.gameState.score,
    lives: this.gameState.lives,
    health: this.gameState.health,
    powerUps: this.activePowerUps.map(p => p.type),
    position: { x: this.player.x, y: this.player.y },
    achievements: this.gameState.achievements,
    playtime: this.gameState.playtime
  }
  
  this.saveGame()
}

// Load saved state
create() {
  super.create()
  
  if (this.savedState) {
    this.currentLevel = this.savedState.level || 1
    this.gameState.score = this.savedState.score || 0
    // ... restore other state
  }
}
```

### Achievement System

```typescript
private checkAchievements() {
  // Score-based achievements
  if (this.gameState.score >= 10000 && !this.hasAchievement('high_scorer')) {
    this.addAchievement('high_scorer')
    this.showAchievementNotification('High Scorer!')
  }
  
  // Time-based achievements
  if (this.gameState.playtime >= 300 && !this.hasAchievement('persistent')) {
    this.addAchievement('persistent')
    this.showAchievementNotification('Persistent Player!')
  }
  
  // Action-based achievements
  if (this.enemiesKilled >= 50 && !this.hasAchievement('destroyer')) {
    this.addAchievement('destroyer')
    this.showAchievementNotification('Destroyer!')
  }
}

private showAchievementNotification(title: string) {
  const notification = this.add.container(400, 100)
  notification.setScrollFactor(0)
  notification.setDepth(1200)
  
  const bg = this.add.rectangle(0, 0, 300, 60, 0x4169E1, 0.9)
  const text = this.add.text(0, 0, `🏆 ${title}`, {
    fontSize: '18px',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    fontStyle: 'bold'
  }).setOrigin(0.5)
  
  notification.add([bg, text])
  
  // Animate notification
  this.tweens.add({
    targets: notification,
    y: 50,
    duration: 300,
    ease: 'Back.easeOut'
  })
  
  this.time.delayedCall(3000, () => {
    this.tweens.add({
      targets: notification,
      alpha: 0,
      duration: 500,
      onComplete: () => notification.destroy()
    })
  })
}
```

## 📱 Mobile Optimization

### Touch Controls

```typescript
// Enhanced mobile controls in BaseGameScene
protected setupMobileControls() {
  // Larger touch areas for better usability
  const joystickBase = this.add.circle(0, 0, 60, 0x333333, 0.5) // Increased size
  const actionButton = this.add.circle(
    this.cameras.main.width - 80, 
    this.cameras.main.height - 120, // Higher position
    45, // Larger button
    0xff6b35, 
    0.8
  )
  
  // Visual feedback for touches
  actionButton.on('pointerdown', () => {
    actionButton.setScale(0.9)
    actionButton.setAlpha(1)
  })
  
  actionButton.on('pointerup', () => {
    actionButton.setScale(1)
    actionButton.setAlpha(0.8)
  })
}
```

### Responsive Design

```typescript
// Adjust game elements based on screen size
create() {
  super.create()
  
  // Scale UI elements for mobile
  if (this.isMobile) {
    this.cameras.main.setZoom(0.8) // Zoom out on mobile
    this.adjustUIForMobile()
  }
}

private adjustUIForMobile() {
  // Larger UI elements
  const healthBar = this.data.get('healthBar')
  if (healthBar) {
    healthBar.setScale(1.5)
  }
  
  // Reposition elements
  const scoreText = this.data.get('scoreText')
  if (scoreText) {
    scoreText.setFontSize('20px')
  }
}
```

## 📊 Testing Your Game

### Debug Mode

```typescript
create() {
  super.create()
  
  if (import.meta.env.VITE_GAME_DEBUG === 'true') {
    this.setupDebugMode()
  }
}

private setupDebugMode() {
  // Debug keyboard shortcuts
  this.input.keyboard?.on('keydown-G', () => {
    // Toggle god mode
    this.gameState.health = 1000
  })
  
  this.input.keyboard?.on('keydown-L', () => {
    // Skip to next level
    this.nextLevel()
  })
  
  this.input.keyboard?.on('keydown-S', () => {
    // Add score
    this.gameState.score += 1000
    this.updateUI()
  })
}
```

### Performance Testing

```typescript
// Monitor performance
update() {
  if (import.meta.env.VITE_GAME_DEBUG === 'true') {
    const fps = this.game.loop.actualFps
    
    if (fps < 30) {
      console.warn('Low FPS detected:', fps)
    }
    
    // Object count warning
    if (this.children.length > 100) {
      console.warn('High object count:', this.children.length)
    }
  }
}
```

## 🚀 Publishing Your Game

1. **Test thoroughly** on different devices and browsers
2. **Optimize performance** (see performance section)
3. **Add proper error handling**
4. **Update game template metadata**
5. **Create promotional screenshots**
6. **Write game-specific documentation**

### Game Template Checklist

- ☑️ Extends BaseGameScene correctly
- ☑️ Implements preload(), create(), and update()
- ☑️ Handles keyboard and touch input
- ☑️ Uses customization settings
- ☑️ Implements save/load functionality
- ☑️ Has proper collision detection
- ☑️ Includes UI updates
- ☑️ Handles game completion
- ☑️ Has mobile-friendly controls
- ☑️ Includes error handling
- ☑️ Performance optimized
- ☑️ Thoroughly tested

With this guide, you can create engaging game templates that integrate seamlessly with the StoryForge AI platform!