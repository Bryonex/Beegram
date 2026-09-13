import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Upload, Music, Loader2 } from 'lucide-react'
import { useCurrentProfile } from '../../hooks/useCurrentProfile'
import { useToast } from '../../contexts/ToastContext'
import { musicService } from '../../services/musicService'
import type { Song } from '../../types/music'

interface Props {
  onClose: () => void
  onSongAdded: (song: Song) => void
}

export function SongUploader({ onClose, onSongAdded }: Props) {
  const { profile } = useCurrentProfile()
  const { success, error: toastError } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [file, setFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [note, setNote] = useState('')
  const [isFavourite, setIsFavourite] = useState(false)
  
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      if (!title) {
        // Strip extension for default title
        setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""))
      }
    }
  }

  const handleUpload = async () => {
    if (!file || !title || !artist || !profile?.relationship_id || !profile.id) return
    setIsUploading(true)

    try {
      const audioUrl = await musicService.uploadSongFile(file, profile.relationship_id, profile.id)
      let coverUrl: string | undefined

      if (coverFile) {
        coverUrl = await musicService.uploadSongCover(coverFile, profile.relationship_id, profile.id)
      }
      
      const newSong = await musicService.addSong({
        relationshipId: profile.relationship_id,
        authorId: profile.id,
        addedBy: profile.id,
        title: title.trim(),
        artist: artist.trim(),
        audioUrl,
        coverUrl,
        category: 'Our Songs',
        note: note.trim() || undefined,
        isFavourite
      })
      
      success('Song added successfully!')
      onSongAdded(newSong)
      onClose()
    } catch (e) {
      console.error(e)
      toastError("Couldn't upload that song yet. Please try again.")
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center pb-[calc(4rem+env(safe-area-inset-bottom))]">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md bg-[#1a1b2e] sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-serif text-lavender-mist">Add a Song</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-6 space-y-6">
          
          {/* File Picker */}
          <div>
            <input 
              type="file" 
              accept="audio/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {!file ? (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-lavender-dark/50 rounded-2xl flex flex-col items-center justify-center text-lavender-pale/60 hover:text-lavender-pale hover:bg-lavender-dark/20 hover:border-lavender-pale/50 transition-all p-4 text-center"
              >
                <Upload className="w-8 h-8 mb-2" />
                <span className="font-medium text-sm sm:text-base">Tap to select audio file</span>
              </button>
            ) : (
              <div className="w-full p-3 sm:p-4 bg-lavender-dark/30 rounded-2xl border border-lavender-dark flex items-center gap-3 sm:gap-4 overflow-hidden">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-lavender-mist rounded-xl flex items-center justify-center text-midnightPlum shrink-0">
                  <Music className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lavender-mist font-medium truncate text-sm sm:text-base">{file.name}</p>
                  <p className="text-xs text-lavender-pale/60">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="p-2 text-white/40 hover:text-white shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lavender-pale/60 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lavender-mist outline-none focus:border-lavender-mist/50 transition-colors"
                placeholder="Song title..."
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lavender-pale/60 mb-2">Artist</label>
              <input
                type="text"
                value={artist}
                onChange={e => setArtist(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lavender-mist outline-none focus:border-lavender-mist/50 transition-colors"
                placeholder="Artist name..."
              />
            </div>

            <div className="overflow-hidden">
              <label className="block text-xs font-bold uppercase tracking-wider text-lavender-pale/60 mb-2">Cover art (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-lavender-pale/70 file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-medium file:bg-lavender-mist file:text-midnightPlum overflow-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lavender-pale/60 mb-2">Note (Optional)</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lavender-mist outline-none focus:border-lavender-mist/50 transition-colors resize-none"
                placeholder="Why are you adding this? What feeling or moment should this hold?"
              />
            </div>

            <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={isFavourite}
                onChange={(e) => setIsFavourite(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 text-dustyRose focus:ring-dustyRose bg-transparent accent-dustyRose"
              />
              <span className="text-sm font-medium text-lavender-mist">Mark as Favourite</span>
            </label>
          </div>

        </div>

        <div className="p-6 border-t border-white/10 pb-[env(safe-area-inset-bottom)] shrink-0">
          <button
            onClick={handleUpload}
            disabled={!file || !title || !artist || isUploading}
            className="w-full py-4 rounded-xl bg-lavender-mist text-midnightPlum font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Song'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
