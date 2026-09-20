import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Bell, Heart, Music, Image as ImageIcon, MessageCircle, Sprout, Mail, Loader2 } from 'lucide-react'
import { notificationService, type AppNotification } from '../services/notificationService'
import { useCurrentProfile } from '../hooks/useCurrentProfile'
import { supabase } from '../lib/supabase'

export default function Notifications() {
  const navigate = useNavigate()
  const { profile } = useCurrentProfile()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  const loadNotifications = async () => {
    if (!profile?.id) return
    try {
      setNotifications(await notificationService.getNotifications(profile.id))
    } catch (error) {
      console.error('Failed to load notifications', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    if (!profile?.id) return

    const channel = supabase
      .channel(`notifications-page:${profile.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${profile.id}`
      }, () => {
        void loadNotifications()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [profile?.id])

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    await notificationService.markAsRead(id)
  }

  const markAllAsRead = async () => {
    if (!profile?.id) return
    await notificationService.markAllAsRead(profile.id)
    setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })))
  }

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'message': return <MessageCircle className="w-5 h-5 text-dustyRose" />
      case 'buzz': return <Bell className="w-5 h-5 text-rose-dusty" />
      case 'song': return <Music className="w-5 h-5 text-lavender-deep" />
      case 'moment':
      case 'moment_like':
      case 'moment_comment': return <ImageIcon className="w-5 h-5 text-sage" />
      case 'garden': return <Sprout className="w-5 h-5 text-sage" />
      case 'letter': return <Mail className="w-5 h-5 text-dustyRose" />
      default: return <Heart className="w-5 h-5 text-dustyRose" />
    }
  }

  const formatTime = (date: string) => new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  return (
    <div className="w-full min-h-[100dvh] bg-warmPaper flex flex-col relative overflow-hidden pt-safe pb-24">
      
      {/* Atmosphere Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-lavender-soft/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blush/20 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

      {/* Header */}
      <div className="px-5 pt-6 pb-2 sticky top-0 bg-warmPaper/80 backdrop-blur-md z-20 flex items-center justify-between border-b border-lavender-mist/50">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-deepPlum/70 hover:text-deepPlum transition-colors"
        >
          <ChevronLeft className="w-5 h-5 -ml-0.5" />
        </button>
        <h1 className="text-xl font-serif text-deepPlum font-medium">Notifications</h1>
        <button onClick={markAllAsRead} className="text-xs text-deepPlum/60 hover:text-deepPlum">Mark all read</button>
      </div>

      <div className="flex-1 px-5 pt-6 relative z-10 space-y-4">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-deepPlum/50" /></div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Bell className="w-12 h-12 text-lavender-mist mb-4" />
            <p className="text-deepPlum/50">It's quiet in Beegram...</p>
          </div>
        ) : (
          notifications.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => void markAsRead(notif.id)}
              className={`p-4 rounded-3xl flex items-start gap-4 border transition-colors cursor-pointer
                ${notif.read_at
                  ? 'bg-white/40 border-transparent' 
                  : 'bg-white border-lavender-mist/50 shadow-sm'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                ${notif.read_at ? 'bg-lavender-mist/30' : 'bg-lavender-mist'}`}
              >
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 pt-1">
                <p className={`text-sm ${notif.read_at ? 'text-deepPlum/70' : 'text-deepPlum font-medium'}`}>
                  {notif.title}
                </p>
                {notif.body && <p className="text-xs text-deepPlum/60 mt-1">{notif.body}</p>}
                <p className="text-xs text-deepPlum/60 mt-1">{formatTime(notif.created_at)}</p>
              </div>
              {!notif.read_at && (
                <div className="w-2 h-2 bg-dustyRose rounded-full mt-2" />
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
