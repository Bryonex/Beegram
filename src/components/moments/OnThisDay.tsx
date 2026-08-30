import { motion } from 'framer-motion'
import { CalendarHeart } from 'lucide-react'
import type { Moment } from '../../types/moments'

interface Props {
  historicalMoments: Moment[]
}

export function OnThisDay({ historicalMoments }: Props) {
  if (historicalMoments.length === 0) {
    return (
      <div className="w-full bg-rose-base/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center border border-rose-pink/20 border-dashed">
        <CalendarHeart className="w-8 h-8 text-rose-dusty/40 mb-3" />
        <h3 className="font-serif text-rose-plum text-lg mb-1">On This Day</h3>
        <p className="text-rose-dusty/70 text-xs font-sans max-w-[200px] leading-relaxed">
          As our garden grows, memories from previous years will bloom here.
        </p>
      </div>
    )
  }

  // Future implementation for real historical moments
  return (
    <div className="w-full bg-rose-pink/15 rounded-3xl p-6 border border-rose-pink/30">
      <div className="flex items-center gap-2 mb-4 text-rose-plum">
        <CalendarHeart className="w-5 h-5" />
        <h3 className="font-serif text-lg">On This Day</h3>
      </div>
      
      {/* Scrollable list of past memories... */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {historicalMoments.map(moment => (
          <motion.div 
            whileTap={{ scale: 0.98 }}
            key={moment.id} 
            className="w-48 h-64 shrink-0 rounded-2xl bg-white shadow-soft overflow-hidden relative cursor-pointer"
          >
            {moment.media.length > 0 && (
              <img 
                src={moment.media[0].posterUrl || moment.media[0].url} 
                alt=""
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-rose-plum/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <p className="text-[10px] uppercase tracking-wider mb-1 opacity-80">{new Date(moment.date).getFullYear()}</p>
              <p className="text-sm font-serif line-clamp-2 leading-tight shadow-sm">{moment.caption}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
