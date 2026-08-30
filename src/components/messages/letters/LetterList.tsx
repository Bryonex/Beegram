import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Edit3, Heart, ChevronRight, X } from 'lucide-react'
import type { Letter } from '../../../types/messages'
import { useCurrentProfile } from '../../../hooks/useCurrentProfile'
import { messageService } from '../../../services/messageService'
import { LetterComposer } from './LetterComposer'

export function LetterList() {
  const { profile, partner } = useCurrentProfile()
  const [letters, setLetters] = useState<Letter[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null)
  const [isComposing, setIsComposing] = useState(false)
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const loadLetters = async () => {
    if (!profile?.relationship_id) return
    try {
      const data = await messageService.getLetters(profile.relationship_id)
      setLetters(data)
    } catch (error) {
      console.error('Failed to load letters', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLetters()
  }, [profile?.relationship_id])

  const filteredLetters = letters // Removed internal tabs as per user request

  if (isComposing) {
    return (
      <LetterComposer
        onSent={() => setNotice('Letter sent 💌')}
        onClose={() => {
          setIsComposing(false)
          loadLetters()
        }}
      />
    )
  }

  return (
    <div className="w-full h-full flex flex-col relative pt-2">
      {/* Internal Tabs Removed */}

      {notice && (
        <div className="mx-5 mb-2 rounded-xl bg-sage/20 border border-sage/30 px-3 py-2 text-sm text-deepPlum" role="status">
          {notice}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-4">
        {loading ? (
          <div className="w-full py-12 flex justify-center">
             <div className="w-6 h-6 border-2 border-deepPlum/30 border-t-deepPlum rounded-full animate-spin" />
          </div>
        ) : filteredLetters.length === 0 ? (
          <div className="w-full py-16 flex flex-col items-center text-center">
            <Mail className="w-12 h-12 text-deepPlum/10 mb-4" />
            <p className="font-serif text-deepPlum/50">No letters here.</p>
          </div>
        ) : (
          filteredLetters.map(letter => (
            <motion.div 
              key={letter.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedLetter(letter)}
              className="bg-white p-4 rounded-2xl shadow-sm border border-blush/30 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-8 bg-warmPaper border-b border-blush/30 origin-top transform group-hover:rotate-x-12 transition-transform" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
              
              <div className="mt-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif text-lg text-deepPlum line-clamp-1 pr-4">{letter.title || 'Untitled Letter'}</h3>
                  {letter.is_favourite && <Heart className="w-4 h-4 text-dustyRose fill-dustyRose shrink-0" />}
                </div>
                <p className="text-sm text-deepPlum/60 line-clamp-2 mb-4 font-sans">{letter.content}</p>
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-deepPlum/40">
                  <span>{new Date(letter.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1">Open <ChevronRight className="w-3 h-3" /></span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="fixed right-4 z-30" style={{ bottom: 'calc(var(--beegram-nav-offset) + 0.5rem)' }}>
        <button 
          onClick={() => setIsComposing(true)}
          className="px-5 min-h-[52px] bg-lavender-deep text-white rounded-full flex items-center justify-center gap-2 shadow-lg shadow-lavender-deep/30 hover:bg-deepPlum hover:scale-105 transition-all border border-white/20"
        >
          <Edit3 className="w-5 h-5" />
          <span className="font-medium tracking-wide text-sm">Write a Letter</span>
        </button>
      </div>

      <AnimatePresence>
        {selectedLetter && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-rose-white/90 backdrop-blur-md flex flex-col items-center justify-center p-5 overflow-hidden"
            onClick={() => {
              if (isEnvelopeOpen) {
                setIsEnvelopeOpen(false)
                setTimeout(() => setSelectedLetter(null), 600)
              } else {
                setSelectedLetter(null)
              }
            }}
          >
            <div className="relative w-full max-w-md aspect-[3/4] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
              {/* Envelope Back */}
              <div className="absolute inset-0 bg-[#E8DCC8] rounded-md shadow-2xl overflow-hidden cursor-pointer" onClick={() => !isEnvelopeOpen && setIsEnvelopeOpen(true)}>
                <div className="absolute inset-x-0 bottom-0 top-[30%] bg-[#DFD0BA]" style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }} />
                
                {/* The Paper Letter */}
                <motion.div 
                  initial={{ y: '30%', opacity: 0 }}
                  animate={isEnvelopeOpen ? { y: '-10%', opacity: 1, scale: 1.05, zIndex: 10 } : { y: '30%', opacity: 0, zIndex: 0 }}
                  transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
                  className="absolute inset-x-4 bottom-4 bg-white rounded-sm shadow-inner p-6 flex flex-col overflow-y-auto max-h-[120%]"
                  style={{ height: '140%', top: '-20%' }}
                >
                  <div className="flex justify-between items-center mb-6 border-b border-blush/30 pb-4">
                    <button onClick={() => {
                      setIsEnvelopeOpen(false)
                      setTimeout(() => {
                        setSelectedLetter(null)
                        loadLetters()
                      }, 600)
                    }} className="w-8 h-8 flex items-center justify-center text-deepPlum/60 bg-rose-white rounded-full shadow-sm shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                    <h1 className="font-serif text-xl text-deepPlum text-center flex-1 pr-8 truncate">{selectedLetter.title}</h1>
                  </div>
                  
                  <div className="text-[11px] uppercase tracking-widest text-deepPlum/50 mb-6 flex flex-col gap-1">
                    <div><span className="font-bold">To:</span> {selectedLetter.author_id === profile?.id ? partner?.display_name || 'Partner' : profile?.display_name || 'Me'}</div>
                    <div><span className="font-bold">From:</span> {selectedLetter.author_id === profile?.id ? profile?.display_name || 'Me' : partner?.display_name || 'Partner'}</div>
                    <div><span className="font-bold">Date:</span> {new Date(selectedLetter.created_at).toLocaleDateString()}</div>
                  </div>
                  
                  <div className="flex-1 text-[15px] leading-relaxed text-deepPlum/90 font-serif whitespace-pre-wrap">
                    {selectedLetter.content}
                  </div>
                </motion.div>

                {/* Envelope Flap Front */}
                <motion.div 
                  className="absolute inset-x-0 top-0 h-[45%] bg-[#E8DCC8] origin-top border-b border-black/5"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
                  animate={isEnvelopeOpen ? { rotateX: -180, zIndex: 0 } : { rotateX: 0, zIndex: 20 }}
                  transition={{ duration: 0.5 }}
                />
                
                {/* Envelope Front Bottom Fold */}
                <div className="absolute inset-x-0 bottom-0 top-[15%] bg-[#F0E6D2] z-10 pointer-events-none border-t border-white/30" style={{ clipPath: 'polygon(0 100%, 0 0, 50% 40%, 100% 0, 100% 100%)' }}>
                  {!isEnvelopeOpen && (
                    <div className="absolute inset-0 flex items-center justify-center pt-24 text-deepPlum/40 font-serif text-sm italic pointer-events-auto">
                      Tap to open
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
