
-- Add avatar_url column to operadores table
ALTER TABLE public.operadores ADD COLUMN IF NOT EXISTS avatar_url text;
