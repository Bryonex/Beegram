import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useCurrentProfile } from './useCurrentProfile'

export function useUnreadNotifications() {
  const { profile } = useCurrentProfile()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!profile?.id) return

    const fetchUnread = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', profile.id)
        .is('read_at', null)

      setUnreadCount(count || 0)
    }

    fetchUnread()

    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${profile.id}`
        },
        () => {
          fetchUnread()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id])

  return { unreadCount }
}
