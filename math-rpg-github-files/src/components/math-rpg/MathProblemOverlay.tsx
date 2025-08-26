import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Sword, Shield, Heart } from 'lucide-react'

interface MathProblem {
  question: string
  answer: number
  difficulty: number
  type: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed'
}

interface Enemy {
  name: string
  hp: number
  maxHp: number
  isBoss: boolean
}

interface MathProblemOverlayProps {
  problem: MathProblem
  enemy: Enemy
  onAnswer: (answer: number) => void
  onClose?: () => void
  isVisible: boolean
}

const answerSchema = z.object({
  answer: z.string().min(1, 'Please enter an answer').refine((val) => {
    const num = parseInt(val)
    return !isNaN(num)
  }, 'Please enter a valid number')
})

type AnswerForm = z.infer<typeof answerSchema>

export const MathProblemOverlay: React.FC<MathProblemOverlayProps> = ({
  problem,
  enemy,
  onAnswer,
  onClose,
  isVisible
}) => {
  const { register, handleSubmit, formState: { errors }, reset, setFocus } = useForm<AnswerForm>({
    resolver: zodResolver(answerSchema)
  })

  useEffect(() => {
    if (isVisible) {
      reset()
      setTimeout(() => setFocus('answer'), 100)
    }
  }, [isVisible, reset, setFocus])

  const onSubmit = (data: AnswerForm) => {
    const answer = parseInt(data.answer)
    onAnswer(answer)
    reset()
  }

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'Easy'
      case 2: return 'Medium'
      case 3: return 'Hard'
      case 4: return 'Expert'
      default: return 'Normal'
    }
  }

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'bg-green-500'
      case 2: return 'bg-yellow-500'
      case 3: return 'bg-orange-500'
      case 4: return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'addition': return '+'
      case 'subtraction': return '-'
      case 'multiplication': return '×'
      case 'division': return '÷'
      case 'mixed': return '∑'
      default: return '?'
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4">
        <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sword className="w-6 h-6 text-yellow-400" />
                Combat Math Challenge
              </h2>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getDifficultyColor(problem.difficulty)}`}>
                  {getDifficultyLabel(problem.difficulty)}
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-bold text-white bg-indigo-600">
                  {getTypeIcon(problem.type)} {problem.type.toUpperCase()}
                </div>
              </div>
            </div>
            
            {/* Enemy Info */}
            <div className="flex items-center justify-between bg-red-500/20 rounded-lg p-3 border border-red-500/30">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-400" />
                <span className="text-white font-medium">
                  {enemy.name} {enemy.isBoss && <span className="text-yellow-400 text-sm">👑 BOSS</span>}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-red-300 text-sm font-mono">
                  {enemy.hp}/{enemy.maxHp} HP
                </span>
                <div className="w-20 h-2 bg-red-900/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Math Problem */}
          <div className="p-6">
            <div className="text-center mb-6">
              <p className="text-gray-300 text-sm mb-2">Solve this problem to attack:</p>
              <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-white font-mono mb-2">
                  {problem.question}
                </div>
                <div className="text-gray-300 text-lg">= ?</div>
              </div>
            </div>

            {/* Answer Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <input
                  {...register('answer')}
                  type="number"
                  placeholder="Enter your answer..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-xl font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoFocus
                />
                {errors.answer && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <span>⚠️</span> {errors.answer.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  ⚔️ Attack!
                </button>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* Help Text */}
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                💡 Correct answers deal more damage!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
