# Troubleshooting Guide - StoryForge AI

This guide helps resolve common issues you might encounter with StoryForge AI.

## 🐛 Common Issues & Solutions

### 1. Games Not Loading / Stuck at 0%

**Symptoms:**
- Loading screen appears but stays at 0%
- No progress after waiting 30+ seconds
- Games don't start when "Start Game" is clicked

**Root Causes:**
- Asset loading failures
- JavaScript errors
- Network connectivity issues
- Phaser.js initialization problems
- Supabase connection timeouts

**Solutions:**

#### Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for errors during game loading
4. Common error patterns:
   ```
   Failed to load resource: net::ERR_FAILED
   Uncaught TypeError: Cannot read property 'x' of undefined
   Module not found
   ```

#### Clear Browser Cache
```bash
# Chrome: Ctrl+Shift+Del
# Firefox: Ctrl+Shift+Del
# Safari: Cmd+Option+E

# Or hard refresh:
# Ctrl+F5 (Windows/Linux)
# Cmd+Shift+R (Mac)
```

#### Disable Browser Extensions
1. Try opening in incognito/private mode
2. If it works, disable extensions one by one
3. Common problematic extensions:
   - Ad blockers
   - Privacy tools
   - Script blockers

#### Check Network Connection
1. Open Network tab in Dev Tools
2. Reload the page
3. Look for failed requests (red entries)
4. Check if Supabase requests are failing

#### Development Server Issues
If running locally:
```bash
# Kill any existing processes
pkill -f "vite"

# Clear cache and restart
rm -rf node_modules/.vite
pnpm dev
```

#### Enable Debug Mode
Add to `.env.local`:
```bash
VITE_DEBUG=true
VITE_GAME_DEBUG=true
```

This will show detailed console logs:
```
GameEngine: Starting initialization for pixel-quest
PixelQuestScene: Starting preload...
PixelQuestScene: Preload complete!
GameEngine: Initialization complete!
```

### 2. Dropdown Menus Not Visible

**Symptoms:**
- White text on white background
- Cannot see dropdown options
- Menu appears to be empty

**Solution:**
The fix is already included in `src/index.css`:
```css
/* Fix for dropdown menu visibility */
.bg-white\/10 {
  background-color: darkslateblue !important;
}
```

**If still not working:**
1. Check if CSS is being loaded
2. Verify Tailwind is working
3. Try force refresh (Ctrl+F5)
4. Check for CSS conflicts in Dev Tools

### 3. Supabase Connection Issues

**Symptoms:**
- Save/load functionality not working
- "Failed to connect" messages
- Game progress not persisting

**Debug Steps:**

#### Verify Environment Variables
```bash
# Check .env.local exists
ls -la .env.local

# Verify variables are set (don't log keys!)
echo "URL set: $([ -n "$VITE_SUPABASE_URL" ] && echo 'Yes' || echo 'No')"
echo "Key set: $([ -n "$VITE_SUPABASE_ANON_KEY" ] && echo 'Yes' || echo 'No')"
```

#### Test Supabase Connection
```typescript
// Add to console in browser
fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/', {
  headers: {
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + import.meta.env.VITE_SUPABASE_ANON_KEY
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

#### Common Supabase Issues

1. **Project Paused**
   - Check Supabase dashboard
   - Unpause if necessary

2. **Wrong URL/Key**
   - Verify from Supabase dashboard
   - Settings → API → URL and anon key

3. **Database Table Missing**
   ```bash
   # Run migration
   supabase db push
   ```

4. **Row Level Security**
   - Check RLS policies are correct
   - Test with RLS disabled temporarily

### 4. Performance Issues

**Symptoms:**
- Slow game performance
- Low frame rate
- Input lag
- Browser freezing

**Solutions:**

#### Reduce Game Settings
In `src/game/GameEngine.ts`:
```typescript
const config: Phaser.Types.Core.GameConfig = {
  width: 600,  // Reduce from 800
  height: 450, // Reduce from 600
  physics: {
    default: 'arcade',
    arcade: {
      debug: false  // Ensure debug is off
    }
  }
}
```

#### Disable Debug Features
In `.env.local`:
```bash
VITE_DEBUG=false
VITE_GAME_DEBUG=false
VITE_PHYSICS_DEBUG=false
```

#### Browser Optimization
- Close other browser tabs
- Disable browser extensions
- Use Chrome/Firefox (best Phaser.js support)
- Enable hardware acceleration

#### System Resources
- Check system memory usage
- Close unnecessary applications
- Ensure adequate RAM (4GB+ recommended)

### 5. Build and Deployment Issues

**Symptoms:**
- Build fails with errors
- Deployment succeeds but site doesn't work
- Assets not loading in production

**Common Build Errors:**

#### Memory Issues
```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm build
```

#### TypeScript Errors
```bash
# Check for type errors
pnpm type-check

