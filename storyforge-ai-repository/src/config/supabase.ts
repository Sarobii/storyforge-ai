import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vktmpqhkqivxmjkdtvas.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdG1wcWhrcWl2eG1qa2R0dmFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwODQ2MTUsImV4cCI6MjA3MTY2MDYxNX0.i5VIV9rb8Vs78A_DE30Jb2AZzqw9h-g67FWtpbMkIXw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Game save/load functionality
export const saveGameState = async (gameType: string, saveData: any, userId?: string) => {
  try {
    const saveKey = userId ? `${gameType}_${userId}` : `${gameType}_guest`
    
    // Save to localStorage for offline functionality
    localStorage.setItem(saveKey, JSON.stringify({
      ...saveData,
      timestamp: new Date().toISOString(),
      gameType
    }))
    
    // If user is authenticated, also save to Supabase
    if (userId) {
      const { error } = await supabase
        .from('game_saves')
        .upsert({
          user_id: userId,
          game_type: gameType,
          save_data: saveData,
          updated_at: new Date().toISOString()
        })
      
      if (error) {
        console.warn('Failed to save to cloud:', error)
        // Continue with local save
      }
    }
    
    return true
  } catch (error) {
    console.error('Save game failed:', error)
    return false
  }
}

export const loadGameState = async (gameType: string, userId?: string) => {
  try {
    const saveKey = userId ? `${gameType}_${userId}` : `${gameType}_guest`
    
    // Try to load from Supabase first if user is authenticated
    if (userId) {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        )
        
        const queryPromise = supabase
          .from('game_saves')
          .select('save_data, updated_at')
          .eq('user_id', userId)
          .eq('game_type', gameType)
          .maybeSingle()
        
        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any
        
        if (data && !error) {
          return data.save_data
        }
      } catch (supabaseError) {
        console.warn('Supabase load failed, using local storage:', supabaseError)
        // Continue with localStorage fallback
      }
    }
    
    // Fallback to localStorage
    const saved = localStorage.getItem(saveKey)
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed
    }
    
    return null
  } catch (error) {
    console.error('Load game failed:', error)
    return null
  }
}