ALTER TABLE public.garden_items ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id);

-- Make sure we can insert
DROP POLICY IF EXISTS "Users can insert garden items" ON public.garden_items;
CREATE POLICY "Users can insert garden items" ON public.garden_items FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid()));

-- Also notifications schema
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  relationship_id UUID REFERENCES public.relationships(id) NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own notifications" ON public.notifications;
CREATE POLICY "Users can read their own notifications" ON public.notifications FOR SELECT
USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND relationship_id IN (SELECT relationship_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE
USING (auth.uid() = recipient_id);