# Fix common issues
# - Update @types packages
# - Check import statements
# - Verify Phaser types are installed
```

#### Missing Dependencies
```bash
# Reinstall node_modules
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Production Asset Issues

1. **Incorrect Base URL**
   In `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/',  // For root domain
     // OR
     base: '/your-repo-name/',  // For GitHub Pages
   })
   ```

2. **Missing Public Assets**
   - Ensure `public/` folder is included in build
   - Check asset paths start with `/`
   - Verify images exist in `public/images/`

### 6. Mobile/Touch Issues

**Symptoms:**
- Touch controls not working
- Game not responsive on mobile
- Virtual joystick not appearing

**Solutions:**

#### Check Mobile Detection
In browser console:
```javascript
// Should return true on mobile
console.log(/Android|webOS|iPhone|iPad/i.test(navigator.userAgent))
```

#### Enable Touch Controls
In `src/game/BaseGameScene.ts`, verify:
```typescript
if (this.isMobile) {
  this.setupMobileControls()
}
```

#### Test Touch Events
```javascript
// Add to browser console on mobile
document.addEventListener('touchstart', (e) => {
  console.log('Touch detected:', e.touches.length)
})
```

#### Responsive Design Issues
- Check viewport meta tag in `index.html`
- Verify CSS media queries
- Test different screen sizes

### 7. Audio Issues

**Symptoms:**
- No sound effects
- Audio not playing
- WebAudio context errors

**Solutions:**

#### Check Audio Context
```typescript
// In BaseGameScene.ts
setupAudio() {
  try {
    if ((this.sound as any).context?.state === 'suspended') {
      (this.sound as any).context.resume()
    }
  } catch (error) {
    console.warn('Audio context not available:', error)
  }
}
```

#### Browser Audio Policies
- Modern browsers require user interaction before audio
- Click anywhere on page before expecting sound
- Check browser audio settings

#### Audio File Issues
- Verify audio files exist in `public/audio/`
- Check file formats (OGG, MP3, WAV supported)
- Test audio files can play directly

## 🗺️ Debug Tools & Techniques

### Browser Developer Tools

#### Console Debugging
```javascript
// Global debug helpers (paste in console)
window.debugGame = {
  // Show current game state
  state: () => {
    const scene = game.scene.getScene('PixelQuestScene')
    console.log('Game State:', scene?.gameState)
  },
  
  // Show player position
  player: () => {
    const scene = game.scene.getScene('PixelQuestScene')
    console.log('Player:', scene?.player?.x, scene?.player?.y)
  },
  
  // Toggle physics debug
  physics: () => {
    const scene = game.scene.getScene('PixelQuestScene')
    scene?.physics.world.drawDebug = !scene?.physics.world.drawDebug
  }
}
```

#### Network Monitoring
1. Open Network tab
2. Filter by:
   - XHR (API calls)
   - JS (JavaScript files)
   - Img (Images)
3. Look for:
   - Red entries (failed requests)
   - Slow requests (> 3 seconds)
   - 404 errors

#### Performance Profiling
1. Open Performance tab
2. Record while loading game
3. Look for:
   - Long tasks (> 50ms)
   - Memory leaks
   - High CPU usage

### Game Engine Debugging

#### Add Debug Overlays
```typescript
// In any game scene
create() {
  super.create()
  
  if (import.meta.env.VITE_GAME_DEBUG === 'true') {
    this.addDebugInfo()
  }
}

addDebugInfo() {
  // FPS counter
  this.add.text(10, 10, '', { fontSize: '16px', color: '#00ff00' })
    .setScrollFactor(0)
    .setDepth(1000)
  
  // Update FPS display
  this.time.addEvent({
    delay: 100,
    callback: () => {
      const fps = this.game.loop.actualFps.toFixed(1)
      this.children.getAt(0).setText(`FPS: ${fps}`)
    },
    loop: true
  })
}
```

