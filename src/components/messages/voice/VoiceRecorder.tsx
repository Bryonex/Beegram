import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Send, Play, Pause, Mic } from 'lucide-react'


interface Props {
  onClose: () => void
  onSend: (blob: Blob, duration: number, mimeType: string) => Promise<void> | void
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function VoiceRecorder({ onClose, onSend }: Props) {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [mimeType, setMimeType] = useState<string>('')
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const timerRef = useRef<number>(undefined)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Determine support
      let options = { mimeType: 'audio/webm' }
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options.mimeType = 'audio/mp4'
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus'
      }

      setMimeType(options.mimeType)
      const recorder = new MediaRecorder(stream, options)
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: options.mimeType })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      chunksRef.current = []
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      setDuration(0)

      timerRef.current = window.setInterval(() => {
        setDuration(d => d + 1)
      }, 1000)

    } catch (e) {
      console.error(e)
      setError('Microphone access is required to record a voice note.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
    }
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        // Use object URL
        if (!audioRef.current.src && audioBlob) {
          audioRef.current.src = URL.createObjectURL(audioBlob)
        }
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.onended = () => setIsPlaying(false)
    }
  }, [audioBlob])

  const handleSend = async () => {
    if (!audioBlob) return
    setIsSending(true)
    setError(null)
    try {
      await onSend(audioBlob, duration, mimeType)
      onClose()
    } catch (sendError) {
      console.error('Voice note send failed:', sendError)
      setError("Couldn't send voice note yet. Your recording is still here.")
    } finally {
      setIsSending(false)
    }
  }

  const handleDiscard = () => {
    if (isRecording) stopRecording()
    setAudioBlob(null)
    setDuration(0)
    setIsPlaying(false)
    chunksRef.current = []
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 z-50 bg-warmPaper/90 backdrop-blur-md flex flex-col items-center justify-center p-6 pt-safe pb-safe"
    >
      <button 
        onClick={onClose}
        className="absolute top-safe mt-4 right-4 w-12 h-12 flex items-center justify-center text-deepPlum/50 bg-black/5 rounded-full"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Visualizer Mock */}
        <div className="h-32 w-full flex items-center justify-center mb-12">
          {isRecording ? (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: ['16px', '64px', '16px'] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
                  className="w-3 bg-dustyRose rounded-full"
                />
              ))}
            </div>
          ) : audioBlob ? (
            <div className="flex items-center gap-1">
              <div className="w-full h-1 bg-dustyRose/20 rounded-full">
                <div className="h-full bg-dustyRose rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          ) : (
             <div className="text-deepPlum/30 font-serif italic text-lg">Tap to start recording</div>
          )}
        </div>

        <div className="text-4xl font-mono text-deepPlum mb-12 font-medium tracking-wider">
          {formatTime(duration)}
        </div>

        {error && <p className="w-full mb-5 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-center text-sm text-red-600">{error}</p>}

        {!audioBlob ? (
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isRecording ? 'bg-deepPlum text-white shadow-xl scale-95' : 'bg-dustyRose text-white shadow-xl shadow-dustyRose/30 hover:scale-105 active:scale-95'
            }`}
          >
            {isRecording ? <div className="w-8 h-8 bg-current rounded-sm" /> : <Mic className="w-10 h-10" />}
          </button>
        ) : (
          <div className="flex flex-col gap-4 w-full">
            <button 
              onClick={handleSend}
              disabled={isSending}
              className="w-full h-14 rounded-full bg-dustyRose text-white font-bold tracking-wide shadow-lg shadow-dustyRose/30 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Send className="w-5 h-5" /> {isSending ? 'SENDING...' : 'SEND'}
            </button>

            <div className="flex items-center gap-4 w-full">
              <button 
                onClick={handleDiscard}
                className="flex-1 h-14 rounded-full bg-blush text-deepPlum/70 font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <X className="w-5 h-5" /> Cancel
              </button>
              
              <button 
                onClick={togglePlayback}
                className="flex-1 h-14 rounded-full bg-white text-dustyRose font-medium shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                {isPlaying ? <><Pause className="w-5 h-5 fill-current" /> Pause</> : <><Play className="w-5 h-5 fill-current" /> Play</>}
              </button>
            </div>
          </div>
        )}
      </div>

      <audio ref={audioRef} className="hidden" />
    </motion.div>
  )
}
