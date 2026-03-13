
CREATE TABLE public.trilha_progresso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL,
  etapas_concluidas jsonb NOT NULL DEFAULT '[]'::jsonb,
  pontuacao integer NOT NULL DEFAULT 0,
  concluido boolean NOT NULL DEFAULT false,
  concluido_em timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.trilha_progresso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all_trilha_progresso" ON public.trilha_progresso
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);
