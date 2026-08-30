import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic } from 'lucide-react'
import type { VoiceNote } from '../../../types/messages'
import { useCurrentProfile } from '../../../hooks/useCurrentProfile'
import { messageService } from '../../../services/messageService'
import { VoiceNotePlayer } from './VoiceNotePlayer'
import { VoiceRecorder } from './VoiceRecorder'

export function VoiceNoteList() {
  const { profile } = useCurrentProfile()
  const [notes, setNotes] = useState<VoiceNote[]>([])
  const [loading, setLoading] = useState(true)
  const [isRecording, setIsRecording] = useState(false)

  const loadNotes = async () => {
    if (!profile?.relationship_id) {
      setLoading(false)
      return
    }
    try {
      const data = await messageService.getVoiceNotes(profile.relationship_id)
      setNotes(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotes()
  }, [profile?.relationship_id])

  return (
    <div className="w-full flex flex-col h-full relative">
      <div className="flex-1 px-5 pt-2 pb-24 overflow-y-auto flex flex-col gap-4 scrollbar-hide">
        {loading ? (
           <div className="w-full py-12 flex justify-center">
             <div className="w-6 h-6 border-2 border-deepPlum/30 border-t-deepPlum rounded-full animate-spin" />
           </div>
        ) : (
          notes.map(note => (
            <VoiceNotePlayer key={note.id} note={note} />
          ))
        )}
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsRecording(true)}
          className="w-16 h-16 rounded-full bg-dustyRose text-white shadow-xl shadow-dustyRose/20 flex items-center justify-center pointer-events-auto"
        >
          <Mic className="w-7 h-7" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isRecording && (
          <VoiceRecorder 
            onClose={() => {
              setIsRecording(false)
              loadNotes()
            }} 
            onSend={async (blob, duration) => {
              if (!profile?.relationship_id || !profile?.id) throw new Error('Missing relationship profile')
              await messageService.saveVoiceNote(profile.relationship_id, {
                relationship_id: profile.relationship_id,
                author_id: profile.id,
                duration_seconds: duration,
                is_favourite: false,
                file: blob,
              })
              setIsRecording(false)
              loadNotes()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
