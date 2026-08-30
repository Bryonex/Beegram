import React from 'react'

export const Sunflower = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    {/* Center */}
    <circle cx="50" cy="50" r="15" fill="currentColor" opacity="0.3" />
    {/* Petals */}
    {Array.from({ length: 12 }).map((_, i) => (
      <path key={i} d="M50 35 L45 15 L50 5 L55 15 Z" transform={`rotate(${i * 30} 50 50)`} fill="currentColor" />
    ))}
  </svg>
)

export const Rose = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M50 80 Q60 60 70 50 Q80 40 70 30 Q60 20 50 25 Q40 20 30 30 Q20 40 30 50 Q40 60 50 80 Z" fill="currentColor" />
    <path d="M40 35 Q50 20 60 35 Q70 50 50 60 Q30 50 40 35 Z" fill="rgba(255,255,255,0.3)" />
    <path d="M45 45 Q50 35 55 45 Q60 55 50 55 Q40 55 45 45 Z" fill="rgba(255,255,255,0.5)" />
  </svg>
)

export const Tulip = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M25 50 Q25 80 50 85 Q75 80 75 50 C75 30 65 15 50 15 C35 15 25 30 25 50 Z" fill="currentColor" />
    <path d="M40 18 Q50 40 60 18" />
    <path d="M50 15 L50 60" stroke="rgba(255,255,255,0.4)" />
  </svg>
)

export const Lavender = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M50 90 L50 20" stroke="rgba(255,255,255,0.2)" />
    {[25, 35, 45, 55, 65, 75].map((y, i) => (
      <React.Fragment key={i}>
        <circle cx="42" cy={y} r="4" fill="currentColor" />
        <circle cx="58" cy={y} r="4" fill="currentColor" />
      </React.Fragment>
    ))}
    <circle cx="50" cy="15" r="4" fill="currentColor" />
  </svg>
)

export const Daisy = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="50" cy="50" r="10" fill="#F3C969" stroke="none" />
    {Array.from({ length: 8 }).map((_, i) => (
      <ellipse key={i} cx="50" cy="22" rx="6" ry="14" fill="currentColor" transform={`rotate(${i * 45} 50 50)`} />
    ))}
  </svg>
)

export const ForgetMeNot = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="50" cy="50" r="8" fill="#F3C969" stroke="none" />
    {Array.from({ length: 5 }).map((_, i) => (
      <circle key={i} cx="50" cy="25" r="12" fill="currentColor" transform={`rotate(${i * 72} 50 50)`} />
    ))}
  </svg>
)
