# StoryForge AI - Interactive Retro Game Creation Platform

🎮 **Create amazing retro games with AI-powered customization and real gameplay mechanics**

![StoryForge AI Demo](https://img.shields.io/badge/Status-Hackathon%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue)
![Phaser.js](https://img.shields.io/badge/Phaser.js-3.90.0-orange)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4.16-cyan)

## 🚀 Features

- **5 Playable Game Templates**: 
  - 🗡️ **Pixel Quest Adventure** - Top-down RPG with combat and inventory
  - 🏃‍♂️ **Platform Hero** - Side-scrolling platformer with physics
  - 🧮 **Math Learning RPG** - Educational game with turn-based combat
  - 🎉 **Gender Reveal Adventure** - Celebration game with mini-games
  - 🧩 **Puzzle Solver Challenge** - Logic puzzles with drag-and-drop

- **AI-Powered Customization**: Character names, themes, difficulty levels
- **Real Game Mechanics**: WASD movement, spacebar actions, touch controls
- **Save/Load System**: Progress persistence with Supabase backend
- **Mobile Compatible**: Touch controls and responsive design
- **Modern UI**: TailwindCSS with dark theme and animations

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Game Engine**: Phaser.js 3.90
- **Styling**: TailwindCSS, Radix UI components
- **Backend**: Supabase (PostgreSQL, Edge Functions)
- **State Management**: React hooks and context
- **Build Tool**: Vite with TypeScript

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **pnpm** (recommended) or npm/yarn
- **Git** for version control
- **Supabase account** (optional, for save/load features)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd storyforge-ai
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit the environment variables
# Add your Supabase credentials (optional)
```

### 4. Start Development Server

```bash
pnpm dev
# or npm run dev
# or yarn dev
```

### 5. Open in Browser

Navigate to `http://localhost:5173` to see your StoryForge AI platform!

## 🗄️ Supabase Setup (Optional)

For save/load functionality, set up Supabase:

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key

### 2. Configure Environment

```bash
# .env.local
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Database Migration

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your_project_id

# Run migrations
supabase db push
```

### 4. Database Schema

The migration will create a `game_saves` table:

```sql
CREATE TABLE game_saves (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  game_type TEXT NOT NULL,
  save_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎮 Game Architecture

### Game Engine Structure

```
src/game/
├── GameEngine.ts          # Main game engine class
├── BaseGameScene.ts       # Base scene with common functionality
└── scenes/
    ├── PixelQuestScene.ts     # RPG adventure game
    ├── PlatformHeroScene.ts   # Platform jumping game
    ├── MathRPGScene.ts        # Educational math game
    ├── RevealAdventureScene.ts # Celebration game
    └── PuzzleSolverScene.ts   # Logic puzzle game
```

### Game Features

- **Physics System**: Arcade physics with collision detection
- **Input Handling**: Keyboard (WASD + Space) and touch controls
- **State Management**: Game state persistence and loading
- **UI System**: Health bars, score displays, mobile controls
- **Audio Support**: Web Audio API integration
- **Graphics**: Programmatically generated sprites for performance

### Controls

- **WASD** or **Arrow Keys**: Movement
- **SPACE** or **ENTER**: Action/Attack
- **P** or **ESC**: Pause
- **Mobile**: Virtual joystick and action buttons

## 🏗️ Project Structure

```
storyforge-ai/
├── README.md                 # This file
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # TailwindCSS configuration
├── tsconfig.json            # TypeScript configuration
├── index.html               # Entry HTML file
├── .env.example             # Environment variables template
│
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Global styles (includes dropdown fixes)
│   │
│   ├── components/          # React components
│   │   ├── GameSelection.tsx    # Game template selection
│   │   ├── GameCustomization.tsx # Game settings form
│   │   ├── GamePlay.tsx         # Game container component
│   │   └── GameComplete.tsx     # Game completion screen
│   │
│   ├── game/                # Game engine
│   │   ├── GameEngine.ts        # Main engine class
│   │   ├── BaseGameScene.ts     # Base game scene
│   │   └── scenes/              # Individual game implementations
│   │
│   ├── types/               # TypeScript type definitions
│   │   └── game.ts              # Game-related types
│   │
│   ├── config/              # Configuration files
│   │   └── supabase.ts          # Supabase client setup
│   │
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   └── components/ui/       # UI component library
│
├── public/                  # Static assets
│   ├── images/              # Game sprite images
│   ├── audio/               # Sound effects and music
│   └── data/                # Game data files
│
├── supabase/                # Supabase configuration
│   ├── functions/           # Edge functions
│   ├── migrations/          # Database migrations
│   └── config.toml          # Supabase configuration
│
└── docs/                    # Additional documentation
    ├── DEPLOYMENT.md        # Deployment guide
    ├── GAME_DEVELOPMENT.md  # Adding new games
    └── TROUBLESHOOTING.md   # Common issues and solutions
```

## 🔧 Build & Deployment

### Development Build

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm preview    # Preview production build
pnpm lint       # Run ESLint
```

### Production Deployment

#### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

#### Netlify

1. Build the project: `pnpm build`
2. Upload `dist/` folder to Netlify
3. Configure environment variables

#### Self-Hosted

```bash
# Build production version
pnpm build

# Serve the dist/ folder with any web server
# Example with serve:
npx serve dist
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Games Not Loading / Stuck at 0%

**Symptoms**: Loading screen stays at 0%, no progress

**Solutions**:
- Check browser console for errors
- Verify all dependencies are installed
- Clear browser cache and reload
- Check network connectivity
- Try different browser

**Debug Steps**:
```bash
# Check console logs
# Look for errors like:
# - "Failed to load resource"
# - "Module not found"
# - "Uncaught TypeError"
```

#### 2. Dropdown Menus Not Visible

**Symptoms**: White text on white background

**Solution**: The CSS fix is already included in `src/index.css`:
```css
.bg-white\/10 {
  background-color: darkslateblue !important;
}
```

#### 3. Supabase Connection Issues

**Symptoms**: Save/load not working

**Solutions**:
- Verify environment variables are set correctly
- Check Supabase project is active
- Ensure database migrations have been applied
- Check browser network tab for failed API calls

#### 4. Performance Issues

**Symptoms**: Slow game performance

**Solutions**:
- Reduce game resolution in GameEngine.ts
- Disable debug mode in physics config
- Clear browser cache
- Close other browser tabs

### Debug Mode

Enable debug logging by adding to your `.env.local`:
```bash
VITE_DEBUG=true
```

This will show detailed console logs for:
- Game engine initialization
- Asset loading progress
- Scene transitions
- Input handling
- Save/load operations

## 📝 Environment Variables

Create a `.env.local` file:

```bash
# Supabase Configuration (Optional)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Debug Mode (Optional)
VITE_DEBUG=false

# Game Configuration (Optional)
VITE_GAME_DEBUG=false
VITE_PHYSICS_DEBUG=false
```

## 🎯 Game Development

### Adding a New Game Template

1. Create new scene class in `src/game/scenes/`:

```typescript
import { BaseGameScene, GameSceneData } from '../BaseGameScene'

export class YourGameScene extends BaseGameScene {
  constructor(data: GameSceneData) {
    super('YourGameScene')
    this.init(data)
  }

  preload() {
    // Load assets
  }

  create() {
    super.create()
    // Initialize game objects
  }

  update() {
    // Game loop logic
  }
}
```

2. Add template to `src/types/game.ts`:

```typescript
export const GAME_TEMPLATES: GameTemplate[] = [
  // ... existing templates
  {
    id: 'your-game',
    title: 'Your Game Title',
    description: 'Game description',
    icon: '🎮',
    difficulty: 'Medium',
    estimatedTime: '10-15 min',
    category: 'Action',
    featured: true
  }
]
```

3. Update GameEngine.ts to include your scene

### Asset Management

The current implementation uses programmatically generated graphics for performance and reliability. To use custom sprites:

1. Add images to `public/images/`
2. Update scene preload() method:

```typescript
preload() {
  this.load.image('player', '/images/player.png')
  // Add fallback for loading failures
}
```

## 🚀 Performance Optimization

- **Code Splitting**: Games are loaded dynamically
- **Asset Optimization**: Generated graphics reduce load times
- **Memory Management**: Proper cleanup in destroy() methods
- **Physics Optimization**: Arcade physics for better performance
- **Responsive Design**: Scales to different screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Phaser.js** - Excellent HTML5 game framework
- **React** - Component-based UI library
- **Supabase** - Backend-as-a-Service platform
- **TailwindCSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting Guide](#-troubleshooting)
2. Search existing GitHub issues
3. Create a new issue with:
   - Browser version
   - Console error messages
   - Steps to reproduce
   - Expected vs actual behavior

---

**Built for Hackathon 2025** 🏆

*StoryForge AI - Where creativity meets technology in game development!*
