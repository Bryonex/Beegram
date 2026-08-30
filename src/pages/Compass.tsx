import { useState, useEffect } from 'react'
import { useCurrentProfile } from '../hooks/useCurrentProfile'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Navigation, MapPin, Sun, Moon } from 'lucide-react'

export default function Compass() {
  const navigate = useNavigate()
  const { profile, partner } = useCurrentProfile()
  
  // Simulated compass state
  const [heading, setHeading] = useState(0)
  const [distance, setDistance] = useState(0)
  const [isLocating, setIsLocating] = useState(true)
  const hasPartnerLocation = !!(partner?.latitude && partner?.longitude)

  const isUserSun = profile?.username?.toLowerCase() === 'sundar'
  const UserIcon = isUserSun ? Sun : Moon
  const PartnerIcon = isUserSun ? Moon : Sun
  const partnerLabel = isUserSun ? 'Moon' : 'Sun'

  const [targetBearing, setTargetBearing] = useState(0)

// Distance calculator using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371 // km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Bearing calculator
const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const dLon = (lon2 - lon1) * Math.PI / 180
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180)
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon)
  let brng = Math.atan2(y, x) * 180 / Math.PI
  return (brng + 360) % 360
}

useEffect(() => {
  if (!profile) return

  let watchId: number
  const updateLocation = () => {
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(async (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude

        setIsLocating(false)

        // Update own location in DB
        if (profile.id) {
          await (supabase as any).from('profiles').update({
            latitude: lat,
            longitude: lon,
            location_updated_at: new Date().toISOString()
          }).eq('id', profile.id)
        }

        // Calculate distance to partner if they have location
        if (partner?.latitude && partner?.longitude) {
          const d = calculateDistance(lat, lon, partner.latitude, partner.longitude)
          setDistance(d)

          const b = calculateBearing(lat, lon, partner.latitude, partner.longitude)
          setTargetBearing(b)
        }
      }, (err) => {
        console.error('Error getting location', err)
        setIsLocating(false)
      }, { enableHighAccuracy: true })
    }
  }

  updateLocation()

  return () => {
    if (watchId) navigator.geolocation.clearWatch(watchId)
  }
}, [profile, partner])

  useEffect(() => {


    let compassInterval: ReturnType<typeof setInterval>
    
    const handleOrientation = (event: DeviceOrientationEvent) => {
      // Use webkitCompassHeading for iOS if available, else alpha
      let currentHeading = 0
      if ('webkitCompassHeading' in event) {
        currentHeading = (event as any).webkitCompassHeading
      } else if (event.alpha !== null) {
        currentHeading = 360 - event.alpha
      }
      setHeading(currentHeading)
    }

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientationabsolute', handleOrientation as any)
      window.addEventListener('deviceorientation', handleOrientation as any)
    } else {
      // Fallback to simulate subtle compass movement if no API
      compassInterval = setInterval(() => {
        setHeading(prev => {
          const drift = (Math.random() - 0.5) * 5
          return (prev + drift + 360) % 360
        })
      }, 100)
    }

    return () => {
      if (compassInterval) clearInterval(compassInterval)
      window.removeEventListener('deviceorientationabsolute', handleOrientation as any)
      window.removeEventListener('deviceorientation', handleOrientation as any)
    }
  }, [])

  const requestCompassPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission()
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', (e) => {
             let currentHeading = 0
             if ('webkitCompassHeading' in e) {
               currentHeading = (e as any).webkitCompassHeading
             } else if (e.alpha !== null) {
               currentHeading = 360 - e.alpha
             }
             setHeading(currentHeading)
          })
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#F0F4F8] flex flex-col relative overflow-hidden pt-safe pb-24">
      {/* Soft Sky Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E1EAF4] to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lavender-soft/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="px-5 pt-6 pb-2 sticky top-0 z-20 flex items-center justify-between">
        <button 
          onClick={() => navigate('/home')}
          className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm shadow-sm flex items-center justify-center text-deepPlum/70 hover:text-deepPlum transition-colors"
        >
          <ChevronLeft className="w-5 h-5 -ml-0.5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-5">
        
        <h1 className="text-3xl font-serif text-deepPlum mb-2">Our Compass</h1>
        <p className="text-deepPlum/60 text-sm font-sans mb-12">Always pointing to the {partnerLabel}</p>

        {isLocating ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-lavender-soft border-t-lavender-deep rounded-full animate-spin" />
            <p className="text-deepPlum/60 text-sm font-medium animate-pulse">Finding our coordinates...</p>
          </div>
        ) : !hasPartnerLocation ? (
          <div className="flex flex-col items-center justify-center space-y-4 max-w-xs text-center py-10">
            <div className="w-16 h-16 bg-white/60 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center mb-2 border border-lavender-mist/50">
              <PartnerIcon className="w-8 h-8 text-lavender-deep/60" />
            </div>
            <h2 className="text-lg font-serif text-deepPlum font-medium">Waiting for {partnerLabel}</h2>
            <p className="text-sm text-deepPlum/60 font-sans leading-relaxed">
              We need {partner?.display_name}'s location to guide you to them. Tell them to open the Compass.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full max-w-sm">
            
            {/* Compass Dial */}
            <div 
              className="relative w-72 h-72 rounded-full border-4 border-white bg-white/40 backdrop-blur-md shadow-xl flex items-center justify-center mb-12 cursor-pointer"
              onClick={requestCompassPermission}
            >
              <div className="absolute inset-0 rounded-full border border-lavender-deep/10 m-4" />
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-deepPlum/10 m-8 animate-[spin_60s_linear_infinite]" />
              
              {/* Target Indicator */}
              <motion.div 
                className="absolute w-full h-full flex items-start justify-center"
                animate={{ rotate: targetBearing - heading }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
              >
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[24px] border-b-lavender-deep -mt-2 drop-shadow-md" />
                <div className="w-6 h-6 bg-white rounded-full absolute top-[16px] shadow-sm border border-lavender-deep/20 flex items-center justify-center">
                   <PartnerIcon className="w-3 h-3 text-lavender-deep" />
                </div>
              </motion.div>

              {/* Center Node */}
              <div className="w-8 h-8 bg-white rounded-full shadow-md border-2 border-lavender-soft flex items-center justify-center z-10">
                <UserIcon className="w-4 h-4 text-deepPlum" />
              </div>
            </div>

            {/* Distance HUD */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-md px-8 py-5 rounded-3xl shadow-sm border border-white flex flex-col items-center w-full"
            >
              <div className="flex items-center gap-2 text-lavender-deep mb-2">
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-widest">Distance</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-serif text-deepPlum tabular-nums tracking-tight">{distance.toFixed(1)}</span>
                <span className="text-xl text-deepPlum/60 font-medium">km</span>
              </div>
              
              <div className="w-full h-px bg-lavender-mist/50 my-4" />
              
              <div className="flex items-center justify-between w-full text-sm">
                <span className="text-deepPlum/60 flex items-center gap-1">
                  <Navigation className="w-4 h-4" />
                  Heading
                </span>
                <span className="text-deepPlum font-medium">{Math.round(heading)}° NNE</span>
              </div>
            </motion.div>
            
          </div>
        )}
      </div>
    </div>
  )
}
