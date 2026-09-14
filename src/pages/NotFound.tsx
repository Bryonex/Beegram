import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-warmPaper overflow-hidden">
      <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
        {/* The big 404 */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-8xl font-black text-amber-200/50 absolute z-0 tracking-tighter"
        >
          404
        </motion.h1>

        {/* The lost bee animation */}
        <motion.div
          initial={{ x: -300, y: -100, opacity: 0 }}
          animate={{
            x: [ -200, -50, 20, -10, 0 ],
            y: [ -50, 80, -20, 10, 0 ],
            opacity: 1,
            rotate: [ -20, 40, -10, 10, 0 ]
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.4, 0.7, 0.9, 1]
          }}
          className="z-10 text-6xl relative"
        >
          🐝
          
          {/* Confused marks popping up after landing */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.1, duration: 0.3 }}
            className="absolute -top-4 -right-2 text-2xl"
          >
            ❓
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 0.5 }}
        className="text-center mt-8 z-10"
      >
        <h2 className="text-2xl font-bold text-slate-800 mb-2 font-display">
          Looks like the bee got lost.
        </h2>
        <p className="text-slate-500 mb-8 max-w-[280px] mx-auto leading-relaxed">
          Hmm... this isn't where we were going. Let's fly back home.
        </p>

        <Link 
          to="/home"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 text-amber-950 font-bold rounded-full shadow-lg shadow-amber-400/20 active:scale-95 transition-transform"
        >
          <Home className="w-5 h-5" />
          Fly Home
        </Link>
      </motion.div>
    </div>
  )
}
