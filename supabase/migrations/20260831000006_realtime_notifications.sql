-- Enable realtime for notifications table
BEGIN;

DO $$ 
BEGIN
  -- Check if publication exists, if not it will be created by Supabase, 
  -- but we ensure we add the table to it safely.
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

COMMIT;
