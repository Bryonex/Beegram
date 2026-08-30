import React from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import { cn } from './Button'

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: 'elevated' | 'flat'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'elevated', children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-3xl bg-white overflow-hidden",
          {
            'shadow-soft': variant === 'elevated',
            'border-2 border-lavender-mist': variant === 'flat',
          },
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = "Card"
