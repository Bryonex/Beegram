import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Music, Camera, Mail, MessageSquare, Flower2, Heart, PenTool, Navigation } from 'lucide-react'
import { useRelationshipTimer } from '../hooks/useRelationshipTimer'
import { thingsToDoService } from '../services/thingsToDoService'
import { momentService } from '../services/momentService'
import { musicService } from '../services/musicService'
import { gardenService } from '../services/gardenService'
import { useCurrentProfile } from '../hooks/useCurrentProfile'
import type { Moment } from '../types/moments'
import type { Song } from '../types/music'

const homeHeroImg = '/beegram%201img.jpeg'

export default function Home() {
  const navigate = useNavigate()
  const [todoCount, setTodoCount] = useState<number | null>(null)
  const [latestMoment, setLatestMoment] = useState<Moment | null>(null)
  const [latestSong, setLatestSong] = useState<Song | null>(null)
  const [gardenCount, setGardenCount] = useState<number | null>(null)
  const { profile } = useCurrentProfile()
  
  useEffect(() => {
    if (!profile?.relationship_id) return
    Promise.all([
      thingsToDoService.getActivities(),
      momentService.getMoments(),
      musicService.getSongs(profile.relationship_id),
      gardenService.getItems(profile.relationship_id),
    ]).then(([activities, moments, songs, gardenItems]) => {
      setTodoCount(activities.filter(activity => !activity.isCompleted).length)
      setLatestMoment(moments[0] || null)
      setLatestSong(songs[0] || null)
      setGardenCount(gardenItems.length)
    }).catch(error => console.error('Failed to load home data:', error))
  }, [profile?.relationship_id])

  // Seeded start date: 20 June 2026, 12:00 AM
  const { days, hours, minutes, seconds } = useRelationshipTimer('2026-06-20T00:00:00')

  return (
    <div className="min-h-[100dvh] bg-lavender-mist pt-safe">
      
      {/* Hero Section */}
      <div className="w-full relative flex flex-col items-center pt-8 bg-gradient-to-b from-lavender-soft/20 to-lavender-mist">
        
        {/* Welcome Text */}
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="text-center z-20 px-6 mb-2"
        >
          <h1 className="text-[1.6rem] font-serif text-plumBrown font-medium tracking-tight">Beegram</h1>
          <p className="text-mauveGray/90 text-xs mt-1">A private place just for us.</p>
        </motion.div>

        {/* Artwork */}
        <motion.div 
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="relative w-full h-[28vh] min-h-[200px] max-h-[260px] flex justify-center items-end"
        >
          <div className="w-full h-full overflow-hidden rounded-t-[50%] border border-lavender-soft/30 bg-lavender-mist/20 flex items-center justify-center">
            <img
              src={homeHeroImg}
              alt="Beegram"
              className="w-full h-full object-cover object-center opacity-90 scale-[1.12]"
              style={{
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0.2) 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0.2) 100%)'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-lavender-soft/10 via-lavender-mist/10 to-lavender-mist/40" />
            <Heart className="absolute w-12 h-12 text-lavender-deep/20" />
          </div>
        </motion.div>
      </div>

      <div className="px-5 relative z-20 space-y-8 pb-8 -mt-2">
        
        {/* Timer Lockup */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-center"
        >
          <div className="flex justify-center items-baseline gap-2 text-plumBrown font-serif">
            <div className="flex flex-col items-center w-12">
              <span className="text-4xl font-light tabular-nums tracking-tighter">{days}</span>
              <span className="text-[8px] font-sans text-mauveGray uppercase tracking-[0.15em] mt-1">Days</span>
            </div>
            <span className="text-xl font-light text-lavender-deep/30 -mt-4">:</span>
            <div className="flex flex-col items-center w-12">
              <span className="text-4xl font-light tabular-nums tracking-tighter">{hours.toString().padStart(2, '0')}</span>
              <span className="text-[8px] font-sans text-mauveGray uppercase tracking-[0.15em] mt-1">Hrs</span>
            </div>
            <span className="text-xl font-light text-lavender-deep/30 -mt-4">:</span>
            <div className="flex flex-col items-center w-12">
              <span className="text-4xl font-light tabular-nums tracking-tighter">{minutes.toString().padStart(2, '0')}</span>
              <span className="text-[8px] font-sans text-mauveGray uppercase tracking-[0.15em] mt-1">Min</span>
            </div>
            <span className="text-xl font-light text-lavender-deep/30 -mt-4">:</span>
            <div className="flex flex-col items-center w-12">
              <span className="text-4xl font-light tabular-nums tracking-tighter text-rose-dusty">{seconds.toString().padStart(2, '0')}</span>
              <span className="text-[8px] font-sans text-mauveGray uppercase tracking-[0.15em] mt-1">Sec</span>
            </div>
          </div>
          <p className="text-[11px] font-serif italic text-mauveGray mt-4 opacity-80">Since 20 June 2026 · 12:00 AM</p>
        </motion.div>

        {/* Compact Shortcuts */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button 
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/songs')}
            className="flex items-center gap-3 p-3.5 rounded-[1.25rem] bg-white shadow-[0_2px_10px_-4px_rgba(118,90,158,0.1)] border border-lavender-mist/30 text-left w-full"
          >
            <div className="w-9 h-9 shrink-0 rounded-full bg-lavender-deep/10 flex items-center justify-center">
              <Music className="w-4 h-4 text-lavender-deep" />
            </div>
            <div>
              <span className="block font-serif text-plumBrown text-[15px] leading-tight mb-0.5">Songs</span>
              <span className="block text-[10px] text-mauveGray font-sans leading-tight truncate max-w-[100px]">{latestSong ? latestSong.title : 'No songs yet'}</span>
            </div>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/messages')}
            className="flex items-center gap-3 p-3.5 rounded-[1.25rem] bg-white shadow-[0_2px_10px_-4px_rgba(118,90,158,0.1)] border border-lavender-mist/30 text-left w-full"
          >
            <div className="w-9 h-9 shrink-0 rounded-full bg-blush flex items-center justify-center">
              <Mail className="w-4 h-4 text-rose-dusty" />
            </div>
            <div>
              <span className="block font-serif text-plumBrown text-[15px] leading-tight mb-0.5">Letters</span>
              <span className="block text-[10px] text-mauveGray font-sans leading-tight">Warm paper</span>
            </div>
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/moments')}
            className="flex items-center gap-3 p-3.5 rounded-[1.25rem] bg-white shadow-[0_2px_10px_-4px_rgba(118,90,158,0.1)] border border-lavender-mist/30 text-left w-full"
          >
            <div className="w-9 h-9 shrink-0 rounded-full bg-rose-pink/15 flex items-center justify-center">
              <Camera className="w-4 h-4 text-rose-dusty" />
            </div>
            <div>
              <span className="block font-serif text-plumBrown text-[15px] leading-tight mb-0.5">Moments</span>
              <span className="block text-[10px] text-mauveGray font-sans leading-tight">Photographs</span>
            </div>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/messages')}
            className="flex items-center gap-3 p-3.5 rounded-[1.25rem] bg-white shadow-[0_2px_10px_-4px_rgba(118,90,158,0.1)] border border-lavender-mist/30 text-left w-full"
          >
            <div className="w-9 h-9 shrink-0 rounded-full bg-sunflower/15 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-sunflower" />
            </div>
            <div>
              <span className="block font-serif text-plumBrown text-[15px] leading-tight mb-0.5">Buzz</span>
              <span className="block text-[10px] text-mauveGray font-sans leading-tight">Quick hello</span>
            </div>
          </motion.button>
        </div>

        {/* Things To Do Shortcut */}
        <div className="space-y-3">
          <h2 className="text-[12px] font-serif italic text-mauveGray px-1 opacity-80">Things we're going to do</h2>
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(todoCount === null || todoCount === 0 ? '/things-to-do?compose=true' : '/things-to-do')}
            className="w-full p-5 rounded-[1.5rem] bg-white shadow-[0_4px_20px_-4px_rgba(118,90,158,0.1)] cursor-pointer group border border-lavender-mist/30 flex items-center justify-between"
          >
            <div>
              <p className="font-serif text-plumBrown text-[1.05rem] leading-snug">
                {todoCount === null || todoCount === 0 
                  ? 'Start a little plan together' 
                  : `${todoCount} little ${todoCount === 1 ? 'plan' : 'plans'} waiting for us`}
              </p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-mauveGray font-sans font-medium mt-1">
                {todoCount === null || todoCount === 0 ? 'Add something \u2192' : 'View our plans \u2192'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Doodle Wall */}
        <div className="space-y-3">
          <h2 className="text-[12px] font-serif italic text-mauveGray px-1 opacity-80">Doodle Wall</h2>
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/doodle')}
            className="w-full p-5 rounded-[1.5rem] bg-white shadow-[0_4px_20px_-4px_rgba(118,90,158,0.1)] cursor-pointer group border border-lavender-mist/30 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-sunflower/15 flex items-center justify-center shrink-0">
              <PenTool className="w-5 h-5 text-sunflower" />
            </div>
            <div>
              <p className="font-serif text-plumBrown text-[1.05rem] leading-snug">
                Draw something together
              </p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-mauveGray font-sans font-medium mt-1">
                Open Canvas \u2192
              </p>
            </div>
          </motion.div>
        </div>

        {/* Compass */}
        <div className="space-y-3">
          <h2 className="text-[12px] font-serif italic text-mauveGray px-1 opacity-80">Distance Between Us</h2>
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/compass')}
            className="w-full p-5 rounded-[1.5rem] bg-white shadow-[0_4px_20px_-4px_rgba(118,90,158,0.1)] cursor-pointer group border border-lavender-mist/30 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <Navigation className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="font-serif text-plumBrown text-[1.05rem] leading-snug">
                Our Compass
              </p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-mauveGray font-sans font-medium mt-1">
                Find direction \u2192
              </p>
            </div>
          </motion.div>
        </div>

        {/* Games */}
        <div className="space-y-3">
          <h2 className="text-[12px] font-serif italic text-mauveGray px-1 opacity-80">Play together</h2>
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/games')}
            className="w-full p-5 rounded-[1.5rem] bg-white shadow-[0_4px_20px_-4px_rgba(118,90,158,0.1)] cursor-pointer group border border-lavender-mist/30 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-rose-pink/15 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-rose-dusty" />
            </div>
            <div>
              <p className="font-serif text-plumBrown text-[1.05rem] leading-snug">
                Mini Games
              </p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-mauveGray font-sans font-medium mt-1">
                Play now &rarr;
              </p>
            </div>
          </motion.div>
        </div>



        {/* Recent Memory Preview */}
        <div className="space-y-3">
          <h2 className="text-[12px] font-serif italic text-mauveGray px-1 opacity-80">A recent memory</h2>
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/moments')}
            className="w-full rounded-[1.5rem] overflow-hidden bg-white shadow-[0_4px_20px_-4px_rgba(118,90,158,0.1)] cursor-pointer group border border-lavender-mist/20"
          >
            <div className="aspect-[3/2] bg-rose-pink/5 relative overflow-hidden flex items-center justify-center border-b border-rose-pink/10">
              {latestMoment?.media[0] ? (
                latestMoment.media[0].type === 'video' ? (
                  <video src={latestMoment.media[0].url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                ) : (
                  <img src={latestMoment.media[0].url} alt="Recent memory" className="w-full h-full object-cover" />
                )
              ) : (
                <Camera className="w-8 h-8 text-rose-dusty/20 transition-transform group-hover:scale-110" strokeWidth={1.5} />
              )}
            </div>
            <div className="p-5 bg-white">
              <p className="text-[9px] uppercase tracking-[0.2em] text-mauveGray font-sans mb-2 font-medium">
                {latestMoment ? new Date(latestMoment.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'No moments yet'}
              </p>
              <p className="font-serif text-plumBrown text-[1.05rem] leading-snug">
                {latestMoment?.caption || 'Your next memory will appear here.'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Garden Preview */}
        <div className="space-y-3">
          <h2 className="text-[12px] font-serif italic text-mauveGray px-1 opacity-80">Memory Garden</h2>
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/garden')}
            className="w-full p-6 rounded-[1.5rem] bg-sage/10 relative overflow-hidden flex items-center justify-between cursor-pointer group border border-sage/20"
          >
             <div className="relative z-10">
               <h3 className="font-serif text-plumBrown text-[1.2rem] mb-1 leading-tight">Our garden is growing</h3>
               <p className="text-[10px] uppercase tracking-[0.15em] text-sage font-medium">
                 {gardenCount === null ? 'Loading our blooms...' : `${gardenCount} ${gardenCount === 1 ? 'bloom' : 'blooms'} in the garden`}
               </p>
             </div>
             <Flower2 className="w-10 h-10 text-sage/40 relative z-10 transition-transform group-hover:rotate-12" strokeWidth={1.5} />
             
             {/* Subtle botanical color washes */}
             <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-pink/20 rounded-full blur-xl" />
             <div className="absolute right-12 -top-6 w-20 h-20 bg-sunflower/20 rounded-full blur-xl" />
          </motion.div>
        </div>

        {/* Easter Egg */}
        <div className="flex justify-center pb-8 pt-4">
          <button 
            onClick={() => navigate('/does-not-exist')}
            className="opacity-40 hover:opacity-100 hover:scale-110 transition-all duration-300"
            title="Lost Bee"
          >
            <span className="text-xl">🐝</span>
          </button>
        </div>

      </div>
    </div>
  )
}
