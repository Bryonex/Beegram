import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ImagePlus, MapPin, Calendar } from 'lucide-react'
import type { MomentInsert } from '../../types/moments'
import { useCurrentProfile } from '../../hooks/useCurrentProfile'

interface Props {
  onClose: () => void
  onSubmit: (moment: MomentInsert) => Promise<void>
}

export function CreateMoment({ onClose, onSubmit }: Props) {
  const { profile } = useCurrentProfile()
  const [caption, setCaption] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [location, setLocation] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([e.target.files[0]])
      setError(null)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError('Choose a photo or video before posting.')
      return
    }
    if (!profile?.id) {
      setError("We couldn't find your profile yet. Please try again.")
      return
    }
    setSubmitting(true)
    setError(null)
    
    try {
      await onSubmit({
        authorId: profile.id,
        caption,
        date,
        location: location.trim() || undefined,
        isFavourite: false,
        mediaFiles: files
      })
      onClose()
    } catch (err) {
      console.error(err)
      setError("Couldn't post this moment. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-50 bg-rose-white flex flex-col"
      >
        {/* Header */}
        <div className="w-full pt-safe flex items-center justify-between px-4 py-4 bg-white border-b border-rose-base shadow-sm">
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-rose-plum/60 hover:text-rose-plum rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          
          <h2 className="font-serif text-lg text-rose-plum">New Memory</h2>
          
          <button 
            onClick={handleSubmit}
            disabled={submitting || files.length === 0}
            className="min-h-[44px] px-4 py-1.5 rounded-full bg-rose-plum text-white font-medium text-sm disabled:opacity-50 transition-opacity"
          >
            {submitting ? 'POSTING...' : 'POST MOMENT'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          
          {/* Caption */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write something about this moment..."
            className="w-full bg-transparent outline-none resize-none font-serif text-xl text-rose-plum placeholder:text-rose-dusty/40 min-h-[120px]"
          />
          {error && <p className="mb-5 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}

          {/* Media Previews */}
          {files.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
              {files.map((file, idx) => (
                <div key={idx} className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-rose-base/30 border border-rose-base">
                  {file.type.startsWith('video/') ? (
                    <video 
                      src={URL.createObjectURL(file)} 
                      className="w-full h-full object-cover"
                      muted
                      autoPlay
                      loop
                      playsInline
                    />
                  ) : (
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  )}
                  <button 
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action Row */}
          <div className="flex gap-4 items-center mb-8 pb-8 border-b border-rose-base/50">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-12 min-w-[44px] px-4 rounded-full bg-rose-base/50 flex items-center gap-2 justify-center text-rose-plum hover:bg-rose-base transition-colors"
            >
              <ImagePlus className="w-5 h-5" />
              <span className="text-sm font-medium">Photo or Video</span>
            </button>
          </div>

          {/* Meta Fields */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-rose-plum/80">
              <Calendar className="w-5 h-5 opacity-60" />
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 bg-transparent outline-none font-sans text-sm"
              />
            </div>
            
            <div className="flex items-center gap-3 text-rose-plum/80">
              <MapPin className="w-5 h-5 opacity-60" />
              <input 
                type="text"
                placeholder="Add location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 bg-transparent outline-none font-sans text-sm placeholder:text-rose-dusty/40"
              />
            </div>

          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  )
}
