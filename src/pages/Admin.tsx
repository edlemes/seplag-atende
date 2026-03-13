import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, ArrowLeft, Download, FileSpreadsheet, BarChart3, CheckCircle2,
  AlertCircle, Clock, Star, TrendingUp, AlertTriangle, Target, Eye, Settings,
  HelpCircle, Plus, Pencil, Trash2, Save, X, Users, Shield, ShieldCheck, LogOut,
  User, Camera, KeyRound, Menu, ChevronLeft
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

type AdminSection = 'executivo' | 'operacional' | 'faq' | 'usuarios' | 'configuracoes';

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
      {/* Header */}
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
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Menu principal">
        {menuItems.filter(i => i.visible).map((item) => {
          const isActive = activeSection === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSectionChange(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Actions */}
      <div className="px-3 py-3 space-y-1 border-t border-border/50">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
          title={collapsed ? 'Voltar ao Portal' : undefined}
        >
          <ArrowLeft className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Voltar ao Portal</span>}
        </button>
        {isGestao && (
          <button
            onClick={onExport}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
            title={collapsed ? 'Exportar Excel' : undefined}
          >
            <Download className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Exportar Excel</span>}
          </button>
        )}
      </div>

      {/* User */}
      <div className="px-3 py-4 border-t border-border/50">
        <button
          onClick={onOpenProfile}
          className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-muted/60 transition-all duration-200 ${
            collapsed ? 'justify-center' : ''
          }`}
          aria-label="Abrir perfil"
        >
          <Avatar className="h-8 w-8 shrink-0">
            {currentUser.avatar_url ? (
              <AvatarImage src={currentUser.avatar_url} alt={currentUser.nome} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {currentUser.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">{currentUser.nome}</p>
              <p className="text-[10px] text-muted-foreground truncate">{currentUser.nivel}</p>
            </div>
          )}
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
          title={collapsed ? 'Sair' : undefined}
        >
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
  currentUser: Operador;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onUpdate: (op: Operador) => void;
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
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleChangeSenha = async () => {
    if (!senhaAtual || !novaSenha || saving) return;
    if (senhaAtual !== currentUser.senha) {
      toast({ title: 'Senha atual incorreta', variant: 'destructive' });
      return;
    }
    if (novaSenha.length < 6) {
      toast({ title: 'A nova senha deve ter pelo menos 6 caracteres', variant: 'destructive' });
      return;
    }
    if (novaSenha !== confirmSenha) {
      toast({ title: 'As senhas não coincidem', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await updateOperadorDb(currentUser.id, { senha: novaSenha });
      const updated = { ...currentUser, senha: novaSenha };
      sessionStorage.setItem('admin-auth', JSON.stringify(updated));
      onUpdate(updated);
      setSenhaAtual(''); setNovaSenha(''); setConfirmSenha('');
      setShowSenhaSection(false);
      toast({ title: 'Senha alterada com sucesso!' });
    } catch {
      toast({ title: 'Erro ao alterar senha', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Imagem muito grande', description: 'Máximo 2MB', variant: 'destructive' });
      return;
    }
    setUploadingAvatar(true);
    try {
      const url = await uploadAvatar(currentUser.id, file);
      await updateOperadorDb(currentUser.id, { avatar_url: url } as any);
      const updated = { ...currentUser, avatar_url: url };
      sessionStorage.setItem('admin-auth', JSON.stringify(updated));
      onUpdate(updated);
      toast({ title: 'Foto atualizada!' });
    } catch {
      toast({ title: 'Erro ao enviar foto', variant: 'destructive' });
    } finally { setUploadingAvatar(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <User className="h-5 w-5" />
            Meu Perfil
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <Avatar className="h-20 w-20">
                {currentUser.avatar_url ? (
                  <AvatarImage src={currentUser.avatar_url} alt={currentUser.nome} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                  {currentUser.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                {uploadingAvatar ? (
                  <span className="text-white text-xs">Enviando...</span>
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">Clique na foto para alterar</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-nome">Nome</Label>
              <Input id="profile-nome" value={editNome} onChange={(e) => setEditNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">E-mail</Label>
              <Input id="profile-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              Nível: <Badge variant="secondary">{currentUser.nivel}</Badge>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving || !editNome.trim() || !editEmail.trim()} className="w-full gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar Perfil'}
            </Button>
          </div>

          <div className="border-t pt-4">
            {!showSenhaSection ? (
              <Button variant="outline" className="w-full gap-2" onClick={() => setShowSenhaSection(true)}>
                <KeyRound className="h-4 w-4" />
                Alterar Senha
              </Button>
            ) : (
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2 text-foreground">
                  <KeyRound className="h-4 w-4" />
                  Alterar Senha
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="senha-atual">Senha Atual</Label>
                  <Input id="senha-atual" type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nova-senha">Nova Senha</Label>
                  <Input id="nova-senha" type="password" placeholder="Mínimo 6 caracteres" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-senha">Confirmar Nova Senha</Label>
                  <Input id="confirm-senha" type="password" value={confirmSenha} onChange={(e) => setConfirmSenha(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleChangeSenha} disabled={saving || !senhaAtual || !novaSenha || novaSenha !== confirmSenha} className="gap-1">
                    <Save className="h-3 w-3" /> Salvar
                  </Button>
                  <Button variant="ghost" onClick={() => { setShowSenhaSection(false); setSenhaAtual(''); setNovaSenha(''); setConfirmSenha(''); }}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── FAQ Manager ───
function FaqManager() {
  const { faqs, loading, refresh } = useFaqs();
  const [novaPergunta, setNovaPergunta] = useState('');
  const [novaResposta, setNovaResposta] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editPergunta, setEditPergunta] = useState('');
  const [editResposta, setEditResposta] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!novaPergunta.trim() || !novaResposta.trim() || saving) return;
    setSaving(true);
    try {
      await addFaqDb(novaPergunta.trim(), novaResposta.trim());
      setNovaPergunta(''); setNovaResposta('');
      refresh();
    } finally { setSaving(false); }
  };

  const handleEdit = (faq: FAQ) => { setEditId(faq.id); setEditPergunta(faq.pergunta); setEditResposta(faq.resposta); };

  const handleSaveEdit = async () => {
    if (!editId || !editPergunta.trim() || !editResposta.trim() || saving) return;
    setSaving(true);
    try { await updateFaqDb(editId, editPergunta.trim(), editResposta.trim()); setEditId(null); refresh(); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try { await deleteFaqDb(id); refresh(); } finally { setSaving(false); }
  };

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base flex items-center gap-2 text-foreground"><Plus className="h-4 w-4" />Nova Pergunta</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="faq-pergunta">Pergunta</Label>
            <Input id="faq-pergunta" placeholder="Ex: Como acompanhar meu protocolo?" value={novaPergunta} onChange={(e) => setNovaPergunta(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="faq-resposta">Resposta</Label>
            <Textarea id="faq-resposta" placeholder="Escreva a resposta..." value={novaResposta} onChange={(e) => setNovaResposta(e.target.value)} className="min-h-[100px]" />
          </div>
          <Button onClick={handleAdd} disabled={!novaPergunta.trim() || !novaResposta.trim() || saving} className="gap-2">
            <Plus className="h-4 w-4" /> {saving ? 'Salvando...' : 'Adicionar FAQ'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base text-foreground">FAQs Cadastradas ({faqs.length})</CardTitle></CardHeader>
        <CardContent>
          {faqs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma FAQ cadastrada.</p>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="border rounded-xl p-4 space-y-2">
                  {editId === faq.id ? (
                    <>
                      <Input value={editPergunta} onChange={(e) => setEditPergunta(e.target.value)} />
                      <Textarea value={editResposta} onChange={(e) => setEditResposta(e.target.value)} className="min-h-[80px]" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit} disabled={saving} className="gap-1"><Save className="h-3 w-3" />Salvar</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditId(null)} className="gap-1"><X className="h-3 w-3" />Cancelar</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-foreground">{faq.pergunta}</p>
                      <p className="text-sm text-muted-foreground">{faq.resposta}</p>
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(faq)} className="gap-1 h-7 text-xs"><Pencil className="h-3 w-3" />Editar</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(faq.id)} disabled={saving} className="gap-1 h-7 text-xs"><Trash2 className="h-3 w-3" />Excluir</Button>
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
    const prefixMap: Record<NivelAcesso, string> = {
      'Administrador': 'admin', 'Gerente': 'gerente', 'Coordenador': 'coord',
      'Analista': 'analista', 'Residente Técnico': 'residente', 'Estagiário': 'estagiario',
    };
    return `${prefixMap[nivel]}${String(Math.floor(Math.random() * 9000) + 1000)}`;
  };

  const handleAdd = async () => {
    if (!novoNome.trim() || !novoEmail.trim() || saving) return;
    setSaving(true);
    try {
      const senha = novoSenha.trim() || generateDefaultPassword(novoNivel);
      await addOperadorDb(novoNome.trim(), novoEmail.trim(), novoNivel, senha);
      toast({
        title: 'Operador criado com sucesso!',
        description: `Nome: ${novoNome.trim()} | E-mail: ${novoEmail.trim().toLowerCase()} | Nível: ${novoNivel} | Senha: ${senha}`,
      });
      setNovoNome(''); setNovoEmail(''); setNovoSenha(''); setNovoNivel('Analista');
      refresh();
    } catch (err: any) {
      toast({ title: 'Erro ao criar operador', description: err.message || 'Tente novamente', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleToggleAtivo = async (op: Operador) => { await updateOperadorDb(op.id, { ativo: !op.ativo }); refresh(); };
  const handleChangeNivel = async (id: string, nivel: NivelAcesso) => { await updateOperadorDb(id, { nivel }); refresh(); };
  const handleDelete = async (id: string) => {
    const op = operadores.find(o => o.id === id);
    if (op && window.confirm(`Tem certeza que deseja remover "${op.nome}"?`)) { await deleteOperadorDb(id); refresh(); }
  };
  const handleStartEdit = (op: Operador) => { setEditId(op.id); setEditNome(op.nome); setEditEmail(op.email); };
  const handleSaveEdit = async () => {
    if (!editId || !editNome.trim() || !editEmail.trim() || saving) return;
    setSaving(true);
    try { await updateOperadorDb(editId, { nome: editNome.trim(), email: editEmail.trim().toLowerCase() }); setEditId(null); refresh(); } finally { setSaving(false); }
  };
  const handleResetSenha = async () => {
    if (!resetSenhaId || !novaSenhaReset.trim()) return;
    if (novaSenhaReset !== confirmSenhaReset) { toast({ title: 'As senhas não coincidem!', variant: 'destructive' }); return; }
    if (novaSenhaReset.length < 6) { toast({ title: 'A senha deve ter pelo menos 6 caracteres.', variant: 'destructive' }); return; }
    await updateOperadorDb(resetSenhaId, { senha: novaSenhaReset });
    const op = operadores.find(o => o.id === resetSenhaId);
    toast({ title: `Senha de "${op?.nome}" redefinida com sucesso!` });
    setResetSenhaId(null); setNovaSenhaReset(''); setConfirmSenhaReset('');
    refresh();
  };

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base flex items-center gap-2 text-foreground"><Plus className="h-4 w-4" />Novo Operador</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="op-nome">Nome</Label>
              <Input id="op-nome" placeholder="Nome completo" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="op-email">E-mail</Label>
              <Input id="op-email" placeholder="email@seplag.mt.gov.br" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="op-senha">Senha <span className="text-muted-foreground text-[10px]">(auto se vazio)</span></Label>
              <Input id="op-senha" type="password" placeholder="Senha de acesso" value={novoSenha} onChange={(e) => setNovoSenha(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="op-nivel">Nível de Acesso</Label>
              <Select value={novoNivel} onValueChange={(v) => setNovoNivel(v as NivelAcesso)}>
                <SelectTrigger id="op-nivel"><SelectValue /></SelectTrigger>
                <SelectContent>{NIVEIS_ACESSO.map((n) => (<SelectItem key={n} value={n}>{n}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAdd} disabled={!novoNome.trim() || !novoEmail.trim() || saving} className="gap-2">
            <Plus className="h-4 w-4" /> {saving ? 'Salvando...' : 'Adicionar Operador'}
          </Button>
        </CardContent>
      </Card>

      {resetSenhaId && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <Shield className="h-4 w-4" />
              Redefinir Senha — {operadores.find(o => o.id === resetSenhaId)?.nome}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reset-nova">Nova Senha</Label>
                <Input id="reset-nova" type="password" placeholder="Mínimo 6 caracteres" value={novaSenhaReset} onChange={(e) => setNovaSenhaReset(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-confirm">Confirmar Senha</Label>
                <Input id="reset-confirm" type="password" placeholder="Repita a senha" value={confirmSenhaReset} onChange={(e) => setConfirmSenhaReset(e.target.value)} />
              </div>
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
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground/70">Nome</TableHead>
                <TableHead className="text-foreground/70">E-mail</TableHead>
                <TableHead className="text-foreground/70">Nível</TableHead>
                <TableHead className="text-foreground/70">Status</TableHead>
                <TableHead className="text-foreground/70">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operadores.map((op) => (
                <TableRow key={op.id} className={!op.ativo ? 'opacity-50' : ''}>
                  <TableCell className="font-medium text-foreground">
                    {editId === op.id ? <Input value={editNome} onChange={(e) => setEditNome(e.target.value)} className="h-8 text-sm" /> : op.nome}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {editId === op.id ? <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="h-8 text-sm" /> : op.email}
                  </TableCell>
                  <TableCell>
                    <Select value={op.nivel} onValueChange={(v) => handleChangeNivel(op.id, v as NivelAcesso)}>
                      <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{NIVEIS_ACESSO.map((n) => (<SelectItem key={n} value={n}>{n}</SelectItem>))}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={op.ativo ? 'default' : 'secondary'} className="cursor-pointer text-[10px]" onClick={() => handleToggleAtivo(op)} role="button">
                      {op.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {editId === op.id ? (
                        <>
                          <Button size="sm" onClick={handleSaveEdit} disabled={saving} className="gap-1 h-7 text-xs"><Save className="h-3 w-3" />Salvar</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditId(null)} className="gap-1 h-7 text-xs"><X className="h-3 w-3" /></Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleStartEdit(op)} className="gap-1 h-7 text-xs"><Pencil className="h-3 w-3" />Editar</Button>
                          <Button size="sm" variant="outline" onClick={() => setResetSenhaId(op.id)} className="gap-1 h-7 text-xs"><Shield className="h-3 w-3" />Senha</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(op.id)} className="gap-1 h-7 text-xs"><Trash2 className="h-3 w-3" />Remover</Button>
                        </>
                      )}
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
            <div className="flex gap-2">
              <Input placeholder="Ex: NOVO ÓRGÃO – Nome" value={novoOrgao} onChange={(e) => setNovoOrgao(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddOrgao()} />
              <Button onClick={handleAddOrgao} disabled={!novoOrgao.trim() || saving} size="sm"><Plus className="h-4 w-4" /></Button>
            </div>
            {orgaos.length > 0 ? (
              <div className="space-y-2">{orgaos.map((orgao) => (
                <div key={orgao} className="flex items-center justify-between border rounded-xl px-3 py-2">
                  <span className="text-sm text-foreground">{orgao}</span>
                  <Button size="sm" variant="ghost" onClick={() => handleRemoveOrgao(orgao)} className="h-7 text-red-500 hover:text-red-600"><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}</div>
            ) : <p className="text-xs text-muted-foreground text-center py-4">Nenhum órgão adicional.</p>}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base flex items-center gap-2 text-foreground"><FileSpreadsheet className="h-4 w-4" />Assuntos Adicionais</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">Padrão: {ASSUNTOS.join(', ')}.</p>
            <div className="flex gap-2">
              <Input placeholder="Ex: Novo Assunto" value={novoAssunto} onChange={(e) => setNovoAssunto(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddAssunto()} />
              <Button onClick={handleAddAssunto} disabled={!novoAssunto.trim() || saving} size="sm"><Plus className="h-4 w-4" /></Button>
            </div>
            {assuntos.length > 0 ? (
              <div className="space-y-2">{assuntos.map((assunto) => (
                <div key={assunto} className="flex items-center justify-between border rounded-xl px-3 py-2">
                  <span className="text-sm text-foreground">{assunto}</span>
                  <Button size="sm" variant="ghost" onClick={() => handleRemoveAssunto(assunto)} className="h-7 text-red-500 hover:text-red-600"><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}</div>
            ) : <p className="text-xs text-muted-foreground text-center py-4">Nenhum assunto adicional.</p>}
          </CardContent>
        </Card>
      </div>
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

  // KPIs
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

  // Chart data
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
      <AdminSidebar
        currentUser={currentUser!}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isGestao={isGestao}
        isOperacao={isOperacao}
        isLeitura={isLeitura}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
        onOpenProfile={() => setProfileOpen(true)}
        onExport={exportExcel}
      />

      {currentUser && (
        <ProfileDialog currentUser={currentUser} open={profileOpen} onOpenChange={setProfileOpen} onUpdate={setCurrentUser} />
      )}

      <main
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft: sidebarWidth }}
        role="main"
      >
        <div className="px-6 md:px-8 py-6 space-y-6 max-w-[1400px] mx-auto">
          {/* Page title */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                {activeSection === 'executivo' && 'Visão Executiva'}
                {activeSection === 'operacional' && 'Operacional'}
                {activeSection === 'faq' && 'Gerenciar FAQ'}
                {activeSection === 'usuarios' && 'Gestão de Usuários'}
                {activeSection === 'configuracoes' && 'Configurações'}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {activeSection === 'executivo' && 'Dashboard com indicadores e gráficos'}
                {activeSection === 'operacional' && 'Triagem e gestão de solicitações'}
                {activeSection === 'faq' && 'Perguntas frequentes do portal'}
                {activeSection === 'usuarios' && 'Controle de acessos e operadores'}
                {activeSection === 'configuracoes' && 'Órgãos e assuntos do sistema'}
              </p>
            </div>
          </div>

          {/* KPIs - visible on executivo and operacional */}
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

          {/* ═══ EXECUTIVO ═══ */}
          {activeSection === 'executivo' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle className="text-base text-foreground">Recebidas x Respondidas (Semanal)</CardTitle></CardHeader>
                  <CardContent>
                    {tendenciaSemanal.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={tendenciaSemanal}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis /><Tooltip /><Legend />
                          <Line type="monotone" dataKey="recebidas" stroke="hsl(210, 85%, 40%)" strokeWidth={2} name="Recebidas" />
                          <Line type="monotone" dataKey="respondidas" stroke="hsl(210, 100%, 28%)" strokeWidth={2} name="Respondidas" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle className="text-base text-foreground">Tipos de Demanda</CardTitle></CardHeader>
                  <CardContent>
                    {porTipo.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart><Pie data={porTipo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={40} label>{porTipo.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}</Pie><Tooltip /><Legend /></PieChart>
                      </ResponsiveContainer>
                    ) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}
                  </CardContent>
                </Card>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle className="text-base text-foreground">Top 10 Secretarias</CardTitle></CardHeader>
                  <CardContent>
                    {porSecretaria.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={porSecretaria} layout="vertical" margin={{ left: 10 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" fill="hsl(210, 100%, 28%)" radius={[0, 4, 4, 0]} /></BarChart>
                      </ResponsiveContainer>
                    ) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle className="text-base text-foreground">Status por Secretaria</CardTitle></CardHeader>
                  <CardContent>
                    {statusPorSecretaria.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={statusPorSecretaria} layout="vertical" margin={{ left: 10 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} /><Tooltip /><Legend /><Bar dataKey="Aberto" stackId="a" fill="hsl(45, 97%, 54%)" /><Bar dataKey="Em análise" stackId="a" fill="hsl(210, 85%, 40%)" /><Bar dataKey="Respondido" stackId="a" fill="hsl(210, 100%, 28%)" /></BarChart>
                      </ResponsiveContainer>
                    ) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}
                  </CardContent>
                </Card>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle className="text-base text-foreground">Tempo de Resposta (dias)</CardTitle></CardHeader>
                  <CardContent>
                    {tempoRespostaHist.some((b) => b.value > 0) ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={tempoRespostaHist}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="hsl(210, 85%, 40%)" radius={[4, 4, 0, 0]} name="Qtd" /></BarChart>
                      </ResponsiveContainer>
                    ) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle className="text-base text-foreground">Top 10 Assuntos</CardTitle></CardHeader>
                  <CardContent>
                    {porAssunto.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={porAssunto} layout="vertical" margin={{ left: 10 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" fill="hsl(210, 70%, 55%)" radius={[0, 4, 4, 0]} /></BarChart>
                      </ResponsiveContainer>
                    ) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardHeader><CardTitle className="text-base text-foreground">Satisfação por Secretaria</CardTitle></CardHeader>
                  <CardContent>
                    {satisfacaoPorSecretaria.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={satisfacaoPorSecretaria} layout="vertical" margin={{ left: 10 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" domain={[0, 5]} /><YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" fill="hsl(45, 97%, 54%)" radius={[0, 4, 4, 0]} name="Média" /></BarChart>
                      </ResponsiveContainer>
                    ) : <p className="text-muted-foreground text-center py-12">Nenhum dado</p>}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ═══ OPERACIONAL ═══ */}
          {activeSection === 'operacional' && (
            <OperacionalSection
              filtered={filtered}
              busca={busca}
              setBusca={setBusca}
              filtroSecretaria={filtroSecretaria}
              setFiltroSecretaria={setFiltroSecretaria}
              filtroStatus={filtroStatus}
              setFiltroStatus={setFiltroStatus}
              filtroPrioridade={filtroPrioridade}
              setFiltroPrioridade={setFiltroPrioridade}
              secretarias={secretarias}
              activeOperadores={activeOperadores}
              currentUser={currentUser!}
              isGestao={isGestao}
              isOperacao={isOperacao}
              isLeitura={isLeitura}
              onStatusChange={handleStatusChange}
              onResponsavel={handleResponsavel}
              onRefresh={refreshSol}
            />
          )}

          {/* ═══ FAQ ═══ */}
          {activeSection === 'faq' && <FaqManager />}

          {/* ═══ USUÁRIOS ═══ */}
          {activeSection === 'usuarios' && <UsersManager />}

          {/* ═══ CONFIGURAÇÕES ═══ */}
          {activeSection === 'configuracoes' && <SettingsManager />}
        </div>
      </main>
    </div>
  );
};

export default Admin;
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

              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle className="text-base text-foreground">Triagem de Solicitações</CardTitle></CardHeader>
                <CardContent className="overflow-x-auto">
                  {filtered.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-foreground/70">Protocolo</TableHead>
                          <TableHead className="text-foreground/70">Nome</TableHead>
                          <TableHead className="text-foreground/70">Secretaria</TableHead>
                          <TableHead className="text-foreground/70">Tipo</TableHead>
                          <TableHead className="text-foreground/70">Categoria</TableHead>
                          <TableHead className="text-foreground/70">Prioridade</TableHead>
                          <TableHead className="text-foreground/70">SLA</TableHead>
                          <TableHead className="text-foreground/70">Status</TableHead>
                          <TableHead className="text-foreground/70">Atribuído a</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((s) => {
                          const slaStatus = getSlaStatus(s);
                          return (
                            <TableRow key={s.id}>
                              <TableCell className="font-mono text-xs text-foreground">{s.protocolo}</TableCell>
                              <TableCell className="font-medium text-sm text-foreground">{s.nome}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{s.secretaria.split(' – ')[0]}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{s.tipo}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{s.categoria || '—'}</TableCell>
                              <TableCell>
                                <Badge variant={s.prioridade === 'Urgente' ? 'destructive' : 'outline'} className="text-[10px]">{s.prioridade || 'Normal'}</Badge>
                              </TableCell>
                              <TableCell>
                                <span className={`text-xs font-medium ${SLA_COLORS[slaStatus]}`}>{slaStatus}</span>
                              </TableCell>
                              <TableCell>
                                {isLeitura || (isOperacao && s.responsavel !== currentUser?.nome) ? (
                                  <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[s.status]}`}>{s.status}</Badge>
                                ) : (
                                  <Select value={s.status} onValueChange={(v) => handleStatusChange(s.id, v as StatusSolicitacao)}>
                                    <SelectTrigger className={`w-[130px] text-xs h-8 border ${STATUS_COLORS[s.status]}`}><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Aberto">Aberto</SelectItem>
                                      <SelectItem value="Em análise">Em análise</SelectItem>
                                      <SelectItem value="Respondido">Respondido</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              </TableCell>
                              <TableCell>
                                {(isLeitura || isOperacao) ? (
                                  <span className="text-xs text-muted-foreground">{s.responsavel || '—'}</span>
                                ) : (
                                  <Select value={s.responsavel || ''} onValueChange={(v) => handleResponsavel(s.id, v)}>
                                    <SelectTrigger className="w-[140px] text-xs h-8"><SelectValue placeholder="Atribuir" /></SelectTrigger>
                                    <SelectContent>
                                      {activeOperadores.map((op) => (
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
                  ) : <p className="text-muted-foreground text-center py-12">Nenhuma solicitação encontrada.</p>}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ═══ FAQ ═══ */}
          {activeSection === 'faq' && <FaqManager />}

          {/* ═══ USUÁRIOS ═══ */}
          {activeSection === 'usuarios' && <UsersManager />}

          {/* ═══ CONFIGURAÇÕES ═══ */}
          {activeSection === 'configuracoes' && <SettingsManager />}
        </div>
      </main>
    </div>
  );
};

export default Admin;
