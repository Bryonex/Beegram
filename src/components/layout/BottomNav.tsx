import { NavLink, useLocation } from 'react-router-dom'
import { Home, MessageCircle, Heart, Gamepad2, Flower2 } from 'lucide-react'
import { cn } from '../ui/Button'
import { motion } from 'framer-motion'

export function BottomNav() {
  const location = useLocation()
  
  // Theme colors based on current route
  const getNavTheme = (path: string) => {
    if (path.startsWith('/home')) return { bg: 'bg-indigo-50/90 border-indigo-100', active: 'text-indigo-600', activeBg: 'bg-indigo-100/50' }
    if (path.startsWith('/messages')) return { bg: 'bg-rose-50/90 border-rose-100', active: 'text-rose-600', activeBg: 'bg-rose-100/50' }
    if (path.startsWith('/moments')) return { bg: 'bg-pink-50/90 border-pink-100', active: 'text-pink-600', activeBg: 'bg-pink-100/50' }
    if (path.startsWith('/games')) return { bg: 'bg-amber-50/90 border-amber-100', active: 'text-amber-600', activeBg: 'bg-amber-100/50' }
    if (path.startsWith('/garden')) return { bg: 'bg-emerald-50/90 border-emerald-100', active: 'text-emerald-600', activeBg: 'bg-emerald-100/50' }
    if (path.startsWith('/songs')) return { bg: 'bg-slate-900/90 border-slate-800', active: 'text-indigo-400', activeBg: 'bg-slate-800/50' }
    return { bg: 'bg-white/90 border-lavender-mist', active: 'text-purple-600', activeBg: 'bg-purple-50' }
  }

  const theme = getNavTheme(location.pathname)

  const navItems = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/messages', icon: MessageCircle, label: 'Messages' },
    { to: '/moments', icon: Heart, label: 'Moments' },
    { to: '/games', icon: Gamepad2, label: 'Games' },
    { to: '/garden', icon: Flower2, label: 'Garden' },
  ]

  return (
    <nav className={cn("fixed bottom-0 left-0 right-0 z-[100] backdrop-blur-md border-t pb-[env(safe-area-inset-bottom)] transition-colors duration-500", theme.bg)}>
      <div className="mx-auto flex max-w-md items-center justify-around gap-1 px-2 h-16">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to)
          const isSongsPage = location.pathname.startsWith('/songs')
          const inactiveColor = isSongsPage ? 'text-slate-400 hover:text-slate-300' : 'text-slate-400 hover:text-slate-500'
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-1 flex-col items-center justify-center h-full relative px-1 rounded-2xl mx-0.5 transition-all duration-300",
                isActive ? theme.activeBg : ""
              )}
            >
              <motion.div 
                className={cn(
                  "relative flex flex-col items-center justify-center w-full py-1",
                  isActive ? theme.active : inactiveColor
                )}
                animate={{ 
                  scale: isActive ? 1.05 : 1,
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
