import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Song } from '../../types/music'
import { SongCard } from './SongCard'

interface Props {
  songs: Song[]
}

type Tab = 'Her Favourites' | 'Our Songs' | 'All Songs'

export function SongList({ songs }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('All Songs')

  const filteredSongs = songs.filter(song => {
    if (activeTab === 'Her Favourites') return song.category === 'Her Favourites'
    if (activeTab === 'Our Songs') return song.category === 'Our Songs'
    return true
  })

  return (
    <div className="w-full mt-6">
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {(['All Songs', 'Her Favourites', 'Our Songs'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm transition-colors ${
              activeTab === tab 
                ? 'bg-lavender-pale text-midnightPlum font-medium shadow-sm' 
                : 'bg-lavender-dark/20 text-lavender-mist/80 hover:bg-lavender-dark/40 hover:text-lavender-mist'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3 min-h-[300px]">
        <AnimatePresence mode="popLayout">
          {filteredSongs.length > 0 ? (
            filteredSongs.map((song) => (
              <motion.div
                key={song.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <SongCard song={song} queueContext={filteredSongs} />
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full py-12 flex flex-col items-center justify-center text-center px-6"
            >
              <p className="text-lavender-pale/50 font-serif italic mb-2">No songs in this collection yet.</p>
              <p className="text-xs text-lavender-pale/30">A quiet space waiting for music.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
