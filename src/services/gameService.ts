import { supabase } from '../lib/supabase'
import { requireUuid } from '../lib/ids'

export interface HighScore {
  id: string
  relationship_id: string
  user_id: string
  game_id: string
  score: number
  created_at: string
}

export const gameService = {
  async getHighScore(relationshipId: string, gameId: string): Promise<number> {
    requireUuid(relationshipId, 'relationship ID')
    const { data, error } = await supabase
      .from('games_highscores')
      .select('score')
      .eq('relationship_id', relationshipId)
      .eq('game_id', gameId)
      .order('score', { ascending: false })
      .limit(1)
      
    if (error) {
      console.error('Failed to get high score:', error)
      return 0
    }
    
    return data && data.length > 0 ? data[0].score : 0
  },

  async submitScore(relationshipId: string, userId: string, gameId: string, score: number): Promise<void> {
    requireUuid(relationshipId, 'relationship ID')
    requireUuid(userId, 'user ID')
    
    // First check if it's actually higher than the current highest
    const currentHigh = await this.getHighScore(relationshipId, gameId)
    
    if (score > currentHigh) {
      const { error } = await supabase
        .from('games_highscores')
        .insert({
          relationship_id: relationshipId,
          user_id: userId,
          game_id: gameId,
          score: score
        })
        
      if (error) {
        console.error('Failed to submit high score:', error)
      }
    }
  }
}
