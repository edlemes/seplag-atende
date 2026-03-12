import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Solicitacao, Avaliacao, FAQ, Operador, NivelAcesso } from '@/types/solicitacao';

// ============ SOLICITAÇÕES ============

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

function generateProtocolo(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  return `SEPLAG-${y}${m}-${seq}`;
}

function mapRowToSolicitacao(row: any): Solicitacao {
  return {
    id: row.id,
    protocolo: row.protocolo,
    nome: row.nome,
    email: row.email,
    secretaria: row.secretaria,
    setor: row.setor,
    tipo: row.tipo,
    descricao: row.descricao,
    categoria: row.categoria,
    assunto: row.assunto,
    impacto: row.impacto,
    prioridade: row.prioridade,
    canal: row.canal,
    data: row.data,
    status: row.status,
    responsavel: row.responsavel,
    dataResposta: row.data_resposta,
    resposta: row.resposta,
    slaLimite: row.sla_limite,
    avaliacao: row.avaliacao as Avaliacao | undefined,
  };
}

export function useSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('solicitacoes')
      .select('*')
      .order('data', { ascending: false });
    if (!error && data) {
      setSolicitacoes(data.map(mapRowToSolicitacao));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const refresh = useCallback(() => fetch(), [fetch]);

  return { solicitacoes, loading, refresh };
}

export async function addSolicitacaoDb(sol: Omit<Solicitacao, 'id' | 'data' | 'status' | 'protocolo' | 'slaLimite'>): Promise<Solicitacao> {
  const dataStr = new Date().toISOString();
  const protocolo = generateProtocolo();
  const slaLimite = calcSlaLimite(dataStr, sol.tipo);

  const { data, error } = await supabase
    .from('solicitacoes')
    .insert({
      protocolo,
      nome: sol.nome,
      email: sol.email,
      secretaria: sol.secretaria,
      setor: sol.setor,
      tipo: sol.tipo,
      descricao: sol.descricao,
      categoria: sol.categoria,
      assunto: sol.assunto,
      impacto: sol.impacto,
      prioridade: sol.prioridade,
      canal: sol.canal,
      data: dataStr,
      status: 'Aberto',
      sla_limite: slaLimite,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return mapRowToSolicitacao(data);
}

export async function updateSolicitacaoDb(id: string, updates: Partial<Solicitacao>) {
  const mapped: any = {};
  if (updates.status !== undefined) mapped.status = updates.status;
  if (updates.responsavel !== undefined) mapped.responsavel = updates.responsavel;
  if (updates.resposta !== undefined) mapped.resposta = updates.resposta;
  if (updates.dataResposta !== undefined) mapped.data_resposta = updates.dataResposta;
  if (updates.avaliacao !== undefined) mapped.avaliacao = updates.avaliacao;

  const { error } = await supabase
    .from('solicitacoes')
    .update(mapped)
    .eq('id', id);
  if (error) throw error;
}

export async function updateStatusDb(id: string, status: Solicitacao['status']) {
  const updates: any = { status };
  if (status === 'Respondido') {
    updates.data_resposta = new Date().toISOString();
  }
  const { error } = await supabase
    .from('solicitacoes')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

export async function addAvaliacaoDb(id: string, avaliacao: Avaliacao) {
  const { error } = await supabase
    .from('solicitacoes')
    .update({ avaliacao: avaliacao as any })
    .eq('id', id);
  if (error) throw error;
}

export async function getSolicitacaoByProtocoloDb(protocolo: string): Promise<Solicitacao | null> {
  const { data, error } = await supabase
    .from('solicitacoes')
    .select('*')
    .eq('protocolo', protocolo)
    .maybeSingle();
  if (error || !data) return null;
  return mapRowToSolicitacao(data);
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

// ============ OPERADORES ============

export function useOperadores() {
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('operadores')
      .select('*')
      .order('nome');
    if (!error && data) {
      setOperadores(data.map((r: any) => ({
        id: r.id,
        nome: r.nome,
        email: r.email,
        senha: r.senha,
        nivel: r.nivel as NivelAcesso,
        ativo: r.ativo,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  const refresh = useCallback(() => fetch(), [fetch]);
  return { operadores, loading, refresh };
}

export async function authenticateOperadorDb(email: string, senha: string): Promise<Operador | null> {
  const { data, error } = await supabase
    .from('operadores')
    .select('*')
    .eq('email', email)
    .eq('senha', senha)
    .eq('ativo', true)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    nome: data.nome,
    email: data.email,
    senha: data.senha,
    nivel: data.nivel as NivelAcesso,
    ativo: data.ativo,
  };
}

export async function addOperadorDb(nome: string, email: string, nivel: NivelAcesso, senha: string): Promise<Operador> {
  const { data, error } = await supabase
    .from('operadores')
    .insert({ nome, email, senha, nivel, ativo: true } as any)
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, nome: data.nome, email: data.email, senha: data.senha, nivel: data.nivel as NivelAcesso, ativo: data.ativo };
}

export async function updateOperadorDb(id: string, updates: Partial<Operador>) {
  const { error } = await supabase
    .from('operadores')
    .update(updates as any)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteOperadorDb(id: string) {
  const { error } = await supabase
    .from('operadores')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ============ FAQS ============

export function useFaqs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('created_at');
    if (!error && data) {
      setFaqs(data.map((r: any) => ({ id: r.id, pergunta: r.pergunta, resposta: r.resposta })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  const refresh = useCallback(() => fetch(), [fetch]);
  return { faqs, loading, refresh };
}

export async function addFaqDb(pergunta: string, resposta: string): Promise<FAQ> {
  const { data, error } = await supabase
    .from('faqs')
    .insert({ pergunta, resposta } as any)
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, pergunta: data.pergunta, resposta: data.resposta };
}

export async function updateFaqDb(id: string, pergunta: string, resposta: string) {
  const { error } = await supabase
    .from('faqs')
    .update({ pergunta, resposta } as any)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteFaqDb(id: string) {
  const { error } = await supabase
    .from('faqs')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ============ CUSTOM ÓRGÃOS ============

export function useCustomOrgaos() {
  const [orgaos, setOrgaos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('custom_orgaos')
      .select('nome')
      .order('nome');
    if (!error && data) {
      setOrgaos(data.map((r: any) => r.nome));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  const refresh = useCallback(() => fetch(), [fetch]);
  return { orgaos, loading, refresh };
}

export async function addCustomOrgaoDb(nome: string) {
  const { error } = await supabase
    .from('custom_orgaos')
    .insert({ nome } as any);
  if (error) throw error;
}

export async function removeCustomOrgaoDb(nome: string) {
  const { error } = await supabase
    .from('custom_orgaos')
    .delete()
    .eq('nome', nome);
  if (error) throw error;
}

// ============ CUSTOM ASSUNTOS ============

export function useCustomAssuntos() {
  const [assuntos, setAssuntos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('custom_assuntos')
      .select('nome')
      .order('nome');
    if (!error && data) {
      setAssuntos(data.map((r: any) => r.nome));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  const refresh = useCallback(() => fetch(), [fetch]);
  return { assuntos, loading, refresh };
}

export async function addCustomAssuntoDb(nome: string) {
  const { error } = await supabase
    .from('custom_assuntos')
    .insert({ nome } as any);
  if (error) throw error;
}

export async function removeCustomAssuntoDb(nome: string) {
  const { error } = await supabase
    .from('custom_assuntos')
    .delete()
    .eq('nome', nome);
  if (error) throw error;
}
