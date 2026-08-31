import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

interface BackButtonProps {
  to?: string
  onClick?: () => void
  label?: string
  className?: string
}

export function BackButton({ to, onClick, label, className = '' }: BackButtonProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onClick) {
      onClick()
    } else if (to) {
      navigate(to)
    } else {
      navigate(-1)
    }
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleBack}
      className={`flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors p-2 -ml-2 rounded-full hover:bg-slate-100/50 ${className}`}
      aria-label="Go back"
    >
      <ChevronLeft className="w-6 h-6" />
      {label && <span className="font-medium pr-2">{label}</span>}
    </motion.button>
  )
}
