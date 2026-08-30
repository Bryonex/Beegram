-- Our Little World Database Schema & RLS Policies
-- This schema ensures data is fully private to authenticated users.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. PROFILES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  partner_id UUID REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile and partner profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR auth.uid() = partner_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- ==========================================
-- 1.5 USERNAME RESOLUTION (RPC)
-- ==========================================
-- This function securely looks up a user's email by their username
-- without exposing the entire auth.users table.
CREATE OR REPLACE FUNCTION get_user_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
BEGIN
  -- Look up the email by joining auth.users and public.profiles
  SELECT au.email INTO v_email
  FROM auth.users au
  JOIN public.profiles p ON au.id = p.id
  WHERE lower(p.username) = lower(p_username);
  
  RETURN v_email;
END;
$$;

-- ==========================================
-- 2. MESSAGES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all messages"
ON public.messages FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert messages"
ON public.messages FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- ==========================================
-- 3. MOMENTS (Photos/Videos)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.moments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT,
  description TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL, -- 'image' or 'video'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read moments"
ON public.moments FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert moments"
ON public.moments FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- ==========================================
-- 4. SONGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read songs"
ON public.songs FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert songs"
ON public.songs FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- ==========================================
-- 5. THINGS TO DO
-- ==========================================
CREATE TABLE IF NOT EXISTS public.things_to_do (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  is_favourite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.things_to_do ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read tasks"
ON public.things_to_do FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert tasks"
ON public.things_to_do FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can update tasks"
ON public.things_to_do FOR UPDATE
USING (auth.role() = 'authenticated');

-- ==========================================
-- 6. GARDEN ITEMS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.garden_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL, -- 'Lavender', 'Rose', 'Sunflower', 'Tulip'
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  position_x DECIMAL NOT NULL,
  position_y DECIMAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.garden_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read garden items"
ON public.garden_items FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert garden items"
ON public.garden_items FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- ==========================================
-- 7. STORAGE POLICIES
-- ==========================================
-- (Assumes buckets 'moments', 'songs', 'avatars' exist in Supabase Storage)

-- Create a generic policy for all objects if buckets exist
-- Note: You must manually create these buckets in Supabase Dashboard first.
-- CREATE POLICY "Authenticated users can upload to moments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'moments' AND auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated users can view moments" ON storage.objects FOR SELECT USING (bucket_id = 'moments' AND auth.role() = 'authenticated');