#### Scene Debugging
```typescript
// Add to any scene's update() method
if (import.meta.env.VITE_GAME_DEBUG === 'true') {
  // Log every 60 frames (1 second at 60fps)
  if (this.game.loop.frame % 60 === 0) {
    console.log('Debug Info:', {
      scene: this.scene.key,
      gameObjects: this.children.length,
      activePointers: this.input.activePointer,
      physics: this.physics.world.bodies.entries.length
    })
  }
}
```

### Memory Debugging

#### Check for Memory Leaks
```javascript
// In browser console
// Before loading game
const beforeMemory = performance.memory?.usedJSHeapSize || 0

// After loading game
const afterMemory = performance.memory?.usedJSHeapSize || 0
const memoryUsed = (afterMemory - beforeMemory) / 1024 / 1024
console.log(`Memory used: ${memoryUsed.toFixed(2)} MB`)
```

#### Monitor Game Objects
```typescript
// Add to BaseGameScene
update() {
  if (import.meta.env.VITE_GAME_DEBUG === 'true') {
    // Log object count every 5 seconds
    if (this.game.loop.frame % 300 === 0) {
      console.log('Game Objects:', this.children.length)
    }
  }
}
```

## 📈 Performance Optimization

### Asset Optimization

#### Image Assets
- Use WebP format for better compression
- Optimize PNG files with tools like TinyPNG
- Use sprite sheets to reduce HTTP requests
- Generate textures programmatically when possible

#### Code Optimization
```typescript
// Avoid creating objects in update() loops
// BAD:
update() {
  const velocity = { x: 100, y: 0 }  // Creates object every frame
  this.player.setVelocity(velocity.x, velocity.y)
}

// GOOD:
velocity = { x: 0, y: 0 }  // Class property
update() {
  this.velocity.x = 100
  this.velocity.y = 0
  this.player.setVelocity(this.velocity.x, this.velocity.y)
}
```

#### Physics Optimization
```typescript
// Use collision groups for better performance
create() {
  // Group similar objects
  this.enemyGroup = this.physics.add.group()
  this.collectibleGroup = this.physics.add.group()
  
  // Single collision check instead of individual ones
  this.physics.add.overlap(
    this.player, 
    this.enemyGroup, 
    this.handleEnemyCollision,
    null,
    this
  )
}
```

## 📧 Getting Help

### Before Reporting Issues

1. **Check this troubleshooting guide**
2. **Search existing issues** on GitHub
3. **Try the solutions** listed above
4. **Test in different browsers**
5. **Clear cache and try again**

### When Reporting Issues

Include this information:

```markdown
**Environment:**
- OS: [e.g. Windows 10, macOS Big Sur, Ubuntu 20.04]
- Browser: [e.g. Chrome 96, Firefox 95, Safari 15]
- Node.js version: [run `node --version`]
- Package manager: [pnpm, npm, yarn]

**Issue Description:**
[Clear description of what's happening]

**Expected Behavior:**
[What should happen instead]

**Steps to Reproduce:**
1. Go to '...'
2. Click on '....'
3. See error

**Console Errors:**
```
[Paste any console error messages here]
```

**Additional Context:**
- Does it happen in incognito mode?
- Does it happen with a fresh install?
- Any recent changes to the codebase?
```

### Useful Debug Commands

```bash
# System info
node --version
npm --version
pnpm --version

# Dependency info
pnpm list

# Build with verbose logging
VITE_DEBUG=true pnpm build

# Clear all caches
rm -rf node_modules/.cache
rm -rf node_modules/.vite
rm -rf dist
pnpm install
```

### Community Resources

- **Phaser.js Community**: [phaser.io/community](https://phaser.io/community)
- **React Documentation**: [react.dev](https://react.dev)
- **Vite Issues**: [GitHub Vite Issues](https://github.com/vitejs/vite/issues)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)

---

**Remember**: Most issues are caused by:
1. Environment configuration problems
2. Network connectivity issues  
3. Browser compatibility problems
4. Cached content conflicts
5. Missing dependencies

Start with the basics (clear cache, check console) before diving into complex debugging!