# StoryForge AI Data Assets

This directory contains game data files and configuration.

## Data File Types

### Game Configuration
- `game_settings.json` - Global game settings
- `difficulty_levels.json` - Difficulty configuration
- `achievements.json` - Achievement definitions
- `themes.json` - Visual theme configurations

### Level Data
- `pixel_quest_levels.json` - RPG level layouts and quests
- `platform_hero_levels.json` - Platformer level designs
- `math_problems.json` - Educational content for Math RPG
- `puzzle_templates.json` - Puzzle configurations
- `reveal_scripts.json` - Celebration game scenarios

### Localization
- `en.json` - English text and UI labels
- `es.json` - Spanish translations (future)
- `fr.json` - French translations (future)

## Usage in Games

```typescript
// Loading data files
const gameData = await fetch('/data/game_settings.json')
  .then(response => response.json())

// Using in game logic
if (gameData.enableAchievements) {
  this.setupAchievements()
}
```

## Data File Examples

### game_settings.json
```json
{
  "version": "1.0.0",
  "defaultDifficulty": "medium",
  "enableAudio": true,
  "enableAchievements": true,
  "maxSaveSlots": 5,
  "autoSaveInterval": 30000,
  "debug": {
    "showFPS": false,
    "showHitboxes": false,
    "godMode": false
  }
}
```

### achievements.json
```json
{
  "achievements": [
    {
      "id": "first_steps",
      "name": "First Steps",
      "description": "Complete your first game",
      "icon": "🏆",
      "points": 10
    },
    {
      "id": "high_scorer",
      "name": "High Scorer",
      "description": "Achieve a score of 10,000 points",
      "icon": "🌟",
      "points": 25
    }
  ]
}
```

### themes.json
```json
{
  "themes": {
    "classic": {
      "name": "Classic Retro",
      "colors": {
        "primary": "#4169E1",
        "secondary": "#FF6B35",
        "background": "#2C3E50"
      },
      "font": "monospace"
    },
    "neon": {
      "name": "Neon Cyberpunk",
      "colors": {
        "primary": "#00FFFF",
        "secondary": "#FF00FF",
        "background": "#0D1B2A"
      },
      "font": "monospace",
      "effects": ["glow", "scan_lines"]
    }
  }
}
```

## Data File Guidelines

### Structure
- Use consistent JSON formatting
- Include version numbers for compatibility
- Group related settings together
- Provide default values

### Performance
- Keep files small (< 1MB each)
- Load data asynchronously
- Cache frequently used data
- Use compression for large datasets

### Validation
- Validate JSON structure before use
- Handle missing or corrupted data gracefully
- Provide fallbacks for critical settings

## Dynamic Data Loading

```typescript
// Utility function for loading game data
export async function loadGameData(filename: string) {
  try {
    const response = await fetch(`/data/${filename}`)
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`)
    }
    return await response.json()
  } catch (error) {
    console.warn(`Could not load ${filename}:`, error)
    return null
  }
}

// Usage in games
const levelData = await loadGameData('pixel_quest_levels.json')
if (levelData) {
  this.setupLevels(levelData.levels)
} else {
  this.useDefaultLevels()
}
```

## Custom Data Format

For complex game data, consider creating custom formats:

```typescript
// Custom level format
interface Level {
  id: string
  name: string
  objectives: string[]
  enemies: EnemySpawn[]
  collectibles: Collectible[]
  exits: LevelExit[]
}

// Type-safe data loading
export async function loadLevelData(levelId: string): Promise<Level | null> {
  const data = await loadGameData(`levels/${levelId}.json`)
  // Validate and transform data
  return data ? validateLevel(data) : null
}
```

---

**Note**: This directory currently contains placeholder information. Add actual data files as needed for your games.