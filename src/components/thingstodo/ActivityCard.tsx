import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Heart, MoreVertical, Trash2, RotateCcw, Calendar, Edit2, Sparkles } from 'lucide-react'
import type { Activity } from '../../types/thingsToDo'
import { useCurrentProfile } from '../../hooks/useCurrentProfile'

interface Props {
  activity: Activity
  onComplete: (id: string) => void
  onUncomplete: (id: string) => void
  onToggleFavourite: (id: string, isFavourite: boolean) => void
  onDelete: (id: string) => void
  onEdit: (activity: Activity) => void
}

export function ActivityCard({ activity, onComplete, onUncomplete, onToggleFavourite, onDelete, onEdit }: Props) {
  const [showOptions, setShowOptions] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const { profile, partner } = useCurrentProfile()

  const handleComplete = () => {
    setJustCompleted(true)
    setTimeout(() => {
      onComplete(activity.id)
      setJustCompleted(false)
    }, 800) // Give time for the celebration animation
  }

  if (activity.isCompleted) {
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-sage/10 border border-sage/20 rounded-2xl p-4 relative group"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-4">
            <h3 className="font-serif text-lg text-sage font-medium">{activity.title}</h3>
            {activity.description && (
              <p className="text-sage/70 text-sm mt-1 leading-relaxed">{activity.description}</p>
            )}
            
            <div className="flex items-center gap-3 mt-3 text-[11px] text-sage/60 font-sans uppercase tracking-wider">
              <span>Completed by {activity.completedBy === profile?.id ? profile?.display_name : (activity.completedBy === partner?.id ? partner?.display_name : 'Unknown')}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 shrink-0 relative">
            <button 
              onClick={() => onToggleFavourite(activity.id, !activity.isFavourite)}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                activity.isFavourite ? 'text-dustyRose' : 'text-sage/40 hover:text-dustyRose'
              }`}
            >
              <Heart className={`w-4 h-4 ${activity.isFavourite ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-sage/40 hover:text-sage/60 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Options Dropdown */}
            <AnimatePresence>
              {showOptions && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 top-16 bg-white shadow-xl rounded-xl border border-sage/10 p-1 z-10 w-32"
                >
                  {showDeleteConfirm ? (
                    <div className="p-2">
                      <p className="text-xs text-center text-sage/80 mb-2">Are you sure?</p>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => onDelete(activity.id)}
                          className="flex-1 py-1 bg-red-50 text-red-500 rounded text-xs font-medium"
                        >
                          Yes
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 py-1 bg-sage/10 text-sage rounded text-xs font-medium"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => { setShowOptions(false); onUncomplete(activity.id) }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-sage/80 hover:bg-sage/5 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" /> Undo
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white/60 border border-blush/30 rounded-2xl p-4 shadow-sm relative overflow-hidden"
    >
      {/* Celebration Overlay */}
      <AnimatePresence>
        {justCompleted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-sage/20 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <Sparkles className="w-8 h-8 text-sage" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        {/* Checkbox */}
        <button 
          onClick={handleComplete}
          className="w-6 h-6 shrink-0 rounded-full border-2 border-lavender-soft text-transparent hover:border-lavender-deep hover:text-lavender-soft transition-colors flex items-center justify-center mt-1"
          aria-label="Mark as complete"
        >
          <Check className="w-3.5 h-3.5" />
        </button>

        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg text-deepPlum font-medium pr-10">{activity.title}</h3>
          
          {activity.description && (
            <p className="text-deepPlum/70 text-sm mt-1 leading-relaxed">{activity.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-deepPlum/50 font-sans uppercase tracking-wider">
            <span>
              Added by {activity.createdBy === profile?.id
                ? profile.display_name
                : activity.createdBy === partner?.id
                  ? partner.display_name
                  : 'your partner'}
            </span>
            {activity.targetDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(activity.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-1 shrink-0 absolute top-3 right-3">
          <button 
            onClick={() => onToggleFavourite(activity.id, !activity.isFavourite)}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
              activity.isFavourite ? 'text-dustyRose' : 'text-deepPlum/30 hover:text-dustyRose'
            }`}
          >
            <Heart className={`w-4 h-4 ${activity.isFavourite ? 'fill-current' : ''}`} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-deepPlum/40 hover:text-deepPlum/60 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Options Dropdown */}
            <AnimatePresence>
              {showOptions && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 top-8 bg-white shadow-xl rounded-xl border border-blush/20 p-1 z-10 w-32"
                >
                  {showDeleteConfirm ? (
                    <div className="p-2">
                      <p className="text-xs text-center text-deepPlum/80 mb-2">Are you sure?</p>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => onDelete(activity.id)}
                          className="flex-1 py-1 bg-red-50 text-red-500 rounded text-xs font-medium"
                        >
                          Yes
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 py-1 bg-deepPlum/5 text-deepPlum/80 rounded text-xs font-medium"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => { setShowOptions(false); onEdit(activity) }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-deepPlum/80 hover:bg-blush/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
