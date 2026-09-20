-- The original chat reaction table uses `reaction`; keep the client and
-- database contract aligned without introducing a second required column.
ALTER TABLE public.chat_reactions DROP COLUMN IF EXISTS emoji;
