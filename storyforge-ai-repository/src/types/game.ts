export interface GameTemplate {
  id: string
  title: string
  description: string
  icon: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  estimatedTime: string
  category: 'Adventure' | 'Educational' | 'Celebration' | 'Puzzle' | 'Action'
  featured: boolean
}

export interface GameState {
  level: number
  score: number
  lives: number
  health: number
  inventory: GameItem[]
  position: { x: number; y: number }
  checkpoints: { level: number; position: { x: number; y: number } }[]
  customizations: Record<string, any>
  achievements: string[]
  playtime: number
}

export interface GameItem {
  id: string
  name: string
  type: 'key' | 'potion' | 'coin' | 'weapon' | 'armor' | 'powerup'
  quantity: number
  description: string
  sprite?: string
}

export interface GameCustomization {
  characterName: string
  characterSprite?: string
  theme: string
  difficulty: 'easy' | 'medium' | 'hard'
  specialMessage?: string
  targetAudience?: 'child' | 'teen' | 'adult'
  customColors?: {
    primary: string
    secondary: string
    accent: string
  }
}

export interface GameControls {
  keyboard: {
    up: string[]
    down: string[]
    left: string[]
    right: string[]
    action: string[]
    pause: string[]
    menu: string[]
  }
  touch: {
    enabled: boolean
    joystick: boolean
    actionButtons: boolean
  }
}

// Math RPG Specific Types
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
  sprite?: any
}

export interface MathRPGEnemy {
  name: string
  hp: number
  maxHp: number
  attack: number
  defense: number
  sprite?: any
  rewards: { exp: number; gold: number }
  isBoss: boolean
}

export interface MathRPGEquipment {
  id: string
  name: string
  type: 'weapon' | 'armor'
  attackBonus?: number
  defenseBonus?: number
  description: string
}

export interface MathRPGShopItem {
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

export enum MathRPGBattleState {
  PLAYER_TURN = 'player_turn',
  WAITING_ANSWER = 'waiting_answer',
  ENEMY_TURN = 'enemy_turn',
  VICTORY = 'victory',
  DEFEAT = 'defeat',
  SHOPPING = 'shopping'
}

export interface MathRPGGameState extends GameState {
  mathRPG?: {
    player: MathRPGPlayer
    currentEnemy?: MathRPGEnemy
    battleState: MathRPGBattleState
    currentBattle: number
    maxBattles: number
    equippedWeapon?: MathRPGEquipment
    equippedArmor?: MathRPGEquipment
    totalMathProblemsCorrect: number
    totalMathProblemsAttempted: number
    totalBossesDefeated: number
  }
}

// Math RPG Event Types for React Communication
export interface MathRPGEvents {
  OPEN_MATH_OVERLAY: {
    problem: MathProblem
    enemy: {
      name: string
      hp: number
      maxHp: number
      isBoss: boolean
    }
  }
  UPDATE_HUD: {
    player: MathRPGPlayer
    enemy: MathRPGEnemy | null
  }
  COMBAT_RESULT: {
    success: boolean
    damage: number
    message: string
  }
  ENEMY_ATTACK: {
    damage: number
    enemyName: string
  }
  ENEMY_DEFEATED: {
    enemy: string
    expGained: number
    goldGained: number
    isBoss: boolean
  }
  LEVEL_UP: {
    newLevel: number
    hpIncrease: number
    attackIncrease: number
    defenseIncrease: number
  }
  PLAYER_DEFEATED: {
    finalScore: number
    level: number
    battlesWon: number
  }
  OPEN_SHOP_OVERLAY: {
    items: MathRPGShopItem[]
    playerGold: number
  }
  ITEM_PURCHASED: {
    item: string
    effect: {
      hp?: number
      attack?: number
      defense?: number
    }
  }
  GAME_COMPLETED: {
    victory: boolean
    finalScore: number
    achievements: string[]
  }
}

export const GAME_TEMPLATES: GameTemplate[] = [
  {
    id: 'pixel-quest',
    title: 'Pixel Quest Adventure',
    description: 'Top-down adventure with real-time combat, inventory management, and puzzle-solving',
    icon: '🗡️',
    difficulty: 'Medium',
    estimatedTime: '10-15 min',
    category: 'Adventure',
    featured: true
  },
  {
    id: 'platform-hero',
    title: 'Platform Hero',
    description: 'Side-scrolling platformer with physics-based jumping and power-ups',
    icon: '🏃‍♂️',
    difficulty: 'Easy',
    estimatedTime: '5-10 min',
    category: 'Action',
    featured: true
  },
  {
    id: 'math-rpg',
    title: 'Math Learning RPG',
    description: 'Turn-based combat RPG where solving math problems deals damage',
    icon: '🧮',
    difficulty: 'Medium',
    estimatedTime: '8-12 min',
    category: 'Educational',
    featured: true
  },
  {
    id: 'reveal-adventure',
    title: 'Gender Reveal Adventure',
    description: 'Exploration game with mini-games leading to a special announcement',
    icon: '🎉',
    difficulty: 'Easy',
    estimatedTime: '6-8 min',
    category: 'Celebration',
    featured: true
  },
  {
    id: 'puzzle-solver',
    title: 'Puzzle Solver Challenge',
    description: 'Drag-and-drop puzzle game with pattern matching and logic challenges',
    icon: '🧩',
    difficulty: 'Hard',
    estimatedTime: '12-20 min',
    category: 'Puzzle',
    featured: true
  }
]