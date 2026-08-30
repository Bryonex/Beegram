import React from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          {
            'bg-lavender-soft text-plumBrown hover:bg-lavender-deep hover:text-white shadow-soft': variant === 'primary',
            'bg-warmPaper text-plumBrown border-2 border-lavender-mist hover:bg-lavender-mist': variant === 'secondary',
            'bg-transparent text-plumBrown hover:bg-lavender-mist/50': variant === 'ghost',
            'h-9 px-4 text-sm': size === 'sm',
            'h-12 px-6 text-base': size === 'md',
            'h-14 px-8 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

Button.displayName = "Button"
