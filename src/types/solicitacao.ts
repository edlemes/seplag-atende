export type TipoAtendimento = 'Dúvida' | 'Questionamento' | 'Pergunta' | 'Sugestão' | 'Urgência';
export type StatusSolicitacao = 'Aberto' | 'Em análise' | 'Respondido';
export type CategoriaDemanda = 'Acesso/Permissão' | 'Erro em sistema' | 'Dúvida de processo' | 'Orientação normativa' | 'Solicitação de suporte' | 'Melhoria/Ideia' | 'Outro';
export type Impacto = 'Baixo' | 'Médio' | 'Alto';
export type Prioridade = 'Normal' | 'Urgente';
export type CanalEntrada = 'Web' | 'E-mail' | 'Telefone' | 'Presencial';

export const ASSUNTOS = [
  'FIPLAN', 'SIGCON', 'SEAP', 'Folha de Pagamento', 'PPA/LOA',
  'Contratos', 'Convênios', 'Diárias/Passagens', 'Patrimônio',
  'Portal do Servidor', 'Capacitação', 'Concurso', 'Outros',
] as const;

export type Assunto = typeof ASSUNTOS[number];

export interface Avaliacao {
  satisfacao: number; // 1-5
  resolvido: boolean;
  clareza: number; // 1-5
  tempoResposta: number; // 1-5
  comentario?: string;
  data: string;
}

export interface Solicitacao {
  id: string;
  protocolo: string;
  nome: string;
  email: string;
  secretaria: string;
  setor: string;
  tipo: TipoAtendimento;
  descricao: string;
  categoria: CategoriaDemanda;
  assunto: Assunto;
  impacto: Impacto;
  prioridade: Prioridade;
  canal: CanalEntrada;
  data: string;
  status: StatusSolicitacao;
  responsavel?: string;
  dataResposta?: string;
  resposta?: string;
  slaLimite: string; // ISO date
  avaliacao?: Avaliacao;
}

export const SECRETARIAS = [
  'CASA CIVIL',
  'GABINETE DO GOVERNADOR',
  'PGE – Procuradoria Geral do Estado',
  'CGE – Controladoria Geral do Estado',
  'SEPLAG – Planejamento e Gestão',
  'SEFAZ – Fazenda',
  'SEDUC – Educação',
  'SES – Saúde',
  'SESP – Segurança Pública',
  'SINFRA – Infraestrutura',
  'SEMA – Meio Ambiente',
  'SEAF – Agricultura Familiar',
  'SEDEC – Desenvolvimento Econômico',
  'SECOM – Comunicação',
  'SETASC – Assistência Social',
  'SECEL – Cultura, Esporte e Lazer',
  'SECITECI – Ciência, Tecnologia e Inovação',
  'DETRAN',
  'MTI – Empresa Mato-grossense de Tecnologia da Informação',
] as const;

export const TIPOS_ATENDIMENTO: TipoAtendimento[] = [
  'Dúvida', 'Questionamento', 'Pergunta', 'Sugestão', 'Urgência',
];

export const CATEGORIAS: CategoriaDemanda[] = [
  'Acesso/Permissão', 'Erro em sistema', 'Dúvida de processo',
  'Orientação normativa', 'Solicitação de suporte', 'Melhoria/Ideia', 'Outro',
];

export const IMPACTOS: Impacto[] = ['Baixo', 'Médio', 'Alto'];
export const PRIORIDADES: Prioridade[] = ['Normal', 'Urgente'];
export const CANAIS: CanalEntrada[] = ['Web', 'E-mail', 'Telefone', 'Presencial'];

export const RESPONSAVEIS = [
  'Ana Silva', 'Carlos Mendes', 'Fernanda Lima', 'João Santos', 'Maria Oliveira',
];
