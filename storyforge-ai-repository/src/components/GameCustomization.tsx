import React, { useState } from 'react'
import { GameTemplate, GameCustomization as GameCustomizationType } from '../types/game'

interface GameCustomizationProps {
  template: GameTemplate
  hasExistingSave: boolean
  onCustomizationComplete: (customization: GameCustomizationType) => void
  onBack: () => void
}

export const GameCustomization: React.FC<GameCustomizationProps> = ({
  template,
  hasExistingSave,
  onCustomizationComplete,
  onBack
}) => {
  const [customization, setCustomization] = useState<GameCustomizationType>({
    characterName: '',
    theme: 'classic',
    difficulty: 'medium',
    specialMessage: '',
    targetAudience: 'teen',
    customColors: {
      primary: '#9333ea',
      secondary: '#3b82f6',
      accent: '#f59e0b'
    }
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCustomizationComplete(customization)
  }

  const getThemeDescription = (theme: string) => {
    switch (theme) {
      case 'classic': return 'Timeless retro pixel art style'
      case 'neon': return 'Vibrant cyberpunk aesthetics'
      case 'nature': return 'Organic, earth-toned visuals'
      case 'space': return 'Cosmic sci-fi atmosphere'
      case 'medieval': return 'Fantasy castle and knights'
      default: return 'Classic retro style'
    }
  }

  const getTemplateSpecificFields = () => {
    switch (template.id) {
      case 'reveal-adventure':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Announcement Message *
              </label>
              <input
                type="text"
                value={customization.specialMessage}
                onChange={(e) => setCustomization(prev => ({ ...prev, specialMessage: e.target.value }))}
                placeholder="e.g., 'It's a girl!' or 'It's a boy!'"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Celebration Theme
              </label>
              <select
                value={customization.theme}
                onChange={(e) => setCustomization(prev => ({ ...prev, theme: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="classic">Classic Celebration</option>
                <option value="princess">Princess Theme (Pink)</option>
                <option value="prince">Prince Theme (Blue)</option>
                <option value="rainbow">Rainbow Celebration</option>
              </select>
            </div>
          </div>
        )
      
      case 'math-rpg':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Learning Focus
              </label>
              <select
                value={customization.targetAudience}
                onChange={(e) => setCustomization(prev => ({ ...prev, targetAudience: e.target.value as any }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="child">Elementary (Ages 6-10)</option>
                <option value="teen">Middle School (Ages 11-14)</option>
                <option value="adult">High School+ (Ages 15+)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Math Topics
              </label>
              <div className="text-sm text-white/70">
                Game automatically adapts difficulty based on age group:
                <ul className="mt-2 space-y-1 ml-4">
                  <li>• Elementary: Addition, Subtraction</li>
                  <li>• Middle School: Multiplication, Division</li>
                  <li>• High School+: All operations with larger numbers</li>
                </ul>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-4xl">{template.icon}</div>
        <h2 className="text-3xl font-bold text-white">
          Customize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{template.title}</span>
        </h2>
        <p className="text-white/70">{template.description}</p>
        
        {hasExistingSave && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-300 text-sm">
              💾 Existing save found! Your progress will be restored when you start playing.
            </p>
          </div>
        )}
      </div>

      {/* Customization Form */}
      <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 space-y-6">
        {/* Basic Settings */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            🎨 Basic Settings
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Character Name *
            </label>
            <input
              type="text"
              value={customization.characterName}
              onChange={(e) => setCustomization(prev => ({ ...prev, characterName: e.target.value }))}
              placeholder="Enter your hero's name"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setCustomization(prev => ({ ...prev, difficulty: level }))}
                  className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                    customization.difficulty === level
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40'
                  }`}
                >
                  <div className="font-medium capitalize">{level}</div>
                  <div className="text-xs mt-1">
                    {level === 'easy' && 'Casual'}
                    {level === 'medium' && 'Balanced'}
                    {level === 'hard' && 'Challenge'}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Visual Theme
            </label>
            <select
              value={customization.theme}
              onChange={(e) => setCustomization(prev => ({ ...prev, theme: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="classic">Classic Retro</option>
              <option value="neon">Neon Cyberpunk</option>
              <option value="nature">Nature & Earth</option>
              <option value="space">Space & Sci-Fi</option>
              <option value="medieval">Medieval Fantasy</option>
            </select>
            <p className="text-xs text-white/50 mt-1">{getThemeDescription(customization.theme)}</p>
          </div>
        </div>

        {/* Template-Specific Fields */}
        {getTemplateSpecificFields()}

        {/* Advanced Settings */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-white/70 hover:text-white transition-colors"
          >
            <span className={`mr-2 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>▶</span>
            Advanced Customization
          </button>
          
          {showAdvanced && (
            <div className="space-y-4 ml-4 pl-4 border-l-2 border-white/20">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Target Audience
                </label>
                <select
                  value={customization.targetAudience}
                  onChange={(e) => setCustomization(prev => ({ ...prev, targetAudience: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="child">Children (6-12)</option>
                  <option value="teen">Teens (13-17)</option>
                  <option value="adult">Adults (18+)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Custom Color Scheme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Primary</label>
                    <input
                      type="color"
                      value={customization.customColors?.primary || '#9333ea'}
                      onChange={(e) => setCustomization(prev => ({
                        ...prev,
                        customColors: {
                          ...prev.customColors,
                          primary: e.target.value
                        }
                      }))}
                      className="w-full h-10 rounded border border-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Secondary</label>
                    <input
                      type="color"
                      value={customization.customColors?.secondary || '#3b82f6'}
                      onChange={(e) => setCustomization(prev => ({
                        ...prev,
                        customColors: {
                          ...prev.customColors,
                          secondary: e.target.value
                        }
                      }))}
                      className="w-full h-10 rounded border border-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Accent</label>
                    <input
                      type="color"
                      value={customization.customColors?.accent || '#f59e0b'}
                      onChange={(e) => setCustomization(prev => ({
                        ...prev,
                        customColors: {
                          ...prev.customColors,
                          accent: e.target.value
                        }
                      }))}
                      className="w-full h-10 rounded border border-white/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200 border border-white/20"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={!customization.characterName}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-semibold"
          >
            Start Game →
          </button>
        </div>
      </form>

      {/* Game Preview */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">🔎 Game Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-white/60">Hero Name:</span>
            <span className="text-white ml-2">{customization.characterName || 'Not set'}</span>
          </div>
          <div>
            <span className="text-white/60">Difficulty:</span>
            <span className="text-white ml-2 capitalize">{customization.difficulty}</span>
          </div>
          <div>
            <span className="text-white/60">Theme:</span>
            <span className="text-white ml-2 capitalize">{customization.theme}</span>
          </div>
          <div>
            <span className="text-white/60">Audience:</span>
            <span className="text-white ml-2 capitalize">{customization.targetAudience}</span>
          </div>
        </div>
        
        {customization.specialMessage && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <span className="text-white/60">Special Message:</span>
            <span className="text-white ml-2">{customization.specialMessage}</span>
          </div>
        )}
      </div>
    </div>
  )
}