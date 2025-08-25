import React, { useState } from 'react'
import { GameTemplate } from '../types/game'

interface GameResult {
  score: number
  achievements: string[]
  gameTime: number
  template: GameTemplate
}

interface GameCompleteProps {
  result: GameResult
  onPlayAgain: () => void
  onNewGame: () => void
}

export const GameComplete: React.FC<GameCompleteProps> = ({
  result,
  onPlayAgain,
  onNewGame
}) => {
  const [shareMessage, setShareMessage] = useState('')
  const [showShareOptions, setShowShareOptions] = useState(false)

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreGrade = (score: number): { grade: string; color: string; emoji: string } => {
    if (score >= 5000) return { grade: 'S', color: 'text-yellow-400', emoji: '🏆' }
    if (score >= 3000) return { grade: 'A', color: 'text-green-400', emoji: '🎆' }
    if (score >= 2000) return { grade: 'B', color: 'text-blue-400', emoji: '🎉' }
    if (score >= 1000) return { grade: 'C', color: 'text-purple-400', emoji: '🎈' }
    return { grade: 'D', color: 'text-gray-400', emoji: '🙌' }
  }

  const getAchievementEmoji = (achievement: string): string => {
    if (achievement.includes('complete')) return '✓'
    if (achievement.includes('level')) return '⬆️'
    if (achievement.includes('time')) return '⏱️'
    if (achievement.includes('score')) return '💯'
    if (achievement.includes('defeat')) return '⚔️'
    if (achievement.includes('collect')) return '💰'
    return '✨'
  }

  const generateShareMessage = () => {
    const scoreGrade = getScoreGrade(result.score)
    const message = `Just completed ${result.template.title} in StoryForge AI Enhanced! 🎮\n\n` +
      `🏆 Score: ${result.score.toLocaleString()} (Grade ${scoreGrade.grade})\n` +
      `⏱️ Time: ${formatTime(result.gameTime)}\n` +
      `✨ Achievements: ${result.achievements.length}\n\n` +
      `Create your own retro games at StoryForge AI Enhanced!`
    
    setShareMessage(message)
    setShowShareOptions(true)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareMessage)
      .then(() => alert('Copied to clipboard!'))
      .catch(() => alert('Failed to copy'))
  }

  const scoreGrade = getScoreGrade(result.score)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-6">
        <div className="text-8xl animate-bounce">
          {scoreGrade.emoji}
        </div>
        
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-white">
            Congratulations!
          </h2>
          <p className="text-xl text-white/80">
            You've completed <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-semibold">
              {result.template.title}
            </span>
          </p>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-2xl font-bold text-white mb-1">
            {result.score.toLocaleString()}
          </div>
          <div className="text-sm text-white/60">Final Score</div>
          <div className={`text-4xl font-bold mt-3 ${scoreGrade.color}`}>
            {scoreGrade.grade}
          </div>
          <div className="text-xs text-white/50 mt-1">Grade</div>
        </div>

        {/* Time */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
          <div className="text-3xl mb-2">⏱️</div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatTime(result.gameTime)}
          </div>
          <div className="text-sm text-white/60">Time Played</div>
          <div className="text-lg mt-3 text-blue-400">
            {result.gameTime < 300 ? 'Speed Run!' : 
             result.gameTime < 600 ? 'Great Pace' : 
             result.gameTime < 1200 ? 'Steady Progress' : 'Thorough Explorer'}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
          <div className="text-3xl mb-2">✨</div>
          <div className="text-2xl font-bold text-white mb-1">
            {result.achievements.length}
          </div>
          <div className="text-sm text-white/60">Achievements</div>
          <div className="text-lg mt-3 text-purple-400">
            {result.achievements.length === 0 ? 'Next time!' :
             result.achievements.length < 3 ? 'Good start!' :
             result.achievements.length < 6 ? 'Achievement Hunter!' :
             'Master Player!'}
          </div>
        </div>
      </div>

      {/* Achievements List */}
      {result.achievements.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            🏅 Achievements Unlocked
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.achievements.map((achievement, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="text-xl">{getAchievementEmoji(achievement)}</div>
                <div>
                  <div className="text-white font-medium capitalize">
                    {achievement.replace(/_/g, ' ')}
                  </div>
                  <div className="text-xs text-white/50">
                    Unlocked during gameplay
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Breakdown */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">📈 Performance Breakdown</h3>
        
        <div className="space-y-4">
          {/* Score Breakdown */}
          <div className="space-y-2">
            <div className="text-sm text-white/60">Score Analysis</div>
            <div className="text-white text-sm space-y-1">
              <div className="flex justify-between">
                <span>Base Score:</span>
                <span>{Math.max(result.score - 500, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Time Bonus:</span>
                <span>+{Math.max(1000 - result.gameTime, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Achievement Bonus:</span>
                <span>+{(result.achievements.length * 100).toLocaleString()}</span>
              </div>
              <div className="border-t border-white/20 pt-2 flex justify-between font-bold">
                <span>Total Score:</span>
                <span>{result.score.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          {/* Game-specific stats */}
          <div className="space-y-2">
            <div className="text-sm text-white/60">Game Analysis</div>
            <div className="text-white text-sm">
              {result.template.id === 'pixel-quest' && (
                <p>You've mastered the art of combat and exploration! Your strategic thinking and quick reflexes served you well.</p>
              )}
              {result.template.id === 'platform-hero' && (
                <p>Excellent platforming skills! Your timing and precision helped you overcome challenging obstacles.</p>
              )}
              {result.template.id === 'math-rpg' && (
                <p>Your mathematical prowess proved mighty in battle! Education and entertainment perfectly combined.</p>
              )}
              {result.template.id === 'reveal-adventure' && (
                <p>A wonderful celebration adventure! You've successfully created lasting memories with this special announcement.</p>
              )}
              {result.template.id === 'puzzle-solver' && (
                <p>Your logical thinking and problem-solving skills are impressive! Each puzzle challenged your mind in unique ways.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onPlayAgain}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 font-semibold text-lg"
        >
          🔁 Play Again
        </button>
        
        <button
          onClick={generateShareMessage}
          className="flex-1 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold text-lg"
        >
          📢 Share Results
        </button>
        
        <button
          onClick={onNewGame}
          className="flex-1 px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-semibold text-lg border border-white/20"
        >
          🎆 New Game
        </button>
      </div>

      {/* Share Modal */}
      {showShareOptions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Share Your Achievement</h3>
              <button
                onClick={() => setShowShareOptions(false)}
                className="text-white/60 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
            
            <textarea
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              className="w-full h-32 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 resize-none text-sm"
              placeholder="Customize your share message..."
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={copyToClipboard}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                📋 Copy Text
              </button>
              
              <button
                onClick={() => {
                  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`
                  window.open(twitterUrl, '_blank')
                }}
                className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors text-sm"
              >
                🐦 Twitter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}