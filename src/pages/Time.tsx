import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Clock, CalendarHeart, Stars } from 'lucide-react'
import { useRelationshipTimer } from '../hooks/useRelationshipTimer'

export default function Time() {
  const navigate = useNavigate()
  
  // Seeded start date: 20 June 2026, 12:00 AM
  const { days, hours, minutes, seconds } = useRelationshipTimer('2026-06-20T00:00:00')

  const milestones = [
    {
      id: '1',
      title: 'Beegram Began',
      date: '20 June 2026',
      description: 'The moment everything changed.',
      type: 'origin'
    }
    // Future milestones can be added here
  ]

  return (
    <div className="w-full min-h-[100dvh] bg-[#F0E6F7] pt-safe flex flex-col relative overflow-hidden">
      {/* Twilight Lavender Atmosphere */}
      <div className="fixed inset-0 bg-gradient-to-b from-lavender-deep/10 to-transparent pointer-events-none" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-lavender-deep/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      
      <div className="px-5 pt-6 pb-2 sticky top-0 z-20 flex items-center justify-between">
        <button 
          onClick={() => navigate('/home')}
          className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm shadow-sm flex items-center justify-center text-deepPlum/70 hover:text-deepPlum transition-colors"
        >
          <ChevronLeft className="w-5 h-5 -ml-0.5" />
        </button>
      </div>

      <div className="flex-1 px-5 pt-4 pb-24 relative z-10">
        
        {/* Main Timer Display */}
        <div className="flex flex-col items-center justify-center py-10 mb-8">
          <div className="w-16 h-16 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-lavender-mist/50">
            <Clock className="w-8 h-8 text-lavender-deep" />
          </div>
          
          <h1 className="text-3xl font-serif text-deepPlum mb-8 font-medium">Our Time</h1>
          
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="text-4xl font-serif text-deepPlum tabular-nums tracking-tight">
                {String(days).padStart(2, '0')}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-deepPlum/50 mt-1">Days</div>
            </div>
            <div className="text-2xl font-serif text-deepPlum/30 mt-1">:</div>
            
            <div className="flex flex-col items-center">
              <div className="text-4xl font-serif text-deepPlum tabular-nums tracking-tight">
                {String(hours).padStart(2, '0')}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-deepPlum/50 mt-1">Hrs</div>
            </div>
            <div className="text-2xl font-serif text-deepPlum/30 mt-1">:</div>
            
            <div className="flex flex-col items-center">
              <div className="text-4xl font-serif text-deepPlum tabular-nums tracking-tight">
                {String(minutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-deepPlum/50 mt-1">Min</div>
            </div>
            <div className="text-2xl font-serif text-deepPlum/30 mt-1">:</div>
            
            <div className="flex flex-col items-center">
              <div className="text-4xl font-serif text-deepPlum tabular-nums tracking-tight w-12 text-center">
                {String(seconds).padStart(2, '0')}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-deepPlum/50 mt-1">Sec</div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-8 px-2">
            <CalendarHeart className="w-5 h-5 text-dustyRose" />
            <h2 className="text-lg font-serif text-deepPlum font-medium">Milestones</h2>
          </div>

          <div className="relative pl-6 space-y-8">
            {/* Vertical Line */}
            <div className="absolute left-[11px] top-2 bottom-0 w-px bg-gradient-to-b from-lavender-deep/30 to-transparent" />

            {milestones.map((milestone, i) => (
              <motion.div 
                key={milestone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {/* Node */}
                <div className="absolute -left-[30px] top-1 w-6 h-6 bg-[#F0E6F7] rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-lavender-deep rounded-full shadow-sm" />
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-lavender-mist/40 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-serif text-lg text-deepPlum">{milestone.title}</h3>
                    {milestone.type === 'origin' && (
                      <Stars className="w-4 h-4 text-sunflower shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-lavender-deep font-medium mb-3">{milestone.date}</p>
                  {milestone.description && (
                    <p className="text-sm text-deepPlum/70 leading-relaxed">
                      {milestone.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
