import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { MiniPlayer } from '../music/MiniPlayer'
import { AnimatePresence, motion } from 'framer-motion'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'
import type { CSSProperties } from 'react'

export function AppShell() {
  const location = useLocation()
  const { currentTrack, isMiniPlayerMinimized } = useAudioPlayer()
  
  // Login is the only public application screen. The root route is still
  // guarded, so it must not suppress the private shell while it resolves.
  const isAuth = location.pathname === '/login'

  const isMiniPlayerVisible = currentTrack && !isMiniPlayerMinimized && location.pathname !== '/songs'
  const layoutVars = {
    '--beegram-nav-offset': 'calc(4rem + env(safe-area-inset-bottom))',
    '--beegram-composer-offset': isMiniPlayerVisible
      ? 'calc(9.5rem + env(safe-area-inset-bottom))'
      : 'calc(4rem + env(safe-area-inset-bottom))',
    '--beegram-content-offset': isMiniPlayerVisible
      ? 'calc(10rem + env(safe-area-inset-bottom))'
      : 'calc(5rem + env(safe-area-inset-bottom))',
  } as CSSProperties

  return (
    <div className="w-full min-h-dvh bg-warmPaper relative" style={layoutVars}>
      <main
        className={`w-full ${isAuth ? 'max-w-none' : 'max-w-md mx-auto'} relative`}
        style={{ paddingBottom: isAuth ? 0 : 'var(--beegram-content-offset)' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="min-h-dvh flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      {!isAuth && (
        <>
          <MiniPlayer />
          <BottomNav />
        </>
      )}
    </div>
  )
}
