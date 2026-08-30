-- Beegram Database Migration: V1.2 Schema Additions
-- Adds missing tables for letters, voice_notes, buzz_events, locations, notifications, and relationships

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- RELATIONSHIPS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES auth.users(id) NOT NULL,
  user2_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their relationships"
ON public.relationships FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Update profiles to include relationship_id
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS relationship_id UUID REFERENCES public.relationships(id);

-- ==========================================
-- LETTERS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  relationship_id UUID REFERENCES public.relationships(id) NOT NULL,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  is_draft BOOLEAN DEFAULT TRUE,
  is_favourite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Relationship members can read sent letters"
ON public.letters FOR SELECT
USING (
  (auth.uid() = author_id) OR
  (is_draft = FALSE AND relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid()))
);

CREATE POLICY "Users can insert letters"
ON public.letters FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own letters"
ON public.letters FOR UPDATE
USING (auth.uid() = author_id);

-- ==========================================
-- VOICE NOTES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.voice_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  relationship_id UUID REFERENCES public.relationships(id) NOT NULL,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  is_favourite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Relationship members can read voice notes"
ON public.voice_notes FOR SELECT
USING (relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert voice notes"
ON public.voice_notes FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their voice notes"
ON public.voice_notes FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their voice notes"
ON public.voice_notes FOR DELETE
USING (auth.uid() = author_id);

-- ==========================================
-- CHAT MESSAGES (Updating existing messages table)
-- ==========================================
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS relationship_id UUID REFERENCES public.relationships(id);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES auth.users(id);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Drop old policies to update them with relationship logic
DROP POLICY IF EXISTS "Authenticated users can read all messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.messages;

CREATE POLICY "Relationship members can read messages"
ON public.messages FOR SELECT
USING (relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update messages"
ON public.messages FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = recipient_id);

-- ==========================================
-- BUZZ EVENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.buzz_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  relationship_id UUID REFERENCES public.relationships(id) NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  pattern JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.buzz_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Relationship members can read buzz events"
ON public.buzz_events FOR SELECT
USING (relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert buzz events"
ON public.buzz_events FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- ==========================================
-- LOCATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  sharing_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view partner location if sharing is enabled"
ON public.locations FOR SELECT
USING (
  user_id = auth.uid() OR
  (sharing_enabled = TRUE AND user_id IN (SELECT partner_id FROM public.profiles WHERE id = auth.uid()))
);

CREATE POLICY "Users can insert/update their own location"
ON public.locations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own location"
ON public.locations FOR UPDATE
USING (auth.uid() = user_id);

-- ==========================================
-- NOTIFICATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  relationship_id UUID REFERENCES public.relationships(id) NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) NOT NULL,
  sender_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = recipient_id);

CREATE POLICY "Users can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = recipient_id);

-- Add missing relationship_id to other tables
ALTER TABLE public.moments ADD COLUMN IF NOT EXISTS relationship_id UUID REFERENCES public.relationships(id);
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS relationship_id UUID REFERENCES public.relationships(id);
ALTER TABLE public.things_to_do ADD COLUMN IF NOT EXISTS relationship_id UUID REFERENCES public.relationships(id);
ALTER TABLE public.garden_items ADD COLUMN IF NOT EXISTS relationship_id UUID REFERENCES public.relationships(id);

-- Recreate policies for moments, songs, things_to_do, garden_items to use relationship_id
DROP POLICY IF EXISTS "Authenticated users can read moments" ON public.moments;
CREATE POLICY "Relationship members can read moments" ON public.moments FOR SELECT
USING (relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can read songs" ON public.songs;
CREATE POLICY "Relationship members can read songs" ON public.songs FOR SELECT
USING (relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can read tasks" ON public.things_to_do;
CREATE POLICY "Relationship members can read tasks" ON public.things_to_do FOR SELECT
USING (relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can read garden items" ON public.garden_items;
CREATE POLICY "Relationship members can read garden items" ON public.garden_items FOR SELECT
USING (relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid()));
