import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X } from 'lucide-react'
import type { Buzz } from '../../../types/messages'
import { messageService } from '../../../services/messageService'
import { useCurrentProfile } from '../../../hooks/useCurrentProfile'

// Component intended to be mounted at the root level or layout level to listen for incoming Buzzes.
// For now, we mock the reception by fetching recent buzzes on mount and showing the latest if unread.
// In the final app, this hooks into Supabase Realtime channel.

export function BuzzReceiver() {
  const [incomingBuzz, setIncomingBuzz] = useState<Buzz | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPressState, setIsPressState] = useState(false)

  const { profile, partner } = useCurrentProfile()

  useEffect(() => {
    // Mock realtime reception check
    if (!profile?.relationship_id) return
    messageService.getBuzzes(profile.relationship_id).then(buzzes => {
      // Find a buzz from partner that is very recent
      const recent = buzzes.find(b => b.sender_id !== profile.id && (Date.now() - new Date(b.created_at).getTime()) < 60000 * 60 * 24) // just for demo
      if (recent) {
        // In real app, we wouldn't auto-show a 24hr old buzz unless unread flag was used
        // setIncomingBuzz(recent)
      }
    })
  }, [profile?.relationship_id, profile?.id])

  const replay = async () => {
    if (!incomingBuzz) return
    setIsPlaying(true)
    const seq = incomingBuzz.pattern.sequence

    // Extract vibration pattern for supported devices
    const vibePattern: number[] = []
    seq.forEach(s => vibePattern.push(s.duration))
    
    if (navigator.vibrate) {
      navigator.vibrate(vibePattern)
    }

    // Visual playback
    for (const step of seq) {
      setIsPressState(step.isPress)
      await new Promise(r => setTimeout(r, step.duration))
    }
    setIsPressState(false)
    setIsPlaying(false)
  }

  if (!incomingBuzz) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
      >
        <button 
          onClick={() => setIncomingBuzz(null)}
          className="absolute top-safe mt-4 right-4 w-12 h-12 flex items-center justify-center text-white/50 bg-white/10 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center">
          <p className="text-white/80 font-serif text-lg mb-8">
            {partner?.display_name || 'Your partner'} sent you a Buzz
          </p>

          <div className="relative mb-12">
            <motion.div 
              animate={{ 
                scale: isPressState ? 1.2 : 1, 
                opacity: isPressState ? 0.8 : 0 
              }}
              className="absolute inset-0 bg-dustyRose rounded-full blur-3xl"
            />
            
            <motion.div
              animate={{
                scale: isPressState ? 0.9 : 1,
                backgroundColor: isPressState ? '#C9798C' : '#E8A8B8'
              }}
              className="w-40 h-40 rounded-full bg-dustyRose shadow-xl shadow-dustyRose/20 flex items-center justify-center relative z-10 border-4 border-white/50"
            >
              <Heart className={`w-14 h-14 transition-colors ${isPressState ? 'fill-white text-white' : 'text-white'}`} strokeWidth={1.5} />
            </motion.div>
          </div>

          <button 
            onClick={replay}
            disabled={isPlaying}
            className="px-8 py-3 rounded-full bg-white text-deepPlum font-medium active:scale-95 transition-transform disabled:opacity-50"
          >
            {isPlaying ? 'Playing...' : 'Feel it again'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
