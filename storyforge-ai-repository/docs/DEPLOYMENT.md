# Deployment Guide - StoryForge AI

This guide covers various deployment options for StoryForge AI platform.

## 🚀 Quick Deployment Options

### 1. Vercel (Recommended)

Vercel provides the easiest deployment with automatic builds and environment variable management.

#### Step-by-Step Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your StoryForge AI repository

3. **Configure Build Settings**
   - Framework Preset: **Vite**
   - Build Command: `pnpm build` (or `npm run build`)
   - Output Directory: `dist`
   - Install Command: `pnpm install` (or `npm install`)

4. **Set Environment Variables**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   VITE_SUPABASE_URL = your_supabase_url
   VITE_SUPABASE_ANON_KEY = your_supabase_key
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Get your live URL (e.g., `storyforge-ai.vercel.app`)

#### Auto-Deploy Setup
- Every push to `main` branch triggers automatic deployment
- Preview deployments for pull requests
- Rollback capability if needed

### 2. Netlify

Netlify offers similar ease of use with great performance.

#### Manual Netlify Deployment

1. **Build Locally**
   ```bash
   pnpm build
   ```

2. **Deploy to Netlify**
   - Visit [netlify.com](https://netlify.com)
   - Drag and drop your `dist/` folder
   - Get instant deployment

#### Continuous Netlify Deployment

1. **Connect GitHub Repository**
   - Netlify Dashboard → "New site from Git"
   - Choose your repository

2. **Build Settings**
   ```
   Build command: pnpm build
   Publish directory: dist
   ```

3. **Environment Variables**
   Site settings → Environment variables:
   ```
   VITE_SUPABASE_URL = your_supabase_url
   VITE_SUPABASE_ANON_KEY = your_supabase_key
   ```

### 3. GitHub Pages

Free hosting for public repositories.

#### GitHub Pages Setup

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add Deploy Script**
   In `package.json`:
   ```json
   {
     "scripts": {
       "predeploy": "pnpm build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Configure Vite for GitHub Pages**
   Update `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... rest of config
   })
   ```

4. **Deploy**
   ```bash
   pnpm run deploy
   ```

5. **Enable GitHub Pages**
   - Repository Settings → Pages
   - Source: Deploy from branch
   - Branch: gh-pages

### 4. Firebase Hosting

Google's hosting solution with CDN and SSL.

#### Firebase Deployment

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```
   
   Configuration:
   - Public directory: `dist`
   - Single-page app: `Yes`
   - Overwrite index.html: `No`

3. **Build and Deploy**
   ```bash
   pnpm build
   firebase deploy
   ```

## 🔧 Environment Configuration

### Production Environment Variables

For production deployments, set these environment variables:

```bash
# Required for save/load functionality
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Optional: Disable debug modes
VITE_DEBUG=false
VITE_GAME_DEBUG=false
VITE_PHYSICS_DEBUG=false

# Optional: Performance optimizations
VITE_RENDER_PIXEL_ART=true
VITE_ENABLE_ANTIALIAS=false
```

### Build Optimizations

Optimize your build for production:

#### Vite Configuration

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize chunk sizes
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          phaser: ['phaser'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select']
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    // Generate source maps for debugging
    sourcemap: false
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['phaser', 'react', 'react-dom']
  }
})
```

## 🗄️ Supabase Backend Deployment

### Supabase Project Setup

1. **Create Supabase Project**
   - Visit [supabase.com](https://supabase.com)
   - Create new project
   - Choose region closest to users

2. **Database Migration**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login and link project
   supabase login
   supabase link --project-ref your_project_id
   
   # Apply migrations
   supabase db push
   ```

3. **Edge Functions (Optional)**
   ```bash
   # Deploy edge functions
   supabase functions deploy
   ```

