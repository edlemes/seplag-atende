
-- Tabela de solicitações
CREATE TABLE public.solicitacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo text UNIQUE NOT NULL,
  nome text NOT NULL,
  email text NOT NULL,
  secretaria text NOT NULL,
  setor text NOT NULL,
  tipo text NOT NULL,
  descricao text NOT NULL,
  categoria text NOT NULL,
  assunto text NOT NULL,
  impacto text NOT NULL,
  prioridade text NOT NULL DEFAULT 'Normal',
  canal text NOT NULL DEFAULT 'Web',
  data timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'Aberto',
  responsavel text,
  data_resposta timestamptz,
  resposta text,
  sla_limite timestamptz NOT NULL,
  avaliacao jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela de operadores
CREATE TABLE public.operadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  senha text NOT NULL,
  nivel text NOT NULL DEFAULT 'Analista',
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela de FAQs
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pergunta text NOT NULL,
  resposta text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela de órgãos customizados
CREATE TABLE public.custom_orgaos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela de assuntos customizados
CREATE TABLE public.custom_assuntos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: solicitacoes (público pode inserir e ler, admin pode atualizar)
ALTER TABLE public.solicitacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_solicitacoes" ON public.solicitacoes FOR SELECT USING (true);
CREATE POLICY "public_insert_solicitacoes" ON public.solicitacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_solicitacoes" ON public.solicitacoes FOR UPDATE USING (true);

-- RLS: operadores
ALTER TABLE public.operadores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_operadores" ON public.operadores FOR SELECT USING (true);
CREATE POLICY "public_insert_operadores" ON public.operadores FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_operadores" ON public.operadores FOR UPDATE USING (true);
CREATE POLICY "public_delete_operadores" ON public.operadores FOR DELETE USING (true);

-- RLS: faqs
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_faqs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "public_insert_faqs" ON public.faqs FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_faqs" ON public.faqs FOR UPDATE USING (true);
CREATE POLICY "public_delete_faqs" ON public.faqs FOR DELETE USING (true);

-- RLS: custom_orgaos
ALTER TABLE public.custom_orgaos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all_custom_orgaos" ON public.custom_orgaos FOR ALL USING (true) WITH CHECK (true);

-- RLS: custom_assuntos
ALTER TABLE public.custom_assuntos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all_custom_assuntos" ON public.custom_assuntos FOR ALL USING (true) WITH CHECK (true);
