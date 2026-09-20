import { useMemo } from 'react'

export const CustomSun = ({ className, label }: { className?: string, label?: string }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Glow effects */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-300 via-sunflower to-yellow-100 blur-[20px] animate-pulse" style={{ animationDuration: '3s' }} />
      <div className="absolute inset-[-20%] rounded-full bg-sunflower/20 blur-[25px] animate-[spin_10s_linear_infinite]" />
      
      {/* Actual Sun Image */}
      <img 
        src="/sun.jpg" 
        alt="Sun" 
        className="relative z-10 w-full h-full rounded-full object-cover shadow-[0_0_20px_rgba(243,201,105,0.8)] border border-orange-200/50"
      />
      
      {label && (
        <div className="absolute -bottom-8 z-20 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-xs font-bold text-orange-900 shadow-sm whitespace-nowrap">
          {label}
        </div>
      )}
    </div>
  )
}

export const CustomMoon = ({ className, label }: { className?: string, label?: string }) => {
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

  // Phase is 0-29. 15 is full moon.
  // We'll use fullmoon.jpg around 13-17, otherwise halfmoon.jpg
  const isFullMoon = phase >= 13 && phase <= 17
  const moonImage = isFullMoon ? "/fullmoon.jpg" : "/halfmoon.jpg"

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Outer Glow */}
      <div className="absolute inset-[-20%] rounded-full bg-indigo-300/30 blur-[20px]" />
      <div className="absolute inset-0 rounded-full bg-indigo-200/20 blur-[10px]" />
      
      {/* Actual Moon Image */}
      <img 
        src={moonImage} 
        alt={isFullMoon ? "Full Moon" : "Half Moon"}
        className="relative z-10 w-full h-full rounded-full object-cover shadow-[0_0_15px_rgba(199,210,254,0.6)] border border-indigo-200/30 mix-blend-screen"
      />

      {label && (
        <div className="absolute -bottom-8 z-20 px-3 py-1 rounded-full bg-indigo-900/40 backdrop-blur-md border border-indigo-200/20 text-xs font-bold text-indigo-100 shadow-sm whitespace-nowrap">
          {label}
        </div>
      )}
    </div>
  )
}
