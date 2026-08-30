export type SongCategory = 'Her Favourites' | 'Our Songs' | 'Shared' | 'Other'
export type AddedBy = 'Her' | 'You' | 'Shared'

export interface Song {
  id: string
  title: string
  artist: string
  audioUrl: string
  coverUrl?: string
  addedBy: AddedBy | string
  addedByName?: string
  authorId?: string
  category: SongCategory | string
  note?: string
  isFavourite: boolean
  duration?: number // in seconds
  createdAt: string
  relationshipId: string
}

export interface AudioPlaybackState {
  isPlaying: boolean
  isBuffering: boolean
  isError: boolean
  duration: number
  currentTime: number
  volume: number
}

// Prepare types for future Supabase inserts
export type SongInsert = Omit<Song, 'id' | 'createdAt'>
