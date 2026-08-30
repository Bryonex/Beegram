import { motion } from 'framer-motion'
import { Music } from 'lucide-react'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'
import { PlayerControls } from './PlayerControls'

export function MusicPlayer() {
  const { currentTrack, isPlaying } = useAudioPlayer()

  if (!currentTrack) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 text-lavender-dark/40 border border-lavender-dark/20 rounded-[2rem] border-dashed">
        <Music className="w-12 h-12 mb-3 opacity-50" />
        <p className="font-serif text-sm">Select a song to play</p>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center mt-2">
      
      {/* Album Artwork */}
      <motion.div 
        animate={{ 
          y: isPlaying ? [0, -3, 0] : 0 
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="w-56 h-56 md:w-64 md:h-64 rounded-[2rem] bg-lavender-dark/20 shadow-float overflow-hidden flex items-center justify-center relative mb-8"
      >
        {currentTrack.coverUrl ? (
          <img src={currentTrack.coverUrl} alt="Album Art" className="w-full h-full object-cover" />
        ) : (
          <Music className="w-16 h-16 text-lavender-pale/20" />
        )}
      </motion.div>

      {/* Title & Metadata */}
      <div className="text-center px-4 w-full mb-8">
        <h2 className="text-2xl font-serif text-lavender-mist font-medium mb-1 truncate">{currentTrack.title}</h2>
        <p className="text-lavender-pale/80 text-sm font-sans uppercase tracking-[0.15em] truncate">{currentTrack.artist}</p>
        
        <div className="flex items-center justify-center gap-2 mt-4 text-[10px] uppercase tracking-widest font-medium">
          <span className={`px-2 py-0.5 rounded-full ${
            currentTrack.addedBy === 'Her' 
              ? 'bg-rose-pink/15 text-rose-pink'
              : 'bg-lavender-pale/10 text-lavender-pale'
          }`}>
            Added by {currentTrack.addedBy}
          </span>
        </div>
        
        {currentTrack.note && (
          <div className="mt-4 text-center px-6">
            <p className="font-serif italic text-lavender-pale/60 text-sm leading-snug">
              “{currentTrack.note}”
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <PlayerControls />
    </div>
  )
}
