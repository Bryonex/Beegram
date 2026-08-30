export type MediaType = 'image' | 'video'

export interface MomentMedia {
  id: string
  momentId: string
  type: MediaType
  url: string
  posterUrl?: string // For videos
  aspectRatio?: number
  order: number
}

export interface MomentReaction {
  id: string
  momentId: string
  authorId: string
  authorName?: string
  createdAt: string
}

export interface MomentComment {
  id: string
  momentId: string
  authorId: string
  authorName?: string
  text: string
  createdAt: string
}

export interface Moment {
  id: string
  relationshipId: string
  authorId: string
  authorName?: string
  caption: string
  location?: string
  date: string // The date the moment represents, not necessarily createdAt
  media: MomentMedia[]
  isFavourite: boolean
  reactions: MomentReaction[]
  comments: MomentComment[]
  createdAt: string
  updatedAt: string
}

export type MomentInsert = Omit<Moment, 'id' | 'relationshipId' | 'createdAt' | 'updatedAt' | 'reactions' | 'comments' | 'media'> & { mediaFiles?: File[] }
