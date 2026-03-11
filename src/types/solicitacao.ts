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
  satisfacao: number;
  resolvido: boolean;
  clareza: number;
  tempoResposta: number;
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
  slaLimite: string;
  avaliacao?: Avaliacao;
}

export interface OrgaoCategoria {
  categoria: string;
  orgaos: string[];
}

export const ORGAOS_POR_CATEGORIA: OrgaoCategoria[] = [
  {
    categoria: 'Secretarias',
    orgaos: [
      'CASA CIVIL – Casa Civil',
      'CGE – Controladoria-Geral do Estado',
      'PGE – Procuradoria-Geral do Estado',
      'SEAF – Secretaria de Agricultura Familiar',
      'SECEL – Secretaria de Cultura, Esporte e Lazer',
      'SECITECI – Secretaria de Ciência, Tecnologia e Inovação',
      'SECOM – Secretaria de Comunicação',
      'SEDEC – Secretaria de Desenvolvimento Econômico',
      'SEDUC – Secretaria de Educação',
      'SEFAZ – Secretaria de Fazenda',
      'SEMA – Secretaria de Meio Ambiente',
      'SEPLAG – Secretaria de Planejamento e Gestão',
      'SES – Secretaria de Saúde',
      'SESP – Secretaria de Segurança Pública',
      'SETASC – Secretaria de Assistência Social',
      'SINFRA – Secretaria de Infraestrutura',
    ],
  },
  {
    categoria: 'Administração Indireta / Autarquias',
    orgaos: [
      'AGER – Agência Reguladora',
      'DETRAN – Departamento de Trânsito',
      'INDEA – Instituto de Defesa Agropecuária',
      'INTERMAT – Instituto de Terras',
      'IPEM – Instituto de Pesos e Medidas',
      'JUCEMAT – Junta Comercial',
      'MTPREV – Previdência do Estado',
      'MT SAÚDE – Instituto de Saúde dos Servidores',
      'UNEMAT – Universidade do Estado',
    ],
  },
  {
    categoria: 'Fundações e Empresas',
    orgaos: [
      'FAPEMAT – Fundação de Amparo à Pesquisa',
      'FUNAC – Fundação Nova Chance',
      'CEASA – Central de Abastecimento',
      'DESENVOLVE MT – Agência de Fomento',
      'EMPAER – Empresa de Pesquisa Agropecuária',
      'METAMAT – Companhia Matogrossense de Mineração',
      'MT GÁS – Companhia de Gás',
      'MTI – Empresa de Tecnologia da Informação',
      'MT PAR – Empresa de Participações',
    ],
  },
  {
    categoria: 'Segurança e Outros',
    orgaos: [
      'CBM – Corpo de Bombeiros Militar',
      'PJC – Polícia Judiciária Civil',
      'PM – Polícia Militar',
      'POLITEC – Perícia Oficial e Identificação Técnica',
      'MPMT – Ministério Público',
      'TJMT – Tribunal de Justiça',
    ],
  },
];

// Flat list for backward compatibility
export const SECRETARIAS = ORGAOS_POR_CATEGORIA.flatMap((c) => c.orgaos);

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

export interface FAQ {
  id: string;
  pergunta: string;
  resposta: string;
}

export type NivelAcesso = 'Administrador' | 'Técnico';

export interface Operador {
  id: string;
  nome: string;
  email: string;
  nivel: NivelAcesso;
  ativo: boolean;
}
