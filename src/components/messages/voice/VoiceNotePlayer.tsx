import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Download } from 'lucide-react'
import type { VoiceNote } from '../../../types/messages'

interface Props {
  note: VoiceNote
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function VoiceNotePlayer({ note }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0)
    }
    
    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('pause', () => setIsPlaying(false))
    audio.addEventListener('play', () => setIsPlaying(true))

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('pause', () => setIsPlaying(false))
      audio.removeEventListener('play', () => setIsPlaying(true))
    }
  }, [])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        // Stop any other voice notes
        document.querySelectorAll('audio.voice-note-audio').forEach(el => {
          if (el instanceof HTMLAudioElement && el !== audioRef.current) {
            el.pause()
          }
        })
        audioRef.current.play().catch(e => console.error("Playback failed", e))
      }
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    audioRef.current.currentTime = percentage * audioRef.current.duration
  }

  return (
    <div className="w-full bg-white/60 backdrop-blur-sm p-4 rounded-3xl border border-blush/50 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-dustyRose text-white flex items-center justify-center shrink-0 shadow-md shadow-dustyRose/20 active:scale-95 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
          <div>
            <p className="font-serif text-deepPlum text-sm font-medium">
              {note.author_id}
            </p>
            <p className="text-[10px] font-sans uppercase tracking-widest text-deepPlum/50 mt-0.5">
              {new Date(note.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <a href={note.audio_url} download={`voicenote-${note.id}.webm`} className="w-8 h-8 flex items-center justify-center text-deepPlum/30 hover:text-deepPlum/60">
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[10px] font-medium text-deepPlum/60 font-mono w-8 text-right">
          {formatTime(audioRef.current?.currentTime || 0)}
        </span>
        
        <div 
          className="flex-1 h-8 flex items-center cursor-pointer group"
          onClick={handleSeek}
        >
          <div className="w-full h-1.5 bg-blush/40 rounded-full overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 bottom-0 bg-dustyRose transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <span className="text-[10px] font-medium text-deepPlum/60 font-mono w-8">
          {formatTime(note.duration_seconds)}
        </span>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={note.audio_url} className="voice-note-audio hidden" preload="metadata" />
    </div>
  )
}
