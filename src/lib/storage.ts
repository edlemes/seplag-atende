import { Solicitacao, Avaliacao, FAQ } from '@/types/solicitacao';

const STORAGE_KEY = 'seplag-solicitacoes';
const FAQ_KEY = 'seplag-faqs';

function generateProtocolo(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  return `SEPLAG-${y}${m}-${seq}`;
}

function calcSlaLimite(data: string, tipo: string): string {
  const d = new Date(data);
  const dias = tipo === 'Urgência' ? 1 : 3;
  let added = 0;
  while (added < dias) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d.toISOString();
}

export function getSolicitacoes(): Solicitacao[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export type NovaSolicitacao = Omit<Solicitacao, 'id' | 'data' | 'status' | 'protocolo' | 'slaLimite'>;

export function addSolicitacao(sol: NovaSolicitacao): Solicitacao {
  const solicitacoes = getSolicitacoes();
  const dataStr = new Date().toISOString();
  const nova: Solicitacao = {
    ...sol,
    id: crypto.randomUUID(),
    protocolo: generateProtocolo(),
    data: dataStr,
    status: 'Aberto',
    slaLimite: calcSlaLimite(dataStr, sol.tipo),
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
    if (status === 'Respondido' && !solicitacoes[idx].dataResposta) {
      solicitacoes[idx].dataResposta = new Date().toISOString();
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitacoes));
  }
}

export function updateSolicitacao(id: string, updates: Partial<Solicitacao>) {
  const solicitacoes = getSolicitacoes();
  const idx = solicitacoes.findIndex((s) => s.id === id);
  if (idx !== -1) {
    solicitacoes[idx] = { ...solicitacoes[idx], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitacoes));
  }
}

export function addAvaliacao(id: string, avaliacao: Avaliacao) {
  const solicitacoes = getSolicitacoes();
  const idx = solicitacoes.findIndex((s) => s.id === id);
  if (idx !== -1) {
    solicitacoes[idx].avaliacao = avaliacao;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitacoes));
  }
}

export function getSolicitacaoByProtocolo(protocolo: string): Solicitacao | undefined {
  return getSolicitacoes().find((s) => s.protocolo === protocolo);
}

// SLA helpers
export function getSlaStatus(s: Solicitacao): 'Dentro do Prazo' | 'Próximo do Prazo' | 'Atrasado' {
  if (s.status === 'Respondido') return 'Dentro do Prazo';
  const now = new Date();
  const limite = new Date(s.slaLimite);
  const diff = limite.getTime() - now.getTime();
  const horasRestantes = diff / (1000 * 60 * 60);
  if (horasRestantes < 0) return 'Atrasado';
  if (horasRestantes < 24) return 'Próximo do Prazo';
  return 'Dentro do Prazo';
}

export function getTempoResposta(s: Solicitacao): number | null {
  if (!s.dataResposta) return null;
  const diff = new Date(s.dataResposta).getTime() - new Date(s.data).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24) * 10) / 10;
}

// FAQ helpers
export function getFaqs(): FAQ[] {
  const data = localStorage.getItem(FAQ_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveFaqs(faqs: FAQ[]) {
  localStorage.setItem(FAQ_KEY, JSON.stringify(faqs));
}

export function addFaq(pergunta: string, resposta: string): FAQ {
  const faqs = getFaqs();
  const faq: FAQ = { id: crypto.randomUUID(), pergunta, resposta };
  faqs.push(faq);
  saveFaqs(faqs);
  return faq;
}

export function updateFaq(id: string, pergunta: string, resposta: string) {
  const faqs = getFaqs();
  const idx = faqs.findIndex((f) => f.id === id);
  if (idx !== -1) {
    faqs[idx] = { ...faqs[idx], pergunta, resposta };
    saveFaqs(faqs);
  }
}

export function deleteFaq(id: string) {
  const faqs = getFaqs().filter((f) => f.id !== id);
  saveFaqs(faqs);
}
