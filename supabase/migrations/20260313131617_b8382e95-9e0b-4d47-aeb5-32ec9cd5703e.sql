
-- Trilhas content table
CREATE TABLE public.trilhas_conteudo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trilha TEXT NOT NULL DEFAULT 'SIAD',
  modulo_ordem INTEGER NOT NULL DEFAULT 1,
  titulo TEXT NOT NULL,
  subtitulo TEXT NOT NULL DEFAULT '',
  conteudo TEXT NOT NULL DEFAULT '',
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  pontos INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quiz questions table
CREATE TABLE public.quiz_perguntas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trilha_conteudo_id UUID REFERENCES public.trilhas_conteudo(id) ON DELETE CASCADE NOT NULL,
  pergunta TEXT NOT NULL,
  opcoes JSONB NOT NULL DEFAULT '[]'::jsonb,
  resposta_correta INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quiz results table
CREATE TABLE public.quiz_resultados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  trilha TEXT NOT NULL DEFAULT 'SIAD',
  modulo_ordem INTEGER NOT NULL DEFAULT 1,
  acertos INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  pontuacao INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.trilhas_conteudo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_resultados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all_trilhas_conteudo" ON public.trilhas_conteudo FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "public_all_quiz_perguntas" ON public.quiz_perguntas FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "public_all_quiz_resultados" ON public.quiz_resultados FOR ALL TO public USING (true) WITH CHECK (true);
