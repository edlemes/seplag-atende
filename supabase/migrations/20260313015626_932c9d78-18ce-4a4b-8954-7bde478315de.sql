
ALTER TABLE public.trilha_progresso
  ADD COLUMN IF NOT EXISTS nivel text NOT NULL DEFAULT 'Iniciante',
  ADD COLUMN IF NOT EXISTS medalhas jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tempo_minutos integer NOT NULL DEFAULT 0;
