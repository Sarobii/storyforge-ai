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