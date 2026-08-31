import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  rules: string[]
}

export function GameRulesModal({ isOpen, onClose, title, rules }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-deepPlum/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-lavender-mist/30 text-lavender-deep rounded-full hover:bg-lavender-mist transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h2 className="font-serif text-2xl text-deepPlum mb-6">{title} Rules</h2>
            
            <div className="space-y-4">
              {rules.map((rule, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-lavender-soft/30 text-lavender-deep flex items-center justify-center font-serif text-sm">
                    {i + 1}
                  </div>
                  <p className="text-deepPlum/80 text-sm leading-relaxed pt-0.5">
                    {rule}
                  </p>
                </div>
              ))}
            </div>
            
            <button
              onClick={onClose}
              className="w-full mt-8 py-3 bg-lavender-dark text-white rounded-xl font-medium tracking-wide shadow-md"
            >
              Got it
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
