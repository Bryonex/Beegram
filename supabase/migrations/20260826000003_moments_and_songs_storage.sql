CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- MOMENT LIKES / REACTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.moment_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  moment_id UUID REFERENCES public.moments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(moment_id, user_id)
);

ALTER TABLE public.moment_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Relationship members can read moment reactions"
ON public.moment_reactions FOR SELECT
USING (
  moment_id IN (
    SELECT id FROM public.moments 
    WHERE relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "Users can insert their own reactions"
ON public.moment_reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
ON public.moment_reactions FOR DELETE
USING (auth.uid() = user_id);


-- ==========================================
-- MOMENT COMMENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.moment_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  moment_id UUID REFERENCES public.moments(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.moment_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Relationship members can read moment comments"
ON public.moment_comments FOR SELECT
USING (
  moment_id IN (
    SELECT id FROM public.moments 
    WHERE relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "Users can insert their own comments"
ON public.moment_comments FOR INSERT
WITH CHECK (auth.uid() = author_id);


-- ==========================================
-- SONGS EXTENSION
-- ==========================================
-- Add missing fields for songs if they don't match exactly.
-- Original songs table has: id, user_id, title, artist, audio_url, cover_url, added_at, relationship_id
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS added_by UUID REFERENCES auth.users(id);
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS is_favourite BOOLEAN DEFAULT FALSE;

-- ==========================================
-- STORAGE BUCKETS
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('music', 'music', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('artwork', 'artwork', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('voice_notes', 'voice_notes', false) ON CONFLICT (id) DO NOTHING;

-- RLS for Storage Buckets
CREATE POLICY "Authenticated users can upload music"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'music');

CREATE POLICY "Authenticated users can read music"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'music');

CREATE POLICY "Authenticated users can upload artwork"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'artwork');

CREATE POLICY "Authenticated users can read artwork"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'artwork');

CREATE POLICY "Authenticated users can upload voice_notes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'voice_notes');

CREATE POLICY "Authenticated users can read voice_notes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'voice_notes');
