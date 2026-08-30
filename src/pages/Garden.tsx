import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Wind, X, Stars } from 'lucide-react'
import { Sunflower, Rose, Tulip, Lavender, Daisy, ForgetMeNot } from '../components/garden/FlowerIcons'
import { CustomSun, CustomMoon } from '../components/garden/CelestialBodies'

type FlowerType = 'Lavender' | 'Rose' | 'Sunflower' | 'Tulip' | 'Daisy' | 'ForgetMeNot'

interface GardenItem {
  id: string
  type: FlowerType
  title: string
  date: string
  source: string
  author: 'sundar' | 'bee'
  x: number 
  y: number 
}

import { gardenService } from '../services/gardenService'
import { useCurrentProfile } from '../hooks/useCurrentProfile'

export default function Garden() {
  const [selectedItem, setSelectedItem] = useState<GardenItem | null>(null)
  const [timePhase, setTimePhase] = useState<'day' | 'sunset' | 'night'>('day')
  const [orbitProgress, setOrbitProgress] = useState(0)
  
  const [items, setItems] = useState<GardenItem[]>([])
  const { profile } = useCurrentProfile()
  
  useEffect(() => {
    if (profile?.relationship_id) {
      gardenService.getItems(profile.relationship_id).then(data => {
        setItems(data.map(d => ({
          id: d.id,
          type: d.type as FlowerType,
          title: d.title,
          date: new Date(d.created_at).toLocaleDateString(),
          source: d.source,
          author: d.author_id === profile.id ? profile.username as 'sundar' | 'bee' : (profile.username === 'sundar' ? 'bee' : 'sundar'),
          x: d.position_x,
          y: d.position_y
        })))
      }).catch(console.error)
    }
  }, [profile])

  useEffect(() => {
    const updateTime = () => {
      const current = new Date()
      const hour = current.getHours()
      const minutes = current.getMinutes()
      const totalMinutes = hour * 60 + minutes
      
      // Calculate phase
      if (hour >= 6 && hour < 17) {
        setTimePhase('day')
        setOrbitProgress((totalMinutes - (6 * 60)) / (11 * 60)) // 6am to 5pm
      }
      else if (hour >= 17 && hour < 19) {
        setTimePhase('sunset')
        setOrbitProgress((totalMinutes - (17 * 60)) / (2 * 60)) // 5pm to 7pm
      }
      else {
        setTimePhase('night')
        let nightMinutes = totalMinutes
        if (hour >= 19) nightMinutes -= (19 * 60)
        else nightMinutes += (5 * 60)
        setOrbitProgress(nightMinutes / (11 * 60)) // 7pm to 6am
      }
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const theme = useMemo(() => {
    switch (timePhase) {
      case 'day': return {
        bg: 'bg-[#F5F7F4]',
        text: 'text-deepPlum',
        subtext: 'text-deepPlum/60',
        sky: 'from-[#e0f2fe] to-[#F5F7F4]',
        celestial: <CustomSun className="w-24 h-24" />,
        greeting: 'Good morning, Sun.',
        glow: 'bg-sunflower/20'
      }
      case 'sunset': return {
        bg: 'bg-[#FFF0F0]',
        text: 'text-deepPlum',
        subtext: 'text-deepPlum/60',
        sky: 'from-[#fed7aa] to-[#FFF0F0]',
        celestial: <CustomSun className="w-24 h-24 opacity-80" />,
        greeting: 'Sun meets Moon.',
        glow: 'bg-orange-300/20'
      }
      case 'night': return {
        bg: 'bg-[#1a1b2e]',
        text: 'text-lavender-mist',
        subtext: 'text-lavender-pale/60',
        sky: 'from-[#0f172a] to-[#1a1b2e]',
        celestial: <CustomMoon className="w-20 h-20" />,
        greeting: 'Good evening, Moon.',
        glow: 'bg-indigo-500/20'
      }
    }
  }, [timePhase])

  // Celestial mechanics: moves in an arc from left (0%) to right (100%) and rises in the middle
  const orbitStyle = {
    left: `${10 + (orbitProgress * 80)}%`,
    top: `${30 - Math.sin(orbitProgress * Math.PI) * 15}%`,
    transform: 'translate(-50%, -50%)',
    transition: 'all 1s linear'
  }



  const getFlowerStyle = (type: FlowerType) => {
    switch (type) {
      case 'Lavender': return { color: '#765A9E', bg: 'bg-lavender-soft/30', Icon: Lavender }
      case 'Rose': return { color: '#E8A8B8', bg: 'bg-blush/40', Icon: Rose }
      case 'Sunflower': return { color: '#F3C969', bg: 'bg-sunflower/30', Icon: Sunflower }
      case 'Tulip': return { color: '#A9BEA5', bg: 'bg-sage/40', Icon: Tulip }
      case 'Daisy': return { color: '#ffffff', bg: 'bg-white/40', Icon: Daisy }
      case 'ForgetMeNot': return { color: '#60a5fa', bg: 'bg-blue-200/40', Icon: ForgetMeNot }
      default: return { color: '#765A9E', bg: 'bg-lavender-soft/30', Icon: Lavender }
    }
  }

  return (
    <div className={`w-full min-h-[100dvh] flex flex-col relative pt-safe pb-24 transition-colors duration-1000 ${theme.bg}`}>
      
      {/* Fixed Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-b ${theme.sky} opacity-60 transition-colors duration-1000`} />
        
        {/* Atmosphere Orbs */}
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] ${theme.glow} rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 transition-colors duration-1000`} />
        <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] ${timePhase==='night'?'bg-indigo-900/40':'bg-sage/10'} rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 transition-colors duration-1000`} />

        {/* Orbiting Celestial Body */}
        <div className="absolute flex items-center justify-center" style={orbitStyle}>
          {theme.celestial}
        </div>
      </div>

      {/* Scrolling Content Layer */}
      <div className="relative z-10 flex flex-col w-full">
        
        {/* Header */}
        <div className="px-5 pt-8 mb-8">
          <h1 className={`text-3xl font-serif ${theme.text} mb-1 transition-colors duration-1000`}>Memory Garden</h1>
          <p className={`${theme.subtext} text-sm font-sans italic transition-colors duration-1000`}>"where our little moments grow"</p>
          <p className={`${theme.text} text-xs mt-2 font-medium opacity-80`}>{theme.greeting}</p>
        </div>

        {/* Garden Ground Area */}
        <div className={`mx-5 h-[400px] relative border ${timePhase==='night'?'border-white/10 bg-black/20':'border-sage/20 bg-white/40'} rounded-[2rem] backdrop-blur-sm overflow-hidden shadow-sm transition-colors duration-1000 flex-shrink-0`}>
          <div className={`absolute inset-0 opacity-20 bg-[radial-gradient(${timePhase==='night'?'#ffffff':'#A9BEA5'}_1px,transparent_1px)] [background-size:24px_24px]`} />
          
          {timePhase === 'night' && (
             <div className="absolute top-10 right-10 text-indigo-200/30"><Stars className="w-10 h-10" /></div>
          )}
          
          {items.map((item, i) => {
            const style = getFlowerStyle(item.type)
            return (
              <motion.button
                key={item.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: [-2, 2, -2] }}
                transition={{ 
                  scale: { delay: i * 0.15, type: 'spring' },
                  rotate: { repeat: Infinity, duration: 4 + Math.random() * 2, ease: "easeInOut" }
                }}
                onClick={() => setSelectedItem(item)}
                className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex flex-col items-center justify-center gap-1 hover:scale-110 focus:outline-none"
                style={{ left: `${item.x}%`, top: `${item.y}%`, transformOrigin: 'bottom center' }}
              >
                <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center shadow-sm border border-white/40 backdrop-blur-md`}>
                  <style.Icon className="w-6 h-6" style={{ color: style.color }} />
                </div>
                {/* Stem */}
                <div className={`w-[2px] h-3 ${timePhase==='night'?'bg-white/20':'bg-sage/40'} rounded-full absolute -bottom-2 transition-colors duration-1000`} />
              </motion.button>
            )
          })}

          {timePhase !== 'night' && (
            <div className="absolute bottom-10 left-10 text-sage/30"><Wind className="w-6 h-6" /></div>
          )}
        </div>
        
        {/* Spacer for bottom nav */}
        <div className="h-24 w-full" />
      </div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center px-5 pb-[env(safe-area-inset-bottom)] bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-xl w-full max-w-sm rounded-3xl p-6 shadow-xl border border-white/20 relative"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className={`w-16 h-16 rounded-2xl ${getFlowerStyle(selectedItem.type).bg} flex items-center justify-center mb-5 border border-white`}>
                {(() => {
                  const StyleIcon = getFlowerStyle(selectedItem.type).Icon;
                  return <StyleIcon className="w-10 h-10" style={{ color: getFlowerStyle(selectedItem.type).color }} />;
                })()}
              </div>
              
              <div className="flex items-center gap-2 text-xs font-medium text-sage mb-2 uppercase tracking-wider">
                <Leaf className="w-3 h-3" />
                {selectedItem.source}
              </div>
              
              <h2 className="font-serif text-2xl text-deepPlum mb-1">{selectedItem.title}</h2>
              <p className="text-deepPlum/60 text-sm mb-1">{selectedItem.date}</p>
              
              <p className="text-deepPlum/40 text-xs font-bold uppercase tracking-wider mb-4">
                Planted by {selectedItem.author === 'sundar' ? 'Sundar' : 'Bee'}
              </p>
              
              <p className="text-deepPlum/80 text-sm leading-relaxed pb-2">
                This {selectedItem.type.toLowerCase()} bloomed from a beautiful memory shared in Beegram.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  )
}
