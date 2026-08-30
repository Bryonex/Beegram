import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Send, Mail } from 'lucide-react'
import type { LetterInsert } from '../../../types/messages'
import { useCurrentProfile } from '../../../hooks/useCurrentProfile'
import { messageService } from '../../../services/messageService'
import { gardenService } from '../../../services/gardenService'

interface Props {
  onClose: () => void
  onSent: () => void
}

export function LetterComposer({ onClose, onSent }: Props) {
  const { profile, partner } = useCurrentProfile()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recipientName = partner?.display_name || partner?.username || 'Your partner'
  const recipientId = partner?.id || profile?.partner_id

  const handleSend = async () => {
    if (!content.trim()) {
      setError('Write a little something before sending.')
      return
    }
    if (!profile?.relationship_id || !profile?.id) {
      setError("We couldn't find your relationship yet. Please try again.")
      return
    }

    if (!recipientId) {
      setError("We couldn't find your partner yet. Please try again.")
      return
    }

    setIsSaving(true)
    setError(null)
    try {
      const insert: LetterInsert = {
        relationship_id: profile.relationship_id,
        author_id: profile.id,
        title: title.trim(),
        content: content.trim(),
        is_favourite: false,
        is_draft: false
      }
      await messageService.sendLetter(insert)
      gardenService.checkAndUnlockAchievement(
        profile.relationship_id,
        profile.id,
        'Rose',
        'First Letter',
        'Letters'
      ).catch(console.error)
      onSent()
      onClose()
    } catch (e: any) {
      console.error('Failed to save letter:', e)
      setError("Couldn't send the letter. Please try again.")
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-warmPaper flex flex-col"
    >
      {/* Header */}
      <div className="pt-safe px-4 flex items-center justify-between h-16 shrink-0 bg-warmPaper/80 backdrop-blur-md border-b border-blush/30">
        <button 
          onClick={() => onClose()}
          className="w-10 h-10 flex items-center justify-center text-deepPlum/60"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="font-serif text-deepPlum text-lg">
          New Letter
        </span>
        <button 
          onClick={handleSend}
          disabled={isSaving || !content.trim()}
          className="w-10 h-10 flex items-center justify-center rounded-full text-deepPlum/70 disabled:opacity-40 transition-colors"
          aria-label="Publish letter"
        >
          <Mail className="w-5 h-5" />
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col bg-[url('/noise.png')] bg-repeat opacity-95">
        <div className="flex items-center gap-2 mb-4 text-deepPlum/60 font-serif">
          <span className="font-bold">To:</span>
          <span>{recipientName}</span>
        </div>
        <input
          type="text"
          placeholder="Title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-2xl font-serif text-deepPlum placeholder:text-deepPlum/50 mb-6"
        />
        
        <textarea
          placeholder="Dear..."
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full flex-1 bg-transparent border-none outline-none resize-none text-[15px] leading-relaxed text-deepPlum/80 font-serif placeholder:text-deepPlum/50"
        />
        {error && <p className="mt-4 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* Actions */}
      <div className="pb-safe pt-4 px-6 pb-6 bg-warmPaper border-t border-blush/30 flex justify-end shrink-0">
        <button 
          onClick={handleSend}
          disabled={isSaving || !content.trim()}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-dustyRose text-white font-medium shadow-md shadow-dustyRose/30 hover:bg-rose-pink active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
        >
          <span className="tracking-wide">SEND LETTER</span>
          <Send className="w-4 h-4 ml-1" />
        </button>
      </div>
    </motion.div>
  )
}
