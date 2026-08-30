
import { supabase } from '../lib/supabase'
import { requireUuid } from '../lib/ids'

export interface GardenItem {
  id: string
  type: string
  title: string
  source: string
  position_x: number
  position_y: number
  created_at: string
  relationship_id: string
  author_id: string
}

export type GardenItemInsert = Omit<GardenItem, 'id' | 'created_at'>

export const gardenService = {
  async getItems(relationship_id: string): Promise<GardenItem[]> {
    requireUuid(relationship_id, 'relationship ID')
    const { data, error } = await (supabase as any)
      .from('garden_items')
      .select('*')
      .eq('relationship_id', relationship_id)
    if (error) throw error
    return data as GardenItem[]
  },
  
  async addAchievement(insert: GardenItemInsert): Promise<GardenItem> {
    requireUuid(insert.relationship_id, 'relationship ID')
    requireUuid(insert.author_id, 'author ID')
    const { data, error } = await (supabase as any)
      .from('garden_items')
      .insert(insert as any)
      .select()
      .single()
    if (error) throw error
    return data as GardenItem
  },

  async checkAndUnlockAchievement(relationship_id: string, author_id: string, type: string, title: string, source: string): Promise<void> {
    requireUuid(relationship_id, 'relationship ID')
    requireUuid(author_id, 'author ID')
    const { data } = await (supabase as any)
      .from('garden_items')
      .select('id')
      .eq('relationship_id', relationship_id)
      .eq('title', title)
      .limit(1)
      
    if (!data || data.length === 0) {
      // Random position
      const position_x = Math.floor(Math.random() * 80) + 10
      const position_y = Math.floor(Math.random() * 60) + 20
      
      await this.addAchievement({
        relationship_id,
        author_id,
        type,
        title,
        source,
        position_x,
        position_y
      })
    }
  }
}
