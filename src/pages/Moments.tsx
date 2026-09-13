import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import type { Moment, MomentInsert } from '../types/moments'
import { momentService } from '../services/momentService'
import { gardenService } from '../services/gardenService'
import { useCurrentProfile } from '../hooks/useCurrentProfile'
import { OnThisDay } from '../components/moments/OnThisDay'
import { MomentCard } from '../components/moments/MomentCard'
import { CreateMoment } from '../components/moments/CreateMoment'

export default function Moments() {
  const [moments, setMoments] = useState<Moment[]>([])
  const [loading, setLoading] = useState(true)
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const { profile } = useCurrentProfile()
  const optimisticIds = useRef<Set<string>>(new Set())

  const loadMoments = async () => {
    try {
      const data = await momentService.getMoments()
      setMoments(prev => {
        // If we have optimistically added moments, ensure they stay at the top if they are missing
        const newIds = new Set(data.map(m => m.id))
        const optimisticsToKeep = prev.filter(m => optimisticIds.current.has(m.id) && !newIds.has(m.id))
        return [...optimisticsToKeep, ...data]
      })
    } catch (err) {
      console.error('Failed to load moments', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMoments()
  }, [])

  const handleCreate = async (momentData: MomentInsert) => {
    try {
      const newMoment = await momentService.createMoment(momentData)
      optimisticIds.current.add(newMoment.id)
      setMoments(prev => [newMoment, ...prev.filter(m => m.id !== newMoment.id)])
      
      if (profile?.relationship_id) {
        gardenService.checkAndUnlockAchievement(
          profile.relationship_id,
          profile.id,
          'Daisy',
          'First Moment',
          'Moments'
        ).catch(console.error)
      }

      // Explicitly reload from server to ensure perfect sync
      loadMoments()
    } catch (err) {
      console.error('Failed to create moment', err)
      throw err // Let composer handle error state
    }
  }

  return (
    <div className="min-h-screen bg-rose-white pt-safe relative pb-10">
      
      {/* Background Texture/Glow (Subtle) */}
      <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-rose-base/50 to-transparent pointer-events-none" />

      <div className="px-5 pt-8 relative z-10 space-y-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start mb-2"
        >
          <div>
            <h1 className="text-3xl font-serif text-rose-plum font-medium tracking-tight mb-1">Our Moments</h1>
            <p className="text-rose-dusty/80 text-sm font-sans">A little space for our memories.</p>
          </div>
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsComposerOpen(true)}
            className="w-10 h-10 rounded-full bg-rose-base border border-rose-pink/30 flex items-center justify-center text-rose-plum shadow-sm"
            title="Create Memory"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* On This Day */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <OnThisDay historicalMoments={moments.filter(moment => {
            const date = new Date(moment.date)
            const today = new Date()
            return date.getMonth() === today.getMonth() && date.getDate() === today.getDate() && date.getFullYear() !== today.getFullYear()
          })} />
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col gap-6"
        >
          {loading ? (
            <div className="w-full flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-rose-plum/30 border-t-rose-plum rounded-full animate-spin" />
            </div>
          ) : (
            moments.map(moment => (
              <MomentCard key={moment.id} moment={moment} />
            ))
          )}
        </motion.div>

      </div>

      {isComposerOpen && (
        <CreateMoment 
          onClose={() => setIsComposerOpen(false)} 
          onSubmit={handleCreate} 
        />
      )}
    </div>
  )
}
