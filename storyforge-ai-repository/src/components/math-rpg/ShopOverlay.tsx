import React from 'react'
import { Coins, Sword, Shield, Heart, ShoppingCart, X } from 'lucide-react'

export interface ShopItem {
  id: string
  name: string
  type: 'potion' | 'weapon' | 'armor'
  cost: number
  effect: {
    hp?: number
    attack?: number
    defense?: number
  }
  description: string
}

interface ShopOverlayProps {
  items: ShopItem[]
  playerGold: number
  onPurchase: (itemId: string) => void
  onClose: () => void
  isVisible: boolean
}

export const ShopOverlay: React.FC<ShopOverlayProps> = ({
  items,
  playerGold,
  onPurchase,
  onClose,
  isVisible
}) => {
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'potion': return <Heart className="w-5 h-5 text-red-400" />
      case 'weapon': return <Sword className="w-5 h-5 text-orange-400" />
      case 'armor': return <Shield className="w-5 h-5 text-blue-400" />
      default: return <ShoppingCart className="w-5 h-5 text-gray-400" />
    }
  }

  const getItemColor = (type: string) => {
    switch (type) {
      case 'potion': return 'border-red-500/30 bg-red-500/10'
      case 'weapon': return 'border-orange-500/30 bg-orange-500/10'
      case 'armor': return 'border-blue-500/30 bg-blue-500/10'
      default: return 'border-gray-500/30 bg-gray-500/10'
    }
  }

  const getEffectText = (effect: ShopItem['effect']) => {
    const effects = []
    if (effect.hp) effects.push(`+${effect.hp} HP`)
    if (effect.attack) effects.push(`+${effect.attack} ATK`)
    if (effect.defense) effects.push(`+${effect.defense} DEF`)
    return effects.join(', ')
  }

  const canAfford = (cost: number) => playerGold >= cost

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-8 h-8 text-yellow-400" />
                <div>
                  <h2 className="text-3xl font-bold text-white">Merchant's Shop</h2>
                  <p className="text-gray-300">Purchase items to aid your journey</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-yellow-600/20 px-4 py-2 rounded-lg border border-yellow-600/30">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-100 font-bold text-lg">{playerGold}</span>
                  <span className="text-yellow-300 text-sm">Gold</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="p-6 overflow-y-auto max-h-96">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => {
                const affordable = canAfford(item.cost)
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border ${getItemColor(item.type)} ${!affordable ? 'opacity-50' : 'hover:bg-white/5'} transition-all`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getItemIcon(item.type)}
                        <h3 className="font-bold text-white">{item.name}</h3>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-bold ${item.type === 'potion' ? 'bg-red-600 text-white' : item.type === 'weapon' ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'}`}>
                        {item.type.toUpperCase()}
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-3">{item.description}</p>

                    <div className="mb-4">
                      <div className="text-green-400 font-bold mb-1">{getEffectText(item.effect)}</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className={`font-bold ${affordable ? 'text-yellow-300' : 'text-red-400'}`}>
                          {item.cost}
                        </span>
                      </div>
                      <button
                        onClick={() => onPurchase(item.id)}
                        disabled={!affordable}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${
                          affordable
                            ? 'bg-green-600 hover:bg-green-700 text-white hover:scale-105 active:scale-95'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {affordable ? 'Buy' : 'Too Expensive'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {items.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No items available in the shop</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <p className="text-gray-300 text-sm">
                💡 Potions restore health, weapons increase attack, armor boosts defense
              </p>
              <button
                onClick={onClose}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
              >
                Continue Journey
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
