-- Beegram V1 stability: persistent media paths, complete shared task data,
-- and policies that keep relationship media private.

ALTER TABLE public.moments ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.moments ADD COLUMN IF NOT EXISTS occurred_on DATE;

ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Our Songs';
UPDATE public.songs SET created_at = added_at WHERE created_at IS NULL AND added_at IS NOT NULL;

ALTER TABLE public.things_to_do ADD COLUMN IF NOT EXISTS target_date TIMESTAMPTZ;
ALTER TABLE public.things_to_do ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
UPDATE public.things_to_do SET updated_at = created_at WHERE updated_at IS NULL;

-- The first notifications migration used title/body while the app uses a
-- message. Keep all three fields compatible while clients roll forward.
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS message TEXT;
UPDATE public.notifications SET message = COALESCE(message, body, title, 'Notification') WHERE message IS NULL;
ALTER TABLE public.notifications ALTER COLUMN title DROP NOT NULL;

-- Sent letters are immutable. There is no edit or delete policy for them.
DROP POLICY IF EXISTS "Users can update their own letters" ON public.letters;

-- Shared tasks must be read, changed, and removed only by relationship members.
DROP POLICY IF EXISTS "Authenticated users can update tasks" ON public.things_to_do;
CREATE POLICY "Relationship members can update tasks"
ON public.things_to_do FOR UPDATE
USING (relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Relationship members can delete tasks"
ON public.things_to_do FOR DELETE
USING (relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid()));

INSERT INTO storage.buckets (id, name, public) VALUES ('moments', 'moments', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Media is stored as relationship_id/... so storage access can use the first
-- folder segment without exposing relationship files to every authenticated user.
DROP POLICY IF EXISTS "Relationship members can upload moment media" ON storage.objects;
DROP POLICY IF EXISTS "Relationship members can read moment media" ON storage.objects;
CREATE POLICY "Relationship members can upload moment media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'moments'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND relationship_id::text = (storage.foldername(name))[1]
  )
);
CREATE POLICY "Relationship members can read moment media"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'moments'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND relationship_id::text = (storage.foldername(name))[1]
  )
);

DROP POLICY IF EXISTS "Authenticated users can upload voice_notes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read voice_notes" ON storage.objects;
DROP POLICY IF EXISTS "Relationship members can upload voice notes" ON storage.objects;
DROP POLICY IF EXISTS "Relationship members can read voice notes" ON storage.objects;
CREATE POLICY "Relationship members can upload voice notes"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'voice_notes'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND relationship_id::text = (storage.foldername(name))[1]
  )
);
CREATE POLICY "Relationship members can read voice notes"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'voice_notes'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND relationship_id::text = (storage.foldername(name))[1]
  )
);

DROP POLICY IF EXISTS "Authenticated users can upload music" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read music" ON storage.objects;
DROP POLICY IF EXISTS "Relationship members can upload music" ON storage.objects;
DROP POLICY IF EXISTS "Relationship members can read music" ON storage.objects;
CREATE POLICY "Relationship members can upload music"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'music'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND relationship_id::text = (storage.foldername(name))[1]
  )
);
CREATE POLICY "Relationship members can read music"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'music'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND relationship_id::text = (storage.foldername(name))[1]
  )
);
