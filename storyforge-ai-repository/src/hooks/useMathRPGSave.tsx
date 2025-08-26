import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../config/supabase'

export interface MathRPGSaveData {
  // Player Stats
  playerName: string
  playerLevel: number
  playerHP: number
  playerMaxHP: number
  playerAttack: number
  playerDefense: number
  playerExp: number
  playerExpToNext: number
  playerGold: number

  // Game Progress
  currentBattle: number
  maxBattles: number

  // Equipment and Items
  equippedWeapon?: string
  equippedArmor?: string
  inventory: string[]

  // Achievements and Stats
  totalEnemiesDefeated: number
  totalBossesDefeated: number
  totalMathProblemsCorrect: number
  totalMathProblemsAttempted: number
  highestDifficultyCompleted: number

  // Timestamps
  lastPlayed: string
  totalPlayTime: number
  created: string
}

const DEFAULT_SAVE_DATA: MathRPGSaveData = {
  playerName: 'Hero',
  playerLevel: 1,
  playerHP: 100,
  playerMaxHP: 100,
  playerAttack: 15,
  playerDefense: 8,
  playerExp: 0,
  playerExpToNext: 100,
  playerGold: 50,
  currentBattle: 1,
  maxBattles: 10,
  inventory: [],
  totalEnemiesDefeated: 0,
  totalBossesDefeated: 0,
  totalMathProblemsCorrect: 0,
  totalMathProblemsAttempted: 0,
  highestDifficultyCompleted: 0,
  lastPlayed: new Date().toISOString(),
  totalPlayTime: 0,
  created: new Date().toISOString()
}

export const useMathRPGSave = (userId?: string) => {
  const [saveData, setSaveData] = useState<MathRPGSaveData>(DEFAULT_SAVE_DATA)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null)

  // Generate save key for localStorage
  const getSaveKey = () => userId ? `mathRPGSave_${userId}` : 'mathRPGSave_guest'

  // Load save data from localStorage
  const loadFromLocalStorage = useCallback((): MathRPGSaveData | null => {
    try {
      const savedData = localStorage.getItem(getSaveKey())
      if (savedData) {
        const parsed = JSON.parse(savedData)
        // Ensure all required fields are present by merging with defaults
        return { ...DEFAULT_SAVE_DATA, ...parsed }
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error)
    }
    return null
  }, [getSaveKey])

  // Save data to localStorage
  const saveToLocalStorage = useCallback((data: MathRPGSaveData) => {
    try {
      localStorage.setItem(getSaveKey(), JSON.stringify({
        ...data,
        lastPlayed: new Date().toISOString()
      }))
      return true
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
      return false
    }
  }, [getSaveKey])

  // Load save data from Supabase
  const loadFromSupabase = useCallback(async (): Promise<MathRPGSaveData | null> => {
    if (!userId) return null

    try {
      const { data, error } = await supabase
        .from('game_saves')
        .select('save_data')
        .eq('user_id', userId)
        .eq('game_type', 'math-rpg')
        .maybeSingle()

      if (error) {
        console.warn('Supabase load error:', error)
        return null
      }

      if (data?.save_data) {
        // Ensure all required fields are present
        return { ...DEFAULT_SAVE_DATA, ...data.save_data }
      }
    } catch (error) {
      console.warn('Failed to load from Supabase:', error)
    }

    return null
  }, [userId])

  // Save data to Supabase
  const saveToSupabase = useCallback(async (data: MathRPGSaveData): Promise<boolean> => {
    if (!userId) return false

    try {
      const saveDataWithTimestamp = {
        ...data,
        lastPlayed: new Date().toISOString()
      }

      const { error } = await supabase
        .from('game_saves')
        .upsert({
          user_id: userId,
          game_type: 'math-rpg',
          save_data: saveDataWithTimestamp,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Supabase save error:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Failed to save to Supabase:', error)
      return false
    }
  }, [userId])

  // Load save data on mount
  useEffect(() => {
    const loadSaveData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        let loadedData: MathRPGSaveData | null = null

        // Try Supabase first if user is logged in
        if (userId) {
          loadedData = await loadFromSupabase()
        }

        // Fallback to localStorage if Supabase fails or user is guest
        if (!loadedData) {
          loadedData = loadFromLocalStorage()
        }

        // Use default data if nothing found
        const finalData = loadedData || DEFAULT_SAVE_DATA
        setSaveData(finalData)

      } catch (error) {
        console.error('Failed to load save data:', error)
        setError('Failed to load save data')
        setSaveData(DEFAULT_SAVE_DATA)
      } finally {
        setIsLoading(false)
      }
    }

    loadSaveData()
  }, [userId, loadFromSupabase, loadFromLocalStorage])

  // Save function
  const save = useCallback(async (newData?: Partial<MathRPGSaveData>): Promise<boolean> => {
    try {
      const dataToSave = newData ? { ...saveData, ...newData } : saveData

      // Always save to localStorage first (immediate, reliable)
      const localSaveSuccess = saveToLocalStorage(dataToSave)

      // Try to save to Supabase if user is logged in
      let supabaseSaveSuccess = true
      if (userId) {
        supabaseSaveSuccess = await saveToSupabase(dataToSave)
      }

      // Update local state if save was successful
      if (localSaveSuccess) {
        setSaveData(dataToSave)
        setLastSaveTime(new Date())
      }

      return localSaveSuccess
    } catch (error) {
      console.error('Save failed:', error)
      setError('Failed to save game data')
      return false
    }
  }, [saveData, userId, saveToLocalStorage, saveToSupabase])

  // Update save data
  const updateSave = useCallback((updates: Partial<MathRPGSaveData>) => {
    setSaveData(prevData => ({ ...prevData, ...updates }))
  }, [])

  // Reset save data to defaults
  const resetSave = useCallback(async (): Promise<boolean> => {
    const newData = { ...DEFAULT_SAVE_DATA, created: new Date().toISOString() }
    return await save(newData)
  }, [save])

  // Delete save data
  const deleteSave = useCallback(async (): Promise<boolean> => {
    try {
      // Remove from localStorage
      localStorage.removeItem(getSaveKey())

      // Remove from Supabase if user is logged in
      if (userId) {
        await supabase
          .from('game_saves')
          .delete()
          .eq('user_id', userId)
          .eq('game_type', 'math-rpg')
      }

      setSaveData(DEFAULT_SAVE_DATA)
      setLastSaveTime(null)
      return true
    } catch (error) {
      console.error('Failed to delete save:', error)
      setError('Failed to delete save data')
      return false
    }
  }, [userId, getSaveKey])

  // Auto-save functionality (call this when important game events happen)
  const autoSave = useCallback(async (updates?: Partial<MathRPGSaveData>) => {
    if (updates) {
      updateSave(updates)
      // Use setTimeout to ensure state is updated before saving
      setTimeout(() => save(), 100)
    } else {
      await save()
    }
  }, [updateSave, save])

  // Calculate derived stats
  const mathAccuracy = saveData.totalMathProblemsAttempted > 0
    ? (saveData.totalMathProblemsCorrect / saveData.totalMathProblemsAttempted) * 100
    : 0

  return {
    // Save data
    saveData,
    isLoading,
    error,
    lastSaveTime,

    // Save operations
    save,
    updateSave,
    autoSave,
    resetSave,
    deleteSave,

    // Derived stats
    mathAccuracy: Math.round(mathAccuracy),

    // Utility functions
    hasExistingSave: () => saveData.created !== DEFAULT_SAVE_DATA.created,
    isNewGame: () => saveData.currentBattle === 1 && saveData.totalEnemiesDefeated === 0
  }
}

export default useMathRPGSave
