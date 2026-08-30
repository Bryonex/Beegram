import { useState, useEffect } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useCurrentProfile } from '../../../hooks/useCurrentProfile'
import { messageService } from '../../../services/messageService'
import { gardenService } from '../../../services/gardenService'

export function BuzzPad() {
  const { profile } = useCurrentProfile()
  const currentUserId = profile?.id
  const relationshipId = profile?.relationship_id
  
  const [cooldown, setCooldown] = useState(0)
  const [isPressing, setIsPressing] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pulseControls = useAnimationControls()

  useEffect(() => {
    // Start pulsing indefinitely
    pulseControls.start({
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    })
  }, [pulseControls])

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handlePress = async () => {
    if (cooldown > 0) return

    setIsPressing(true)
    setError(null)
    
    // Vibrate if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }

    try {
      if (!currentUserId || !relationshipId) {
        throw new Error("Missing relationship profile")
      }

      await messageService.sendBuzz({ 
        sender_id: currentUserId, 
        relationship_id: relationshipId,
        pattern: {
          type: 'Heartbeat',
          sequence: [
            { duration: 100, isPress: true },
            { duration: 50, isPress: false },
            { duration: 100, isPress: true }
          ]
        }
      })
      
      // create notification
      if (profile?.partner_id) {
        await messageService.createNotification({
          relationship_id: relationshipId,
          recipient_id: profile.partner_id,
          sender_id: currentUserId,
          type: 'buzz',
          message: `${profile.display_name} misses you`
        })
      }
      
      // unlock achievement
      gardenService.checkAndUnlockAchievement(
        relationshipId,
        currentUserId,
        'Sunflower',
        'First Buzz',
        'Buzz'
      ).catch(console.error)
      
      setCooldown(1)
      setFeedback(`${profile.display_name || 'Someone'} misses you 💗`)
      window.setTimeout(() => setFeedback(null), 2400)
      
      // Stop pulsing, animate press down
      await pulseControls.start({ scale: 0.9, backgroundColor: '#C9798C', transition: { duration: 0.1 } })
      // Animate release
      await pulseControls.start({ scale: 1, backgroundColor: '#E8A8B8', transition: { duration: 0.2 } })
      // Resume pulsing
      pulseControls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
      })
    } catch (e) {
      console.error(e)
      setError("Couldn't send that buzz yet.")
    } finally {
      setIsPressing(false)
    }
  }

  return (
    <div className="w-full min-h-[calc(100dvh-8rem)] flex flex-col items-center justify-center p-6 bg-rose-base/70 pb-[env(safe-area-inset-bottom)]">
      
      <div className="mb-24 text-center">
        <h2 className="font-serif text-3xl text-deepPlum mb-3">Send a Buzz</h2>
        <p className="text-rose-plum/80 text-sm font-sans max-w-[240px] mx-auto leading-relaxed">
          Tap the heart to let them know you're thinking of them.
        </p>
      </div>

      <div className="relative mb-24 select-none touch-none">
        {/* Glow */}
        <motion.div 
          animate={{ scale: isPressing ? 1.1 : 1, opacity: isPressing ? 0.3 : 0.15 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-rose-plum/30 rounded-full blur-3xl"
        />
        
        {/* Pad */}
        <motion.div
          animate={pulseControls}
          onTap={handlePress}
          className={`w-56 h-56 rounded-full shadow-2xl shadow-rose-plum/25 flex items-center justify-center relative z-10 border-4 border-rose-plum/20 ${cooldown > 0 ? 'bg-rose-pink/60 cursor-not-allowed opacity-80' : 'bg-rose-plum cursor-pointer'}`}
        >
          <Heart className={`w-20 h-20 transition-all duration-300 ${isPressing ? 'fill-rose-base text-rose-base scale-90' : 'text-rose-base'}`} strokeWidth={1.5} />
          
          {cooldown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full backdrop-blur-[2px]">
              <span className="text-rose-plum font-mono text-2xl font-bold">{cooldown}s</span>
            </div>
          )}
        </motion.div>
      </div>

      <div className="min-h-8 text-center" role="status">
        {feedback && <p className="font-serif text-rose-plum text-lg animate-pulse">{feedback}</p>}
        {error && <p className="rounded-xl bg-white/70 px-3 py-2 text-sm text-red-700">{error}</p>}
      </div>
      
    </div>
  )
}
