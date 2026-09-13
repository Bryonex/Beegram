import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import type { Song } from '../types/music'
import { musicService } from '../services/musicService'
import { MusicPlayer } from '../components/music/MusicPlayer'
import { SongList } from '../components/music/SongList'
import { SongUploader } from '../components/music/SongUploader'
import { useCurrentProfile } from '../hooks/useCurrentProfile'

export default function Songs() {
  const { profile } = useCurrentProfile()
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  const loadSongs = async () => {
    if (!profile?.relationship_id) return
    try {
      const data = await musicService.getSongs(profile.relationship_id)
      setSongs(data)
    } catch (err) {
      console.error('Failed to load songs', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSongs()
  }, [profile?.relationship_id])

  return (
    <div className="min-h-screen bg-midnightPlum pt-safe relative pb-10">
      
      {/* Background Texture/Glow (Subtle) */}
      <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-lavender-dark/20 to-transparent pointer-events-none" />

      <div className="px-5 pt-8 relative z-10 space-y-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start"
        >
          <div>
            <h1 className="text-3xl font-serif text-lavender-mist font-medium tracking-tight mb-1">Our Songs</h1>
            <p className="text-lavender-pale/80 text-sm font-sans">A little collection that belongs here.</p>
            <p className="text-[10px] text-lavender-pale/40 mt-1 font-serif italic tracking-wider">#ourlittleplaylist</p>
          </div>
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="px-4 py-2 rounded-full bg-lavender-dark/30 border border-lavender-dark/50 flex items-center justify-center text-lavender-pale hover:bg-lavender-dark/50 transition-colors shadow-soft shrink-0 gap-2"
            onClick={() => setIsUploading(true)}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Song</span>
          </motion.button>
        </motion.div>

        {/* Featured Player */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <MusicPlayer />
        </motion.div>

        {/* Collections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {loading ? (
            <div className="w-full flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-lavender-pale/30 border-t-lavender-pale rounded-full animate-spin" />
            </div>
          ) : (
            <SongList songs={songs} />
          )}
        </motion.div>

      </div>

      <AnimatePresence>
        {isUploading && (
          <SongUploader 
            onClose={() => setIsUploading(false)} 
            onSongAdded={(song) => setSongs(prev => [song, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
