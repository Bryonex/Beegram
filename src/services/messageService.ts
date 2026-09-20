import { supabase } from '../lib/supabase'
import { requireUuid } from '../lib/ids'
import type {
  Letter,
  LetterInsert,
  ChatMessage,
  ChatMessageInsert,
  VoiceNote,
  VoiceNoteInsert,
  Buzz,
  BuzzInsert,
  AppNotificationInsert
} from '../types/messages'
import { notificationService } from './notificationService'

async function signedVoiceUrl(pathOrUrl: string | undefined): Promise<string | undefined> {
  if (!pathOrUrl || /^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  const { data, error } = await supabase.storage.from('voice_notes').createSignedUrl(pathOrUrl, 60 * 60)
  if (error) throw error
  return data.signedUrl
}

async function hydrateChatMessage(message: ChatMessage): Promise<ChatMessage> {
  if (message.message_type !== 'voice') return message
  return { ...message, audio_url: await signedVoiceUrl(message.audio_url) }
}

async function hydrateVoiceNote(note: VoiceNote): Promise<VoiceNote> {
  return { ...note, audio_url: (await signedVoiceUrl(note.audio_url)) || '' }
}

export const messageService = {
  async getLetters(relationshipId: string): Promise<Letter[]> {
    requireUuid(relationshipId, 'relationship ID')
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .eq('relationship_id', relationshipId)
      .eq('is_draft', false)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Letter[]
  },

  async sendLetter(insert: LetterInsert): Promise<Letter> {
    requireUuid(insert.relationship_id, 'relationship ID')
    requireUuid(insert.author_id, 'author ID')
    const { data, error } = await (supabase as any)
      .from('letters')
      .insert({ ...insert, is_draft: false, sent_at: new Date().toISOString() })
      .select()
      .single()
    if (error) throw error

    // Fetch sender profile to notify recipient
    const partnerId = await notificationService.getPartnerId(insert.relationship_id, insert.author_id)
    if (partnerId) {
      const { data: profile } = await (supabase as any).from('profiles').select('display_name').eq('id', insert.author_id).single()
      await notificationService.sendNotification(
        partnerId,
        insert.relationship_id,
        'letter',
        `${profile?.display_name || 'Your partner'} sent you a letter`
      )
    }

    return data as Letter
  },

  async getChatMessages(relationshipId: string): Promise<ChatMessage[]> {
    requireUuid(relationshipId, 'relationship ID')
    const { data, error } = await (supabase as any)
      .from('messages')
      .select('*, chat_reactions(*)')
      .eq('relationship_id', relationshipId)
      .order('created_at', { ascending: true })
    if (error) throw error
    
    // Map chat_reactions to reactions
    const mapped = (data as any[]).map(msg => ({
      ...msg,
      reactions: msg.chat_reactions || []
    }))
    
    return Promise.all((mapped as ChatMessage[]).map(hydrateChatMessage))
  },

  async sendChatMessage(insert: ChatMessageInsert): Promise<ChatMessage> {
    requireUuid(insert.relationship_id, 'relationship ID')
    requireUuid(insert.user_id, 'sender ID')
    requireUuid(insert.recipient_id, 'recipient ID')
    const { data, error } = await (supabase as any).from('messages').insert(insert).select().single()
    if (error) throw error

    const partnerId = await notificationService.getPartnerId(insert.relationship_id, insert.user_id)
    if (partnerId) {
      const { data: profile } = await (supabase as any).from('profiles').select('display_name').eq('id', insert.user_id).single()
      await notificationService.sendNotification(
        partnerId,
        insert.relationship_id,
        'message',
        `${profile?.display_name || 'Your partner'}: ${insert.content || 'Voice message'}`
      )
    }

    return hydrateChatMessage(data as ChatMessage)
  },

  async uploadVoiceRecording(relationshipId: string, userId: string, file: Blob, mimeType?: string): Promise<string> {
    requireUuid(relationshipId, 'relationship ID')
    requireUuid(userId, 'sender ID')
    const extension = mimeType?.includes('mp4') ? 'm4a' : 'webm'
    const filePath = `${relationshipId}/chat/${userId}/${crypto.randomUUID()}.${extension}`
    const { error } = await supabase.storage
      .from('voice_notes')
      .upload(filePath, file, { contentType: mimeType || file.type || 'audio/webm', upsert: false })
    if (error) throw error
    return filePath
  },

  async markMessageDelivered(id: string): Promise<void> {
    requireUuid(id, 'message ID')
    const { error } = await (supabase as any).from('messages').update({ delivered_at: new Date().toISOString() }).eq('id', id).is('delivered_at', null)
    if (error) throw error
  },

  async markMessageRead(id: string): Promise<void> {
    requireUuid(id, 'message ID')
    const { error } = await (supabase as any).from('messages').update({ read_at: new Date().toISOString() }).eq('id', id).is('read_at', null)
    if (error) throw error
  },

  async getVoiceNotes(relationshipId: string): Promise<VoiceNote[]> {
    requireUuid(relationshipId, 'relationship ID')
    const { data, error } = await (supabase as any)
      .from('voice_notes')
      .select('*')
      .eq('relationship_id', relationshipId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return Promise.all((data as VoiceNote[]).map(hydrateVoiceNote))
  },

  async saveVoiceNote(relationshipId: string, insert: VoiceNoteInsert): Promise<VoiceNote> {
    requireUuid(relationshipId, 'relationship ID')
    requireUuid(insert.author_id, 'author ID')
    const filePath = await this.uploadVoiceRecording(relationshipId, insert.author_id, insert.file)
    const { data, error } = await (supabase as any)
      .from('voice_notes')
      .insert({
        relationship_id: relationshipId,
        author_id: insert.author_id,
        duration_seconds: insert.duration_seconds,
        is_favourite: insert.is_favourite,
        audio_url: filePath,
      })
      .select()
      .single()
    if (error) throw error
    return hydrateVoiceNote(data as VoiceNote)
  },

  async deleteVoiceNote(id: string): Promise<void> {
    requireUuid(id, 'voice note ID')
    const { error } = await (supabase as any).from('voice_notes').delete().eq('id', id)
    if (error) throw error
  },

  async getBuzzes(relationshipId: string): Promise<Buzz[]> {
    requireUuid(relationshipId, 'relationship ID')
    const { data, error } = await (supabase as any).from('buzz_events').select('*').eq('relationship_id', relationshipId).order('created_at', { ascending: false })
    if (error) throw error
    return data as Buzz[]
  },

  async sendBuzz(insert: BuzzInsert): Promise<Buzz> {
    requireUuid(insert.relationship_id, 'relationship ID')
    requireUuid(insert.sender_id, 'sender ID')
    const { data, error } = await (supabase as any).from('buzz_events').insert(insert).select().single()
    if (error) throw error

    const partnerId = await notificationService.getPartnerId(insert.relationship_id, insert.sender_id)
    if (partnerId) {
      const { data: profile } = await (supabase as any).from('profiles').select('display_name').eq('id', insert.sender_id).single()
      await notificationService.sendNotification(
        partnerId,
        insert.relationship_id,
        'buzz',
        `${profile?.display_name || 'Your partner'} sent a Buzz! 🐝`
      )
    }

    return data as Buzz
  },

  async createNotification(insert: AppNotificationInsert): Promise<void> {
    requireUuid(insert.relationship_id, 'relationship ID')
    requireUuid(insert.recipient_id, 'recipient ID')
    requireUuid(insert.sender_id, 'sender ID')
    const { error } = await (supabase as any).from('notifications').insert(insert)
    if (error) throw error
  },

  async getUnreadCount(relationshipId: string, userId: string): Promise<number> {
    requireUuid(relationshipId, 'relationship ID')
    requireUuid(userId, 'user ID')
    
    // Check unread chat messages
    const { count: messageCount } = await (supabase as any)
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('relationship_id', relationshipId)
      .eq('recipient_id', userId)
      .is('read_at', null)

    // Check unread letters
    const { count: letterCount } = await (supabase as any)
      .from('letters')
      .select('id', { count: 'exact', head: true })
      .eq('relationship_id', relationshipId)
      .neq('author_id', userId)
      .is('read_at', null)
      .eq('is_draft', false)

    return (messageCount || 0) + (letterCount || 0)
  },

  async toggleReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    requireUuid(messageId, 'message ID')
    requireUuid(userId, 'user ID')

    // Check if reaction exists
    const { data: existing } = await (supabase as any)
      .from('chat_reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('emoji', emoji)
      .maybeSingle()

    if (existing) {
      // Remove
      const { error } = await (supabase as any).from('chat_reactions').delete().eq('id', existing.id)
      if (error) throw error
    } else {
      // Add
      const { error } = await (supabase as any).from('chat_reactions').insert({
        message_id: messageId,
        user_id: userId,
        emoji
      })
      if (error) throw error
    }
  }
}
