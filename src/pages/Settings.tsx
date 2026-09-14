import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCircle, Heart, Shield, Download, LogOut, ChevronLeft, Edit2, Upload } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCurrentProfile } from '../hooks/useCurrentProfile'
import { useToast } from '../contexts/ToastContext'

export default function Settings() {
  const navigate = useNavigate()
  const { profile, partner } = useCurrentProfile()
  const { success, error: toastError } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(profile?.display_name || '')
  const [isUploading, setIsUploading] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  const handleSaveName = async () => {
    if (!profile?.id || !editName.trim()) return
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: editName.trim() })
        .eq('id', profile.id)
      
      if (error) throw error
      success('Display name updated!')
      setIsEditingName(false)
      // Note: A real app might mutate the SWR cache or context here, 
      // but it will update on next fetch or we can let React update it if we had a setProfile
      window.location.reload()
    } catch (err) {
      console.error(err)
      toastError('Failed to update name')
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile?.id) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `profile-image.${fileExt}`
      const filePath = `avatars/${profile.id}/${fileName}`

      // Upload image
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath)

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      if (updateError) throw updateError

      success('Profile picture updated!')
      window.location.reload()
    } catch (err) {
      console.error(err)
      toastError('Failed to upload picture')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="w-full min-h-[100dvh] bg-[#F8F7FA] pt-safe pb-24 flex flex-col relative overflow-y-auto">
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
          <div className="flex items-center gap-3 mb-6 text-deepPlum">
            <UserCircle className="w-5 h-5 text-lavender-deep" />
            <h2 className="font-semibold text-base">Profile</h2>
          </div>
          
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-lavender-mist/50 border-4 border-white shadow-sm flex items-center justify-center text-3xl font-serif text-deepPlum">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  profile?.display_name?.charAt(0).toUpperCase() || '?'
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-lavender-deep text-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform disabled:opacity-50"
              >
                {isUploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-deepPlum/70">Display Name</span>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-lavender-soft/50 border border-lavender-mist rounded-lg px-3 py-1 text-sm text-deepPlum outline-none w-32"
                    autoFocus
                  />
                  <button onClick={handleSaveName} className="text-xs bg-lavender-deep text-white px-3 py-1.5 rounded-lg font-medium">Save</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-deepPlum">{profile?.display_name || 'Set a name'}</span>
                  <button onClick={() => { setEditName(profile?.display_name || ''); setIsEditingName(true); }} className="text-lavender-deep p-1">
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-deepPlum/70">Username</span>
              <span className="text-sm font-medium text-deepPlum/50">@{profile?.username}</span>
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
              <span className="text-sm font-medium text-deepPlum">{partner?.display_name || 'Connecting...'}</span>
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
        <section className="pt-2 pb-6 relative">
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
          
          <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 flex justify-center opacity-30 hover:opacity-100 transition-opacity">
            <button onClick={() => navigate('/where-is-this')} className="text-xl">🐝</button>
          </div>
        </section>

      </div>
    </div>
  )
}
