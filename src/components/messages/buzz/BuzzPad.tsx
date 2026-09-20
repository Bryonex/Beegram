import { useState, useEffect } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useCurrentProfile } from '../../../hooks/useCurrentProfile'
import { messageService } from '../../../services/messageService'
import { gardenService } from '../../../services/gardenService'
import { useToast } from '../../../contexts/ToastContext'

export function BuzzPad() {
  const { profile, partner } = useCurrentProfile()
  const currentUserId = profile?.id
  const relationshipId = profile?.relationship_id
  
  const [cooldown, setCooldown] = useState(0)
  const [isPressing, setIsPressing] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const presets = ['I miss you', 'Thinking of you', 'Hello 🐝', 'Sweet dreams']
  const [activeMessage, setActiveMessage] = useState<string>(presets[0])

  const pulseControls = useAnimationControls()
  const { success, error: toastError } = useToast()

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
          type: customMessage.trim() ? 'Custom' : 'Heartbeat',
          sequence: [
            { duration: 100, isPress: true },
            { duration: 50, isPress: false },
            { duration: 100, isPress: true }
          ]
        }
      })
      
      // create notification
      const buzzMsg = customMessage.trim() || activeMessage
      if (profile?.partner_id) {
        await messageService.createNotification({
          relationship_id: relationshipId,
          recipient_id: profile.partner_id,
          sender_id: currentUserId,
          type: 'buzz',
          message: `${profile.display_name} sent: "${buzzMsg}"`
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
      const successMsg = customMessage.trim() || activeMessage
      success(`Sent "${successMsg}" to ${partner?.display_name || 'them'} 💗`)
      setCustomMessage('')
      
      // Stop pulsing, animate press down
      await pulseControls.start({ scale: 0.9, backgroundColor: '#a35064', transition: { duration: 0.1 } })
      // Animate release
      await pulseControls.start({ scale: 1, backgroundColor: '#c86b85', transition: { duration: 0.2 } })
      // Resume pulsing
      pulseControls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
      })
    } catch (e) {
      console.error(e)
      toastError("Couldn't send that buzz yet.")
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

      <div className="relative mb-12 select-none touch-none">
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
          className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full shadow-2xl shadow-rose-plum/25 flex items-center justify-center relative z-10 border-4 border-rose-plum/20 ${cooldown > 0 ? 'bg-rose-pink/60 cursor-not-allowed opacity-80' : 'bg-rose-plum cursor-pointer'}`}
        >
          <Heart className={`w-16 h-16 sm:w-20 sm:h-20 transition-all duration-300 ${isPressing ? 'fill-rose-base text-rose-base scale-90' : 'text-white'}`} strokeWidth={1.5} />
          
          {cooldown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full backdrop-blur-[2px]">
              <span className="text-rose-plum font-mono text-2xl font-bold">{cooldown}s</span>
            </div>
          )}
        </motion.div>
      </div>

      <div className="w-full max-w-sm px-4 flex flex-col gap-3 z-10">
        <input 
          type="text"
          placeholder="Or type a custom message..."
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          className="w-full bg-white/50 border border-rose-plum/20 rounded-xl px-4 py-3 text-sm text-deepPlum placeholder-deepPlum/40 focus:outline-none focus:border-rose-plum/40 focus:bg-white transition-all shadow-sm"
        />
        <div className="flex flex-wrap justify-center gap-2">
          {presets.map(preset => (
            <button
              key={preset}
              onClick={() => { setActiveMessage(preset); setCustomMessage(''); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                activeMessage === preset && !customMessage.trim()
                  ? 'bg-rose-plum text-white border-rose-plum shadow-sm'
                  : 'bg-white/40 text-deepPlum/60 border-rose-plum/20 hover:bg-white/80'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
      
    </div>
  )
}
