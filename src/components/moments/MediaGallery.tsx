import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import type { MomentMedia } from '../../types/moments'

interface Props {
  media: MomentMedia[]
  initialIndex?: number
  onClose: () => void
}

export function MediaGallery({ media, initialIndex = 0, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Reset video when sliding
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [currentIndex])

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentIndex < media.length - 1) setCurrentIndex(prev => prev + 1)
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1)
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    const currentMedia = media[currentIndex]
    const a = document.createElement('a')
    a.href = currentMedia.url
    a.download = `moment-media-${currentIndex}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const currentMedia = media[currentIndex]

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 flex flex-col backdrop-blur-md"
        onClick={onClose}
      >
        {/* Top Bar */}
        <div className="w-full pt-safe flex items-center justify-between px-4 pb-4 bg-gradient-to-b from-black/50 to-transparent">
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white rounded-full bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          {media.length > 1 && (
            <div className="text-white/80 font-sans text-xs tracking-widest font-medium">
              {currentIndex + 1} / {media.length}
            </div>
          )}

          <button 
            onClick={handleDownload}
            className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white rounded-full bg-white/10"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Media Container */}
        <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex items-center justify-center touch-pan-y"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, { offset }) => {
                const swipe = offset.x
                if (swipe < -50 && currentIndex < media.length - 1) {
                  setCurrentIndex(prev => prev + 1)
                } else if (swipe > 50 && currentIndex > 0) {
                  setCurrentIndex(prev => prev - 1)
                }
              }}
              onClick={(e) => e.stopPropagation()} // Prevent close on tap
            >
              {currentMedia.type === 'image' ? (
                <img 
                  src={currentMedia.url} 
                  alt="" 
                  className="w-full h-full object-contain max-h-[80vh] pointer-events-none"
                />
              ) : (
                <div className="relative w-full max-h-[80vh] flex items-center justify-center">
                  <video 
                    ref={videoRef}
                    src={currentMedia.url}
                    poster={currentMedia.posterUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain max-h-[80vh]"
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls (Invisible touch zones for mobile, visible on hover for desktop) */}
          {currentIndex > 0 && (
            <div 
              className="absolute left-0 top-0 bottom-0 w-1/3 flex items-center pl-4 cursor-pointer group"
              onClick={handlePrev}
            >
              <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </div>
            </div>
          )}
          
          {currentIndex < media.length - 1 && (
            <div 
              className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-end pr-4 cursor-pointer group"
              onClick={handleNext}
            >
              <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
                <ChevronRight className="w-6 h-6" />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
