import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, ArrowLeft, Download, FileSpreadsheet, BarChart3, CheckCircle2,
  AlertCircle, Clock, Star, TrendingUp, AlertTriangle, Target, Eye, Settings,
  HelpCircle, Plus, Pencil, Trash2, Save, X, Users, Shield, ShieldCheck, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import {
  getSolicitacoes, updateStatus, updateSolicitacao, getSlaStatus, getTempoResposta,
  getFaqs, addFaq, updateFaq, deleteFaq,
  getOperadores, addOperador, updateOperador, deleteOperador,
  getCustomOrgaos, addCustomOrgao, removeCustomOrgao,
  getCustomAssuntos, addCustomAssunto, removeCustomAssunto,
} from '@/lib/storage';
import { Solicitacao, StatusSolicitacao, FAQ, Operador, NivelAcesso, NIVEIS_ACESSO, NIVEIS_GESTAO, NIVEIS_LEITURA, ASSUNTOS } from '@/types/solicitacao';
import AdminLogin from './AdminLogin';
import * as XLSX from 'xlsx';

const COLORS = ['#004B8D', '#0067B3', '#FDB913', '#42A5F5', '#EF5350', '#AB47BC', '#26C6DA', '#8D6E63', '#78909C', '#D4E157'];

const STATUS_COLORS: Record<StatusSolicitacao, string> = {
  'Aberto': 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  'Em análise': 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  'Respondido': 'bg-primary/20 text-primary border-primary/30',
};

const SLA_COLORS = {
  'Dentro do Prazo': 'text-primary',
  'Próximo do Prazo': 'text-chart-3',
  'Atrasado': 'text-destructive',
};

