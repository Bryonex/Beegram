import { useState } from 'react'

import { useNavigate } from 'react-router-dom'
import { UserCircle, Heart, Bell, MapPin, Shield, Download, LogOut, ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="w-full min-h-[100dvh] bg-[#F8F7FA] pt-safe pb-24 flex flex-col relative">
      <div className="px-5 pt-6 pb-2 sticky top-0 bg-[#F8F7FA]/80 backdrop-blur-md z-20 border-b border-lavender-mist/50 flex items-center justify-between">
        <button 
          onClick={() => navigate('/home')}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-deepPlum/70 hover:text-deepPlum transition-colors"
        >
          <ChevronLeft className="w-5 h-5 -ml-0.5" />
        </button>
        <h1 className="text-xl font-serif text-deepPlum font-medium">Settings</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 pt-6 space-y-6">
        
        {/* Profile */}
        <section className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 border border-lavender-mist/40 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-deepPlum">
            <UserCircle className="w-5 h-5 text-lavender-deep" />
            <h2 className="font-semibold text-base">Profile</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-deepPlum/70">Display Name</span>
              <span className="text-sm font-medium text-deepPlum">Me</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-deepPlum/70">Username</span>
              <span className="text-sm font-medium text-deepPlum">sundar</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-deepPlum/70">Avatar</span>
              <button className="text-sm text-lavender-deep font-medium">Update</button>
            </div>
          </div>
        </section>

        {/* Relationship */}
        <section className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 border border-lavender-mist/40 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-deepPlum">
            <Heart className="w-5 h-5 text-dustyRose" />
            <h2 className="font-semibold text-base">Relationship</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-deepPlum/70">Partner</span>
              <span className="text-sm font-medium text-deepPlum">Her</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-deepPlum/70">Started</span>
              <span className="text-sm font-medium text-deepPlum">20 June 2026</span>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 border border-lavender-mist/40 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-deepPlum">
            <Bell className="w-5 h-5 text-sunflower" />
            <h2 className="font-semibold text-base">Notifications</h2>
          </div>
          <div className="space-y-4">
            {['Letters', 'Voice Notes', 'Buzz', 'Moments', 'Activities', 'Garden', 'Games'].map(item => (
              <div key={item} className="flex items-center justify-between">
                <span className="text-sm text-deepPlum/70">{item}</span>
                <div className="w-11 h-6 bg-lavender-soft rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Location Sharing */}
        <section className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 border border-lavender-mist/40 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-deepPlum">
            <MapPin className="w-5 h-5 text-sage" />
            <h2 className="font-semibold text-base">Location Sharing</h2>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-deepPlum/70">Status</span>
              <span className="text-sm font-medium text-deepPlum/50">Not sharing</span>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 border border-lavender-mist/40 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-deepPlum">
            <Shield className="w-5 h-5 text-deepPlum/60" />
            <h2 className="font-semibold text-base">Privacy</h2>
          </div>
          <p className="text-xs text-deepPlum/60 leading-relaxed">
            This is a private relationship space. Your photos, videos, messages, storage, and shared activities are protected and only accessible by you and your partner.
          </p>
        </section>

        {/* PWA / App */}
        <section className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 border border-lavender-mist/40 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-deepPlum">
            <Download className="w-5 h-5 text-lavender-deep" />
            <h2 className="font-semibold text-base">Install App</h2>
          </div>
          <p className="text-xs text-deepPlum/60 leading-relaxed mb-3">
            For the best experience on iOS, tap the Share icon in Safari and select "Add to Home Screen".
          </p>
        </section>

        {/* Account */}
        <section className="pt-2 pb-6">
          <button 
            onClick={handleLogout}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-white text-red-500 rounded-2xl font-medium shadow-sm border border-red-100 hover:bg-red-50 transition-colors"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
            ) : (
              <>
                <LogOut className="w-5 h-5" />
                Sign Out
              </>
            )}
          </button>
        </section>

      </div>
    </div>
  )
}
