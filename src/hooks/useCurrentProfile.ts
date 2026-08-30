import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  partner_id?: string
  relationship_id?: string
  latitude?: number
  longitude?: number
  location_updated_at?: string
}

export function useCurrentProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [partner, setPartner] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfiles() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setProfile(null)
          setPartner(null)
          setLoading(false)
          return
        }

        let userProfile: Profile | null = null
        const { data: userProfileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (userProfileData) {
          userProfile = userProfileData as Profile
        }

        let relationshipId = userProfile?.relationship_id
        let partnerId = userProfile?.partner_id

        if (!relationshipId || !partnerId) {
          const { data: relationshipData } = await supabase
            .from('relationships')
            .select('*')
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
            .maybeSingle()

          if (relationshipData) {
            const relation = relationshipData as { id: string; user1_id: string; user2_id: string }
            relationshipId = relation.id
            partnerId = relation.user1_id === user.id ? relation.user2_id : relation.user1_id

            if (userProfile) {
              const nextProfile: Profile = { ...userProfile, relationship_id: relationshipId, partner_id: partnerId }
              setProfile(nextProfile)
              userProfile = nextProfile
            }

            if (userProfile?.id) {
              await (supabase as any)
                .from('profiles')
                .update({ relationship_id: relationshipId, partner_id: partnerId })
                .eq('id', userProfile.id)
            }
          }
        }

        const resolvedProfile = userProfile ? { ...userProfile, relationship_id: relationshipId, partner_id: partnerId } : null
        setProfile(resolvedProfile)

        if (partnerId) {
          const { data: partnerProfileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', partnerId)
            .maybeSingle()

          setPartner(partnerProfileData as Profile | null)
        } else {
          setPartner(null)
        }
      } catch (error) {
        console.error('Error loading profiles:', error)
        setProfile(null)
        setPartner(null)
      } finally {
        setLoading(false)
      }
    }

    loadProfiles()
  }, [])

  return {
    profile,
    partner,
    loading,
    relationshipId: profile?.relationship_id,
    isSundar: profile?.username?.toLowerCase() === 'sundar',
    isBee: profile?.username?.toLowerCase() === 'bee'
  }
}
