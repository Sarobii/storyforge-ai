import Phaser from 'phaser'
import { BaseGameScene, GameSceneData } from '../BaseGameScene'

interface PuzzlePiece {
  sprite: Phaser.GameObjects.Rectangle
  originalX: number
  originalY: number
  currentSlot: number | null
  id: number
  isDragging: boolean
}

interface PuzzleSlot {
  x: number
  y: number
  correctPieceId: number
  occupied: boolean
  sprite: Phaser.GameObjects.Rectangle
}

interface PatternChallenge {
  pattern: number[]
  playerPattern: number[]
  currentStep: number
  buttons: Phaser.GameObjects.Rectangle[]
}

export class PuzzleSolverScene extends BaseGameScene {
  private currentPuzzleType: 'jigsaw' | 'pattern' | 'sliding' | 'logic' = 'jigsaw'
  private puzzleLevel = 1
  private maxLevels = 5
  
  // Jigsaw puzzle
  private jigsawPieces: PuzzlePiece[] = []
  private jigsawSlots: PuzzleSlot[] = []
  private draggedPiece: PuzzlePiece | null = null
  
  // Pattern matching
  private patternChallenge: PatternChallenge | null = null
  private patternTimer: Phaser.Time.TimerEvent | null = null
  
  // Sliding puzzle
  private slidingGrid: (number | null)[][] = []
  private slidingTiles: Phaser.GameObjects.Rectangle[] = []
  private emptySlot = { x: 2, y: 2 }
  
  // Logic puzzle
  private logicGrid: boolean[][] = []
  private logicButtons: Phaser.GameObjects.Rectangle[][] = []
  
  private puzzleContainer!: Phaser.GameObjects.Container
  private uiContainer!: Phaser.GameObjects.Container
  private timerText!: Phaser.GameObjects.Text
  private puzzleStartTime = 0
  private bestTime = Infinity
  private hintsRemaining = 3

  constructor(data: GameSceneData) {
    super('PuzzleSolverScene')
    this.init(data)
  }

  preload() {
    console.log('PuzzleSolverScene: Starting preload...')
    
    // Create puzzle piece graphics
    const graphics = this.add.graphics()
    
    // Items (puzzle pieces)
    graphics.fillStyle(0x4169E1)
    graphics.fillRoundedRect(0, 0, 16, 16, 2)
    graphics.generateTexture('items', 16, 16)
    
    graphics.destroy()
    
    console.log('PuzzleSolverScene: Preload complete!')
  }

  create() {
    super.create()
    
    this.createBackground()
    this.createUI()
    this.startPuzzle()
    
    this.puzzleStartTime = this.time.now
  }

