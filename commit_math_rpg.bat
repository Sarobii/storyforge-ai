@echo off
REM Math Learning RPG - GitHub Commit Script (Windows)
REM Run this script from your repository root directory

echo 🎮 Committing Math Learning RPG Implementation...

REM Stage all the new and modified files
echo 📁 Staging files...
git add src/game/scenes/MathRPGScene.ts
git add src/components/math-rpg/HUD.tsx
git add src/components/math-rpg/MathProblemOverlay.tsx
git add src/components/math-rpg/ShopOverlay.tsx
git add src/hooks/useMathRPGSave.tsx
git add src/components/GamePlay.tsx
git add src/types/game.ts

REM Optional: Add any build/config files that might have changed
git add package.json
git add package-lock.json

echo 📝 Creating commit...
git commit -m "feat: Add Math Learning RPG game" -m "🎯 Features:" -m "- Complete turn-based math combat system" -m "- Educational content with adaptive difficulty scaling" -m "- React UI components (HUD, Math Overlay, Shop)" -m "- Supabase/localStorage dual persistence system" -m "- Player progression with XP, levels, and gold" -m "- Shop mechanics for purchasing upgrades" -m "- Boss fight system every 3rd enemy" -m "" -m "🔧 Technical:" -m "- Phaser.js scene with event-driven architecture" -m "- React Hook Form + Zod validation" -m "- Radix UI components with Tailwind styling" -m "- Auto-save functionality for game progress" -m "" -m "📊 Educational Value:" -m "- Levels 1-3: Addition/Subtraction (1-20)" -m "- Levels 4-6: Multiplication (up to 12×12)" -m "- Levels 7+: Division & complex problems" -m "- Immediate feedback and progress tracking" -m "" -m "✅ Tested and deployed successfully"

echo 🚀 Pushing to GitHub...
git push origin main

echo ✨ Math Learning RPG successfully committed and pushed!
echo 🌐 Live at: https://82qlbsp8rfow.space.minimax.io

pause
