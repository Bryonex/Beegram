import { NavLink } from 'react-router-dom'
import { Home, MessageCircle, Heart, Gamepad2, Flower2, Bell } from 'lucide-react'
import { cn } from '../ui/Button'
import { motion } from 'framer-motion'
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications'

export function BottomNav() {
  const { unreadCount } = useUnreadNotifications()

  const navItems = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/messages', icon: MessageCircle, label: 'Messages' },
    { to: '/moments', icon: Heart, label: 'Moments' },
    { to: '/games', icon: Gamepad2, label: 'Games' },
    { to: '/garden', icon: Flower2, label: 'Garden' },
    { to: '/notifications', icon: Bell, label: 'Alerts' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-lavender-mist pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-center justify-around gap-1 px-2 h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center justify-center h-full transition-colors relative px-1",
                isActive ? "text-lavender-deep" : "text-mauveGray hover:text-lavender-soft"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -top-[1px] w-8 h-1 bg-lavender-deep rounded-b-full"
                  />
                )}
                <div className="relative">
                  <item.icon className="w-5 h-5 mb-1" strokeWidth={isActive ? 2.5 : 2} />
                  {item.to === '/notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 border border-white"></span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
