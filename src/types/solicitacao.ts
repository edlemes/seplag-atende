export interface Solicitacao {
  id: string;
  nome: string;
  email: string;
  secretaria: string;
  setor: string;
  tipo: TipoAtendimento;
  descricao: string;
  data: string;
  status: StatusSolicitacao;
}

export type TipoAtendimento = 'Dúvida' | 'Questionamento' | 'Pergunta' | 'Sugestão' | 'Urgência';
export type StatusSolicitacao = 'Aberto' | 'Em análise' | 'Respondido';

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
  'Dúvida',
  'Questionamento',
  'Pergunta',
  'Sugestão',
  'Urgência',
];
