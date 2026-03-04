import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Download, FileSpreadsheet, BarChart3, Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getSolicitacoes, updateStatus } from '@/lib/storage';
import { Solicitacao, StatusSolicitacao } from '@/types/solicitacao';
import * as XLSX from 'xlsx';

const COLORS = ['#2E7D32', '#66BB6A', '#FFA726', '#42A5F5', '#EF5350', '#AB47BC', '#26C6DA', '#8D6E63'];

const STATUS_COLORS: Record<StatusSolicitacao, string> = {
  'Aberto': 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  'Em análise': 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  'Respondido': 'bg-primary/20 text-primary border-primary/30',
};

const Admin = () => {
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(0);
  const solicitacoes = useMemo(() => getSolicitacoes(), [refresh]);

  const porSecretaria = useMemo(() => {
    const map: Record<string, number> = {};
    solicitacoes.forEach((s) => {
      const key = s.secretaria.split(' – ')[0];
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [solicitacoes]);

  const porTipo = useMemo(() => {
    const map: Record<string, number> = {};
    solicitacoes.forEach((s) => { map[s.tipo] = (map[s.tipo] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [solicitacoes]);

  const abertas = solicitacoes.filter((s) => s.status === 'Aberto').length;
  const respondidas = solicitacoes.filter((s) => s.status === 'Respondido').length;
  const iai = solicitacoes.length > 0 ? ((respondidas / solicitacoes.length) * 100).toFixed(1) : '0';

  const handleStatusChange = (id: string, status: StatusSolicitacao) => {
    updateStatus(id, status);
    setRefresh((r) => r + 1);
  };

  const exportExcel = () => {
    const data = solicitacoes.map((s) => ({
      Nome: s.nome,
      Email: s.email,
      Secretaria: s.secretaria,
      'Tipo de Solicitação': s.tipo,
      Mensagem: s.descricao,
      Data: new Date(s.data).toLocaleDateString('pt-BR'),
      Status: s.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Solicitações');
    XLSX.writeFile(wb, `solicitacoes-seplag-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="institutional-gradient px-6 py-4 flex items-center gap-3 shadow-lg">
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Building2 className="h-7 w-7 text-primary-foreground" />
        <h1 className="text-lg font-bold text-primary-foreground flex-1">Painel Administrativo – SEPLAG MT</h1>
        <Button variant="secondary" size="sm" onClick={exportExcel} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Excel
        </Button>
      </header>

      <main className="flex-1 px-4 md:px-8 py-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: solicitacoes.length, icon: FileSpreadsheet, color: 'text-primary' },
            { label: 'Abertas', value: abertas, icon: AlertCircle, color: 'text-chart-3' },
            { label: 'Respondidas', value: respondidas, icon: CheckCircle2, color: 'text-primary' },
            { label: 'Secretarias', value: porSecretaria.length, icon: Users, color: 'text-chart-4' },
            { label: 'IAI', value: `${iai}%`, icon: BarChart3, color: 'text-primary' },
          ].map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="pt-6 flex flex-col items-center text-center gap-1">
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Solicitações por Secretaria</CardTitle>
            </CardHeader>
            <CardContent>
              {porSecretaria.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={porSecretaria} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(122, 46%, 33%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-12">Nenhum dado disponível</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tipos de Demanda</CardTitle>
            </CardHeader>
            <CardContent>
              {porTipo.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={porTipo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {porTipo.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-12">Nenhum dado disponível</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Todas as Solicitações</CardTitle>
            <Badge variant="outline" className="text-xs">{solicitacoes.length} registros</Badge>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {solicitacoes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Secretaria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitacoes.slice().reverse().map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.nome}</TableCell>
                      <TableCell className="text-sm">{s.secretaria.split(' – ')[0]}</TableCell>
                      <TableCell>{s.tipo}</TableCell>
                      <TableCell className="text-sm">{new Date(s.data).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Select value={s.status} onValueChange={(v) => handleStatusChange(s.id, v as StatusSolicitacao)}>
                          <SelectTrigger className={`w-[140px] text-xs h-8 border ${STATUS_COLORS[s.status]}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Aberto">Aberto</SelectItem>
                            <SelectItem value="Em análise">Em análise</SelectItem>
                            <SelectItem value="Respondido">Respondido</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-12">Nenhuma solicitação registrada ainda.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
