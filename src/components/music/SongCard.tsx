import { motion } from 'framer-motion'
import { Play, Music, Heart } from 'lucide-react'
import type { Song } from '../../types/music'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'

interface Props {
  song: Song
  queueContext: Song[] // the list context this song was played from
}

export function SongCard({ song, queueContext }: Props) {
  const { currentTrack, isPlaying, playTrack, pause } = useAudioPlayer()

  const isCurrent = currentTrack?.id === song.id

  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        if (isCurrent && isPlaying) {
          pause()
        } else {
          playTrack(song, queueContext)
        }
      }}
      className={`w-full p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-colors border border-lavender-dark/20 ${
        isCurrent ? 'bg-lavender-dark/40 border-lavender-mist/30' : 'bg-lavender-dark/10 hover:bg-lavender-dark/30'
      }`}
    >
      <div className="w-12 h-12 shrink-0 rounded-xl bg-lavender-dark/30 flex items-center justify-center overflow-hidden relative">
        {song.coverUrl ? (
          <img src={song.coverUrl} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <Music className="w-5 h-5 text-lavender-pale/30" />
        )}
        
        {/* Play Overlay */}
        <div className={`absolute inset-0 bg-midnightPlum/40 flex items-center justify-center transition-opacity ${isCurrent && isPlaying ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex gap-0.5 items-end h-3">
             <div className="w-1 bg-lavender-pale animate-pulse h-2" />
             <div className="w-1 bg-lavender-pale animate-pulse h-3" style={{ animationDelay: '0.1s' }} />
             <div className="w-1 bg-lavender-pale animate-pulse h-1.5" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <h3 className={`text-[15px] font-serif truncate leading-tight ${isCurrent ? 'text-lavender-mist' : 'text-lavender-pale'}`}>
          {song.title}
        </h3>
        <p className="text-[10px] uppercase tracking-wider text-lavender-mist/70 font-sans truncate mt-0.5">
          {song.artist}
        </p>
        
        {/* Small Badges / Notes */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-[8px] uppercase tracking-widest font-medium px-1.5 py-0.5 rounded-sm ${
            'bg-lavender-pale/10 text-lavender-pale/80'
          }`}>
            By {song.addedByName || song.addedBy}
          </span>
          {song.note && (
             <span className="text-[9px] font-serif italic text-lavender-mist/60 truncate">
               "{song.note}"
             </span>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center pr-1">
        {song.isFavourite && (
          <Heart className="w-4 h-4 fill-rose-pink text-rose-pink mr-3" />
        )}
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
          <Play className="w-4 h-4 text-lavender-mist ml-0.5" />
        </div>
      </div>
    </motion.div>
  )
}
