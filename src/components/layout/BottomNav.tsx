import { NavLink, useLocation } from 'react-router-dom'
import { Home, MessageCircle, Heart, Gamepad2, Flower2 } from 'lucide-react'
import { cn } from '../ui/Button'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useCurrentProfile } from '../../hooks/useCurrentProfile'
import { messageService } from '../../services/messageService'
import { supabase } from '../../lib/supabase'

export function BottomNav() {
  const location = useLocation()
  const { profile } = useCurrentProfile()
  const [unreadCount, setUnreadCount] = useState(0)
  
  useEffect(() => {
    if (!profile?.id || !profile?.relationship_id) return
    
    const checkUnread = async () => {
      try {
        const count = await messageService.getUnreadCount(profile.relationship_id!, profile.id)
        setUnreadCount(count)
      } catch (err) {
        console.error('Failed to check unread messages', err)
      }
    }
    
    checkUnread()
    
    // Subscribe to new messages
    const channel = supabase.channel('bottom_nav_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${profile.id}` }, () => {
        checkUnread()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `recipient_id=eq.${profile.id}` }, () => {
        checkUnread()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'letters', filter: `relationship_id=eq.${profile.relationship_id}` }, () => {
        checkUnread()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'letters', filter: `relationship_id=eq.${profile.relationship_id}` }, () => {
        checkUnread()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id, profile?.relationship_id])

  const navItems = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/messages', icon: MessageCircle, label: 'Messages', badge: unreadCount > 0 },
    { to: '/moments', icon: Heart, label: 'Moments' },
    { to: '/games', icon: Gamepad2, label: 'Games' },
    { to: '/garden', icon: Flower2, label: 'Garden' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-[#FFFBF0]/80 backdrop-blur-md border-t border-rose-base/30 pb-[env(safe-area-inset-bottom)] transition-colors duration-500">
      <div className="mx-auto flex max-w-md items-center justify-around gap-1 px-2 h-16">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to)
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-1 flex-col items-center justify-center h-full relative px-1 rounded-2xl mx-0.5 transition-all duration-300",
                isActive ? "bg-rose-plum/5" : ""
              )}
            >
              <motion.div 
                className={cn(
                  "relative flex flex-col items-center justify-center w-full py-1",
                  isActive ? "text-rose-plum" : "text-rose-dusty hover:text-rose-dusty/80"
                )}
                animate={{ 
                  scale: isActive ? 1.05 : 1,
                  y: isActive ? -2 : 0
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5 mb-1" strokeWidth={isActive ? 2.5 : 2} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  )}
                </div>
                <motion.span 
                  className="text-[10px] font-medium leading-none"
                  animate={{ opacity: isActive ? 1 : 0.7 }}
                >
                  {item.label}
                </motion.span>
              </motion.div>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
