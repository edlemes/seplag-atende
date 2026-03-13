import { useState, useEffect, useMemo, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Building2, ArrowLeft, Download, FileSpreadsheet, BarChart3, CheckCircle2,
  AlertCircle, Clock, Star, TrendingUp, AlertTriangle, Target, Eye, Settings,
  HelpCircle, Plus, Pencil, Trash2, Save, X, Users, Shield, ShieldCheck, LogOut,
  User, Camera, KeyRound, Menu, ChevronLeft, MessageSquare, BookOpen, Trophy, Award, Medal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import {
  useSolicitacoes, updateStatusDb, updateSolicitacaoDb, getSlaStatus, getTempoResposta,
  useFaqs, addFaqDb, updateFaqDb, deleteFaqDb,
  useOperadores, addOperadorDb, updateOperadorDb, deleteOperadorDb,
  useCustomOrgaos, addCustomOrgaoDb, removeCustomOrgaoDb,
  useCustomAssuntos, addCustomAssuntoDb, removeCustomAssuntoDb,
  uploadAvatar,
} from '@/hooks/use-supabase-data';
import { Solicitacao, StatusSolicitacao, FAQ, Operador, NivelAcesso, NIVEIS_ACESSO, NIVEIS_GESTAO, NIVEIS_OPERACAO, NIVEIS_LEITURA, ASSUNTOS } from '@/types/solicitacao';
import AdminLogin from './AdminLogin';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#004B8D', '#0067B3', '#FDB913', '#42A5F5', '#EF5350', '#AB47BC', '#26C6DA', '#8D6E63', '#78909C', '#D4E157'];

const STATUS_COLORS: Record<StatusSolicitacao, string> = {
  'Aberto': 'bg-amber-50 text-amber-800 border-amber-200',
  'Em análise': 'bg-blue-50 text-blue-800 border-blue-200',
  'Respondido': 'bg-emerald-50 text-emerald-800 border-emerald-200',
};

const SLA_COLORS = {
  'Dentro do Prazo': 'text-emerald-600',
  'Próximo do Prazo': 'text-amber-600',
  'Atrasado': 'text-red-600',
};

type AdminSection = 'executivo' | 'operacional' | 'faq' | 'usuarios' | 'configuracoes' | 'aprendizagem' | 'banners' | 'equipe';

// ─── KPI Card ───
function KpiCard({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card/80 backdrop-blur-sm">
      <CardContent className="pt-5 pb-4 flex flex-col items-center text-center gap-1">
        <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/60">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Sidebar ───
function AdminSidebar({ 
  currentUser, activeSection, onSectionChange, isGestao, isOperacao, isLeitura,
  collapsed, onToggleCollapse, onLogout, onOpenProfile, onExport
}: {
  currentUser: Operador;
  activeSection: AdminSection;
  onSectionChange: (s: AdminSection) => void;
  isGestao: boolean;
  isOperacao: boolean;
  isLeitura: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  onExport: () => void;
}) {
  const navigate = useNavigate();

  const menuItems: { key: AdminSection; label: string; icon: any; visible: boolean }[] = [
    { key: 'executivo', label: 'Visão Executiva', icon: Eye, visible: isGestao || isOperacao },
    { key: 'operacional', label: 'Operacional', icon: BarChart3, visible: true },
    { key: 'aprendizagem', label: 'Gestão de Trilhas', icon: BookOpen, visible: isGestao },
    { key: 'banners', label: 'Banners', icon: FileSpreadsheet, visible: isGestao },
    { key: 'equipe', label: 'Equipe', icon: Users, visible: isGestao },
    { key: 'faq', label: 'Gerenciar FAQ', icon: HelpCircle, visible: isGestao },
    { key: 'usuarios', label: 'Usuários', icon: Users, visible: isGestao },
    { key: 'configuracoes', label: 'Configurações', icon: Settings, visible: isGestao },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-card/95 backdrop-blur-xl border-r border-border/50 shadow-xl transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[68px]' : 'w-[260px]'
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border/50">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground shrink-0">
          <Building2 className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-foreground truncate">SEPLAG Atende</h1>
            <p className="text-[10px] text-muted-foreground">Gestão do Atendimento</p>
          </div>
        )}
        <Button variant="ghost" size="icon" className="ml-auto h-7 w-7 text-muted-foreground hover:text-foreground shrink-0" onClick={onToggleCollapse} aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}>
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Menu principal">
        {menuItems.filter(i => i.visible).map((item) => {
          const isActive = activeSection === item.key;
          return (
            <button key={item.key} onClick={() => onSectionChange(item.key)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}`} aria-current={isActive ? 'page' : undefined} title={collapsed ? item.label : undefined}>
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-3 space-y-1 border-t border-border/50">
        <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200" title={collapsed ? 'Voltar ao Portal' : undefined}>
          <ArrowLeft className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Voltar ao Portal</span>}
        </button>
        {isGestao && (
          <button onClick={onExport} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200" title={collapsed ? 'Exportar Excel' : undefined}>
            <Download className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Exportar Excel</span>}
          </button>
        )}
      </div>

      <div className="px-3 py-4 border-t border-border/50">
        <button onClick={onOpenProfile} className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-muted/60 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`} aria-label="Abrir perfil">
          <Avatar className="h-8 w-8 shrink-0">
            {currentUser.avatar_url ? <AvatarImage src={currentUser.avatar_url} alt={currentUser.nome} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{currentUser.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">{currentUser.nome}</p>
              <p className="text-[10px] text-muted-foreground truncate">{currentUser.nivel}</p>
            </div>
          )}
        </button>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all duration-200" title={collapsed ? 'Sair' : undefined}>
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}

// ─── Loading Skeleton ───
function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex bg-background">
      <div className="w-[260px] border-r border-border/50 bg-card/95 p-4 space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
      </div>
      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i} className="border-0"><CardContent className="pt-5 pb-4 flex flex-col items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-12" />
            </CardContent></Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Dialog ───
function ProfileDialog({ currentUser, open, onOpenChange, onUpdate }: {
  currentUser: Operador; open: boolean; onOpenChange: (o: boolean) => void; onUpdate: (op: Operador) => void;
}) {
  const { toast } = useToast();
  const [editNome, setEditNome] = useState(currentUser.nome);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showSenhaSection, setShowSenhaSection] = useState(false);

  const handleSaveProfile = async () => {
    if (!editNome.trim() || !editEmail.trim() || saving) return;
    setSaving(true);
    try {
      await updateOperadorDb(currentUser.id, { nome: editNome.trim(), email: editEmail.trim().toLowerCase() });
      const updated = { ...currentUser, nome: editNome.trim(), email: editEmail.trim().toLowerCase() };
      sessionStorage.setItem('admin-auth', JSON.stringify(updated));
      onUpdate(updated);
      toast({ title: 'Perfil atualizado!', description: 'Seus dados foram salvos.' });
    } catch { toast({ title: 'Erro ao salvar', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const handleChangeSenha = async () => {
    if (!senhaAtual || !novaSenha || saving) return;
    if (senhaAtual !== currentUser.senha) { toast({ title: 'Senha atual incorreta', variant: 'destructive' }); return; }
    if (novaSenha.length < 6) { toast({ title: 'A nova senha deve ter pelo menos 6 caracteres', variant: 'destructive' }); return; }
    if (novaSenha !== confirmSenha) { toast({ title: 'As senhas não coincidem', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      await updateOperadorDb(currentUser.id, { senha: novaSenha });
      const updated = { ...currentUser, senha: novaSenha };
      sessionStorage.setItem('admin-auth', JSON.stringify(updated));
      onUpdate(updated);
      setSenhaAtual(''); setNovaSenha(''); setConfirmSenha(''); setShowSenhaSection(false);
      toast({ title: 'Senha alterada com sucesso!' });
    } catch { toast({ title: 'Erro ao alterar senha', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast({ title: 'Imagem muito grande', description: 'Máximo 2MB', variant: 'destructive' }); return; }
    setUploadingAvatar(true);
    try {
      const url = await uploadAvatar(currentUser.id, file);
      await updateOperadorDb(currentUser.id, { avatar_url: url } as any);
      const updated = { ...currentUser, avatar_url: url };
      sessionStorage.setItem('admin-auth', JSON.stringify(updated));
      onUpdate(updated);
      toast({ title: 'Foto atualizada!' });
    } catch { toast({ title: 'Erro ao enviar foto', variant: 'destructive' }); }
    finally { setUploadingAvatar(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground"><User className="h-5 w-5" />Meu Perfil</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <Avatar className="h-20 w-20">
                {currentUser.avatar_url ? <AvatarImage src={currentUser.avatar_url} alt={currentUser.nome} /> : null}
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">{currentUser.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}</AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                {uploadingAvatar ? <span className="text-white text-xs">Enviando...</span> : <Camera className="h-5 w-5 text-white" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">Clique na foto para alterar</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2"><Label htmlFor="profile-nome">Nome</Label><Input id="profile-nome" value={editNome} onChange={(e) => setEditNome(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="profile-email">E-mail</Label><Input id="profile-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} /></div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Shield className="h-4 w-4" />Nível: <Badge variant="secondary">{currentUser.nivel}</Badge></div>
            <Button onClick={handleSaveProfile} disabled={saving || !editNome.trim() || !editEmail.trim()} className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Salvando...' : 'Salvar Perfil'}</Button>
          </div>
          <div className="border-t pt-4">
            {!showSenhaSection ? (
              <Button variant="outline" className="w-full gap-2" onClick={() => setShowSenhaSection(true)}><KeyRound className="h-4 w-4" />Alterar Senha</Button>
            ) : (
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2 text-foreground"><KeyRound className="h-4 w-4" />Alterar Senha</h4>
                <div className="space-y-2"><Label htmlFor="senha-atual">Senha Atual</Label><Input id="senha-atual" type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="nova-senha">Nova Senha</Label><Input id="nova-senha" type="password" placeholder="Mínimo 6 caracteres" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="confirm-senha">Confirmar Nova Senha</Label><Input id="confirm-senha" type="password" value={confirmSenha} onChange={(e) => setConfirmSenha(e.target.value)} /></div>
                <div className="flex gap-2">
                  <Button onClick={handleChangeSenha} disabled={saving || !senhaAtual || !novaSenha || novaSenha !== confirmSenha} className="gap-1"><Save className="h-3 w-3" /> Salvar</Button>
                  <Button variant="ghost" onClick={() => { setShowSenhaSection(false); setSenhaAtual(''); setNovaSenha(''); setConfirmSenha(''); }}>Cancelar</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Aprendizagem Manager (Learning Analytics + CRUD) ───
function AprendizagemManager() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'conteudo' | 'quizzes'>('analytics');
  const [trilhas, setTrilhas] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedTrilha, setSelectedTrilha] = useState('SIAD');
  const [editingContent, setEditingContent] = useState<string | null>(null);
  const [editFields, setEditFields] = useState({ titulo: '', subtitulo: '', conteudo: '', pontos: 15 });
  const [newQuiz, setNewQuiz] = useState({ pergunta: '', opcoes: ['', '', '', ''], resposta_correta: 0 });
  const [editingQuiz, setEditingQuiz] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: rows }, { data: content }, { data: qz }] = await Promise.all([
      supabase.from('trilha_progresso').select('*').order('pontuacao', { ascending: false }),
      supabase.from('trilhas_conteudo').select('*').order('trilha, modulo_ordem'),
      supabase.from('quiz_perguntas').select('*, trilhas_conteudo(trilha, titulo, modulo_ordem)').order('created_at'),
    ]);
    setData(rows || []);
    setTrilhas(content || []);
    setQuizzes(qz || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const totalServidores = data.length;
  const concluidos = data.filter((d: any) => d.concluido).length;
  const taxaConclusao = totalServidores > 0 ? Math.round((concluidos / totalServidores) * 100) : 0;
  const pontuacaoMedia = totalServidores > 0 ? Math.round(data.reduce((s: number, d: any) => s + (d.pontuacao || 0), 0) / totalServidores) : 0;
  const tempoMedio = totalServidores > 0 ? Math.round(data.reduce((s: number, d: any) => s + (d.tempo_minutos || 0), 0) / totalServidores) : 0;
  const totalMedalhas = data.reduce((s: number, d: any) => s + (Array.isArray(d.medalhas) ? d.medalhas.length : 0), 0);

  const nivelDist = data.reduce((acc: Record<string, number>, d: any) => {
    const n = d.nivel || 'Iniciante';
    acc[n] = (acc[n] || 0) + 1;
    return acc;
  }, {});
  const nivelChartData = Object.entries(nivelDist).map(([name, value]) => ({ name, value }));

  const filteredContent = trilhas.filter((t: any) => t.trilha === selectedTrilha);
  const filteredQuizzes = quizzes.filter((q: any) => q.trilhas_conteudo?.trilha === selectedTrilha);

  const handleSaveContent = async (id: string) => {
    setSaving(true);
    await supabase.from('trilhas_conteudo').update({
      titulo: editFields.titulo, subtitulo: editFields.subtitulo,
      conteudo: editFields.conteudo, pontos: editFields.pontos,
    }).eq('id', id);
    setEditingContent(null);
    toast({ title: 'Conteúdo atualizado!' });
    fetchAll();
    setSaving(false);
  };

  const handleDeleteQuiz = async (id: string) => {
    await supabase.from('quiz_perguntas').delete().eq('id', id);
    toast({ title: 'Pergunta removida!' });
    fetchAll();
  };

  const handleAddQuiz = async (conteudoId: string) => {
    if (!newQuiz.pergunta.trim() || newQuiz.opcoes.some(o => !o.trim())) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }
    setSaving(true);
    await supabase.from('quiz_perguntas').insert({
      trilha_conteudo_id: conteudoId,
      pergunta: newQuiz.pergunta.trim(),
      opcoes: newQuiz.opcoes.map(o => o.trim()),
      resposta_correta: newQuiz.resposta_correta,
    });
    setNewQuiz({ pergunta: '', opcoes: ['', '', '', ''], resposta_correta: 0 });
    toast({ title: 'Pergunta adicionada!' });
    fetchAll();
    setSaving(false);
  };

  const handleUpdateQuiz = async (id: string) => {
    setSaving(true);
    await supabase.from('quiz_perguntas').update({
      pergunta: newQuiz.pergunta.trim(),
      opcoes: newQuiz.opcoes.map(o => o.trim()),
      resposta_correta: newQuiz.resposta_correta,
    }).eq('id', id);
    setEditingQuiz(null);
    toast({ title: 'Pergunta atualizada!' });
    fetchAll();
    setSaving(false);
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-2">
        {(['analytics', 'conteudo', 'quizzes'] as const).map((tab) => (
          <Button key={tab} variant={activeTab === tab ? 'default' : 'outline'} size="sm" className="rounded-full text-xs" onClick={() => setActiveTab(tab)}>
            {tab === 'analytics' ? 'Métricas' : tab === 'conteudo' ? 'Conteúdo' : 'Quizzes'}
          </Button>
        ))}
      </div>

      {/* Trilha selector for content/quizzes */}
      {activeTab !== 'analytics' && (
        <div className="flex gap-2">
          {['SIAD', 'SIEP', 'Banco de Talentos'].map((t) => (
            <Badge key={t} variant={selectedTrilha === t ? 'default' : 'outline'} className="cursor-pointer rounded-full px-3 py-1 text-xs" onClick={() => setSelectedTrilha(t)}>
              {t}
            </Badge>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card className="border-0 shadow-sm"><CardContent className="pt-5 pb-4 text-center">
              <Users className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{totalServidores}</p>
              <p className="text-[11px] text-muted-foreground">Servidores Ativos</p>
            </CardContent></Card>
            <Card className="border-0 shadow-sm"><CardContent className="pt-5 pb-4 text-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{taxaConclusao}%</p>
              <p className="text-[11px] text-muted-foreground">Taxa Conclusão</p>
            </CardContent></Card>
            <Card className="border-0 shadow-sm"><CardContent className="pt-5 pb-4 text-center">
              <Star className="h-5 w-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{pontuacaoMedia}</p>
              <p className="text-[11px] text-muted-foreground">Pontuação Média</p>
            </CardContent></Card>
            <Card className="border-0 shadow-sm"><CardContent className="pt-5 pb-4 text-center">
              <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{tempoMedio}min</p>
              <p className="text-[11px] text-muted-foreground">Tempo Médio</p>
            </CardContent></Card>
            <Card className="border-0 shadow-sm"><CardContent className="pt-5 pb-4 text-center">
              <Award className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{totalMedalhas}</p>
              <p className="text-[11px] text-muted-foreground">Medalhas</p>
            </CardContent></Card>
            <Card className="border-0 shadow-sm"><CardContent className="pt-5 pb-4 text-center">
              <TrendingUp className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{concluidos}</p>
              <p className="text-[11px] text-muted-foreground">Concluídos</p>
            </CardContent></Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base text-foreground">Distribuição por Nível</CardTitle></CardHeader>
              <CardContent>
                {nivelChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={nivelChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={35} label>
                        {nivelChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base text-foreground flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" /> Top Servidores</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {data.filter((d: any) => d.concluido).slice(0, 10).map((entry: any, i: number) => (
                    <div key={entry.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${i === 0 ? 'bg-amber-500/10' : 'hover:bg-muted/50'}`}>
                      <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{entry.nome}</p>
                        <p className="text-[10px] text-muted-foreground">{entry.nivel} · {entry.tempo_minutos || 0}min</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-bold text-amber-600">
                        <Star className="h-3.5 w-3.5" /> {entry.pontuacao}
                      </div>
                    </div>
                  ))}
                  {data.filter((d: any) => d.concluido).length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">Nenhum servidor concluiu ainda</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Full table */}
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base text-foreground">Todos os Participantes</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead><TableHead>E-mail</TableHead><TableHead>Nível</TableHead>
                    <TableHead>Pontos</TableHead><TableHead>Medalhas</TableHead><TableHead>Tempo</TableHead>
                    <TableHead>Status</TableHead><TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((d: any) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium text-foreground">{d.nome}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{d.email}</TableCell>
                      <TableCell><Badge variant="outline" className="rounded-full text-[10px]">{d.nivel}</Badge></TableCell>
                      <TableCell className="font-semibold text-amber-600">{d.pontuacao}</TableCell>
                      <TableCell>{Array.isArray(d.medalhas) ? d.medalhas.length : 0}</TableCell>
                      <TableCell className="text-muted-foreground">{d.tempo_minutos || 0}min</TableCell>
                      <TableCell>{d.concluido ? <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Concluído</Badge> : <Badge variant="outline" className="text-[10px]">Em progresso</Badge>}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{d.concluido_em ? new Date(d.concluido_em).toLocaleDateString('pt-BR') : '-'}</TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhum participante</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'conteudo' && (
        <div className="space-y-4">
          {filteredContent.map((mod: any) => (
            <Card key={mod.id} className="border-0 shadow-sm">
              <CardContent className="p-5">
                {editingContent === mod.id ? (
                  <div className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="space-y-1"><Label>Título</Label><Input value={editFields.titulo} onChange={(e) => setEditFields({ ...editFields, titulo: e.target.value })} /></div>
                      <div className="space-y-1"><Label>Subtítulo</Label><Input value={editFields.subtitulo} onChange={(e) => setEditFields({ ...editFields, subtitulo: e.target.value })} /></div>
                    </div>
                    <div className="space-y-1"><Label>Conteúdo</Label><Textarea value={editFields.conteudo} onChange={(e) => setEditFields({ ...editFields, conteudo: e.target.value })} className="min-h-[100px]" /></div>
                    <div className="space-y-1 max-w-[100px]"><Label>Pontos</Label><Input type="number" value={editFields.pontos} onChange={(e) => setEditFields({ ...editFields, pontos: parseInt(e.target.value) || 0 })} /></div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveContent(mod.id)} disabled={saving} className="gap-1"><Save className="h-3 w-3" /> Salvar</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingContent(null)}><X className="h-3 w-3" /> Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="rounded-full text-[10px]">Módulo {mod.modulo_ordem}</Badge>
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 rounded-full text-[10px]">{mod.pontos} pts</Badge>
                      </div>
                      <p className="font-semibold text-foreground">{mod.titulo}</p>
                      <p className="text-sm text-primary">{mod.subtitulo}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{mod.conteudo}</p>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1 shrink-0" onClick={() => { setEditingContent(mod.id); setEditFields({ titulo: mod.titulo, subtitulo: mod.subtitulo, conteudo: mod.conteudo, pontos: mod.pontos }); }}>
                      <Pencil className="h-3 w-3" /> Editar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {filteredContent.length === 0 && <p className="text-muted-foreground text-center py-8">Nenhum conteúdo para esta trilha.</p>}
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          {filteredContent.map((mod: any) => {
            const modQuizzes = filteredQuizzes.filter((q: any) => q.trilha_conteudo_id === mod.id);
            return (
              <Card key={mod.id} className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full text-[10px]">Módulo {mod.modulo_ordem}</Badge>
                    {mod.titulo}
                    <Badge className="ml-auto rounded-full text-[10px]">{modQuizzes.length} perguntas</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {modQuizzes.map((q: any) => (
                    <div key={q.id} className="border rounded-xl p-3 space-y-2">
                      {editingQuiz === q.id ? (
                        <div className="space-y-2">
                          <Input value={newQuiz.pergunta} onChange={(e) => setNewQuiz({ ...newQuiz, pergunta: e.target.value })} placeholder="Pergunta" />
                          {newQuiz.opcoes.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Input value={opt} onChange={(e) => { const o = [...newQuiz.opcoes]; o[i] = e.target.value; setNewQuiz({ ...newQuiz, opcoes: o }); }} placeholder={`Opção ${i + 1}`} className="flex-1" />
                              <input type="radio" name="edit-correct" checked={newQuiz.resposta_correta === i} onChange={() => setNewQuiz({ ...newQuiz, resposta_correta: i })} />
                              <span className="text-[10px] text-muted-foreground">Correta</span>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleUpdateQuiz(q.id)} disabled={saving} className="gap-1"><Save className="h-3 w-3" /> Salvar</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingQuiz(null)}><X className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-foreground">{q.pergunta}</p>
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(q.opcoes) ? q.opcoes : []).map((opt: string, i: number) => (
                              <Badge key={i} variant={i === q.resposta_correta ? 'default' : 'outline'} className="text-[10px] rounded-full">{opt}</Badge>
                            ))}
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={() => { setEditingQuiz(q.id); setNewQuiz({ pergunta: q.pergunta, opcoes: Array.isArray(q.opcoes) ? q.opcoes : ['', '', '', ''], resposta_correta: q.resposta_correta }); }}>
                              <Pencil className="h-2.5 w-2.5" /> Editar
                            </Button>
                            <Button size="sm" variant="destructive" className="h-6 text-[10px] gap-1" onClick={() => handleDeleteQuiz(q.id)}>
                              <Trash2 className="h-2.5 w-2.5" /> Excluir
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Add new quiz */}
                  <div className="border-t pt-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Plus className="h-3 w-3" /> Nova Pergunta</p>
                    <Input value={newQuiz.pergunta} onChange={(e) => setNewQuiz({ ...newQuiz, pergunta: e.target.value })} placeholder="Pergunta" className="text-sm" />
                    {newQuiz.opcoes.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input value={opt} onChange={(e) => { const o = [...newQuiz.opcoes]; o[i] = e.target.value; setNewQuiz({ ...newQuiz, opcoes: o }); }} placeholder={`Opção ${i + 1}`} className="flex-1 text-sm" />
                        <input type="radio" name={`new-correct-${mod.id}`} checked={newQuiz.resposta_correta === i} onChange={() => setNewQuiz({ ...newQuiz, resposta_correta: i })} />
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">Correta</span>
                      </div>
                    ))}
                    <Button size="sm" onClick={() => handleAddQuiz(mod.id)} disabled={saving} className="gap-1"><Plus className="h-3 w-3" /> Adicionar</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FaqManager() {
  const { faqs, loading, refresh } = useFaqs();
  const [novaPergunta, setNovaPergunta] = useState('');
  const [novaResposta, setNovaResposta] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editPergunta, setEditPergunta] = useState('');
  const [editResposta, setEditResposta] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => { if (!novaPergunta.trim() || !novaResposta.trim() || saving) return; setSaving(true); try { await addFaqDb(novaPergunta.trim(), novaResposta.trim()); setNovaPergunta(''); setNovaResposta(''); refresh(); } finally { setSaving(false); } };
  const handleEdit = (faq: FAQ) => { setEditId(faq.id); setEditPergunta(faq.pergunta); setEditResposta(faq.resposta); };
  const handleSaveEdit = async () => { if (!editId || !editPergunta.trim() || !editResposta.trim() || saving) return; setSaving(true); try { await updateFaqDb(editId, editPergunta.trim(), editResposta.trim()); setEditId(null); refresh(); } finally { setSaving(false); } };
  const handleDelete = async (id: string) => { setSaving(true); try { await deleteFaqDb(id); refresh(); } finally { setSaving(false); } };

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base flex items-center gap-2 text-foreground"><Plus className="h-4 w-4" />Nova Pergunta</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label htmlFor="faq-pergunta">Pergunta</Label><Input id="faq-pergunta" placeholder="Ex: Como acompanhar meu protocolo?" value={novaPergunta} onChange={(e) => setNovaPergunta(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="faq-resposta">Resposta</Label><Textarea id="faq-resposta" placeholder="Escreva a resposta..." value={novaResposta} onChange={(e) => setNovaResposta(e.target.value)} className="min-h-[100px]" /></div>
          <Button onClick={handleAdd} disabled={!novaPergunta.trim() || !novaResposta.trim() || saving} className="gap-2"><Plus className="h-4 w-4" /> {saving ? 'Salvando...' : 'Adicionar FAQ'}</Button>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base text-foreground">FAQs Cadastradas ({faqs.length})</CardTitle></CardHeader>
        <CardContent>
          {faqs.length === 0 ? <p className="text-muted-foreground text-center py-8">Nenhuma FAQ cadastrada.</p> : (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="border rounded-xl p-4 space-y-2">
                  {editId === faq.id ? (<>
                    <Input value={editPergunta} onChange={(e) => setEditPergunta(e.target.value)} />
                    <Textarea value={editResposta} onChange={(e) => setEditResposta(e.target.value)} className="min-h-[80px]" />
                    <div className="flex gap-2"><Button size="sm" onClick={handleSaveEdit} disabled={saving} className="gap-1"><Save className="h-3 w-3" />Salvar</Button><Button size="sm" variant="ghost" onClick={() => setEditId(null)} className="gap-1"><X className="h-3 w-3" />Cancelar</Button></div>
                  </>) : (<>
                    <p className="font-medium text-foreground">{faq.pergunta}</p>
                    <p className="text-sm text-muted-foreground">{faq.resposta}</p>
                    <div className="flex gap-2 pt-1"><Button size="sm" variant="outline" onClick={() => handleEdit(faq)} className="gap-1 h-7 text-xs"><Pencil className="h-3 w-3" />Editar</Button><Button size="sm" variant="destructive" onClick={() => handleDelete(faq.id)} disabled={saving} className="gap-1 h-7 text-xs"><Trash2 className="h-3 w-3" />Excluir</Button></div>
                  </>)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Users Manager ───
function UsersManager() {
  const { operadores, loading, refresh } = useOperadores();
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoSenha, setNovoSenha] = useState('');
  const [novoNivel, setNovoNivel] = useState<NivelAcesso>('Analista');
  const [editId, setEditId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [resetSenhaId, setResetSenhaId] = useState<string | null>(null);
  const [novaSenhaReset, setNovaSenhaReset] = useState('');
  const [confirmSenhaReset, setConfirmSenhaReset] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const generateDefaultPassword = (nivel: NivelAcesso): string => {
    const prefixMap: Record<NivelAcesso, string> = { 'Administrador': 'admin', 'Gerente': 'gerente', 'Coordenador': 'coord', 'Analista': 'analista', 'Residente Técnico': 'residente', 'Estagiário': 'estagiario' };
    return `${prefixMap[nivel]}${String(Math.floor(Math.random() * 9000) + 1000)}`;
  };

  const handleAdd = async () => {
    if (!novoNome.trim() || !novoEmail.trim() || saving) return;
    setSaving(true);
    try {
      const senha = novoSenha.trim() || generateDefaultPassword(novoNivel);
      await addOperadorDb(novoNome.trim(), novoEmail.trim(), novoNivel, senha);
      toast({ title: 'Operador criado com sucesso!', description: `Nome: ${novoNome.trim()} | E-mail: ${novoEmail.trim().toLowerCase()} | Nível: ${novoNivel} | Senha: ${senha}` });
      setNovoNome(''); setNovoEmail(''); setNovoSenha(''); setNovoNivel('Analista'); refresh();
    } catch (err: any) { toast({ title: 'Erro ao criar operador', description: err.message || 'Tente novamente', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const handleToggleAtivo = async (op: Operador) => { await updateOperadorDb(op.id, { ativo: !op.ativo }); refresh(); };
  const handleChangeNivel = async (id: string, nivel: NivelAcesso) => { await updateOperadorDb(id, { nivel }); refresh(); };
  const handleDelete = async (id: string) => { const op = operadores.find(o => o.id === id); if (op && window.confirm(`Tem certeza que deseja remover "${op.nome}"?`)) { await deleteOperadorDb(id); refresh(); } };
  const handleStartEdit = (op: Operador) => { setEditId(op.id); setEditNome(op.nome); setEditEmail(op.email); };
  const handleSaveEdit = async () => { if (!editId || !editNome.trim() || !editEmail.trim() || saving) return; setSaving(true); try { await updateOperadorDb(editId, { nome: editNome.trim(), email: editEmail.trim().toLowerCase() }); setEditId(null); refresh(); } finally { setSaving(false); } };
  const handleResetSenha = async () => {
    if (!resetSenhaId || !novaSenhaReset.trim()) return;
    if (novaSenhaReset !== confirmSenhaReset) { toast({ title: 'As senhas não coincidem!', variant: 'destructive' }); return; }
    if (novaSenhaReset.length < 6) { toast({ title: 'A senha deve ter pelo menos 6 caracteres.', variant: 'destructive' }); return; }
    await updateOperadorDb(resetSenhaId, { senha: novaSenhaReset });
    const op = operadores.find(o => o.id === resetSenhaId);
    toast({ title: `Senha de "${op?.nome}" redefinida com sucesso!` });
    setResetSenhaId(null); setNovaSenhaReset(''); setConfirmSenhaReset(''); refresh();
  };

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base flex items-center gap-2 text-foreground"><Plus className="h-4 w-4" />Novo Operador</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2"><Label htmlFor="op-nome">Nome</Label><Input id="op-nome" placeholder="Nome completo" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="op-email">E-mail</Label><Input id="op-email" placeholder="email@seplag.mt.gov.br" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="op-senha">Senha <span className="text-muted-foreground text-[10px]">(auto se vazio)</span></Label><Input id="op-senha" type="password" placeholder="Senha de acesso" value={novoSenha} onChange={(e) => setNovoSenha(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="op-nivel">Nível de Acesso</Label><Select value={novoNivel} onValueChange={(v) => setNovoNivel(v as NivelAcesso)}><SelectTrigger id="op-nivel"><SelectValue /></SelectTrigger><SelectContent>{NIVEIS_ACESSO.map((n) => (<SelectItem key={n} value={n}>{n}</SelectItem>))}</SelectContent></Select></div>
          </div>
          <Button onClick={handleAdd} disabled={!novoNome.trim() || !novoEmail.trim() || saving} className="gap-2"><Plus className="h-4 w-4" /> {saving ? 'Salvando...' : 'Adicionar Operador'}</Button>
        </CardContent>
      </Card>

      {resetSenhaId && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10">
          <CardHeader><CardTitle className="text-base flex items-center gap-2 text-foreground"><Shield className="h-4 w-4" />Redefinir Senha — {operadores.find(o => o.id === resetSenhaId)?.nome}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="reset-nova">Nova Senha</Label><Input id="reset-nova" type="password" placeholder="Mínimo 6 caracteres" value={novaSenhaReset} onChange={(e) => setNovaSenhaReset(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="reset-confirm">Confirmar Senha</Label><Input id="reset-confirm" type="password" placeholder="Repita a senha" value={confirmSenhaReset} onChange={(e) => setConfirmSenhaReset(e.target.value)} /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleResetSenha} disabled={!novaSenhaReset.trim() || novaSenhaReset !== confirmSenhaReset} className="gap-1"><Save className="h-3 w-3" /> Salvar</Button>
              <Button variant="ghost" onClick={() => { setResetSenhaId(null); setNovaSenhaReset(''); setConfirmSenhaReset(''); }} className="gap-1"><X className="h-3 w-3" /> Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base text-foreground">Operadores ({operadores.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-foreground/70">Nome</TableHead>
              <TableHead className="text-foreground/70">E-mail</TableHead>
              <TableHead className="text-foreground/70">Nível</TableHead>
              <TableHead className="text-foreground/70">Status</TableHead>
              <TableHead className="text-foreground/70">Ações</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {operadores.map((op) => (
                <TableRow key={op.id} className={!op.ativo ? 'opacity-50' : ''}>
                  <TableCell className="font-medium text-foreground">{editId === op.id ? <Input value={editNome} onChange={(e) => setEditNome(e.target.value)} className="h-8 text-sm" /> : op.nome}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{editId === op.id ? <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="h-8 text-sm" /> : op.email}</TableCell>
                  <TableCell><Select value={op.nivel} onValueChange={(v) => handleChangeNivel(op.id, v as NivelAcesso)}><SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{NIVEIS_ACESSO.map((n) => (<SelectItem key={n} value={n}>{n}</SelectItem>))}</SelectContent></Select></TableCell>
                  <TableCell><Badge variant={op.ativo ? 'default' : 'secondary'} className="cursor-pointer text-[10px]" onClick={() => handleToggleAtivo(op)} role="button">{op.ativo ? 'Ativo' : 'Inativo'}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {editId === op.id ? (<><Button size="sm" onClick={handleSaveEdit} disabled={saving} className="gap-1 h-7 text-xs"><Save className="h-3 w-3" />Salvar</Button><Button size="sm" variant="ghost" onClick={() => setEditId(null)} className="gap-1 h-7 text-xs"><X className="h-3 w-3" /></Button></>) : (<><Button size="sm" variant="outline" onClick={() => handleStartEdit(op)} className="gap-1 h-7 text-xs"><Pencil className="h-3 w-3" />Editar</Button><Button size="sm" variant="outline" onClick={() => setResetSenhaId(op.id)} className="gap-1 h-7 text-xs"><Shield className="h-3 w-3" />Senha</Button><Button size="sm" variant="destructive" onClick={() => handleDelete(op.id)} className="gap-1 h-7 text-xs"><Trash2 className="h-3 w-3" />Remover</Button></>)}
                    </div>
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

// ─── Settings Manager ───
function SettingsManager() {
  const { orgaos, refresh: refreshOrgaos } = useCustomOrgaos();
  const { assuntos, refresh: refreshAssuntos } = useCustomAssuntos();
  const [novoOrgao, setNovoOrgao] = useState('');
  const [novoAssunto, setNovoAssunto] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddOrgao = async () => { if (!novoOrgao.trim() || saving) return; setSaving(true); try { await addCustomOrgaoDb(novoOrgao.trim()); setNovoOrgao(''); refreshOrgaos(); } finally { setSaving(false); } };
  const handleRemoveOrgao = async (orgao: string) => { await removeCustomOrgaoDb(orgao); refreshOrgaos(); };
  const handleAddAssunto = async () => { if (!novoAssunto.trim() || saving) return; setSaving(true); try { await addCustomAssuntoDb(novoAssunto.trim()); setNovoAssunto(''); refreshAssuntos(); } finally { setSaving(false); } };
  const handleRemoveAssunto = async (assunto: string) => { await removeCustomAssuntoDb(assunto); refreshAssuntos(); };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base flex items-center gap-2 text-foreground"><Building2 className="h-4 w-4" />Órgãos Adicionais</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">Adicione órgãos extras além da lista padrão.</p>
            <div className="flex gap-2"><Input placeholder="Ex: NOVO ÓRGÃO – Nome" value={novoOrgao} onChange={(e) => setNovoOrgao(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddOrgao()} /><Button onClick={handleAddOrgao} disabled={!novoOrgao.trim() || saving} size="sm"><Plus className="h-4 w-4" /></Button></div>
            {orgaos.length > 0 ? (
              <div className="space-y-2">{orgaos.map((orgao) => (
                <div key={orgao} className="flex items-center justify-between border rounded-xl px-3 py-2">
                  <span className="text-sm text-foreground">{orgao}</span>
                  <Button size="sm" variant="ghost" onClick={() => handleRemoveOrgao(orgao)} className="h-7 text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}</div>
            ) : <p className="text-xs text-muted-foreground text-center py-4">Nenhum órgão adicional.</p>}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base flex items-center gap-2 text-foreground"><FileSpreadsheet className="h-4 w-4" />Assuntos Adicionais</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">Padrão: {ASSUNTOS.join(', ')}.</p>
            <div className="flex gap-2"><Input placeholder="Ex: Novo Assunto" value={novoAssunto} onChange={(e) => setNovoAssunto(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddAssunto()} /><Button onClick={handleAddAssunto} disabled={!novoAssunto.trim() || saving} size="sm"><Plus className="h-4 w-4" /></Button></div>
            {assuntos.length > 0 ? (
              <div className="space-y-2">{assuntos.map((assunto) => (
                <div key={assunto} className="flex items-center justify-between border rounded-xl px-3 py-2">
                  <span className="text-sm text-foreground">{assunto}</span>
                  <Button size="sm" variant="ghost" onClick={() => handleRemoveAssunto(assunto)} className="h-7 text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}</div>
            ) : <p className="text-xs text-muted-foreground text-center py-4">Nenhum assunto adicional.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Operacional Section with inline response ───
function OperacionalSection({
  filtered, busca, setBusca, filtroSecretaria, setFiltroSecretaria,
  filtroStatus, setFiltroStatus, filtroPrioridade, setFiltroPrioridade,
  secretarias, activeOperadores, currentUser, isGestao, isOperacao, isLeitura,
  onStatusChange, onResponsavel, onRefresh,
}: {
  filtered: Solicitacao[];
  busca: string; setBusca: (v: string) => void;
  filtroSecretaria: string; setFiltroSecretaria: (v: string) => void;
  filtroStatus: string; setFiltroStatus: (v: string) => void;
  filtroPrioridade: string; setFiltroPrioridade: (v: string) => void;
  secretarias: string[];
  activeOperadores: Operador[];
  currentUser: Operador;
  isGestao: boolean; isOperacao: boolean; isLeitura: boolean;
  onStatusChange: (id: string, s: StatusSolicitacao) => Promise<void>;
  onResponsavel: (id: string, r: string) => Promise<void>;
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [respostaTexto, setRespostaTexto] = useState('');
  const [sending, setSending] = useState(false);

  const canRespond = (s: Solicitacao) => {
    if (isLeitura) return false;
    if (isGestao) return true;
    if (isOperacao && s.responsavel === currentUser.nome) return true;
    return false;
  };

  const handleSendResposta = async (s: Solicitacao) => {
    if (!respostaTexto.trim() || sending) return;
    setSending(true);
    try {
      await updateSolicitacaoDb(s.id, { resposta: respostaTexto.trim(), dataResposta: new Date().toISOString(), status: 'Respondido' });
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        if (projectId) {
          await fetch(`https://${projectId}.supabase.co/functions/v1/send-confirmation-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
            body: JSON.stringify({ to: s.email, nome: s.nome, protocolo: s.protocolo, resposta: respostaTexto.trim() }),
          });
        }
      } catch { /* email is best-effort */ }
      toast({ title: 'Resposta enviada!', description: `Chamado ${s.protocolo} concluído.` });
      setRespostaTexto(''); setExpandedId(null); onRefresh();
    } catch { toast({ title: 'Erro ao enviar resposta', variant: 'destructive' }); }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Input placeholder="Buscar por protocolo, nome ou e-mail..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-64" />
            <Select value={filtroSecretaria} onValueChange={setFiltroSecretaria}><SelectTrigger className="w-[200px]"><SelectValue placeholder="Secretaria" /></SelectTrigger><SelectContent><SelectItem value="all">Todas Secretarias</SelectItem>{secretarias.map((s) => (<SelectItem key={s} value={s}>{s.split(' – ')[0]}</SelectItem>))}</SelectContent></Select>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos Status</SelectItem><SelectItem value="Aberto">Aberto</SelectItem><SelectItem value="Em análise">Em análise</SelectItem><SelectItem value="Respondido">Respondido</SelectItem></SelectContent></Select>
            <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Prioridade</SelectItem><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Urgente">Urgente</SelectItem></SelectContent></Select>
            <Badge variant="outline" className="self-center">{filtered.length} registros</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base text-foreground">Triagem de Solicitações</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {filtered.length > 0 ? (
            <Table>
              <TableHeader><TableRow>
                <TableHead className="text-foreground/70">Protocolo</TableHead>
                <TableHead className="text-foreground/70">Nome</TableHead>
                <TableHead className="text-foreground/70">Secretaria</TableHead>
                <TableHead className="text-foreground/70">Tipo</TableHead>
                <TableHead className="text-foreground/70">Prioridade</TableHead>
                <TableHead className="text-foreground/70">SLA</TableHead>
                <TableHead className="text-foreground/70">Status</TableHead>
                <TableHead className="text-foreground/70">Atribuído a</TableHead>
                <TableHead className="text-foreground/70 w-[100px]">Ações</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map((s) => {
                  const slaStatus = getSlaStatus(s);
                  const isExpanded = expandedId === s.id;
                  return (
                    <Fragment key={s.id}>
                      <TableRow className={isExpanded ? 'border-b-0' : ''}>
                        <TableCell className="font-mono text-xs text-foreground">{s.protocolo}</TableCell>
                        <TableCell className="font-medium text-sm text-foreground">{s.nome}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{s.secretaria.split(' – ')[0]}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{s.tipo}</TableCell>
                        <TableCell><Badge variant={s.prioridade === 'Urgente' ? 'destructive' : 'outline'} className="text-[10px]">{s.prioridade || 'Normal'}</Badge></TableCell>
                        <TableCell><span className={`text-xs font-medium ${SLA_COLORS[slaStatus]}`}>{slaStatus}</span></TableCell>
                        <TableCell>
                          {isLeitura || (isOperacao && s.responsavel !== currentUser?.nome) ? (
                            <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[s.status]}`}>{s.status}</Badge>
                          ) : (
                            <Select value={s.status} onValueChange={(v) => onStatusChange(s.id, v as StatusSolicitacao)}><SelectTrigger className={`w-[130px] text-xs h-8 border ${STATUS_COLORS[s.status]}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Aberto">Aberto</SelectItem><SelectItem value="Em análise">Em análise</SelectItem><SelectItem value="Respondido">Respondido</SelectItem></SelectContent></Select>
                          )}
                        </TableCell>
                        <TableCell>
                          {(isLeitura || isOperacao) ? (
                            <span className="text-xs text-muted-foreground">{s.responsavel || '—'}</span>
                          ) : (
                            <Select value={s.responsavel || ''} onValueChange={(v) => onResponsavel(s.id, v)}><SelectTrigger className="w-[140px] text-xs h-8"><SelectValue placeholder="Atribuir" /></SelectTrigger><SelectContent>{activeOperadores.map((op) => (<SelectItem key={op.id} value={op.nome}><span className="flex items-center gap-1">{NIVEIS_GESTAO.includes(op.nivel) ? <ShieldCheck className="h-3 w-3 text-primary inline" /> : <Shield className="h-3 w-3 text-muted-foreground inline" />}{op.nome}</span></SelectItem>))}</SelectContent></Select>
                          )}
                        </TableCell>
                        <TableCell>
                          {canRespond(s) && s.status !== 'Respondido' && (
                            <Button size="sm" variant={isExpanded ? 'secondary' : 'outline'} className="h-7 text-xs gap-1" onClick={() => { setExpandedId(isExpanded ? null : s.id); setRespostaTexto(s.resposta || ''); }}>
                              <MessageSquare className="h-3 w-3" />{isExpanded ? 'Fechar' : 'Responder'}
                            </Button>
                          )}
                          {s.status === 'Respondido' && s.resposta && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground" onClick={() => setExpandedId(isExpanded ? null : s.id)}>
                              <Eye className="h-3 w-3" />{isExpanded ? 'Fechar' : 'Ver'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={9} className="bg-muted/30 p-0">
                            <div className="p-5 space-y-4">
                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground text-xs font-medium mb-1">Descrição do Chamado</p>
                                  <p className="text-foreground bg-card rounded-xl p-3 border">{s.descricao}</p>
                                </div>
                                <div className="space-y-2 text-xs">
                                  <p><span className="text-muted-foreground">E-mail:</span> <span className="text-foreground">{s.email}</span></p>
                                  <p><span className="text-muted-foreground">Setor:</span> <span className="text-foreground">{s.setor}</span></p>
                                  <p><span className="text-muted-foreground">Assunto:</span> <span className="text-foreground">{s.assunto}</span></p>
                                  <p><span className="text-muted-foreground">Impacto:</span> <span className="text-foreground">{s.impacto}</span></p>
                                  <p><span className="text-muted-foreground">Data:</span> <span className="text-foreground">{new Date(s.data).toLocaleDateString('pt-BR')}</span></p>
                                  <p><span className="text-muted-foreground">SLA Limite:</span> <span className="text-foreground">{new Date(s.slaLimite).toLocaleDateString('pt-BR')}</span></p>
                                </div>
                              </div>
                              {s.status === 'Respondido' && s.resposta ? (
                                <div>
                                  <p className="text-muted-foreground text-xs font-medium mb-1">Resposta Enviada</p>
                                  <div className="bg-card rounded-xl p-4 border text-sm text-foreground whitespace-pre-wrap">{s.resposta}</div>
                                  {s.dataResposta && <p className="text-[10px] text-muted-foreground mt-1">Respondido em {new Date(s.dataResposta).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
                                </div>
                              ) : canRespond(s) ? (
                                <div className="space-y-3">
                                  <p className="text-muted-foreground text-xs font-medium">Responder ao Chamado</p>
                                  <Textarea placeholder="Escreva a resposta para o solicitante..." value={respostaTexto} onChange={(e) => setRespostaTexto(e.target.value)} className="min-h-[120px] rounded-xl bg-card focus-visible:ring-primary/30" />
                                  <div className="flex gap-2">
                                    <Button onClick={() => handleSendResposta(s)} disabled={!respostaTexto.trim() || sending} className="gap-2"><CheckCircle2 className="h-4 w-4" />{sending ? 'Enviando...' : 'Enviar Resposta'}</Button>
                                    <Button variant="ghost" onClick={() => setRespostaTexto('')} className="gap-1"><X className="h-4 w-4" /> Limpar</Button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          ) : <p className="text-muted-foreground text-center py-12">Nenhuma solicitação encontrada.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── MAIN ADMIN ───
const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<Operador | null>(() => {
    const stored = sessionStorage.getItem('admin-auth');
    if (!stored) return null;
    try { return JSON.parse(stored); } catch { return null; }
  });
  const authed = !!currentUser;
  const isGestao = currentUser ? NIVEIS_GESTAO.includes(currentUser.nivel) : false;
  const isOperacao = currentUser ? NIVEIS_OPERACAO.includes(currentUser.nivel) : false;
  const isLeitura = currentUser ? NIVEIS_LEITURA.includes(currentUser.nivel) : false;
  const [activeSection, setActiveSection] = useState<AdminSection>(() => isLeitura ? 'operacional' : 'executivo');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroSecretaria, setFiltroSecretaria] = useState('all');
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [filtroPrioridade, setFiltroPrioridade] = useState('all');
  const [profileOpen, setProfileOpen] = useState(false);

  const { solicitacoes, loading: loadingSol, refresh: refreshSol } = useSolicitacoes();
  const { operadores } = useOperadores();
  const activeOperadores = useMemo(() => operadores.filter((o) => o.ativo), [operadores]);

  const filtered = useMemo(() => {
    return solicitacoes.filter((s) => {
      if (filtroSecretaria !== 'all' && s.secretaria !== filtroSecretaria) return false;
      if (filtroStatus !== 'all' && s.status !== filtroStatus) return false;
      if (filtroPrioridade !== 'all' && s.prioridade !== filtroPrioridade) return false;
      if (busca) { const q = busca.toLowerCase(); return s.nome.toLowerCase().includes(q) || s.protocolo.toLowerCase().includes(q) || s.email.toLowerCase().includes(q); }
      return true;
    });
  }, [solicitacoes, filtroSecretaria, filtroStatus, filtroPrioridade, busca]);

  const total = solicitacoes.length;
  const abertas = solicitacoes.filter((s) => s.status === 'Aberto').length;
  const emAnalise = solicitacoes.filter((s) => s.status === 'Em análise').length;
  const respondidas = solicitacoes.filter((s) => s.status === 'Respondido').length;
  const iai = total > 0 ? ((respondidas / total) * 100).toFixed(1) : '0';
  const slaData = useMemo(() => { const nr = solicitacoes.filter((s) => s.status !== 'Respondido'); const ds = nr.filter((s) => getSlaStatus(s) === 'Dentro do Prazo').length; return ((ds / (nr.length || 1)) * 100).toFixed(1); }, [solicitacoes]);
  const tempoMedioResposta = useMemo(() => { const t = solicitacoes.map(getTempoResposta).filter((t): t is number => t !== null); if (!t.length) return '—'; return (t.reduce((a, b) => a + b, 0) / t.length).toFixed(1) + 'd'; }, [solicitacoes]);
  const avaliacoes = useMemo(() => solicitacoes.filter((s) => s.avaliacao), [solicitacoes]);
  const satisfacaoMedia = useMemo(() => { if (!avaliacoes.length) return '—'; return (avaliacoes.reduce((a, s) => a + (s.avaliacao?.satisfacao || 0), 0) / avaliacoes.length).toFixed(1); }, [avaliacoes]);
  const resolvidoPercent = useMemo(() => { if (!avaliacoes.length) return '—'; return ((avaliacoes.filter((s) => s.avaliacao?.resolvido).length / avaliacoes.length) * 100).toFixed(0) + '%'; }, [avaliacoes]);
  const backlog = abertas + emAnalise;

  const porSecretaria = useMemo(() => { const m: Record<string, number> = {}; solicitacoes.forEach((s) => { const k = s.secretaria.split(' – ')[0]; m[k] = (m[k] || 0) + 1; }); return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10); }, [solicitacoes]);
  const porTipo = useMemo(() => { const m: Record<string, number> = {}; solicitacoes.forEach((s) => { m[s.tipo] = (m[s.tipo] || 0) + 1; }); return Object.entries(m).map(([name, value]) => ({ name, value })); }, [solicitacoes]);
  const porAssunto = useMemo(() => { const m: Record<string, number> = {}; solicitacoes.forEach((s) => { if (s.assunto) m[s.assunto] = (m[s.assunto] || 0) + 1; }); return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10); }, [solicitacoes]);
  const statusPorSecretaria = useMemo(() => { const m: Record<string, { Aberto: number; 'Em análise': number; Respondido: number }> = {}; solicitacoes.forEach((s) => { const k = s.secretaria.split(' – ')[0]; if (!m[k]) m[k] = { Aberto: 0, 'Em análise': 0, Respondido: 0 }; m[k][s.status]++; }); return Object.entries(m).map(([name, vals]) => ({ name, ...vals })).sort((a, b) => (b.Aberto + b['Em análise'] + b.Respondido) - (a.Aberto + a['Em análise'] + a.Respondido)).slice(0, 10); }, [solicitacoes]);
  const tempoRespostaHist = useMemo(() => { const bins = [{ name: '0-1d', min: 0, max: 1, value: 0 }, { name: '2-3d', min: 1, max: 3, value: 0 }, { name: '4-7d', min: 3, max: 7, value: 0 }, { name: '>7d', min: 7, max: Infinity, value: 0 }]; solicitacoes.forEach((s) => { const t = getTempoResposta(s); if (t === null) return; const bin = bins.find((b) => t >= b.min && t < b.max) || bins[bins.length - 1]; bin.value++; }); return bins; }, [solicitacoes]);
  const satisfacaoPorSecretaria = useMemo(() => { const m: Record<string, { sum: number; count: number }> = {}; avaliacoes.forEach((s) => { const k = s.secretaria.split(' – ')[0]; if (!m[k]) m[k] = { sum: 0, count: 0 }; m[k].sum += s.avaliacao!.satisfacao; m[k].count++; }); return Object.entries(m).map(([name, v]) => ({ name, value: Math.round((v.sum / v.count) * 10) / 10 })).sort((a, b) => b.value - a.value); }, [avaliacoes]);
  const tendenciaSemanal = useMemo(() => { const w: Record<string, { recebidas: number; respondidas: number }> = {}; solicitacoes.forEach((s) => { const d = new Date(s.data); const ws = new Date(d); ws.setDate(d.getDate() - d.getDay()); const k = ws.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); if (!w[k]) w[k] = { recebidas: 0, respondidas: 0 }; w[k].recebidas++; if (s.status === 'Respondido') w[k].respondidas++; }); return Object.entries(w).map(([name, v]) => ({ name, ...v })).slice(-8); }, [solicitacoes]);

  const handleStatusChange = async (id: string, status: StatusSolicitacao) => { await updateStatusDb(id, status); refreshSol(); };
  const handleResponsavel = async (id: string, responsavel: string) => { await updateSolicitacaoDb(id, { responsavel }); refreshSol(); };

  const exportExcel = () => {
    const dataSol = solicitacoes.map((s) => ({ Protocolo: s.protocolo, Nome: s.nome, Email: s.email, Secretaria: s.secretaria, Setor: s.setor, Tipo: s.tipo, Categoria: s.categoria || '', Assunto: s.assunto || '', Impacto: s.impacto || '', Prioridade: s.prioridade || '', Mensagem: s.descricao, Data: new Date(s.data).toLocaleDateString('pt-BR'), Status: s.status, Responsável: s.responsavel || '' }));
    const dataSla = solicitacoes.map((s) => ({ Protocolo: s.protocolo, Secretaria: s.secretaria.split(' – ')[0], Tipo: s.tipo, 'Data Abertura': new Date(s.data).toLocaleDateString('pt-BR'), 'SLA Limite': new Date(s.slaLimite).toLocaleDateString('pt-BR'), 'Data Resposta': s.dataResposta ? new Date(s.dataResposta).toLocaleDateString('pt-BR') : '', 'Tempo (dias)': getTempoResposta(s) ?? '', 'Status SLA': getSlaStatus(s) }));
    const dataAval = avaliacoes.map((s) => ({ Protocolo: s.protocolo, Secretaria: s.secretaria.split(' – ')[0], Satisfação: s.avaliacao?.satisfacao, Resolvido: s.avaliacao?.resolvido ? 'Sim' : 'Não', Clareza: s.avaliacao?.clareza, 'Tempo Resposta': s.avaliacao?.tempoResposta, Comentário: s.avaliacao?.comentario || '' }));
    const dataResumo = [{ Indicador: 'Total de Solicitações', Valor: total }, { Indicador: 'Respondidas', Valor: respondidas }, { Indicador: 'Em Aberto', Valor: abertas }, { Indicador: '% Dentro do SLA', Valor: slaData + '%' }, { Indicador: 'Tempo Médio de Resposta', Valor: tempoMedioResposta }, { Indicador: 'Satisfação Média', Valor: satisfacaoMedia }, { Indicador: '% Resolvido', Valor: resolvidoPercent }, { Indicador: 'IAI', Valor: iai + '%' }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dataSol), 'Solicitações');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dataSla), 'SLA');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dataAval), 'Avaliações');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dataResumo), 'Resumo Mensal');
    XLSX.writeFile(wb, `seplag-relatorio-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleLogout = () => { sessionStorage.removeItem('admin-auth'); setCurrentUser(null); };

  if (!authed) return <AdminLogin onAuth={(op) => setCurrentUser(op)} />;
  if (loadingSol) return <LoadingSkeleton />;

  const secretarias = [...new Set(solicitacoes.map((s) => s.secretaria))];
  const sidebarWidth = sidebarCollapsed ? '68px' : '260px';

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar currentUser={currentUser!} activeSection={activeSection} onSectionChange={setActiveSection} isGestao={isGestao} isOperacao={isOperacao} isLeitura={isLeitura} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} onLogout={handleLogout} onOpenProfile={() => setProfileOpen(true)} onExport={exportExcel} />

      {currentUser && <ProfileDialog currentUser={currentUser} open={profileOpen} onOpenChange={setProfileOpen} onUpdate={setCurrentUser} />}

      <main className="transition-all duration-300 ease-in-out" style={{ marginLeft: sidebarWidth }} role="main">
        <div className="px-6 md:px-8 py-6 space-y-6 max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                {activeSection === 'executivo' && 'Visão Executiva'}
                {activeSection === 'operacional' && 'Operacional'}
                {activeSection === 'aprendizagem' && 'Gestão de Trilhas'}
                {activeSection === 'banners' && 'Gerenciar Banners'}
                {activeSection === 'equipe' && 'Gestão de Equipe'}
                {activeSection === 'faq' && 'Gerenciar FAQ'}
                {activeSection === 'usuarios' && 'Gestão de Usuários'}
                {activeSection === 'configuracoes' && 'Configurações'}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {activeSection === 'executivo' && 'Dashboard com indicadores e gráficos'}
                {activeSection === 'operacional' && 'Triagem e gestão de solicitações'}
                {activeSection === 'aprendizagem' && 'Conteúdo, quizzes e métricas de engajamento'}
                {activeSection === 'banners' && 'Banners do carrossel principal da Home'}
                {activeSection === 'equipe' && 'Fotos e dados dos gestores de área'}
                {activeSection === 'faq' && 'Perguntas frequentes do portal'}
                {activeSection === 'usuarios' && 'Controle de acessos e operadores'}
                {activeSection === 'configuracoes' && 'Órgãos e assuntos do sistema'}
              </p>
            </div>
          </div>

          {(activeSection === 'executivo' || activeSection === 'operacional') && (
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3" role="region" aria-label="Indicadores">
              <KpiCard icon={FileSpreadsheet} label="Total" value={total} color="text-primary" />
              <KpiCard icon={AlertCircle} label="Abertas" value={abertas} color="text-amber-600" />
              <KpiCard icon={Clock} label="Em Análise" value={emAnalise} color="text-blue-600" />
              <KpiCard icon={CheckCircle2} label="Respondidas" value={respondidas} color="text-emerald-600" />
              <KpiCard icon={Target} label="% SLA" value={slaData + '%'} color="text-primary" />
              <KpiCard icon={TrendingUp} label="Tempo Médio" value={tempoMedioResposta} color="text-primary" />
              <KpiCard icon={AlertTriangle} label="Backlog" value={backlog} color="text-amber-600" />
              <KpiCard icon={Star} label="Satisfação" value={satisfacaoMedia} color="text-amber-500" sub="/5" />
              <KpiCard icon={BarChart3} label="IAI" value={iai + '%'} color="text-primary" />
            </div>
          )}

          {activeSection === 'executivo' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-base text-foreground">Recebidas x Respondidas (Semanal)</CardTitle></CardHeader><CardContent>{tendenciaSemanal.length > 0 ? (<ResponsiveContainer width="100%" height={280}><LineChart data={tendenciaSemanal}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="recebidas" stroke="hsl(210, 85%, 40%)" strokeWidth={2} name="Recebidas" /><Line type="monotone" dataKey="respondidas" stroke="hsl(210, 100%, 28%)" strokeWidth={2} name="Respondidas" /></LineChart></ResponsiveContainer>) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}</CardContent></Card>
                <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-base text-foreground">Tipos de Demanda</CardTitle></CardHeader><CardContent>{porTipo.length > 0 ? (<ResponsiveContainer width="100%" height={280}><PieChart><Pie data={porTipo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={40} label>{porTipo.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}</CardContent></Card>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-base text-foreground">Top 10 Secretarias</CardTitle></CardHeader><CardContent>{porSecretaria.length > 0 ? (<ResponsiveContainer width="100%" height={300}><BarChart data={porSecretaria} layout="vertical" margin={{ left: 10 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" fill="hsl(210, 100%, 28%)" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}</CardContent></Card>
                <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-base text-foreground">Status por Secretaria</CardTitle></CardHeader><CardContent>{statusPorSecretaria.length > 0 ? (<ResponsiveContainer width="100%" height={300}><BarChart data={statusPorSecretaria} layout="vertical" margin={{ left: 10 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} /><Tooltip /><Legend /><Bar dataKey="Aberto" stackId="a" fill="hsl(45, 97%, 54%)" /><Bar dataKey="Em análise" stackId="a" fill="hsl(210, 85%, 40%)" /><Bar dataKey="Respondido" stackId="a" fill="hsl(210, 100%, 28%)" /></BarChart></ResponsiveContainer>) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}</CardContent></Card>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-base text-foreground">Tempo de Resposta (dias)</CardTitle></CardHeader><CardContent>{tempoRespostaHist.some((b) => b.value > 0) ? (<ResponsiveContainer width="100%" height={220}><BarChart data={tempoRespostaHist}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="hsl(210, 85%, 40%)" radius={[4, 4, 0, 0]} name="Qtd" /></BarChart></ResponsiveContainer>) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}</CardContent></Card>
                <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-base text-foreground">Top 10 Assuntos</CardTitle></CardHeader><CardContent>{porAssunto.length > 0 ? (<ResponsiveContainer width="100%" height={220}><BarChart data={porAssunto} layout="vertical" margin={{ left: 10 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" fill="hsl(210, 70%, 55%)" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}</CardContent></Card>
                <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-base text-foreground">Satisfação por Secretaria</CardTitle></CardHeader><CardContent>{satisfacaoPorSecretaria.length > 0 ? (<ResponsiveContainer width="100%" height={220}><BarChart data={satisfacaoPorSecretaria} layout="vertical" margin={{ left: 10 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" domain={[0, 5]} /><YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" fill="hsl(45, 97%, 54%)" radius={[0, 4, 4, 0]} name="Média" /></BarChart></ResponsiveContainer>) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}</CardContent></Card>
              </div>
            </div>
          )}

          {activeSection === 'operacional' && (
            <OperacionalSection filtered={filtered} busca={busca} setBusca={setBusca} filtroSecretaria={filtroSecretaria} setFiltroSecretaria={setFiltroSecretaria} filtroStatus={filtroStatus} setFiltroStatus={setFiltroStatus} filtroPrioridade={filtroPrioridade} setFiltroPrioridade={setFiltroPrioridade} secretarias={secretarias} activeOperadores={activeOperadores} currentUser={currentUser!} isGestao={isGestao} isOperacao={isOperacao} isLeitura={isLeitura} onStatusChange={handleStatusChange} onResponsavel={handleResponsavel} onRefresh={refreshSol} />
          )}

          {activeSection === 'aprendizagem' && <AprendizagemManager />}
          {activeSection === 'banners' && <BannersManager />}
          {activeSection === 'equipe' && <EquipeManager />}
          {activeSection === 'faq' && <FaqManager />}
          {activeSection === 'usuarios' && <UsersManager />}
          {activeSection === 'configuracoes' && <SettingsManager />}
        </div>
      </main>
    </div>
  );
};

export default Admin;
