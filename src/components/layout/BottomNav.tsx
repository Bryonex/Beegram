import { NavLink, useLocation } from 'react-router-dom'
import { Home, MessageCircle, Heart, Gamepad2, Flower2 } from 'lucide-react'
import { cn } from '../ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

export function BottomNav() {
  const location = useLocation()
  
  const navItems = [
    { to: '/home', icon: Home, label: 'Home', color: 'text-purple-500', bg: 'bg-purple-500' },
    { to: '/messages', icon: MessageCircle, label: 'Messages', color: 'text-pink-400', bg: 'bg-pink-400' },
    { to: '/moments', icon: Heart, label: 'Moments', color: 'text-rose-500', bg: 'bg-rose-500' },
    { to: '/games', icon: Gamepad2, label: 'Games', color: 'text-amber-500', bg: 'bg-amber-500' },
    { to: '/garden', icon: Flower2, label: 'Garden', color: 'text-emerald-500', bg: 'bg-emerald-500' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-lavender-mist pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-center justify-around gap-1 px-2 h-16">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-1 flex-col items-center justify-center h-full transition-colors relative px-1",
                isActive ? item.color : "text-mauveGray hover:text-lavender-soft"
              )}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className={cn("absolute top-0 w-8 h-1 rounded-b-full", item.bg)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </AnimatePresence>
              <motion.div 
                className="relative flex flex-col items-center justify-center"
                animate={{ 
                  scale: isActive ? 1.15 : 1,
                  y: isActive ? -2 : 0
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <item.icon className="w-5 h-5 mb-1" strokeWidth={isActive ? 2.5 : 2} />
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
