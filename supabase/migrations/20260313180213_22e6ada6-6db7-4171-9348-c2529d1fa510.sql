
-- Banners table for the hero carousel
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL DEFAULT '',
  subtitulo text NOT NULL DEFAULT '',
  imagem_url text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '',
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all_banners" ON public.banners FOR ALL TO public USING (true) WITH CHECK (true);

-- Team members table
CREATE TABLE public.equipe (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cargo text NOT NULL DEFAULT '',
  area text NOT NULL DEFAULT '',
  foto_url text NOT NULL DEFAULT '',
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.equipe ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all_equipe" ON public.equipe FOR ALL TO public USING (true) WITH CHECK (true);