4. **Configure Row Level Security**
   
   Enable RLS on `game_saves` table:
   ```sql
   ALTER TABLE game_saves ENABLE ROW LEVEL SECURITY;
   
   -- Allow users to read/write their own saves
   CREATE POLICY "Users can access own saves" ON game_saves
   FOR ALL USING (user_id = auth.uid()::text);
   ```

### Environment Variables from Supabase

1. **Get Project URL and Keys**
   - Project Dashboard → Settings → API
   - Copy Project URL and anon/public key

2. **Add to Deployment Platform**
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   ```

## 🔍 Custom Domain Setup

### Vercel Custom Domain

1. **Add Domain in Vercel**
   - Project Settings → Domains
   - Add your domain (e.g., `storyforge.yourdomain.com`)

2. **Configure DNS**
   Add CNAME record:
   ```
   CNAME storyforge cname.vercel-dns.com
   ```

3. **SSL Certificate**
   - Automatic SSL via Let's Encrypt
   - Force HTTPS redirect

### Netlify Custom Domain

1. **Domain Settings**
   - Site Settings → Domain management
   - Add custom domain

2. **DNS Configuration**
   ```
   CNAME www your-site.netlify.app
   ```

## 📊 Monitoring & Analytics

### Performance Monitoring

#### Add Web Vitals

```typescript
// src/lib/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function sendToAnalytics(metric: any) {
  // Send to your analytics service
  console.log('Web Vital:', metric)
}

// Measure and report all Web Vitals
getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

#### Error Tracking

```typescript
// src/lib/errorTracking.ts
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  // Send to error tracking service
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  // Send to error tracking service
})
```

### Game Analytics

```typescript
// Track game events
export function trackGameEvent(eventName: string, properties: any) {
  // Send to analytics
  console.log('Game Event:', eventName, properties)
}

// Usage in game scenes
trackGameEvent('game_started', {
  template: 'pixel-quest',
  difficulty: 'medium',
  customizations: this.customization
})
```

## 🔒 Security Considerations

### Environment Security

- Never commit `.env` files to git
- Use different keys for development/production
- Rotate API keys periodically
- Enable Supabase Row Level Security

### Content Security Policy

Add to your `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: blob:;
               connect-src 'self' https://*.supabase.co;
               media-src 'self';">
```

### HTTPS Enforcement

All modern deployment platforms automatically provide HTTPS. Ensure:
- Force HTTPS redirects
- HSTS headers enabled
- Secure cookie settings

## 🐛 Deployment Troubleshooting

### Common Build Errors

#### Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm build
```

#### TypeScript Errors
```bash
# Skip TypeScript checks in build (not recommended for production)
export SKIP_PREFLIGHT_CHECK=true
pnpm build
```

#### Phaser.js Issues
- Ensure Phaser is in dependencies, not devDependencies
- Check for module resolution errors
- Verify Vite configuration includes Phaser

### Runtime Errors

#### CORS Issues
- Check Supabase CORS settings
- Verify environment variable URLs
- Test with browser dev tools

#### Asset Loading
- Check public folder structure
- Verify asset paths are correct
- Test with network tab in dev tools

### Performance Issues

#### Slow Loading
- Enable gzip compression
- Use CDN for static assets
- Optimize image sizes
- Implement code splitting

#### Game Performance
- Reduce physics debug mode
- Optimize sprite generation
- Lower target framerate if needed

## 📈 Scaling Considerations

### Database Scaling
- Monitor Supabase usage
- Implement connection pooling
- Consider read replicas for high traffic
- Optimize database queries

### CDN and Caching
- Use platform CDN (Vercel Edge, Netlify CDN)
- Set proper cache headers
- Implement service worker caching
- Optimize bundle splitting

### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Create load test config
echo '
config:
  target: "https://your-app.vercel.app"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Load homepage"
    requests:
      - get:
          url: "/"'
> load-test.yml

# Run load test
artillery run load-test.yml
```

This comprehensive deployment guide should help you get StoryForge AI running in production with proper monitoring, security, and performance optimizations.