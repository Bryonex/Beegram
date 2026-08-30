import { motion } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Download, Heart } from 'lucide-react'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'

function formatTime(seconds: number) {
  if (isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function PlayerControls() {
  const { 
    currentTrack, 
    isPlaying, 
    isBuffering, 
    play, 
    pause, 
    next, 
    previous,
    currentTime,
    duration,
    seek
  } = useAudioPlayer()

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value))
  }

  const handleDownload = async () => {
    if (!currentTrack) return
    try {
      const url = currentTrack.audioUrl
      const a = document.createElement('a')
      a.href = url
      a.download = currentTrack.title
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download failed', err)
    }
  }

  if (!currentTrack) return null

  return (
    <div className="w-full space-y-5 px-2">
      {/* Scrubber / Progress */}
      <div className="w-full space-y-1">
        <div className="relative w-full h-1 bg-midnightPlum/40 rounded-full flex items-center">
          <input 
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div 
            className="absolute left-0 h-full bg-lavender-pale rounded-full pointer-events-none"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
          {/* Thumb */}
          <div 
            className="absolute h-3 w-3 bg-white rounded-full shadow pointer-events-none transition-transform"
            style={{ 
              left: `calc(${duration ? (currentTime / duration) * 100 : 0}% - 6px)`,
              transform: isBuffering ? 'scale(0.8)' : 'scale(1)'
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-sans text-lavender-pale/60 tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-between w-full">
        <button 
          onClick={handleDownload}
          className="w-10 h-10 flex items-center justify-center text-lavender-pale/50 hover:text-lavender-pale transition-colors"
        >
          <Download className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-6">
          <button 
            onClick={previous}
            className="w-10 h-10 flex items-center justify-center text-lavender-mist active:text-lavender-pale transition-colors"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>

          <motion.button 
            whileTap={{ scale: 0.92 }}
            onClick={isPlaying ? pause : play}
            className="w-16 h-16 flex items-center justify-center bg-lavender-pale rounded-full text-midnightPlum shadow-[0_0_20px_rgba(216,200,240,0.15)]"
          >
            {isBuffering ? (
              <div className="w-5 h-5 border-2 border-midnightPlum/30 border-t-midnightPlum rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </motion.button>

          <button 
            onClick={next}
            className="w-10 h-10 flex items-center justify-center text-lavender-mist active:text-lavender-pale transition-colors"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
        </div>

        <button className="w-10 h-10 flex items-center justify-center text-lavender-pale/50 hover:text-rose-pink transition-colors">
          <Heart className={`w-5 h-5 ${currentTrack.isFavourite ? 'fill-rose-pink text-rose-pink' : ''}`} />
        </button>
      </div>
    </div>
  )
}
