import { useState } from 'react'
import { Heart, MessageCircle, Play, MoreHorizontal, Trash2, Edit2 } from 'lucide-react'
import type { Moment, MomentComment } from '../../types/moments'
import { MediaGallery } from './MediaGallery'
import { CommentsSheet } from './CommentsSheet'
import { useCurrentProfile } from '../../hooks/useCurrentProfile'
import { momentService } from '../../services/momentService'
import { useToast } from '../../contexts/ToastContext'

interface Props {
  moment: Moment
  onDelete?: (id: string) => void
}

export function MomentCard({ moment: initialMoment, onDelete }: Props) {
  const [moment, setMoment] = useState(initialMoment)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editCaption, setEditCaption] = useState(initialMoment.caption || '')
  const [editLocation, setEditLocation] = useState(initialMoment.location || '')
  const [editDate, setEditDate] = useState(initialMoment.date?.substring(0, 10) || new Date().toISOString().substring(0, 10))
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const { profile } = useCurrentProfile()
  const { error, success } = useToast()
  
  const hasLiked = profile && moment.reactions.some(r => r.authorId === profile.id)

  const handleLike = async () => {
    if (!profile || isLiking) return
    setIsLiking(true)
    
    try {
      if (hasLiked) {
        await momentService.unlikeMoment(moment.id)
        setMoment(prev => ({
          ...prev,
          reactions: prev.reactions.filter(r => r.authorId !== profile.id)
        }))
      } else {
        const reaction = await momentService.likeMoment(moment.id)
        setMoment(prev => ({
          ...prev,
          reactions: [...prev.reactions, reaction]
        }))
      }
    } catch (err) {
      console.error('Failed to toggle like', err)
      error('Failed to update like status')
    } finally {
      setIsLiking(false)
    }
  }

  const handleDelete = async () => {
    if (!isMe || isDeleting) return

    setIsDeleting(true)
    try {
      await momentService.deleteMoment(moment.id)
      success('Moment deleted')
      setConfirmDeleteOpen(false)
      if (onDelete) onDelete(moment.id)
    } catch (err) {
      console.error('Failed to delete moment', err)
      error('Could not delete moment')
    } finally {
      setIsDeleting(false)
      setMenuOpen(false)
    }
  }

  const handleEdit = async () => {
    if (!isMe || isSavingEdit) return
    setIsSavingEdit(true)
    try {
      await momentService.editMoment(moment.id, {
        caption: editCaption,
        location: editLocation,
        date: new Date(editDate).toISOString()
      })
      setMoment(prev => ({
        ...prev,
        caption: editCaption,
        location: editLocation,
        date: new Date(editDate).toISOString()
      }))
      success('Moment updated')
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to update moment', err)
      error('Could not update moment')
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleCommentAdded = (comment: MomentComment) => {
    setMoment(prev => ({
      ...prev,
      comments: [...prev.comments, comment]
    }))
  }

  const openGallery = (index: number) => {
    setInitialGalleryIndex(index)
    setGalleryOpen(true)
  }

  const renderMedia = () => {
    const { media } = moment
    if (media.length === 0) return null

    // Single Media
    if (media.length === 1) {
      const m = media[0]
      return (
        <div 
          className="w-full relative rounded-2xl overflow-hidden cursor-pointer"
          onClick={() => openGallery(0)}
        >
          {m.url === 'error' ? (
            <div className="w-full h-48 bg-rose-base/30 flex items-center justify-center text-rose-dusty text-sm">
              Media temporarily unavailable
            </div>
          ) : m.type === 'video' ? (
            <div className="relative aspect-[4/5] bg-rose-plum/10">
              <video src={m.url} poster={m.posterUrl} className="w-full h-full object-cover" muted playsInline preload="metadata" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur flex items-center justify-center">
                  <Play className="w-6 h-6 text-white ml-1 fill-white" />
                </div>
              </div>
            </div>
          ) : (
            <img src={m.url} alt="" className="w-full h-auto object-cover max-h-[60vh]" />
          )}
        </div>
      )
    }

    // Two Media (Split)
    if (media.length === 2) {
      return (
        <div className="w-full flex gap-1 h-64 rounded-2xl overflow-hidden">
          <div className="flex-1 relative cursor-pointer" onClick={() => openGallery(0)}>
            <img src={media[0].url} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 relative cursor-pointer" onClick={() => openGallery(1)}>
            <img src={media[1].url} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      )
    }

    // Three or more (One featured, two small)
    if (media.length >= 3) {
      return (
        <div className="w-full flex flex-col gap-1 rounded-2xl overflow-hidden">
          <div className="w-full h-48 relative cursor-pointer" onClick={() => openGallery(0)}>
            <img src={media[0].url} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="w-full flex gap-1 h-32">
            <div className="flex-1 relative cursor-pointer" onClick={() => openGallery(1)}>
              <img src={media[1].url} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 relative cursor-pointer" onClick={() => openGallery(2)}>
              <img src={media[2].url} alt="" className="w-full h-full object-cover" />
              {media.length > 3 && (
                <div className="absolute inset-0 bg-rose-plum/60 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="text-white font-serif text-lg">+{media.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
  }

  const dateObj = new Date(moment.date)
  const formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const isMe = profile && moment.authorId === profile.id

  return (
    <>
      <div className={`w-full bg-white rounded-3xl p-4 shadow-sm border ${isDeleting ? 'opacity-50' : ''} border-rose-base/50`}>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-3 px-1">
          <div>
            <p className="text-rose-plum font-serif text-sm">{formattedDate}</p>
            {moment.location && (
              <p className="text-[10px] uppercase tracking-widest text-rose-dusty/60 font-sans mt-0.5">{moment.location}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${
              isMe ? 'bg-rose-base text-rose-dusty' : 'bg-rose-pink/15 text-rose-pink'
            }`}>
              BY {moment.authorName || moment.authorId}
            </div>
            
            {isMe && (
              <div className="relative">
                <button 
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20 py-1">
                      <button 
                        onClick={() => {
                          setMenuOpen(false);
                          setIsEditing(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Moment
                      </button>
                      <button 
                        onClick={() => {
                          setMenuOpen(false);
                          setConfirmDeleteOpen(true);
                        }}
                        disabled={isDeleting}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Moment
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="mt-4 px-2 space-y-4">
            <textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-deepPlum focus:outline-none focus:border-rose-plum/40 resize-none min-h-[80px]"
              placeholder="Caption"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-deepPlum focus:outline-none focus:border-rose-plum/40"
                placeholder="Location"
              />
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-deepPlum focus:outline-none focus:border-rose-plum/40"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-600"
              >
                Cancel
              </button>
              <button 
                onClick={handleEdit}
                disabled={isSavingEdit}
                className="flex-1 py-2 bg-rose-plum rounded-lg text-sm font-medium text-white flex items-center justify-center"
              >
                {isSavingEdit ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Media */}
            {renderMedia()}
    
            {/* Caption */}
            {moment.caption && (
              <div className="mt-4 px-2">
                <p className="text-sm font-serif leading-relaxed text-rose-plum/90">
                  {moment.caption}
                </p>
              </div>
            )}
          </>
        )}

        {/* Footer actions */}
        <div className="mt-5 px-2 flex items-center justify-between text-rose-dusty/60">
          <div className="flex items-center gap-6">
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 transition-colors ${hasLiked ? 'text-rose-pink' : 'hover:text-rose-pink'} ${isLiking ? 'opacity-50' : ''} min-w-[44px] min-h-[44px] -ml-2 p-2`}
            >
              <Heart className={`w-6 h-6 transition-transform ${hasLiked ? 'fill-rose-pink scale-110' : ''} ${isLiking ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-medium">{moment.reactions.length > 0 ? moment.reactions.length : ''}</span>
            </button>
            <button 
              onClick={() => setCommentsOpen(true)}
              className="flex items-center gap-2 hover:text-rose-plum transition-colors min-w-[44px] min-h-[44px] p-2"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm font-medium">{moment.comments.length > 0 ? moment.comments.length : ''}</span>
            </button>
          </div>
        </div>
      </div>

      {galleryOpen && (
        <MediaGallery 
          media={moment.media} 
          initialIndex={initialGalleryIndex} 
          onClose={() => setGalleryOpen(false)} 
        />
      )}

      {commentsOpen && (
        <CommentsSheet 
          momentId={moment.id}
          comments={moment.comments}
          onClose={() => setCommentsOpen(false)}
          onCommentAdded={handleCommentAdded}
        />
      )}

      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-deepPlum mb-2">Delete Moment?</h3>
            <p className="text-sm text-deepPlum/70 mb-6">
              Are you sure you want to delete this memory? This cannot be undone.
            </p>
            <div className="w-full flex gap-3">
              <button
                onClick={() => setConfirmDeleteOpen(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors flex items-center justify-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
