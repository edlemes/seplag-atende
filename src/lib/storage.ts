import { Solicitacao } from '@/types/solicitacao';

const STORAGE_KEY = 'seplag-solicitacoes';

export function getSolicitacoes(): Solicitacao[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function addSolicitacao(sol: Omit<Solicitacao, 'id' | 'data' | 'status'>): Solicitacao {
  const solicitacoes = getSolicitacoes();
  const nova: Solicitacao = {
    ...sol,
    id: crypto.randomUUID(),
    data: new Date().toISOString(),
    status: 'Aberto',
  };
  solicitacoes.push(nova);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitacoes));
  return nova;
}

export function updateStatus(id: string, status: Solicitacao['status']) {
  const solicitacoes = getSolicitacoes();
  const idx = solicitacoes.findIndex((s) => s.id === id);
  if (idx !== -1) {
    solicitacoes[idx].status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitacoes));
  }
}
