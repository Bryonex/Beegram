import { useState } from 'react'
import { Heart, MessageCircle, Play } from 'lucide-react'
import type { Moment, MomentComment } from '../../types/moments'
import { MediaGallery } from './MediaGallery'
import { CommentsSheet } from './CommentsSheet'
import { useCurrentProfile } from '../../hooks/useCurrentProfile'
import { momentService } from '../../services/momentService'
import { useToast } from '../../contexts/ToastContext'

interface Props {
  moment: Moment
}

export function MomentCard({ moment: initialMoment }: Props) {
  const [moment, setMoment] = useState(initialMoment)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  const { profile } = useCurrentProfile()
  const { error } = useToast()
  
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
          {m.type === 'video' ? (
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
      <div className="w-full bg-white rounded-3xl p-4 shadow-sm border border-rose-base/50">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-3 px-1">
          <div>
            <p className="text-rose-plum font-serif text-sm">{formattedDate}</p>
            {moment.location && (
              <p className="text-[10px] uppercase tracking-widest text-rose-dusty/60 font-sans mt-0.5">{moment.location}</p>
            )}
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${
            isMe ? 'bg-rose-base text-rose-dusty' : 'bg-rose-pink/15 text-rose-pink'
          }`}>
            BY {moment.authorName || moment.authorId}
          </div>
        </div>

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
    </>
  )
}
