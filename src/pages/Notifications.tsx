import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Bell, Heart, Music, Image as ImageIcon } from 'lucide-react'

interface Notification {
  id: string
  type: 'message' | 'song' | 'moment' | 'buzz'
  title: string
  time: string
  isRead: boolean
}

export default function Notifications() {
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', type: 'message', title: 'New message from her', time: '2m ago', isRead: false },
    { id: '2', type: 'buzz', title: 'She sent a Buzz', time: '15m ago', isRead: false },
    { id: '3', type: 'song', title: 'She added a new song', time: '1h ago', isRead: false },
    { id: '4', type: 'moment', title: 'A new moment was saved', time: 'Yesterday', isRead: true },
  ])

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message': return <Heart className="w-5 h-5 text-dustyRose" />
      case 'buzz': return <Bell className="w-5 h-5 text-rose-dusty" />
      case 'song': return <Music className="w-5 h-5 text-lavender-deep" />
      case 'moment': return <ImageIcon className="w-5 h-5 text-sage" />
    }
  }

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
        <div className="w-10 h-10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-deepPlum/40" />
        </div>
      </div>

      <div className="flex-1 px-5 pt-6 relative z-10 space-y-4">
        {notifications.length === 0 ? (
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
              onClick={() => markAsRead(notif.id)}
              className={`p-4 rounded-3xl flex items-start gap-4 border transition-colors cursor-pointer
                ${notif.isRead 
                  ? 'bg-white/40 border-transparent' 
                  : 'bg-white border-lavender-mist/50 shadow-sm'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                ${notif.isRead ? 'bg-lavender-mist/30' : 'bg-lavender-mist'}`}
              >
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 pt-1">
                <p className={`text-sm ${notif.isRead ? 'text-deepPlum/70' : 'text-deepPlum font-medium'}`}>
                  {notif.title}
                </p>
                <p className="text-xs text-deepPlum/60 mt-1">{notif.time}</p>
              </div>
              {!notif.isRead && (
                <div className="w-2 h-2 bg-dustyRose rounded-full mt-2" />
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
