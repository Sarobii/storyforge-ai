# StoryForge AI Audio Assets

This directory contains audio assets for the games.

## Supported Formats

- **OGG** (recommended for web)
- **MP3** (broad compatibility)  
- **WAV** (uncompressed, larger files)

## Audio Categories

### Sound Effects
- `jump.ogg` - Player jump sound
- `attack.ogg` - Attack/action sound
- `collect.ogg` - Item collection sound
- `enemy_hit.ogg` - Enemy damage sound
- `player_hurt.ogg` - Player damage sound
- `explosion.ogg` - Explosion effect
- `powerup.ogg` - Power-up collection
- `achievement.ogg` - Achievement unlock

### Background Music
- `menu_theme.ogg` - Main menu background music
- `pixel_quest_theme.ogg` - RPG adventure music
- `platform_hero_theme.ogg` - Platformer music
- `math_rpg_theme.ogg` - Educational game music
- `reveal_adventure_theme.ogg` - Celebration music
- `puzzle_solver_theme.ogg` - Puzzle game music

### UI Sounds
- `button_click.ogg` - Button interaction
- `menu_select.ogg` - Menu navigation
- `game_start.ogg` - Game initialization
- `game_complete.ogg` - Game completion
- `level_up.ogg` - Level progression

## Usage in Games

```typescript
// In preload() method
this.load.audio('jump', '/audio/jump.ogg')
this.load.audio('bgm', '/audio/pixel_quest_theme.ogg')

// In create() method
this.jumpSound = this.sound.add('jump', { volume: 0.5 })
this.bgMusic = this.sound.add('bgm', { volume: 0.3, loop: true })

// Playing sounds
this.jumpSound.play()
this.bgMusic.play()
```

## Audio Guidelines

### File Size Optimization
- Keep sound effects under 100KB each
- Background music should be under 2MB
- Use OGG format for smaller file sizes
- Consider audio compression for web delivery

### Volume Levels
- Sound effects: 0.3 - 0.7
- Background music: 0.2 - 0.4
- UI sounds: 0.1 - 0.3

### Browser Compatibility
- Modern browsers require user interaction before playing audio
- Provide audio toggle options for accessibility
- Test across different browsers and devices

## Adding New Audio

1. Place audio files in this directory
2. Update the game's preload() method to load the audio
3. Create sound objects in create() method
4. Use appropriate volume levels
5. Test on multiple devices

## Free Audio Resources

- **Freesound.org** - Community-contributed sounds
- **OpenGameArt.org** - Game-specific audio assets
- **Incompetech** - Royalty-free background music
- **Zapsplat** - Professional sound effects (account required)
- **BBC Sound Effects** - High-quality sound library

Remember to check licensing requirements for any audio you use!

---

**Note**: This directory currently contains placeholder information. Add actual audio files as needed for your games.