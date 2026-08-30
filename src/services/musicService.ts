import { supabase } from '../lib/supabase'
import { requireUuid } from '../lib/ids'
import type { Song, SongInsert } from '../types/music'

async function signedMusicUrl(pathOrUrl: string | undefined): Promise<string | undefined> {
  if (!pathOrUrl || /^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  const { data, error } = await supabase.storage.from('music').createSignedUrl(pathOrUrl, 60 * 60)
  if (error) throw error
  return data.signedUrl
}

export const musicService = {
  async getSongs(relationshipId: string): Promise<Song[]> {
    requireUuid(relationshipId, 'relationship ID')
    const { data, error } = await (supabase as any)
      .from('songs')
      .select('*, profiles:added_by (username, display_name)')
      .eq('relationship_id', relationshipId)
      .order('created_at', { ascending: false })
    if (error) throw error

    const songs = await Promise.all((data as any[]).map(async (song) => ({
      id: song.id,
      relationshipId: song.relationship_id,
      title: song.title,
      artist: song.artist,
      audioUrl: (await signedMusicUrl(song.audio_url)) || '',
      coverUrl: await signedMusicUrl(song.cover_url),
      addedBy: song.profiles?.username || 'Unknown',
      addedByName: song.profiles?.display_name || undefined,
      authorId: song.added_by,
      category: song.category || 'Our Songs',
      note: song.note || undefined,
      isFavourite: Boolean(song.is_favourite),
      createdAt: song.created_at || song.added_at,
    })))
    return songs as Song[]
  },

  async uploadSongFile(file: File, relationshipId: string, userId: string): Promise<string> {
    requireUuid(relationshipId, 'relationship ID')
    requireUuid(userId, 'user ID')
    const extension = file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '') || 'mp3'
    const fileName = `${relationshipId}/${userId}/${crypto.randomUUID()}.${extension.toLowerCase()}`
    const { error } = await supabase.storage
      .from('music')
      .upload(fileName, file, { contentType: file.type || 'audio/mpeg', upsert: false })
    if (error) throw error
    return fileName
  },

  async uploadSongCover(file: File, relationshipId: string, userId: string): Promise<string> {
    requireUuid(relationshipId, 'relationship ID')
    requireUuid(userId, 'user ID')
    const extension = file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '') || 'jpg'
    const fileName = `${relationshipId}/${userId}/cover-${crypto.randomUUID()}.${extension.toLowerCase()}`
    const { error } = await supabase.storage
      .from('music')
      .upload(fileName, file, { contentType: file.type || 'image/jpeg', upsert: false })
    if (error) throw error
    return fileName
  },

  async addSong(song: Omit<SongInsert, 'id' | 'createdAt'>): Promise<Song> {
    requireUuid(song.relationshipId, 'relationship ID')
    requireUuid(song.authorId, 'author ID')
    const { data, error } = await (supabase as any)
      .from('songs')
      .insert({
        relationship_id: song.relationshipId,
        user_id: song.authorId,
        title: song.title,
        artist: song.artist,
        audio_url: song.audioUrl,
        cover_url: song.coverUrl || null,
        added_by: song.authorId,
        category: song.category,
        note: song.note || null,
        is_favourite: song.isFavourite,
      })
      .select('*, profiles:added_by (username, display_name)')
      .single()
    if (error) throw error
    return {
      id: data.id,
      relationshipId: data.relationship_id,
      title: data.title,
      artist: data.artist,
      audioUrl: (await signedMusicUrl(data.audio_url)) || '',
      coverUrl: await signedMusicUrl(data.cover_url),
      addedBy: data.profiles?.username || 'Unknown',
      addedByName: data.profiles?.display_name || undefined,
      authorId: data.added_by,
      category: data.category || 'Our Songs',
      note: data.note || undefined,
      isFavourite: Boolean(data.is_favourite),
      createdAt: data.created_at || data.added_at,
    } as Song
  },
}
