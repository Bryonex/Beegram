import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send } from 'lucide-react'
import type { MomentComment } from '../../types/moments'
import { momentService } from '../../services/momentService'
import { gardenService } from '../../services/gardenService'
import { useCurrentProfile } from '../../hooks/useCurrentProfile'
import { useToast } from '../../contexts/ToastContext'


interface Props {
  momentId: string
  comments: MomentComment[]
  onClose: () => void
  onCommentAdded: (comment: MomentComment) => void
}

export function CommentsSheet({ momentId, comments, onClose, onCommentAdded }: Props) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { profile } = useCurrentProfile()
  const { success, error: toastError } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const comment = await momentService.addComment(momentId, newComment.trim())
      onCommentAdded(comment)
      
      if (profile?.relationship_id && profile?.id) {
        gardenService.checkAndUnlockAchievement(
          profile.relationship_id,
          profile.id,
          'ForgetMeNot',
          'First Comment',
          'Moments'
        ).catch(console.error)
      }
      
      setNewComment('')
      success('Comment added')
    } catch (err) {
      console.error('Failed to add comment', err)
      toastError("Couldn't post that comment yet.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col justify-end">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-rose-plum/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative bg-white rounded-t-3xl h-[75vh] flex flex-col shadow-2xl safe-bottom"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-rose-base/30">
            <h3 className="font-serif text-lg text-rose-plum">Comments</h3>
            <button onClick={onClose} className="p-2 -mr-2 text-rose-dusty hover:text-rose-plum transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {comments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-rose-dusty/60">
                <p className="font-serif">No comments yet</p>
                <p className="text-sm">Be the first to say something nice.</p>
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-base flex items-center justify-center text-rose-plum font-serif text-sm flex-shrink-0">
                    {(comment.authorName || comment.authorId).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 bg-rose-white/50 rounded-2xl rounded-tl-none p-3 border border-rose-base/30">
                    <p className="text-xs font-medium text-rose-pink mb-1">{comment.authorName || comment.authorId}</p>
                    <p className="text-sm text-rose-plum/90">{comment.text}</p>
                    <p className="text-[10px] text-rose-dusty/60 mt-2">
                      {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Composer */}
          <div className="p-4 bg-white border-t border-rose-base/30 px-6 pb-safe">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="flex-1 bg-rose-white rounded-full border border-rose-base/50 flex items-center px-4 py-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-rose-plum placeholder-rose-dusty/50 outline-none"
                />
              </div>
              <button 
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="w-10 h-10 rounded-full bg-rose-pink text-white flex items-center justify-center disabled:opacity-50 disabled:bg-rose-dusty/30 transition-colors flex-shrink-0 shadow-sm"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
