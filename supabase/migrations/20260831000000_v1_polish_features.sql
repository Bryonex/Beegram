-- Beegram V1 Polish Features Migration

-- ==========================================
-- CHAT REACTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.chat_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  reaction TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

ALTER TABLE public.chat_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Relationship members can read chat reactions"
ON public.chat_reactions FOR SELECT
USING (
  message_id IN (
    SELECT id FROM public.messages 
    WHERE relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "Users can insert their own chat reactions"
ON public.chat_reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat reactions"
ON public.chat_reactions FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat reactions"
ON public.chat_reactions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add edited_at to messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- Allow users to update their own messages (for editing)
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- ==========================================
-- GAMES HIGH SCORES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.games_highscores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  relationship_id UUID REFERENCES public.relationships(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  game_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.games_highscores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Relationship members can read highscores"
ON public.games_highscores FOR SELECT
USING (relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert highscores"
ON public.games_highscores FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid())
);


-- ==========================================
-- SAVED DOODLES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.saved_doodles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  relationship_id UUID REFERENCES public.relationships(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.saved_doodles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Relationship members can read doodles"
ON public.saved_doodles FOR SELECT
USING (relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Relationship members can insert doodles"
ON public.saved_doodles FOR INSERT
WITH CHECK (
  auth.uid() = author_id AND 
  relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Relationship members can delete doodles"
ON public.saved_doodles FOR DELETE
USING (relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid()));


-- ==========================================
-- STORAGE FOR DOODLES
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('doodles', 'doodles', false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Relationship members can upload doodles"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'doodles'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND relationship_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Relationship members can read doodles"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'doodles'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND relationship_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Relationship members can update doodles"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'doodles'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND relationship_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Relationship members can delete doodles"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'doodles'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND relationship_id::text = (storage.foldername(name))[1]
  )
);
