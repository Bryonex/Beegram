-- Keep reaction data consistent with the client and make destructive actions
-- explicit for the owning user.
ALTER TABLE public.chat_reactions ADD COLUMN IF NOT EXISTS emoji TEXT;
UPDATE public.chat_reactions SET emoji = reaction WHERE emoji IS NULL;
ALTER TABLE public.chat_reactions ALTER COLUMN emoji SET NOT NULL;

DROP POLICY IF EXISTS "Users can delete their own moments" ON public.moments;
CREATE POLICY "Users can delete their own moments"
ON public.moments FOR DELETE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Relationship members can delete moment media" ON storage.objects;
CREATE POLICY "Relationship members can delete moment media"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'moments'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND relationship_id::text = (storage.foldername(name))[1]
  )
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'chat_reactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_reactions;
  END IF;
END $$;
