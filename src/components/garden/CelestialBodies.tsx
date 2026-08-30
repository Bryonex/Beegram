import { useMemo } from 'react'

export const CustomSun = ({ className }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-300 via-sunflower to-yellow-100 blur-[8px] animate-pulse" style={{ animationDuration: '3s' }} />
      <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-sunflower to-white shadow-[0_0_20px_rgba(243,201,105,0.8)]" />
      <div className="absolute inset-[-20%] rounded-full bg-sunflower/20 blur-[15px] animate-[spin_10s_linear_infinite]" />
      
      {/* Rays */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute w-[2px] h-[120%] bg-gradient-to-t from-transparent via-sunflower/50 to-transparent" 
          style={{ transform: `rotate(${i * 22.5}deg)` }} 
        />
      ))}
    </div>
  )
}

export const CustomMoon = ({ className }: { className?: string }) => {
  // Simple moon phase calculation based on current date
  const phase = useMemo(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = today.getDate()
    
    // Simple Conway's formula for moon phase
    let r = year % 100
    r %= 19
    if (r > 9) r -= 19
    r = ((r * 11) % 30) + parseInt(month.toString()) + day
    if (month < 3) r += 2
    r -= ((year < 2000) ? 4 : 8.3)
    r = Math.floor(r + 0.5) % 30
    return r < 0 ? r + 30 : r
  }, [])

  // Phase is 0-29. 0 is new moon, 15 is full moon.
  // We'll create a CSS representation of the phase using a clip-path or box-shadow
  // For elegance, we'll use a layered SVG approach
  
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer Glow */}
      <div className="absolute inset-[-20%] rounded-full bg-indigo-300/30 blur-[15px]" />
      
      <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 filter drop-shadow-[0_0_8px_rgba(199,210,254,0.6)]">
        <defs>
          <radialGradient id="moon-gradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#818cf8" />
          </radialGradient>
          <filter id="crater-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="#312e81" floodOpacity="0.4" />
          </filter>
        </defs>
        
        {/* Base Moon */}
        <circle cx="50" cy="50" r="48" fill="url(#moon-gradient)" />
        
        {/* Craters */}
        <circle cx="35" cy="30" r="8" fill="#a5b4fc" opacity="0.4" filter="url(#crater-shadow)" />
        <circle cx="65" cy="45" r="12" fill="#a5b4fc" opacity="0.3" filter="url(#crater-shadow)" />
        <circle cx="45" cy="70" r="6" fill="#a5b4fc" opacity="0.5" filter="url(#crater-shadow)" />
        
        {/* Phase Shadow Overlay */}
        {phase > 2 && phase < 28 && (
          <path 
            d={`M 50 2 
                A 48 48 0 0 ${phase > 15 ? 1 : 0} 50 98 
                A ${Math.abs(15 - phase) * 3} 48 0 0 ${phase > 15 ? 0 : 1} 50 2`} 
            fill="#1e1b4b" 
            opacity="0.85" 
          />
        )}
        {/* New Moon */}
        {(phase <= 2 || phase >= 28) && (
          <circle cx="50" cy="50" r="48" fill="#1e1b4b" opacity="0.85" />
        )}
      </svg>
    </div>
  )
}