function KpiCard({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-300">
      <CardContent className="pt-5 pb-4 flex flex-col items-center text-center gap-1">
        <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/70">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// FAQ Manager Component
function FaqManager() {
  const [faqs, setFaqs] = useState<FAQ[]>(getFaqs());
  const [novaPergunta, setNovaPergunta] = useState('');
  const [novaResposta, setNovaResposta] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editPergunta, setEditPergunta] = useState('');
  const [editResposta, setEditResposta] = useState('');

  const handleAdd = () => {
    if (!novaPergunta.trim() || !novaResposta.trim()) return;
    addFaq(novaPergunta.trim(), novaResposta.trim());
    setNovaPergunta('');
    setNovaResposta('');
    setFaqs(getFaqs());
  };

  const handleEdit = (faq: FAQ) => {
    setEditId(faq.id);
    setEditPergunta(faq.pergunta);
    setEditResposta(faq.resposta);
  };

  const handleSaveEdit = () => {
    if (!editId || !editPergunta.trim() || !editResposta.trim()) return;
    updateFaq(editId, editPergunta.trim(), editResposta.trim());
    setEditId(null);
    setFaqs(getFaqs());
  };

  const handleDelete = (id: string) => {
    deleteFaq(id);
    setFaqs(getFaqs());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" />Nova Pergunta</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Pergunta</Label>
            <Input placeholder="Ex: Como acompanhar meu protocolo?" value={novaPergunta} onChange={(e) => setNovaPergunta(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Resposta</Label>
            <Textarea placeholder="Escreva a resposta..." value={novaResposta} onChange={(e) => setNovaResposta(e.target.value)} className="min-h-[100px]" />
          </div>
          <Button onClick={handleAdd} disabled={!novaPergunta.trim() || !novaResposta.trim()} className="gap-2">
            <Plus className="h-4 w-4" /> Adicionar FAQ
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">FAQs Cadastradas ({faqs.length})</CardTitle></CardHeader>
        <CardContent>
          {faqs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma FAQ cadastrada.</p>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="border rounded-lg p-4 space-y-2">
                  {editId === faq.id ? (
                    <>
                      <Input value={editPergunta} onChange={(e) => setEditPergunta(e.target.value)} />
                      <Textarea value={editResposta} onChange={(e) => setEditResposta(e.target.value)} className="min-h-[80px]" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit} className="gap-1"><Save className="h-3 w-3" />Salvar</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditId(null)} className="gap-1"><X className="h-3 w-3" />Cancelar</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-foreground">{faq.pergunta}</p>
                      <p className="text-sm text-muted-foreground">{faq.resposta}</p>
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(faq)} className="gap-1 h-7 text-xs"><Pencil className="h-3 w-3" />Editar</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(faq.id)} className="gap-1 h-7 text-xs"><Trash2 className="h-3 w-3" />Excluir</Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Users Manager Component
function UsersManager() {
  const [operadores, setOperadores] = useState<Operador[]>(getOperadores());
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoSenha, setNovoSenha] = useState('');
  const [novoNivel, setNovoNivel] = useState<NivelAcesso>('Analista');

  const handleAdd = () => {
    if (!novoNome.trim() || !novoEmail.trim() || !novoSenha.trim()) return;
    addOperador(novoNome.trim(), novoEmail.trim(), novoNivel, novoSenha);
    setNovoNome('');
    setNovoEmail('');
    setNovoSenha('');
    setNovoNivel('Analista');
    setOperadores(getOperadores());
  };

  const handleToggleAtivo = (op: Operador) => {
    updateOperador(op.id, { ativo: !op.ativo });
    setOperadores(getOperadores());
  };

  const handleChangeNivel = (id: string, nivel: NivelAcesso) => {
    updateOperador(id, { nivel });
    setOperadores(getOperadores());
  };

  const handleDelete = (id: string) => {
    deleteOperador(id);
    setOperadores(getOperadores());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" />Novo Operador</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input placeholder="Nome completo" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input placeholder="email@seplag.mt.gov.br" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input type="password" placeholder="Senha de acesso" value={novoSenha} onChange={(e) => setNovoSenha(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nível de Acesso</Label>
              <Select value={novoNivel} onValueChange={(v) => setNovoNivel(v as NivelAcesso)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NIVEIS_ACESSO.map((n) => (<SelectItem key={n} value={n}>{n}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAdd} disabled={!novoNome.trim() || !novoEmail.trim() || !novoSenha.trim()} className="gap-2">
            <Plus className="h-4 w-4" /> Adicionar Operador
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Operadores ({operadores.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operadores.map((op) => (
                <TableRow key={op.id} className={!op.ativo ? 'opacity-50' : ''}>
                  <TableCell className="font-medium">{op.nome}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{op.email}</TableCell>
                  <TableCell>
                    <Select value={op.nivel} onValueChange={(v) => handleChangeNivel(op.id, v as NivelAcesso)}>
                      <SelectTrigger className="w-[160px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NIVEIS_ACESSO.map((n) => (<SelectItem key={n} value={n}>{n}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={op.ativo ? 'default' : 'secondary'}
                      className="cursor-pointer text-[10px]"
                      onClick={() => handleToggleAtivo(op)}
                    >
                      {op.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(op.id)} className="gap-1 h-7 text-xs">
                      <Trash2 className="h-3 w-3" />Remover
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Settings Manager Component
function SettingsManager() {
  const [orgaos, setOrgaos] = useState<string[]>(getCustomOrgaos());
  const [assuntos, setAssuntos] = useState<string[]>(getCustomAssuntos());
  const [novoOrgao, setNovoOrgao] = useState('');
  const [novoAssunto, setNovoAssunto] = useState('');

  const handleAddOrgao = () => {
    if (!novoOrgao.trim()) return;
    addCustomOrgao(novoOrgao.trim());
    setNovoOrgao('');
    setOrgaos(getCustomOrgaos());
  };

  const handleRemoveOrgao = (orgao: string) => {
    removeCustomOrgao(orgao);
    setOrgaos(getCustomOrgaos());
  };

  const handleAddAssunto = () => {
    if (!novoAssunto.trim()) return;
    addCustomAssunto(novoAssunto.trim());
    setNovoAssunto('');
    setAssuntos(getCustomAssuntos());
  };

  const handleRemoveAssunto = (assunto: string) => {
    removeCustomAssunto(assunto);
    setAssuntos(getCustomAssuntos());
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Órgãos */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" />Órgãos Adicionais</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">Adicione órgãos extras além da lista padrão.</p>
            <div className="flex gap-2">
              <Input placeholder="Ex: NOVO ÓRGÃO – Nome Completo" value={novoOrgao} onChange={(e) => setNovoOrgao(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddOrgao()} />
              <Button onClick={handleAddOrgao} disabled={!novoOrgao.trim()} size="sm"><Plus className="h-4 w-4" /></Button>
            </div>
            {orgaos.length > 0 && (
              <div className="space-y-2">
                {orgaos.map((orgao) => (
                  <div key={orgao} className="flex items-center justify-between border rounded-md px-3 py-2">
                    <span className="text-sm">{orgao}</span>
                    <Button size="sm" variant="ghost" onClick={() => handleRemoveOrgao(orgao)} className="h-7 text-destructive hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {orgaos.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhum órgão adicional cadastrado.</p>}
          </CardContent>
        </Card>

        {/* Assuntos */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" />Assuntos Adicionais</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">Assuntos padrão: {ASSUNTOS.join(', ')}.</p>
            <div className="flex gap-2">
              <Input placeholder="Ex: Novo Assunto" value={novoAssunto} onChange={(e) => setNovoAssunto(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddAssunto()} />
              <Button onClick={handleAddAssunto} disabled={!novoAssunto.trim()} size="sm"><Plus className="h-4 w-4" /></Button>
            </div>
            {assuntos.length > 0 && (
              <div className="space-y-2">
                {assuntos.map((assunto) => (
                  <div key={assunto} className="flex items-center justify-between border rounded-md px-3 py-2">
                    <span className="text-sm">{assunto}</span>
                    <Button size="sm" variant="ghost" onClick={() => handleRemoveAssunto(assunto)} className="h-7 text-destructive hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {assuntos.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhum assunto adicional cadastrado.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const Admin = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<Operador | null>(() => {
    const stored = sessionStorage.getItem('admin-auth');
    if (!stored) return null;
    try { return JSON.parse(stored); } catch { return null; }
  });
  const authed = !!currentUser;
  const isGestao = currentUser ? NIVEIS_GESTAO.includes(currentUser.nivel) : false;
  const isLeitura = currentUser ? NIVEIS_LEITURA.includes(currentUser.nivel) : false;
  const [refresh, setRefresh] = useState(0);
  const [busca, setBusca] = useState('');
  const [filtroSecretaria, setFiltroSecretaria] = useState('all');
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [filtroPrioridade, setFiltroPrioridade] = useState('all');

  const solicitacoes = useMemo(() => getSolicitacoes(), [refresh]);
  const operadores = useMemo(() => getOperadores().filter((o) => o.ativo), [refresh]);

  const filtered = useMemo(() => {
    return solicitacoes.filter((s) => {
      if (filtroSecretaria !== 'all' && s.secretaria !== filtroSecretaria) return false;
      if (filtroStatus !== 'all' && s.status !== filtroStatus) return false;
      if (filtroPrioridade !== 'all' && s.prioridade !== filtroPrioridade) return false;
      if (busca) {
        const q = busca.toLowerCase();
        return s.nome.toLowerCase().includes(q) || s.protocolo.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [solicitacoes, filtroSecretaria, filtroStatus, filtroPrioridade, busca]);

  // KPIs
  const total = solicitacoes.length;
  const abertas = solicitacoes.filter((s) => s.status === 'Aberto').length;
  const emAnalise = solicitacoes.filter((s) => s.status === 'Em análise').length;
  const respondidas = solicitacoes.filter((s) => s.status === 'Respondido').length;
  const iai = total > 0 ? ((respondidas / total) * 100).toFixed(1) : '0';

  const slaData = useMemo(() => {
    const naoRespondidas = solicitacoes.filter((s) => s.status !== 'Respondido');
    const dentroSla = naoRespondidas.filter((s) => getSlaStatus(s) === 'Dentro do Prazo').length;
    const t = naoRespondidas.length || 1;
    return ((dentroSla / t) * 100).toFixed(1);
  }, [solicitacoes]);

  const tempoMedioResposta = useMemo(() => {
    const tempos = solicitacoes.map(getTempoResposta).filter((t): t is number => t !== null);
    if (tempos.length === 0) return '—';
    return (tempos.reduce((a, b) => a + b, 0) / tempos.length).toFixed(1) + 'd';
  }, [solicitacoes]);

  const avaliacoes = useMemo(() => solicitacoes.filter((s) => s.avaliacao), [solicitacoes]);
  const satisfacaoMedia = useMemo(() => {
    if (avaliacoes.length === 0) return '—';
    return (avaliacoes.reduce((a, s) => a + (s.avaliacao?.satisfacao || 0), 0) / avaliacoes.length).toFixed(1);
  }, [avaliacoes]);
  const resolvidoPercent = useMemo(() => {
    if (avaliacoes.length === 0) return '—';
    const resolved = avaliacoes.filter((s) => s.avaliacao?.resolvido).length;
    return ((resolved / avaliacoes.length) * 100).toFixed(0) + '%';
  }, [avaliacoes]);

  const backlog = abertas + emAnalise;

  // Chart data
  const porSecretaria = useMemo(() => {
    const map: Record<string, number> = {};
    solicitacoes.forEach((s) => { const k = s.secretaria.split(' – ')[0]; map[k] = (map[k] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [solicitacoes]);

  const porTipo = useMemo(() => {
    const map: Record<string, number> = {};
    solicitacoes.forEach((s) => { map[s.tipo] = (map[s.tipo] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [solicitacoes]);

  const porCategoria = useMemo(() => {
    const map: Record<string, number> = {};
    solicitacoes.forEach((s) => { if (s.categoria) map[s.categoria] = (map[s.categoria] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [solicitacoes]);

  const porAssunto = useMemo(() => {
    const map: Record<string, number> = {};
    solicitacoes.forEach((s) => { if (s.assunto) map[s.assunto] = (map[s.assunto] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [solicitacoes]);

  const statusPorSecretaria = useMemo(() => {
    const map: Record<string, { Aberto: number; 'Em análise': number; Respondido: number }> = {};
    solicitacoes.forEach((s) => {
      const k = s.secretaria.split(' – ')[0];
      if (!map[k]) map[k] = { Aberto: 0, 'Em análise': 0, Respondido: 0 };
      map[k][s.status]++;
    });
    return Object.entries(map).map(([name, vals]) => ({ name, ...vals })).sort((a, b) => (b.Aberto + b['Em análise'] + b.Respondido) - (a.Aberto + a['Em análise'] + a.Respondido)).slice(0, 10);
  }, [solicitacoes]);

  const tempoRespostaHist = useMemo(() => {
    const bins = [
      { name: '0-1d', min: 0, max: 1, value: 0 },
      { name: '2-3d', min: 1, max: 3, value: 0 },
      { name: '4-7d', min: 3, max: 7, value: 0 },
      { name: '>7d', min: 7, max: Infinity, value: 0 },
    ];
    solicitacoes.forEach((s) => {
      const t = getTempoResposta(s);
      if (t === null) return;
      const bin = bins.find((b) => t >= b.min && t < b.max) || bins[bins.length - 1];
      bin.value++;
    });
    return bins;
  }, [solicitacoes]);

  const satisfacaoPorSecretaria = useMemo(() => {
    const map: Record<string, { sum: number; count: number }> = {};
    avaliacoes.forEach((s) => {
      const k = s.secretaria.split(' – ')[0];
      if (!map[k]) map[k] = { sum: 0, count: 0 };
      map[k].sum += s.avaliacao!.satisfacao;
      map[k].count++;
    });
    return Object.entries(map).map(([name, v]) => ({ name, value: Math.round((v.sum / v.count) * 10) / 10 })).sort((a, b) => b.value - a.value);
  }, [avaliacoes]);

  const tendenciaSemanal = useMemo(() => {
    const weeks: Record<string, { recebidas: number; respondidas: number }> = {};
    solicitacoes.forEach((s) => {
      const d = new Date(s.data);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (!weeks[key]) weeks[key] = { recebidas: 0, respondidas: 0 };
      weeks[key].recebidas++;
      if (s.status === 'Respondido') weeks[key].respondidas++;
    });
    return Object.entries(weeks).map(([name, v]) => ({ name, ...v })).slice(-8);
  }, [solicitacoes]);

  const handleStatusChange = (id: string, status: StatusSolicitacao) => {
    updateStatus(id, status);
    setRefresh((r) => r + 1);
  };

  const handleResponsavel = (id: string, responsavel: string) => {
    updateSolicitacao(id, { responsavel });
    setRefresh((r) => r + 1);
  };

  const exportExcel = () => {
    const dataSol = solicitacoes.map((s) => ({
      Protocolo: s.protocolo, Nome: s.nome, Email: s.email, Secretaria: s.secretaria,
      Setor: s.setor, Tipo: s.tipo, Categoria: s.categoria || '', Assunto: s.assunto || '',
      Impacto: s.impacto || '', Prioridade: s.prioridade || '', Mensagem: s.descricao,
      Data: new Date(s.data).toLocaleDateString('pt-BR'), Status: s.status, Responsável: s.responsavel || '',
    }));
    const dataSla = solicitacoes.map((s) => ({
      Protocolo: s.protocolo, Secretaria: s.secretaria.split(' – ')[0], Tipo: s.tipo,
      'Data Abertura': new Date(s.data).toLocaleDateString('pt-BR'),
      'SLA Limite': new Date(s.slaLimite).toLocaleDateString('pt-BR'),
      'Data Resposta': s.dataResposta ? new Date(s.dataResposta).toLocaleDateString('pt-BR') : '',
      'Tempo (dias)': getTempoResposta(s) ?? '', 'Status SLA': getSlaStatus(s),
    }));
    const dataAval = avaliacoes.map((s) => ({
      Protocolo: s.protocolo, Secretaria: s.secretaria.split(' – ')[0],
      Satisfação: s.avaliacao?.satisfacao, Resolvido: s.avaliacao?.resolvido ? 'Sim' : 'Não',
      Clareza: s.avaliacao?.clareza, 'Tempo Resposta': s.avaliacao?.tempoResposta,
      Comentário: s.avaliacao?.comentario || '',
    }));
    const dataResumo = [
      { Indicador: 'Total de Solicitações', Valor: total },
      { Indicador: 'Respondidas', Valor: respondidas },
      { Indicador: 'Em Aberto', Valor: abertas },
      { Indicador: '% Dentro do SLA', Valor: slaData + '%' },
      { Indicador: 'Tempo Médio de Resposta', Valor: tempoMedioResposta },
      { Indicador: 'Satisfação Média', Valor: satisfacaoMedia },
      { Indicador: '% Resolvido', Valor: resolvidoPercent },
      { Indicador: 'IAI', Valor: iai + '%' },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dataSol), 'Solicitações');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dataSla), 'SLA');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dataAval), 'Avaliações');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dataResumo), 'Resumo Mensal');
    XLSX.writeFile(wb, `seplag-relatorio-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin-auth');
    setCurrentUser(null);
  };

  if (!authed) return <AdminLogin onAuth={(op) => setCurrentUser(op)} />;

  const secretarias = [...new Set(solicitacoes.map((s) => s.secretaria))];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="institutional-gradient px-6 py-4 flex items-center gap-3 shadow-lg">
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Building2 className="h-7 w-7 text-primary-foreground" />
        <h1 className="text-lg font-bold text-primary-foreground flex-1">Gestão do Atendimento – SEPLAG MT</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-primary-foreground/80 hidden md:inline">
            {currentUser?.nome} ({currentUser?.nivel})
          </span>
          {isGestao && (
            <Button variant="secondary" size="sm" onClick={exportExcel} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          )}
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={handleLogout} title="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 md:px-8 py-6 space-y-6 max-w-[1400px] mx-auto w-full">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          <KpiCard icon={FileSpreadsheet} label="Total" value={total} color="text-primary" />
          <KpiCard icon={AlertCircle} label="Abertas" value={abertas} color="text-chart-3" />
          <KpiCard icon={Clock} label="Em Análise" value={emAnalise} color="text-chart-4" />
          <KpiCard icon={CheckCircle2} label="Respondidas" value={respondidas} color="text-primary" />
          <KpiCard icon={Target} label="% SLA" value={slaData + '%'} color="text-primary" />
          <KpiCard icon={TrendingUp} label="Tempo Médio" value={tempoMedioResposta} color="text-chart-4" />
          <KpiCard icon={AlertTriangle} label="Backlog" value={backlog} color="text-chart-3" />
          <KpiCard icon={Star} label="Satisfação" value={satisfacaoMedia} color="text-chart-3" sub="/5" />
          <KpiCard icon={BarChart3} label="IAI" value={iai + '%'} color="text-primary" />
        </div>

        <Tabs defaultValue={isGestao ? 'executivo' : 'operacional'} className="space-y-6">
          <TabsList className="flex-wrap">
            {isGestao && <TabsTrigger value="executivo" className="gap-2"><Eye className="h-4 w-4" />Visão Executiva</TabsTrigger>}
            <TabsTrigger value="operacional" className="gap-2"><Settings className="h-4 w-4" />Operacional</TabsTrigger>
            {isGestao && <TabsTrigger value="faq" className="gap-2"><HelpCircle className="h-4 w-4" />Gerenciar FAQ</TabsTrigger>}
            {isGestao && <TabsTrigger value="usuarios" className="gap-2"><Users className="h-4 w-4" />Usuários</TabsTrigger>}
            {isGestao && <TabsTrigger value="configuracoes" className="gap-2"><Settings className="h-4 w-4" />Configurações</TabsTrigger>}
          </TabsList>

          {/* ============ VISÃO EXECUTIVA ============ */}
          <TabsContent value="executivo" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Recebidas x Respondidas (Semanal)</CardTitle></CardHeader>
                <CardContent>
                  {tendenciaSemanal.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={tendenciaSemanal}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="recebidas" stroke="hsl(210, 85%, 40%)" strokeWidth={2} name="Recebidas" />
                        <Line type="monotone" dataKey="respondidas" stroke="hsl(210, 100%, 28%)" strokeWidth={2} name="Respondidas" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Tipos de Demanda</CardTitle></CardHeader>
                <CardContent>
                  {porTipo.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={porTipo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={40} label>
                          {porTipo.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                        </Pie>
                        <Tooltip /><Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Top 10 Secretarias</CardTitle></CardHeader>
                <CardContent>
                  {porSecretaria.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={porSecretaria} layout="vertical" margin={{ left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(210, 100%, 28%)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Status por Secretaria</CardTitle></CardHeader>
                <CardContent>
                  {statusPorSecretaria.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={statusPorSecretaria} layout="vertical" margin={{ left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Aberto" stackId="a" fill="hsl(45, 97%, 54%)" />
                        <Bar dataKey="Em análise" stackId="a" fill="hsl(210, 85%, 40%)" />
                        <Bar dataKey="Respondido" stackId="a" fill="hsl(210, 100%, 28%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Tempo de Resposta (dias)</CardTitle></CardHeader>
                <CardContent>
                  {tempoRespostaHist.some((b) => b.value > 0) ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={tempoRespostaHist}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(210, 85%, 40%)" radius={[4, 4, 0, 0]} name="Qtd" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Top 10 Assuntos</CardTitle></CardHeader>
                <CardContent>
                  {porAssunto.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={porAssunto} layout="vertical" margin={{ left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(210, 70%, 55%)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Satisfação por Secretaria</CardTitle></CardHeader>
                <CardContent>
                  {satisfacaoPorSecretaria.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={satisfacaoPorSecretaria} layout="vertical" margin={{ left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 5]} />
                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(45, 97%, 54%)" radius={[0, 4, 4, 0]} name="Média" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ============ OPERACIONAL ============ */}
          <TabsContent value="operacional" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-3">
                  <Input placeholder="Buscar por protocolo, nome ou e-mail..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-64" />
                  <Select value={filtroSecretaria} onValueChange={setFiltroSecretaria}>
                    <SelectTrigger className="w-[200px]"><SelectValue placeholder="Secretaria" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Secretarias</SelectItem>
                      {secretarias.map((s) => (<SelectItem key={s} value={s}>{s.split(' – ')[0]}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos Status</SelectItem>
                      <SelectItem value="Aberto">Aberto</SelectItem>
                      <SelectItem value="Em análise">Em análise</SelectItem>
                      <SelectItem value="Respondido">Respondido</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Prioridade</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="outline" className="self-center">{filtered.length} registros</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Triagem de Solicitações</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                {filtered.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Protocolo</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Secretaria</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>SLA</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Atribuído a</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.slice().reverse().map((s) => {
                        const slaStatus = getSlaStatus(s);
                        return (
                          <TableRow key={s.id}>
                            <TableCell className="font-mono text-xs">{s.protocolo}</TableCell>
                            <TableCell className="font-medium text-sm">{s.nome}</TableCell>
                            <TableCell className="text-xs">{s.secretaria.split(' – ')[0]}</TableCell>
                            <TableCell className="text-xs">{s.tipo}</TableCell>
                            <TableCell className="text-xs">{s.categoria || '—'}</TableCell>
                            <TableCell>
                              <Badge
                                variant={s.prioridade === 'Urgente' ? 'destructive' : 'outline'}
                                className={`text-[10px] transition-all duration-300 ${s.prioridade === 'Urgente' ? 'bg-destructive text-destructive-foreground' : 'bg-chart-4/15 text-chart-4 border-chart-4/30'}`}
                              >
                                {s.prioridade || 'Normal'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={`text-xs font-medium ${SLA_COLORS[slaStatus]}`}>{slaStatus}</span>
                            </TableCell>
                            <TableCell>
                              {isLeitura ? (
                                <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[s.status]}`}>{s.status}</Badge>
                              ) : (
                                <Select value={s.status} onValueChange={(v) => handleStatusChange(s.id, v as StatusSolicitacao)}>
                                  <SelectTrigger className={`w-[130px] text-xs h-8 border ${STATUS_COLORS[s.status]}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Aberto">Aberto</SelectItem>
                                    <SelectItem value="Em análise">Em análise</SelectItem>
                                    <SelectItem value="Respondido">Respondido</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                            <TableCell>
                              {isLeitura ? (
                                <span className="text-xs text-muted-foreground">{s.responsavel || '—'}</span>
                              ) : (
                                <Select value={s.responsavel || ''} onValueChange={(v) => handleResponsavel(s.id, v)}>
                                  <SelectTrigger className="w-[140px] text-xs h-8">
                                    <SelectValue placeholder="Atribuir" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {operadores.map((op) => (
                                      <SelectItem key={op.id} value={op.nome}>
                                        <span className="flex items-center gap-1">
                                          {NIVEIS_GESTAO.includes(op.nivel) ? <ShieldCheck className="h-3 w-3 text-primary inline" /> : <Shield className="h-3 w-3 text-muted-foreground inline" />}
                                          {op.nome}
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-12">Nenhuma solicitação encontrada.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ FAQ ============ */}
          <TabsContent value="faq" className="space-y-6">
            <FaqManager />
          </TabsContent>

          {/* ============ USUÁRIOS ============ */}
          <TabsContent value="usuarios" className="space-y-6">
            <UsersManager />
          </TabsContent>

          {/* ============ CONFIGURAÇÕES ============ */}
          <TabsContent value="configuracoes" className="space-y-6">
            <SettingsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
