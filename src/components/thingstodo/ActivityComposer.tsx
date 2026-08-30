import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Heart, Calendar } from 'lucide-react'
import type { Activity, ActivityInsert } from '../../types/thingsToDo'
import { useCurrentProfile } from '../../hooks/useCurrentProfile'

interface Props {
  initialData?: Activity
  onClose: () => void
  onSubmit: (data: Partial<ActivityInsert>) => Promise<void>
}

export function ActivityComposer({ initialData, onClose, onSubmit }: Props) {
  const { profile } = useCurrentProfile()
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [targetDate, setTargetDate] = useState(initialData?.targetDate ? new Date(initialData.targetDate).toISOString().split('T')[0] : '')
  const [isFavourite, setIsFavourite] = useState(initialData?.isFavourite || false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  const handleSubmit = async () => {
    if (!title.trim()) return
    setIsSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
        isFavourite,
        createdBy: initialData?.createdBy || profile?.id || 'Unknown' 
      })
      onClose()
    } catch (e) {
      console.error(e)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-deepPlum/40 backdrop-blur-sm"
      />

      {/* Sheet */}
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-warmPaper rounded-t-3xl w-full max-h-[90vh] flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-blush/20 shrink-0">
          <h2 className="font-serif text-xl text-deepPlum font-medium">
            {initialData ? 'Edit Activity' : 'Add to our list'}
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-blush/30 flex items-center justify-center text-deepPlum/70 hover:bg-blush transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto overscroll-contain flex flex-col gap-6">
          
          <div className="flex flex-col gap-1.5">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What do you want to do together?"
              className="w-full bg-transparent border-none text-xl font-serif text-deepPlum placeholder:text-deepPlum/30 focus:outline-none focus:ring-0"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Any details? (optional)"
              className="w-full bg-transparent border-none text-sm text-deepPlum/80 placeholder:text-deepPlum/40 resize-none h-24 focus:outline-none focus:ring-0"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-2 bg-white/50 border border-blush/30 rounded-xl px-3 py-2">
              <Calendar className="w-4 h-4 text-deepPlum/50" />
              <input 
                type="date" 
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="bg-transparent border-none text-sm text-deepPlum focus:outline-none flex-1"
              />
            </div>

            <button
              onClick={() => setIsFavourite(!isFavourite)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-colors ${
                isFavourite 
                  ? 'bg-dustyRose/10 border-dustyRose/30 text-dustyRose' 
                  : 'bg-white/50 border-blush/30 text-deepPlum/50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavourite ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{isFavourite ? 'Favourited' : 'Favourite'}</span>
            </button>
          </div>

        </div>

        <div className="px-5 pb-safe pt-4 border-t border-blush/20 bg-warmPaper/90 backdrop-blur shrink-0">
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className="w-full bg-lavender-dark text-white rounded-2xl py-3.5 font-medium shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              initialData ? 'Save Changes' : 'Add Activity'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
