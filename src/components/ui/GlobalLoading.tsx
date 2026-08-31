import { motion } from 'framer-motion'
import { Flower2 } from 'lucide-react'

export function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-warmPaper/80 backdrop-blur-sm">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="text-amber-400/30"
        >
          <Flower2 className="w-16 h-16" />
        </motion.div>
        
        {/* Subtle bee flying around the flower */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            x: [0, 20, 0, -20, 0],
            y: [0, -20, 0, 20, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center text-xl"
        >
          <motion.span 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="inline-block"
          >
            🐝
          </motion.span>
        </motion.div>
      </div>
    </div>
  )
}
