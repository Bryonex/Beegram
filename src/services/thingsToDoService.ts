import { supabase } from '../lib/supabase'
import { requireUuid } from '../lib/ids'
import type { Activity, ActivityInsert } from '../types/thingsToDo'

function mapActivity(row: any): Activity {
  return {
    id: row.id,
    relationshipId: row.relationship_id,
    title: row.title,
    description: row.description || undefined,
    targetDate: row.target_date || undefined,
    createdBy: row.user_id,
    completedBy: row.completed_by || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
    completedAt: row.completed_at || undefined,
    isCompleted: Boolean(row.is_completed),
    isFavourite: Boolean(row.is_favourite),
  }
}

async function currentRelationship() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  requireUuid(user.id, 'user ID')
  const { data, error } = await (supabase as any)
    .from('profiles')
    .select('relationship_id')
    .eq('id', user.id)
    .single()
  if (error) throw error
  requireUuid(data?.relationship_id, 'relationship ID')
  return { userId: user.id, relationshipId: data.relationship_id as string }
}

export const thingsToDoService = {
  async getActivities(): Promise<Activity[]> {
    const { relationshipId } = await currentRelationship()
    const { data, error } = await (supabase as any)
      .from('things_to_do')
      .select('*')
      .eq('relationship_id', relationshipId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as any[]).map(mapActivity)
  },

  async createActivity(insert: Partial<ActivityInsert>): Promise<Activity> {
    const { userId, relationshipId } = await currentRelationship()
    if (!insert.title?.trim()) throw new Error('An activity needs a title.')
    const { data, error } = await (supabase as any)
      .from('things_to_do')
      .insert({
        relationship_id: relationshipId,
        user_id: userId,
        title: insert.title.trim(),
        description: insert.description || null,
        target_date: insert.targetDate || null,
        is_favourite: Boolean(insert.isFavourite),
      })
      .select()
      .single()
    if (error) throw error
    return mapActivity(data)
  },

  async updateActivity(id: string, updates: Partial<ActivityInsert>): Promise<Activity> {
    requireUuid(id, 'activity ID')
    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (typeof updates.title === 'string') dbUpdates.title = updates.title.trim()
    if (updates.description !== undefined) dbUpdates.description = updates.description || null
    if (updates.targetDate !== undefined) dbUpdates.target_date = updates.targetDate || null
    if (typeof updates.isFavourite === 'boolean') dbUpdates.is_favourite = updates.isFavourite
    const { data, error } = await (supabase as any).from('things_to_do').update(dbUpdates).eq('id', id).select().single()
    if (error) throw error
    return mapActivity(data)
  },

  async completeActivity(id: string, completedBy: string): Promise<Activity> {
    requireUuid(id, 'activity ID')
    requireUuid(completedBy, 'completed-by user ID')
    const { data, error } = await (supabase as any)
      .from('things_to_do')
      .update({ is_completed: true, completed_at: new Date().toISOString(), completed_by: completedBy, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return mapActivity(data)
  },

  async uncompleteActivity(id: string): Promise<Activity> {
    requireUuid(id, 'activity ID')
    const { data, error } = await (supabase as any)
      .from('things_to_do')
      .update({ is_completed: false, completed_at: null, completed_by: null, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return mapActivity(data)
  },

  async toggleFavourite(id: string, isFavourite: boolean): Promise<Activity> {
    requireUuid(id, 'activity ID')
    const { data, error } = await (supabase as any)
      .from('things_to_do')
      .update({ is_favourite: isFavourite, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return mapActivity(data)
  },

  async deleteActivity(id: string): Promise<void> {
    requireUuid(id, 'activity ID')
    const { error } = await (supabase as any).from('things_to_do').delete().eq('id', id)
    if (error) throw error
  },
}
