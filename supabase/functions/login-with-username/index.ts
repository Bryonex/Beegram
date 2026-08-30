import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { username, password } = await req.json()
    
    if (!username || !password) {
      throw new Error('Username and password are required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Server configuration error')
    }

    // 1. Create a Supabase client with the service role key to query profiles securely
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const normalizedUsername = username.toLowerCase().trim()

    // 2. Find the profile
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id')
      .eq('username', normalizedUsername)
      .single()

    if (profileError || !profile) {
      throw new Error('Invalid credentials')
    }

    // 3. Obtain the associated Auth user ID and email via admin API
    const { data: { user }, error: userError } = await adminClient.auth.admin.getUserById(profile.id)

    if (userError || !user || !user.email) {
      throw new Error('Invalid credentials')
    }

    const resolvedEmail = user.email

    // 4. Authenticate using the anon client so we get a valid session for the browser
    // This client acts just like the browser would, but we do it server-side to hide the email
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email: resolvedEmail,
      password: password
    })

    if (authError || !authData.session) {
      throw new Error('Invalid credentials')
    }

    // 5. Return the session to the browser
    return new Response(JSON.stringify(authData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    // Return generic error for any failure to prevent enumeration
    return new Response(JSON.stringify({ error: "That username or password doesn't look right." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
