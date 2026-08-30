export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          partner_id: string | null
          relationship_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          partner_id?: string | null
          relationship_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          partner_id?: string | null
          relationship_id?: string | null
          created_at?: string
        }
      }
      relationships: {
        Row: {
          id: string
          started_at: string
          created_at: string
        }
        Insert: {
          id?: string
          started_at: string
          created_at?: string
        }
        Update: {
          id?: string
          started_at?: string
          created_at?: string
        }
      }
    }
  }
}
