import { supabase } from '../lib/supabase'
import { requireUuid } from '../lib/ids'
import type { Moment, MomentInsert, MomentReaction, MomentComment } from '../types/moments'

async function signedMomentUrl(pathOrUrl: string | undefined): Promise<string | undefined> {
  if (!pathOrUrl || /^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  const { data, error } = await supabase.storage.from('moments').createSignedUrl(pathOrUrl, 60 * 60)
  if (error) throw error
  return data.signedUrl
}

export const momentService = {
  async getMoments(): Promise<Moment[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await (supabase as any)
      .from('moments')
      .select(`
        id, relationship_id, user_id, title, description, media_url, media_type, location, occurred_on, created_at,
        profiles!moments_user_id_fkey ( display_name ),
        moment_reactions ( id, user_id, created_at, profiles!moment_reactions_user_id_fkey ( display_name ) ),
        moment_comments ( id, author_id, content, created_at, profiles!moment_comments_author_id_fkey ( display_name ) )
      `)
      .order('created_at', { ascending: false })
    if (error) throw error

    return Promise.all((data as any[]).map(async (m) => {
      const mediaUrl = await signedMomentUrl(m.media_url)
      return {
        id: m.id,
        relationshipId: m.relationship_id,
        authorId: m.user_id,
        authorName: m.profiles?.display_name || 'Unknown',
        caption: m.description || m.title || '',
        location: m.location || undefined,
        date: m.occurred_on || m.created_at,
        isFavourite: false,
        media: mediaUrl ? [{
          id: m.id,
          momentId: m.id,
          type: m.media_type as 'image' | 'video',
          url: mediaUrl,
          order: 0,
        }] : [],
        reactions: (m.moment_reactions || []).map((reaction: any) => ({
          id: reaction.id,
          momentId: m.id,
          authorId: reaction.user_id,
          authorName: reaction.profiles?.display_name || 'Unknown',
          createdAt: reaction.created_at,
        })),
        comments: (m.moment_comments || []).map((comment: any) => ({
          id: comment.id,
          momentId: m.id,
          authorId: comment.author_id,
          authorName: comment.profiles?.display_name || 'Unknown',
          text: comment.content,
          createdAt: comment.created_at,
        })).sort((a: MomentComment, b: MomentComment) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
        createdAt: m.created_at,
        updatedAt: m.created_at,
      } as Moment
    }))
  },

  async createMoment(moment: MomentInsert): Promise<Moment> {
    const file = moment.mediaFiles?.[0]
    if (!file) throw new Error('Choose a photo or video before posting.')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    requireUuid(user.id, 'user ID')

    const { data: profile, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('relationship_id, display_name')
      .eq('id', user.id)
      .single()
    if (profileError) throw profileError
    requireUuid(profile?.relationship_id, 'relationship ID')

    const momentId = crypto.randomUUID()
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image'
    const extension = file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '') || (mediaType === 'video' ? 'mp4' : 'jpg')
    const storagePath = `${profile.relationship_id}/${momentId}/media.${extension.toLowerCase()}`

    const { error: uploadError } = await supabase.storage
      .from('moments')
      .upload(storagePath, file, { contentType: file.type, upsert: false })
    if (uploadError) throw uploadError

    const { data: row, error: insertError } = await (supabase as any)
      .from('moments')
      .insert({
        id: momentId,
        user_id: user.id,
        relationship_id: profile.relationship_id,
        title: moment.caption.trim().substring(0, 50) || null,
        description: moment.caption.trim() || null,
        media_url: storagePath,
        media_type: mediaType,
        location: moment.location || null,
        occurred_on: moment.date || null,
      })
      .select('id, relationship_id, user_id, title, description, media_url, media_type, location, occurred_on, created_at')
      .single()

    if (insertError) {
      await supabase.storage.from('moments').remove([storagePath])
      throw insertError
    }

    const mediaUrl = await signedMomentUrl(row.media_url)
    return {
      id: row.id,
      relationshipId: row.relationship_id,
      authorId: row.user_id,
      authorName: profile.display_name || 'Unknown',
      caption: row.description || row.title || '',
      location: row.location || undefined,
      date: row.occurred_on || row.created_at,
      isFavourite: false,
      media: mediaUrl ? [{ id: row.id, momentId: row.id, type: row.media_type, url: mediaUrl, order: 0 }] : [],
      reactions: [],
      comments: [],
      createdAt: row.created_at,
      updatedAt: row.created_at,
    }
  },

  async likeMoment(momentId: string): Promise<MomentReaction> {
    requireUuid(momentId, 'moment ID')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    requireUuid(user.id, 'user ID')
    const { data, error } = await (supabase as any)
      .from('moment_reactions')
      .insert({ moment_id: momentId, user_id: user.id })
      .select('id, user_id, created_at, profiles!moment_reactions_user_id_fkey ( display_name )')
      .single()
    if (error) throw error
    return {
      id: data.id,
      momentId,
      authorId: data.user_id,
      authorName: data.profiles?.display_name || 'Unknown',
      createdAt: data.created_at,
    }
  },

  async unlikeMoment(momentId: string): Promise<void> {
    requireUuid(momentId, 'moment ID')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    requireUuid(user.id, 'user ID')
    const { error } = await (supabase as any).from('moment_reactions').delete().match({ moment_id: momentId, user_id: user.id })
    if (error) throw error
  },

  async addComment(momentId: string, content: string): Promise<MomentComment> {
    requireUuid(momentId, 'moment ID')
    if (!content.trim()) throw new Error('A comment cannot be empty.')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    requireUuid(user.id, 'user ID')
    const { data, error } = await (supabase as any)
      .from('moment_comments')
      .insert({ moment_id: momentId, author_id: user.id, content: content.trim() })
      .select('id, author_id, content, created_at, profiles!moment_comments_author_id_fkey ( display_name )')
      .single()
    if (error) throw error
    return {
      id: data.id,
      momentId,
      authorId: data.author_id,
      authorName: data.profiles?.display_name || 'Unknown',
      text: data.content,
      createdAt: data.created_at,
    }
  },
}
