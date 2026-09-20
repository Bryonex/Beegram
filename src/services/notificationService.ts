import { supabase } from '../lib/supabase'

export type NotificationType = 'buzz' | 'message' | 'moment' | 'moment_like' | 'moment_comment' | 'song' | 'garden' | 'letter'

export interface AppNotification {
  id: string
  relationship_id: string
  recipient_id: string
  sender_id: string
  type: NotificationType
  title: string
  body?: string
  created_at: string
  read_at: string | null
}

export const notificationService = {
  async getNotifications(recipientId: string): Promise<AppNotification[]> {
    const { data, error } = await (supabase as any)
      .from('notifications')
      .select('id, relationship_id, recipient_id, sender_id, type, title, body, message, created_at, read_at')
      .eq('recipient_id', recipientId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map((notification: AppNotification & { message?: string }) => ({
      ...notification,
      body: notification.body || notification.message || undefined,
    }))
  },

  async getPartnerId(relationshipId: string, userId: string): Promise<string | null> {
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('id')
      .eq('relationship_id', relationshipId)
      .neq('id', userId)
      .single()
    if (error || !data) return null
    return data.id
  },

  async sendNotification(
    recipientId: string,
    relationshipId: string,
    type: NotificationType,
    title: string,
    body?: string
  ) {
    if (!recipientId || !relationshipId) {
      console.warn('Missing recipient or relationship ID for notification')
      return null
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Don't notify yourself
    if (user.id === recipientId) return null

    try {
      const { data, error } = await (supabase as any)
        .from('notifications')
        .insert({
          relationship_id: relationshipId,
          recipient_id: recipientId,
          sender_id: user.id,
          type,
          title,
          body
        })
        .select()
        .single()

      if (error) {
        console.error('Error sending notification:', error)
        return null
      }
      return data
    } catch (err) {
      console.error('Failed to send notification', err)
      return null
    }
  },
  
  async markAsRead(notificationId: string) {
    const { error } = await (supabase as any)
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
    
    if (error) console.error('Failed to mark notification as read', error)
  },

  async markAllAsRead(recipientId: string) {
    const { error } = await (supabase as any)
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_id', recipientId)
      .is('read_at', null)
    if (error) throw error
  }
}