  private createBackground() {
    // Gradient background
    const bg = this.add.rectangle(400, 300, 800, 600, 0x2c3e50)
    
    // Add some decorative elements
    for (let i = 0; i < 30; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, 800),
        Phaser.Math.Between(0, 600),
        Phaser.Math.Between(1, 3),
        0xFFFFFF,
        0.3
      )
    }
  }

  private createUI() {
    this.uiContainer = this.add.container(0, 0)
    
    // Puzzle type indicator
    const typeText = this.add.text(50, 30, `Puzzle: ${this.getPuzzleTypeName()}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    })
    
    // Level indicator
    const levelText = this.add.text(50, 60, `Level: ${this.puzzleLevel}/${this.maxLevels}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    })
    
    // Timer
    this.timerText = this.add.text(400, 30, 'Time: 00:00', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    })
    this.timerText.setOrigin(0.5, 0)
    
    // Hints remaining
    const hintText = this.add.text(750, 30, `Hints: ${this.hintsRemaining}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    })
    hintText.setOrigin(1, 0)
    hintText.setInteractive()
    hintText.on('pointerdown', () => this.useHint())
    
    // Control buttons
    const shuffleButton = this.createButton(650, 550, 'Shuffle', () => this.shufflePuzzle())
    const resetButton = this.createButton(550, 550, 'Reset', () => this.resetPuzzle())
    const skipButton = this.createButton(450, 550, 'Skip', () => this.skipPuzzle())
    
    this.uiContainer.add([typeText, levelText, this.timerText, hintText, shuffleButton, resetButton, skipButton])
    
    // Store references
    this.data.set('typeText', typeText)
    this.data.set('levelText', levelText)
    this.data.set('hintText', hintText)
  }

  private getPuzzleTypeName(): string {
    switch (this.currentPuzzleType) {
      case 'jigsaw': return 'Jigsaw'
      case 'pattern': return 'Pattern'
      case 'sliding': return 'Sliding'
      case 'logic': return 'Logic'
    }
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y)
    
    const bg = this.add.rectangle(0, 0, 80, 30, 0x4169E1, 0.8)
    bg.setStrokeStyle(2, 0xFFFFFF)
    bg.setInteractive()
    
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    })
    buttonText.setOrigin(0.5)
    
    button.add([bg, buttonText])
    
    bg.on('pointerdown', callback)
    bg.on('pointerover', () => bg.setFillStyle(0x5179F1))
    bg.on('pointerout', () => bg.setFillStyle(0x4169E1))
    
    return button
  }

  private startPuzzle() {
    // Remove previous puzzle
    if (this.puzzleContainer) {
      this.puzzleContainer.destroy()
    }
    
    this.puzzleContainer = this.add.container(400, 300)
    
    // Select puzzle type based on level
    const puzzleTypes: ('jigsaw' | 'pattern' | 'sliding' | 'logic')[] = ['jigsaw', 'pattern', 'sliding', 'logic', 'jigsaw']
    this.currentPuzzleType = puzzleTypes[(this.puzzleLevel - 1) % puzzleTypes.length]
    
    this.updateUI()
    
    switch (this.currentPuzzleType) {
      case 'jigsaw':
        this.createJigsawPuzzle()
        break
      case 'pattern':
        this.createPatternChallenge()
        break
      case 'sliding':
        this.createSlidingPuzzle()
        break
      case 'logic':
        this.createLogicPuzzle()
        break
    }
  }

  private createJigsawPuzzle() {
    const gridSize = Math.min(3 + Math.floor(this.puzzleLevel / 2), 4)
    const pieceSize = 60
    const spacing = 70
    
    this.jigsawPieces = []
    this.jigsawSlots = []
    
    // Create slots (target positions)
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = (col - (gridSize - 1) / 2) * spacing
        const y = (row - (gridSize - 1) / 2) * spacing
        
        const slot = this.add.rectangle(x, y, pieceSize, pieceSize, 0x333333, 0.5)
        slot.setStrokeStyle(2, 0xFFFFFF, 0.5)
        
        const slotData: PuzzleSlot = {
          x, y,
          correctPieceId: row * gridSize + col,
          occupied: false,
          sprite: slot
        }
        
        this.jigsawSlots.push(slotData)
        this.puzzleContainer.add(slot)
      }
    }
    
    // Create pieces (scattered around)
    const colors = [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0x96CEB4, 0xFEBB6B, 0xC9C9C9, 0xDDA0DD, 0xF0E68C]
    
    for (let i = 0; i < gridSize * gridSize; i++) {
      // Random position around the puzzle area
      const angle = (i / (gridSize * gridSize)) * Math.PI * 2
      const distance = 200
      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance
      
      const piece = this.add.rectangle(x, y, pieceSize - 4, pieceSize - 4, colors[i % colors.length])
      piece.setStrokeStyle(2, 0x000000)
      piece.setInteractive({ draggable: true })
      
      // Add number for identification
      const numberText = this.add.text(x, y, (i + 1).toString(), {
        fontSize: '14px',
        color: '#000000',
        fontFamily: 'monospace',
        fontStyle: 'bold'
      })
      numberText.setOrigin(0.5)
      
      const pieceData: PuzzlePiece = {
        sprite: piece,
        originalX: x,
        originalY: y,
        currentSlot: null,
        id: i,
        isDragging: false
      }
      
      this.jigsawPieces.push(pieceData)
      this.puzzleContainer.add([piece, numberText])
      
      // Drag events
      piece.on('dragstart', () => {
        pieceData.isDragging = true
        this.draggedPiece = pieceData
        piece.setDepth(100)
        numberText.setDepth(101)
      })
      
      piece.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        piece.x = dragX
        piece.y = dragY
        numberText.x = dragX
        numberText.y = dragY
      })
      
      piece.on('dragend', () => {
        pieceData.isDragging = false
        this.checkJigsawPlacement(pieceData, numberText)
        piece.setDepth(1)
        numberText.setDepth(2)
      })
    }
    
    // Instructions
    const instructions = this.add.text(0, -200, 'Drag pieces to their correct positions!', {
      fontSize: '16px',
      color: '#FFD700',
      fontFamily: 'monospace',
      align: 'center'
    })
    instructions.setOrigin(0.5)
    this.puzzleContainer.add(instructions)
  }

  private checkJigsawPlacement(piece: PuzzlePiece, numberText: Phaser.GameObjects.Text) {
    const snapDistance = 40
    let snappedToSlot = false
    
    // Check each slot
    for (const slot of this.jigsawSlots) {
      const distance = Phaser.Math.Distance.Between(
        piece.sprite.x, piece.sprite.y,
        slot.x, slot.y
      )
      
      if (distance < snapDistance) {
        // Snap to slot
        piece.sprite.x = slot.x
        piece.sprite.y = slot.y
        numberText.x = slot.x
        numberText.y = slot.y
        
        // Update slot occupation
        if (piece.currentSlot !== null) {
          this.jigsawSlots[piece.currentSlot].occupied = false
        }
        
        piece.currentSlot = this.jigsawSlots.indexOf(slot)
        slot.occupied = true
        snappedToSlot = true
        
        // Check if correct placement
        if (slot.correctPieceId === piece.id) {
          (piece.sprite as any).setTint(0x90EE90) // Green for correct
          this.gameState.score += 50
        } else {
          (piece.sprite as any).clearTint()
        }
        
        break
      }
    }
    
    if (!snappedToSlot && piece.currentSlot !== null) {
      // Remove from slot
      if (piece.currentSlot >= 0 && piece.currentSlot < this.jigsawSlots.length) {
        this.jigsawSlots[piece.currentSlot].occupied = false
      }
      piece.currentSlot = null as number | null
      (piece.sprite as any).clearTint()
    }
    
    this.checkJigsawComplete()
  }

  private checkJigsawComplete() {
    const allCorrect = this.jigsawPieces.every(piece => {
      if (piece.currentSlot === null) return false
      const slot = this.jigsawSlots[piece.currentSlot]
      return slot.correctPieceId === piece.id
    })
    
    if (allCorrect) {
      this.completePuzzle()
    }
  }

  private createPatternChallenge() {
    const sequenceLength = 3 + this.puzzleLevel
    const buttonCount = 4
    const buttonSize = 80
    const buttonColors = [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0x96CEB4]
    
    // Generate random pattern
    const pattern: number[] = []
    for (let i = 0; i < sequenceLength; i++) {
      pattern.push(Phaser.Math.Between(0, buttonCount - 1))
    }
    
    // Create buttons
    const buttons: Phaser.GameObjects.Rectangle[] = []
    for (let i = 0; i < buttonCount; i++) {
      const x = (i - (buttonCount - 1) / 2) * 100
      const y = 50
      
      const button = this.add.rectangle(x, y, buttonSize, buttonSize, buttonColors[i])
      button.setStrokeStyle(3, 0xFFFFFF)
      button.setInteractive()
      
      button.on('pointerdown', () => {
        if (this.patternChallenge) {
          this.handlePatternInput(i)
        }
      })
      
      buttons.push(button as Phaser.GameObjects.Rectangle)
      this.puzzleContainer.add(button)
    }
    
    this.patternChallenge = {
      pattern,
      playerPattern: [],
      currentStep: 0,
      buttons
    }
    
    // Instructions
    const instructions = this.add.text(0, -150, 'Watch the pattern, then repeat it!', {
      fontSize: '16px',
      color: '#FFD700',
      fontFamily: 'monospace',
      align: 'center'
    })
    instructions.setOrigin(0.5)
    this.puzzleContainer.add(instructions)
    
    // Show pattern
    this.time.delayedCall(1000, () => {
      this.showPattern()
    })
  }

  private showPattern() {
    if (!this.patternChallenge) return
    
    let step = 0
    const showNextStep = () => {
      if (step < this.patternChallenge!.pattern.length) {
        const buttonIndex = this.patternChallenge!.pattern[step]
        const button = this.patternChallenge!.buttons[buttonIndex] as Phaser.GameObjects.Rectangle
        
        // Flash button
        (button as any).setTint(0xFFFFFF)
        this.time.delayedCall(300, () => {
          (button as any).clearTint()
          step++
          this.time.delayedCall(200, showNextStep)
        })
      } else {
        // Pattern shown, wait for input
        const inputText = this.add.text(0, 150, 'Now repeat the pattern!', {
          fontSize: '14px',
          color: '#4ade80',
          fontFamily: 'monospace'
        })
        inputText.setOrigin(0.5)
        this.puzzleContainer.add(inputText)
      }
    }
    
    showNextStep()
  }

  private handlePatternInput(buttonIndex: number) {
    if (!this.patternChallenge) return
    
    const button = this.patternChallenge!.buttons[buttonIndex] as Phaser.GameObjects.Rectangle
    (button as any).setTint(0xFFFFFF)
    this.time.delayedCall(200, () => (button as any).clearTint())
    
    this.patternChallenge.playerPattern.push(buttonIndex)
    
    // Check if correct so far
    const currentStep = this.patternChallenge.playerPattern.length - 1
    const expectedButton = this.patternChallenge.pattern[currentStep]
    
    if (buttonIndex !== expectedButton) {
      // Wrong input
      this.showMessage('Wrong pattern! Try again.', '#ff6b6b')
      this.patternChallenge.playerPattern = []
      
      this.time.delayedCall(1000, () => {
        this.showPattern()
      })
      return
    }
    
    // Check if complete
    if (this.patternChallenge.playerPattern.length === this.patternChallenge.pattern.length) {
      this.completePuzzle()
    }
  }

  private createSlidingPuzzle() {
    const gridSize = 3
    const tileSize = 60
    const spacing = 65
    
    // Initialize grid with numbers (0 represents empty space)
    this.slidingGrid = []
    for (let row = 0; row < gridSize; row++) {
      this.slidingGrid[row] = []
      for (let col = 0; col < gridSize; col++) {
        if (row === gridSize - 1 && col === gridSize - 1) {
          this.slidingGrid[row][col] = null // Empty space
        } else {
          this.slidingGrid[row][col] = row * gridSize + col + 1
        }
      }
    }
    
    // Shuffle the puzzle
    this.shuffleSlidingPuzzle()
    
    // Create visual tiles
    this.slidingTiles = []
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = (col - (gridSize - 1) / 2) * spacing
        const y = (row - (gridSize - 1) / 2) * spacing
        
        if (this.slidingGrid[row][col] !== null) {
          const tile = this.add.rectangle(x, y, tileSize, tileSize, 0x4169E1)
          tile.setStrokeStyle(2, 0xFFFFFF)
          tile.setInteractive()
          
          const number = this.add.text(x, y, this.slidingGrid[row][col]!.toString(), {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'monospace',
            fontStyle: 'bold'
          })
          number.setOrigin(0.5)
          
          tile.setData('row', row)
          tile.setData('col', col)
          
          tile.on('pointerdown', () => {
            this.moveSlidingTile(row, col)
          })
          
          this.slidingTiles.push(tile)
          this.puzzleContainer.add([tile, number])
        }
      }
    }
    
    // Instructions
    const instructions = this.add.text(0, -180, 'Click tiles to slide them into order!\nGoal: 1-2-3\n     4-5-6\n     7-8-_', {
      fontSize: '14px',
      color: '#FFD700',
      fontFamily: 'monospace',
      align: 'center'
    })
    instructions.setOrigin(0.5)
    this.puzzleContainer.add(instructions)
  }

  private shuffleSlidingPuzzle() {
    // Shuffle by making random valid moves
    for (let i = 0; i < 100; i++) {
      const emptyRow = this.emptySlot.y
      const emptyCol = this.emptySlot.x
      
      const possibleMoves: {row: number, col: number}[] = []
      
      // Check all adjacent positions
      const directions = [{row: -1, col: 0}, {row: 1, col: 0}, {row: 0, col: -1}, {row: 0, col: 1}]
      
      directions.forEach(dir => {
        const newRow = emptyRow + dir.row
        const newCol = emptyCol + dir.col
        
        if (newRow >= 0 && newRow < 3 && newCol >= 0 && newCol < 3) {
          possibleMoves.push({row: newRow, col: newCol})
        }
      })
      
      const randomMove = Phaser.Utils.Array.GetRandom(possibleMoves)
      this.moveSlidingTileInternal(randomMove.row, randomMove.col)
    }
  }

  private moveSlidingTile(row: number, col: number) {
    if (this.canMoveSlidingTile(row, col)) {
      this.moveSlidingTileInternal(row, col)
      this.updateSlidingPuzzleDisplay()
      this.checkSlidingPuzzleComplete()
    }
  }

  private canMoveSlidingTile(row: number, col: number): boolean {
    const emptyRow = this.emptySlot.y
    const emptyCol = this.emptySlot.x
    
    // Check if tile is adjacent to empty space
    return (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
           (Math.abs(col - emptyCol) === 1 && row === emptyRow)
  }

  private moveSlidingTileInternal(row: number, col: number) {
    if (!this.canMoveSlidingTile(row, col)) return
    
    const emptyRow = this.emptySlot.y
    const emptyCol = this.emptySlot.x
    
    // Swap tile with empty space
    this.slidingGrid[emptyRow][emptyCol] = this.slidingGrid[row][col]
    this.slidingGrid[row][col] = null
    
    // Update empty slot position
    this.emptySlot.y = row
    this.emptySlot.x = col
  }

  private updateSlidingPuzzleDisplay() {
    // Recreate the visual representation
    this.slidingTiles.forEach(tile => tile.destroy())
    this.slidingTiles = []
    
    // Re-add tiles in their new positions
    const gridSize = 3
    const tileSize = 60
    const spacing = 65
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (this.slidingGrid[row][col] !== null) {
          const x = (col - (gridSize - 1) / 2) * spacing
          const y = (row - (gridSize - 1) / 2) * spacing
          
          const tile = this.add.rectangle(x, y, tileSize, tileSize, 0x4169E1)
          tile.setStrokeStyle(2, 0xFFFFFF)
          tile.setInteractive()
          
          const number = this.add.text(x, y, this.slidingGrid[row][col]!.toString(), {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'monospace',
            fontStyle: 'bold'
          })
          number.setOrigin(0.5)
          
          tile.on('pointerdown', () => {
            this.moveSlidingTile(row, col)
          })
          
          this.slidingTiles.push(tile)
          this.puzzleContainer.add([tile, number])
        }
      }
    }
  }

  private checkSlidingPuzzleComplete(): boolean {
    let expectedValue = 1
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (row === 2 && col === 2) {
          // Last position should be empty
          if (this.slidingGrid[row][col] !== null) return false
        } else {
          if (this.slidingGrid[row][col] !== expectedValue) return false
          expectedValue++
        }
      }
    }
    
    this.completePuzzle()
    return true
  }

  private createLogicPuzzle() {
    const gridSize = 4
    const buttonSize = 40
    const spacing = 50
    
    // Initialize grid
    this.logicGrid = []
    this.logicButtons = []
    
    for (let row = 0; row < gridSize; row++) {
      this.logicGrid[row] = []
      this.logicButtons[row] = []
      
      for (let col = 0; col < gridSize; col++) {
        this.logicGrid[row][col] = false
        
        const x = (col - (gridSize - 1) / 2) * spacing
        const y = (row - (gridSize - 1) / 2) * spacing
        
        const button = this.add.rectangle(x, y, buttonSize, buttonSize, 0x333333)
        button.setStrokeStyle(2, 0xFFFFFF)
        button.setInteractive()
        
        button.on('pointerdown', () => {
          this.toggleLogicButton(row, col)
        })
        
        this.logicButtons[row][col] = button as Phaser.GameObjects.Rectangle
        this.puzzleContainer.add(button)
      }
    }
    
    // Create a solvable pattern
    this.createLogicTarget()
    
    // Instructions
    const instructions = this.add.text(0, -180, 'Turn all lights OFF!\nClicking a light toggles it and its neighbors.', {
      fontSize: '14px',
      color: '#FFD700',
      fontFamily: 'monospace',
      align: 'center'
    })
    instructions.setOrigin(0.5)
    this.puzzleContainer.add(instructions)
  }

  private createLogicTarget() {
    // Start with all lights off, then make some moves to create a solvable puzzle
    const moves = [
      {row: 1, col: 1},
      {row: 2, col: 2},
      {row: 0, col: 2}
    ]
    
    moves.forEach(move => {
      this.toggleLogicButtonInternal(move.row, move.col)
    })
  }

  private toggleLogicButton(row: number, col: number) {
    this.toggleLogicButtonInternal(row, col)
    this.updateLogicDisplay()
    this.checkLogicComplete()
  }

  private toggleLogicButtonInternal(row: number, col: number) {
    const directions = [
      {row: 0, col: 0}, // self
      {row: -1, col: 0}, // up
      {row: 1, col: 0}, // down
      {row: 0, col: -1}, // left
      {row: 0, col: 1} // right
    ]
    
    directions.forEach(dir => {
      const newRow = row + dir.row
      const newCol = col + dir.col
      
      if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
        this.logicGrid[newRow][newCol] = !this.logicGrid[newRow][newCol]
      }
    })
  }

  private updateLogicDisplay() {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const button = this.logicButtons[row][col] as any
        button.setFillStyle(this.logicGrid[row][col] ? 0xFFD700 : 0x333333)
      }
    }
  }

  private checkLogicComplete() {
    const allOff = this.logicGrid.every(row => row.every(cell => !cell))
    
    if (allOff) {
      this.completePuzzle()
    }
  }

  private completePuzzle() {
    const timeElapsed = this.time.now - this.puzzleStartTime
    const timeInSeconds = Math.floor(timeElapsed / 1000)
    
    if (timeElapsed < this.bestTime) {
      this.bestTime = timeElapsed
      this.addAchievement('new_best_time')
    }
    
    this.gameState.score += Math.max(1000 - timeInSeconds * 10, 100)
    this.addToInventory({
      id: `puzzle_${this.puzzleLevel}`,
      name: `${this.getPuzzleTypeName()} Puzzle Solution`,
      type: 'key',
      description: `Completed in ${timeInSeconds} seconds`
    })
    
    // Show completion message
    const message = this.add.text(0, 0, `Puzzle Complete!\nTime: ${this.formatTime(timeInSeconds)}\n+${Math.max(1000 - timeInSeconds * 10, 100)} points`, {
      fontSize: '18px',
      color: '#4ade80',
      fontFamily: 'monospace',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 15, y: 10 }
    })
    message.setOrigin(0.5)
    message.setDepth(1000)
    
    this.time.delayedCall(2500, () => {
      message.destroy()
      this.nextPuzzle()
    })
  }

  private nextPuzzle() {
    this.puzzleLevel++
    
    if (this.puzzleLevel > this.maxLevels) {
      // All puzzles completed
      this.addAchievement('puzzle_master')
      this.addAchievement('all_puzzles_solved')
      this.completeGame(this.gameState.score, this.gameState.achievements)
    } else {
      this.puzzleStartTime = this.time.now
      this.startPuzzle()
    }
  }

  private useHint() {
    if (this.hintsRemaining <= 0) {
      this.showMessage('No hints remaining!', '#ff6b6b')
      return
    }
    
    this.hintsRemaining--
    
    // Provide hint based on current puzzle type
    let hintText = ''
    
    switch (this.currentPuzzleType) {
      case 'jigsaw':
        hintText = 'Look for pieces with matching colors or numbers!'
        break
      case 'pattern':
        hintText = 'Pay attention to the sequence of flashing colors!'
        break
      case 'sliding':
        hintText = 'Try to get the lowest numbers in their correct positions first!'
        break
      case 'logic':
        hintText = 'Each click affects the button and its 4 neighbors!'
        break
    }
    
    this.showMessage(`Hint: ${hintText}`, '#FFD700')
    this.gameState.score -= 50 // Penalty for using hints
    this.updateUI()
  }

  private shufflePuzzle() {
    if (this.currentPuzzleType === 'sliding') {
      this.shuffleSlidingPuzzle()
      this.updateSlidingPuzzleDisplay()
    }
  }

  private resetPuzzle() {
    this.puzzleStartTime = this.time.now
    this.startPuzzle()
  }

  private skipPuzzle() {
    this.gameState.score -= 200 // Penalty for skipping
    this.nextPuzzle()
  }

  private showMessage(text: string, color: string = '#ffffff') {
    const message = this.add.text(400, 80, text, {
      fontSize: '14px',
      color: color,
      fontFamily: 'monospace',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    })
    message.setOrigin(0.5)
    message.setDepth(1000)
    
    this.time.delayedCall(2500, () => {
      message.destroy()
    })
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  private updateUITexts() {
    const typeText = this.data.get('typeText')
    const levelText = this.data.get('levelText')
    const hintText = this.data.get('hintText')
    
    if (typeText) {
      typeText.setText(`Puzzle: ${this.getPuzzleTypeName()}`)
    }
    
    if (levelText) {
      levelText.setText(`Level: ${this.puzzleLevel}/${this.maxLevels}`)
    }
    
    if (hintText) {
      hintText.setText(`Hints: ${this.hintsRemaining}`)
    }
  }

  update() {
    // Update timer
    const timeElapsed = this.time.now - this.puzzleStartTime
    const timeInSeconds = Math.floor(timeElapsed / 1000)
    this.timerText.setText(`Time: ${this.formatTime(timeInSeconds)}`)
    
    // Update UI texts
    this.updateUITexts()
    
    // Auto-save
    if (this.time.now % 20000 < 16) {
      this.saveGame()
    }
  }
}