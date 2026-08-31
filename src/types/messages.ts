export interface Letter {
  id: string
  relationship_id: string
  author_id: string
  title: string
  content: string
  is_favourite: boolean
  is_draft: boolean
  created_at: string
  sent_at?: string
}

export type LetterInsert = Omit<Letter, 'id' | 'created_at' | 'sent_at'>

export interface ChatMessage {
  id: string
  relationship_id: string
  user_id: string // Sender
  recipient_id?: string
  content: string
  message_type: 'text' | 'voice'
  audio_url?: string
  duration_seconds?: number
  edited_at?: string
  created_at: string
  delivered_at?: string
  read_at?: string
}

export type ChatMessageInsert = Omit<ChatMessage, 'id' | 'created_at' | 'delivered_at' | 'read_at'>

export interface VoiceNote {
  id: string
  relationship_id: string
  author_id: string
  duration_seconds: number
  audio_url: string // Path to storage
  is_favourite: boolean
  created_at: string
}

export type VoiceNoteInsert = Omit<VoiceNote, 'id' | 'created_at' | 'audio_url'> & { file: Blob }

export interface BuzzPattern {
  type: 'Heartbeat' | 'I Miss You' | 'Hello' | 'Custom'
  sequence: { duration: number, isPress: boolean }[] // Normalised timings in ms
}

export interface Buzz {
  id: string
  relationship_id: string
  sender_id: string
  pattern: BuzzPattern
  created_at: string
}

export type BuzzInsert = Omit<Buzz, 'id' | 'created_at'>

export interface AppNotification {
  id: string
  relationship_id: string
  recipient_id: string
  sender_id: string
  type: string
  message: string
  created_at: string
  read_at?: string
}

export type AppNotificationInsert = Omit<AppNotification, 'id' | 'created_at' | 'read_at'>

