import React from 'react'
import { Heart, Zap, Coins, Sword, Shield, Star, Crown } from 'lucide-react'

interface PlayerStats {
  name: string
  hp: number
  maxHp: number
  level: number
  exp: number
  expToNext: number
  gold: number
  attack: number
  defense: number
}

interface EnemyStats {
  name: string
  hp: number
  maxHp: number
  isBoss: boolean
}

interface HUDProps {
  player: PlayerStats
  enemy: EnemyStats | null
  battleNumber?: number
  isVisible: boolean
}

export const HUD: React.FC<HUDProps> = ({ player, enemy, battleNumber, isVisible }) => {
  const getHPColor = (hp: number, maxHp: number) => {
    const percentage = (hp / maxHp) * 100
    if (percentage > 60) return 'bg-green-500'
    if (percentage > 30) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getHPGradient = (hp: number, maxHp: number) => {
    const percentage = (hp / maxHp) * 100
    if (percentage > 60) return 'from-green-600 to-green-400'
    if (percentage > 30) return 'from-yellow-600 to-yellow-400'
    return 'from-red-600 to-red-400'
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-40 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Player Stats */}
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl border border-white/20 p-4 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Sword className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{player.name}</h3>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-300 font-medium">Level {player.level}</span>
                  {battleNumber && (
                    <span className="text-gray-400 text-sm">• Battle {battleNumber}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Health Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-white text-sm font-medium">Health</span>
                </div>
                <span className="text-white text-sm font-mono">
                  {player.hp}/{player.maxHp}
                </span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getHPGradient(player.hp, player.maxHp)} transition-all duration-500 ease-out`}
                  style={{ width: `${Math.max(0, (player.hp / player.maxHp) * 100)}%` }}
                />
              </div>
            </div>

            {/* Experience Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-white text-sm font-medium">Experience</span>
                </div>
                <span className="text-white text-sm font-mono">
                  {player.exp}/{player.expToNext}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-500 transition-all duration-500 ease-out"
                  style={{ width: `${Math.max(0, (player.exp / player.expToNext) * 100)}%` }}
                />
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Sword className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-300">{player.attack}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300">{player.defense}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-300 font-bold">{player.gold}</span>
              </div>
            </div>
          </div>

          {/* Enemy Stats */}
          {enemy && (
            <div className="bg-black/60 backdrop-blur-sm rounded-2xl border border-red-500/30 p-4 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 ${enemy.isBoss ? 'bg-red-600' : 'bg-red-500'} rounded-full flex items-center justify-center`}>
                  {enemy.isBoss ? (
                    <Crown className="w-6 h-6 text-yellow-400" />
                  ) : (
                    <Shield className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-lg">{enemy.name}</h3>
                    {enemy.isBoss && (
                      <div className="px-2 py-1 bg-yellow-600 text-yellow-100 text-xs font-bold rounded">
                        BOSS
                      </div>
                    )}
                  </div>
                  <span className="text-red-300 text-sm">Enemy</span>
                </div>
              </div>

              {/* Enemy Health Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-white text-sm font-medium">Health</span>
                  </div>
                  <span className="text-white text-sm font-mono">
                    {enemy.hp}/{enemy.maxHp}
                  </span>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ease-out ${
                      enemy.isBoss 
                        ? 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500'
                        : 'bg-gradient-to-r from-red-600 to-red-400'
                    }`}
                    style={{ width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Enemy threat indicator */}
              <div className="mt-3 flex justify-center">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  enemy.isBoss 
                    ? 'bg-red-600/20 border border-red-500/50 text-red-300'
                    : 'bg-orange-600/20 border border-orange-500/50 text-orange-300'
                }`}>
                  {enemy.isBoss ? '👑 Boss Enemy' : '⚔️ Regular Enemy'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
