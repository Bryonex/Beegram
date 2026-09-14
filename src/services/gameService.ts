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

export interface UserLeaderboard {
  userId: string
  overallScore: number
  games: Record<string, number>
}

// Normalization weights to ensure one game doesn't dominate the overall score.
// The goal is for a "good" score in any game to roughly equal 100-200 overall points.
export const SCORE_WEIGHTS: Record<string, number> = {
  tictactoe: 50,      // Wins are rare/hard, 1 win = 50 pts
  balloons: 1,        // Normal score ~100-200 -> 100-200 pts
  candy: 0.1,         // Normal score ~1000-2000 -> 100-200 pts
  chess: 100,         // 1 win = 100 pts
  rps: 20,            // Normal streak ~5-10 -> 100-200 pts
  tower: 5,           // Normal height ~20-40 -> 100-200 pts
  reflex: 10,         // Normal score ~10-20 -> 100-200 pts
  fish: 0.2,          // Normal score ~500-1000 -> 100-200 pts
}

export const gameService = {
  /**
   * Calculates the overall score based on the highest score per game,
   * multiplied by the game's normalization weight.
   */
  calculateOverallScore(bestScores: Record<string, number>): number {
    return Math.floor(
      Object.entries(bestScores).reduce((total, [gameId, score]) => {
        const weight = SCORE_WEIGHTS[gameId] || 1
        return total + (score * weight)
      }, 0)
    )
  },

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
  },

  async getLeaderboard(relationshipId: string): Promise<Record<string, UserLeaderboard>> {
    requireUuid(relationshipId, 'relationship ID')
    
    const { data, error } = await supabase
      .from('games_highscores')
      .select('*')
      .eq('relationship_id', relationshipId)
      
    if (error) {
      console.error('Failed to fetch leaderboard:', error)
      return {}
    }

    const records = data as HighScore[]
    
    // Group by user, then keep only the highest score per game
    const userScores: Record<string, Record<string, number>> = {}
    
    for (const record of records) {
      if (!userScores[record.user_id]) {
        userScores[record.user_id] = {}
      }
      const currentBest = userScores[record.user_id][record.game_id] || 0
      if (record.score > currentBest) {
        userScores[record.user_id][record.game_id] = record.score
      }
    }

    // Build the final leaderboard
    const leaderboard: Record<string, UserLeaderboard> = {}
    for (const [userId, games] of Object.entries(userScores)) {
      leaderboard[userId] = {
        userId,
        games,
        overallScore: this.calculateOverallScore(games)
      }
    }

    return leaderboard
  }
}
