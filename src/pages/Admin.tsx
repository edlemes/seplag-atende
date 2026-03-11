import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, ArrowLeft, Download, FileSpreadsheet, BarChart3, Users, CheckCircle2,
  AlertCircle, Clock, Star, TrendingUp, AlertTriangle, Target, Eye, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import { getSolicitacoes, updateStatus, updateSolicitacao, getSlaStatus, getTempoResposta } from '@/lib/storage';
import { Solicitacao, StatusSolicitacao, RESPONSAVEIS } from '@/types/solicitacao';
import AdminLogin from './AdminLogin';
import * as XLSX from 'xlsx';

const COLORS = ['#114524', '#1D843D', '#FDB913', '#42A5F5', '#EF5350', '#AB47BC', '#26C6DA', '#8D6E63', '#78909C', '#D4E157'];

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
    <Card>
      <CardContent className="pt-5 pb-4 flex flex-col items-center text-center gap-1">
        <Icon className={`h-5 w-5 ${color}`} />
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/70">{sub}</p>}
      </CardContent>
    </Card>
  );
}

const Admin = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin-auth') === '1');
  const [refresh, setRefresh] = useState(0);
  const [busca, setBusca] = useState('');
  const [filtroSecretaria, setFiltroSecretaria] = useState('all');
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [filtroPrioridade, setFiltroPrioridade] = useState('all');

  const solicitacoes = useMemo(() => getSolicitacoes(), [refresh]);

  // Filtered data
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
    const total = naoRespondidas.length || 1;
    return ((dentroSla / total) * 100).toFixed(1);
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

  // Tendência semanal (recebidas x respondidas)
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
    // Aba 1 - Solicitações
    const dataSol = solicitacoes.map((s) => ({
      Protocolo: s.protocolo,
      Nome: s.nome,
      Email: s.email,
      Secretaria: s.secretaria,
      Setor: s.setor,
      Tipo: s.tipo,
      Categoria: s.categoria || '',
      Assunto: s.assunto || '',
      Impacto: s.impacto || '',
      Prioridade: s.prioridade || '',
      Mensagem: s.descricao,
      Data: new Date(s.data).toLocaleDateString('pt-BR'),
      Status: s.status,
      Responsável: s.responsavel || '',
    }));

    // Aba 2 - SLA
    const dataSla = solicitacoes.map((s) => ({
      Protocolo: s.protocolo,
      Secretaria: s.secretaria.split(' – ')[0],
      Tipo: s.tipo,
      'Data Abertura': new Date(s.data).toLocaleDateString('pt-BR'),
      'SLA Limite': new Date(s.slaLimite).toLocaleDateString('pt-BR'),
      'Data Resposta': s.dataResposta ? new Date(s.dataResposta).toLocaleDateString('pt-BR') : '',
      'Tempo (dias)': getTempoResposta(s) ?? '',
      'Status SLA': getSlaStatus(s),
    }));

    // Aba 3 - Avaliações
    const dataAval = avaliacoes.map((s) => ({
      Protocolo: s.protocolo,
      Secretaria: s.secretaria.split(' – ')[0],
      Satisfação: s.avaliacao?.satisfacao,
      Resolvido: s.avaliacao?.resolvido ? 'Sim' : 'Não',
      Clareza: s.avaliacao?.clareza,
      'Tempo Resposta': s.avaliacao?.tempoResposta,
      Comentário: s.avaliacao?.comentario || '',
    }));

    // Aba 4 - Resumo
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

  if (!authed) return <AdminLogin onAuth={() => setAuthed(true)} />;

  const secretarias = [...new Set(solicitacoes.map((s) => s.secretaria))];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="institutional-gradient px-6 py-4 flex items-center gap-3 shadow-lg">
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Building2 className="h-7 w-7 text-primary-foreground" />
        <h1 className="text-lg font-bold text-primary-foreground flex-1">Gestão do Atendimento – SEPLAG MT</h1>
        <Button variant="secondary" size="sm" onClick={exportExcel} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Excel
        </Button>
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

        <Tabs defaultValue="executivo" className="space-y-6">
          <TabsList>
            <TabsTrigger value="executivo" className="gap-2"><Eye className="h-4 w-4" />Visão Executiva</TabsTrigger>
            <TabsTrigger value="operacional" className="gap-2"><Settings className="h-4 w-4" />Operacional</TabsTrigger>
          </TabsList>

          {/* ============ VISÃO EXECUTIVA ============ */}
          <TabsContent value="executivo" className="space-y-6">
            {/* Linha 1: Tendência + Tipos */}
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
                        <Line type="monotone" dataKey="recebidas" stroke="hsl(200, 70%, 50%)" strokeWidth={2} name="Recebidas" />
                        <Line type="monotone" dataKey="respondidas" stroke="hsl(122, 46%, 33%)" strokeWidth={2} name="Respondidas" />
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

            {/* Linha 2: Por secretaria + Status empilhado */}
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
                        <Bar dataKey="value" fill="hsl(122, 46%, 33%)" radius={[0, 4, 4, 0]} />
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
                        <Bar dataKey="Aberto" stackId="a" fill="hsl(36, 100%, 50%)" />
                        <Bar dataKey="Em análise" stackId="a" fill="hsl(200, 70%, 50%)" />
                        <Bar dataKey="Respondido" stackId="a" fill="hsl(122, 46%, 33%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}
                </CardContent>
              </Card>
            </div>

            {/* Linha 3: Qualitativo */}
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
                        <Bar dataKey="value" fill="hsl(200, 70%, 50%)" radius={[4, 4, 0, 0]} name="Qtd" />
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
                        <Bar dataKey="value" fill="hsl(122, 40%, 57%)" radius={[0, 4, 4, 0]} />
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
                        <Bar dataKey="value" fill="hsl(36, 100%, 50%)" radius={[0, 4, 4, 0]} name="Média" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ============ OPERACIONAL ============ */}
          <TabsContent value="operacional" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-3">
                  <Input
                    placeholder="Buscar por protocolo, nome ou e-mail..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-64"
                  />
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

            {/* Tabela */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Triagem de Solicitações</CardTitle>
              </CardHeader>
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
                        <TableHead>Responsável</TableHead>
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
                              <Badge variant={s.prioridade === 'Urgente' ? 'destructive' : 'secondary'} className="text-[10px]">
                                {s.prioridade || 'Normal'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={`text-xs font-medium ${SLA_COLORS[slaStatus]}`}>{slaStatus}</span>
                            </TableCell>
                            <TableCell>
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
                            </TableCell>
                            <TableCell>
                              <Select value={s.responsavel || ''} onValueChange={(v) => handleResponsavel(s.id, v)}>
                                <SelectTrigger className="w-[130px] text-xs h-8">
                                  <SelectValue placeholder="Atribuir" />
                                </SelectTrigger>
                                <SelectContent>
                                  {RESPONSAVEIS.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                                </SelectContent>
                              </Select>
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
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
