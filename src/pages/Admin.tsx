import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, ArrowLeft, Download, FileSpreadsheet, BarChart3, CheckCircle2,
  AlertCircle, Clock, Star, TrendingUp, AlertTriangle, Target, Eye, Settings,
  HelpCircle, Plus, Pencil, Trash2, Save, X, Users, Shield, ShieldCheck, LogOut,
  User, Camera, KeyRound
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
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  uploadAvatar, getAvatarUrl,
} from '@/hooks/use-supabase-data';
import { Solicitacao, StatusSolicitacao, FAQ, Operador, NivelAcesso, NIVEIS_ACESSO, NIVEIS_GESTAO, NIVEIS_OPERACAO, NIVEIS_LEITURA, ASSUNTOS } from '@/types/solicitacao';
import AdminLogin from './AdminLogin';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#004B8D', '#0067B3', '#FDB913', '#42A5F5', '#EF5350', '#AB47BC', '#26C6DA', '#8D6E63', '#78909C', '#D4E157'];

const STATUS_COLORS: Record<StatusSolicitacao, string> = {
  'Aberto': 'bg-accent/20 text-accent-foreground border-accent/30',
  'Em análise': 'bg-primary/10 text-primary border-primary/20',
  'Respondido': 'bg-primary/20 text-primary border-primary/30',
};

const SLA_COLORS = {
  'Dentro do Prazo': 'text-primary',
  'Próximo do Prazo': 'text-accent-foreground',
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

function AdminHeader({ currentUser, isGestao, onExport, onLogout, onOpenProfile }: {
  currentUser: Operador;
  isGestao: boolean;
  onExport: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
}) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 institutional-gradient border-b border-white/10 px-6 py-3 shadow-lg" role="banner">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 gap-2"
            onClick={() => navigate('/')}
            aria-label="Voltar ao portal principal"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">Voltar ao Portal</span>
          </Button>
          <div className="h-6 w-px bg-white/20 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-white" aria-hidden="true" />
            <h1 className="text-sm md:text-base font-semibold text-white tracking-tight">
              Gestão do Atendimento
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {isGestao && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 gap-2"
              aria-label="Exportar relatório em Excel"
            >
              <Download className="h-4 w-4" />
              <span className="hidden md:inline text-sm">Exportar</span>
            </Button>
          )}
          <div className="h-6 w-px bg-white/20 hidden md:block" />
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full pl-1.5 pr-3 py-1 transition-all duration-300 cursor-pointer"
            aria-label="Abrir perfil do usuário"
          >
            <Avatar className="h-7 w-7">
              {currentUser.avatar_url ? (
                <AvatarImage src={currentUser.avatar_url} alt={currentUser.nome} />
              ) : null}
              <AvatarFallback className="bg-white/20 text-white text-xs">
                {currentUser.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-medium text-white leading-tight">{currentUser.nome}</span>
              <span className="text-[10px] text-white/60 leading-tight">{currentUser.nivel}</span>
            </div>
          </button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-destructive/80 transition-all duration-300 gap-2 rounded-full"
            onClick={onLogout}
            title="Sair do sistema"
            aria-label="Sair do sistema e voltar ao login"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="institutional-gradient px-6 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24 bg-white/20" />
            <div className="h-6 w-px bg-white/20" />
            <Skeleton className="h-5 w-40 bg-white/20" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-7 rounded-full bg-white/20" />
            <Skeleton className="h-8 w-16 bg-white/20" />
          </div>
        </div>
      </header>
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-5 pb-4 flex flex-col items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-12" />
            </CardContent></Card>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card><CardContent className="pt-6"><Skeleton className="h-[280px] w-full" /></CardContent></Card>
          <Card><CardContent className="pt-6"><Skeleton className="h-[280px] w-full" /></CardContent></Card>
        </div>
      </div>
    </div>
  );
}

// Profile Dialog Component
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
      await updateOperadorDb(currentUser.id, { nome: editNome.trim(), email: editEmail.trim() });
      const updated = { ...currentUser, nome: editNome.trim(), email: editEmail.trim() };
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
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmSenha('');
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
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Meu Perfil
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <Avatar className="h-20 w-20">
                {currentUser.avatar_url ? (
                  <AvatarImage src={currentUser.avatar_url} alt={currentUser.nome} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {currentUser.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 rounded-full bg-foreground/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
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

          {/* Profile fields */}
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

          {/* Password */}
          <div className="border-t pt-4">
            {!showSenhaSection ? (
              <Button variant="outline" className="w-full gap-2" onClick={() => setShowSenhaSection(true)}>
                <KeyRound className="h-4 w-4" />
                Alterar Senha
              </Button>
            ) : (
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
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

// FAQ Manager Component
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
      setNovaPergunta('');
      setNovaResposta('');
      refresh();
    } finally { setSaving(false); }
  };

  const handleEdit = (faq: FAQ) => {
    setEditId(faq.id);
    setEditPergunta(faq.pergunta);
    setEditResposta(faq.resposta);
  };

  const handleSaveEdit = async () => {
    if (!editId || !editPergunta.trim() || !editResposta.trim() || saving) return;
    setSaving(true);
    try {
      await updateFaqDb(editId, editPergunta.trim(), editResposta.trim());
      setEditId(null);
      refresh();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await deleteFaqDb(id);
      refresh();
    } finally { setSaving(false); }
  };

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" aria-hidden="true" />Nova Pergunta</CardTitle></CardHeader>
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
            <Plus className="h-4 w-4" aria-hidden="true" /> {saving ? 'Salvando...' : 'Adicionar FAQ'}
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
                      <Input value={editPergunta} onChange={(e) => setEditPergunta(e.target.value)} aria-label="Editar pergunta" />
                      <Textarea value={editResposta} onChange={(e) => setEditResposta(e.target.value)} className="min-h-[80px]" aria-label="Editar resposta" />
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

// Users Manager Component
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
      'Administrador': 'admin',
      'Gerente': 'gerente',
      'Coordenador': 'coord',
      'Analista': 'analista',
      'Residente Técnico': 'residente',
      'Estagiário': 'estagiario',
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
        description: `Nome: ${novoNome.trim()} | E-mail: ${novoEmail.trim()} | Nível: ${novoNivel} | Senha: ${senha}`,
      });
      setNovoNome('');
      setNovoEmail('');
      setNovoSenha('');
      setNovoNivel('Analista');
      refresh();
    } catch (err: any) {
      toast({ title: 'Erro ao criar operador', description: err.message || 'Tente novamente', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleToggleAtivo = async (op: Operador) => {
    await updateOperadorDb(op.id, { ativo: !op.ativo });
    refresh();
  };

  const handleChangeNivel = async (id: string, nivel: NivelAcesso) => {
    await updateOperadorDb(id, { nivel });
    refresh();
  };

  const handleDelete = async (id: string) => {
    const op = operadores.find(o => o.id === id);
    if (op && window.confirm(`Tem certeza que deseja remover "${op.nome}"?`)) {
      await deleteOperadorDb(id);
      refresh();
    }
  };

  const handleStartEdit = (op: Operador) => {
    setEditId(op.id);
    setEditNome(op.nome);
    setEditEmail(op.email);
  };

  const handleSaveEdit = async () => {
    if (!editId || !editNome.trim() || !editEmail.trim() || saving) return;
    setSaving(true);
    try {
      await updateOperadorDb(editId, { nome: editNome.trim(), email: editEmail.trim() });
      setEditId(null);
      refresh();
    } finally { setSaving(false); }
  };

  const handleResetSenha = async () => {
    if (!resetSenhaId || !novaSenhaReset.trim()) return;
    if (novaSenhaReset !== confirmSenhaReset) {
      toast({ title: 'As senhas não coincidem!', variant: 'destructive' });
      return;
    }
    if (novaSenhaReset.length < 6) {
      toast({ title: 'A senha deve ter pelo menos 6 caracteres.', variant: 'destructive' });
      return;
    }
    await updateOperadorDb(resetSenhaId, { senha: novaSenhaReset });
    const op = operadores.find(o => o.id === resetSenhaId);
    toast({ title: `Senha de "${op?.nome}" redefinida com sucesso!` });
    setResetSenhaId(null);
    setNovaSenhaReset('');
    setConfirmSenhaReset('');
    refresh();
  };

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" aria-hidden="true" />Novo Operador</CardTitle></CardHeader>
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
                <SelectContent>
                  {NIVEIS_ACESSO.map((n) => (<SelectItem key={n} value={n}>{n}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAdd} disabled={!novoNome.trim() || !novoEmail.trim() || saving} className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" /> {saving ? 'Salvando...' : 'Adicionar Operador'}
          </Button>
        </CardContent>
      </Card>

      {/* Modal de Resetar Senha */}
      {resetSenhaId && (
        <Card className="border-accent/50 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" aria-hidden="true" />
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
              <Button onClick={handleResetSenha} disabled={!novaSenhaReset.trim() || novaSenhaReset !== confirmSenhaReset} className="gap-1">
                <Save className="h-3 w-3" /> Salvar Nova Senha
              </Button>
              <Button variant="ghost" onClick={() => { setResetSenhaId(null); setNovaSenhaReset(''); setConfirmSenhaReset(''); }} className="gap-1">
                <X className="h-3 w-3" /> Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                  <TableCell className="font-medium">
                    {editId === op.id ? (
                      <Input value={editNome} onChange={(e) => setEditNome(e.target.value)} className="h-8 text-sm" aria-label="Editar nome" />
                    ) : op.nome}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {editId === op.id ? (
                      <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="h-8 text-sm" aria-label="Editar e-mail" />
                    ) : op.email}
                  </TableCell>
                  <TableCell>
                    <Select value={op.nivel} onValueChange={(v) => handleChangeNivel(op.id, v as NivelAcesso)}>
                      <SelectTrigger className="w-[160px] h-8 text-xs" aria-label={`Nível de acesso de ${op.nome}`}>
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
                      role="button"
                      aria-label={`Alternar status de ${op.nome}: ${op.ativo ? 'Ativo' : 'Inativo'}`}
                    >
                      {op.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {editId === op.id ? (
                        <>
                          <Button size="sm" onClick={handleSaveEdit} disabled={saving} className="gap-1 h-7 text-xs">
                            <Save className="h-3 w-3" />Salvar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditId(null)} className="gap-1 h-7 text-xs">
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleStartEdit(op)} className="gap-1 h-7 text-xs" aria-label={`Editar ${op.nome}`}>
                            <Pencil className="h-3 w-3" />Editar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setResetSenhaId(op.id)} className="gap-1 h-7 text-xs" aria-label={`Redefinir senha de ${op.nome}`}>
                            <Shield className="h-3 w-3" />Senha
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(op.id)} className="gap-1 h-7 text-xs" aria-label={`Remover ${op.nome}`}>
                            <Trash2 className="h-3 w-3" />Remover
                          </Button>
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

// Settings Manager Component
function SettingsManager() {
  const { orgaos, refresh: refreshOrgaos } = useCustomOrgaos();
  const { assuntos, refresh: refreshAssuntos } = useCustomAssuntos();
  const [novoOrgao, setNovoOrgao] = useState('');
  const [novoAssunto, setNovoAssunto] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddOrgao = async () => {
    if (!novoOrgao.trim() || saving) return;
    setSaving(true);
    try {
      await addCustomOrgaoDb(novoOrgao.trim());
      setNovoOrgao('');
      refreshOrgaos();
    } finally { setSaving(false); }
  };

  const handleRemoveOrgao = async (orgao: string) => {
    await removeCustomOrgaoDb(orgao);
    refreshOrgaos();
  };

  const handleAddAssunto = async () => {
    if (!novoAssunto.trim() || saving) return;
    setSaving(true);
    try {
      await addCustomAssuntoDb(novoAssunto.trim());
      setNovoAssunto('');
      refreshAssuntos();
    } finally { setSaving(false); }
  };

  const handleRemoveAssunto = async (assunto: string) => {
    await removeCustomAssuntoDb(assunto);
    refreshAssuntos();
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" aria-hidden="true" />Órgãos Adicionais</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">Adicione órgãos extras além da lista padrão.</p>
            <div className="flex gap-2">
              <Input placeholder="Ex: NOVO ÓRGÃO – Nome Completo" value={novoOrgao} onChange={(e) => setNovoOrgao(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddOrgao()} aria-label="Novo órgão" />
              <Button onClick={handleAddOrgao} disabled={!novoOrgao.trim() || saving} size="sm" aria-label="Adicionar órgão"><Plus className="h-4 w-4" /></Button>
            </div>
            {orgaos.length > 0 && (
              <div className="space-y-2">
                {orgaos.map((orgao) => (
                  <div key={orgao} className="flex items-center justify-between border rounded-md px-3 py-2">
                    <span className="text-sm">{orgao}</span>
                    <Button size="sm" variant="ghost" onClick={() => handleRemoveOrgao(orgao)} className="h-7 text-destructive hover:text-destructive" aria-label={`Remover ${orgao}`}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {orgaos.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhum órgão adicional cadastrado.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" aria-hidden="true" />Assuntos Adicionais</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">Assuntos padrão: {ASSUNTOS.join(', ')}.</p>
            <div className="flex gap-2">
              <Input placeholder="Ex: Novo Assunto" value={novoAssunto} onChange={(e) => setNovoAssunto(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddAssunto()} aria-label="Novo assunto" />
              <Button onClick={handleAddAssunto} disabled={!novoAssunto.trim() || saving} size="sm" aria-label="Adicionar assunto"><Plus className="h-4 w-4" /></Button>
            </div>
            {assuntos.length > 0 && (
              <div className="space-y-2">
                {assuntos.map((assunto) => (
                  <div key={assunto} className="flex items-center justify-between border rounded-md px-3 py-2">
                    <span className="text-sm">{assunto}</span>
                    <Button size="sm" variant="ghost" onClick={() => handleRemoveAssunto(assunto)} className="h-7 text-destructive hover:text-destructive" aria-label={`Remover ${assunto}`}>
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
  const isOperacao = currentUser ? NIVEIS_OPERACAO.includes(currentUser.nivel) : false;
  const isLeitura = currentUser ? NIVEIS_LEITURA.includes(currentUser.nivel) : false;
  const [busca, setBusca] = useState('');
  const [filtroSecretaria, setFiltroSecretaria] = useState('all');
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [filtroPrioridade, setFiltroPrioridade] = useState('all');
  const [profileOpen, setProfileOpen] = useState(false);

  const { solicitacoes, loading: loadingSol, refresh: refreshSol } = useSolicitacoes();
  const { operadores, loading: loadingOps } = useOperadores();
  const activeOperadores = useMemo(() => operadores.filter((o) => o.ativo), [operadores]);

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

  const handleStatusChange = async (id: string, status: StatusSolicitacao) => {
    await updateStatusDb(id, status);
    refreshSol();
  };

  const handleResponsavel = async (id: string, responsavel: string) => {
    await updateSolicitacaoDb(id, { responsavel });
    refreshSol();
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

  if (loadingSol) return <LoadingSkeleton />;

  const secretarias = [...new Set(solicitacoes.map((s) => s.secretaria))];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AdminHeader
        currentUser={currentUser!}
        isGestao={isGestao}
        onExport={exportExcel}
        onLogout={handleLogout}
        onOpenProfile={() => setProfileOpen(true)}
      />

      {currentUser && (
        <ProfileDialog
          currentUser={currentUser}
          open={profileOpen}
          onOpenChange={setProfileOpen}
          onUpdate={setCurrentUser}
        />
      )}

      <main className="flex-1 px-4 md:px-8 py-6 space-y-6 max-w-[1400px] mx-auto w-full" role="main">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3" role="region" aria-label="Indicadores de desempenho">
          <KpiCard icon={FileSpreadsheet} label="Total" value={total} color="text-primary" />
          <KpiCard icon={AlertCircle} label="Abertas" value={abertas} color="text-accent-foreground" />
          <KpiCard icon={Clock} label="Em Análise" value={emAnalise} color="text-primary" />
          <KpiCard icon={CheckCircle2} label="Respondidas" value={respondidas} color="text-primary" />
          <KpiCard icon={Target} label="% SLA" value={slaData + '%'} color="text-primary" />
          <KpiCard icon={TrendingUp} label="Tempo Médio" value={tempoMedioResposta} color="text-primary" />
          <KpiCard icon={AlertTriangle} label="Backlog" value={backlog} color="text-accent-foreground" />
          <KpiCard icon={Star} label="Satisfação" value={satisfacaoMedia} color="text-accent-foreground" sub="/5" />
          <KpiCard icon={BarChart3} label="IAI" value={iai + '%'} color="text-primary" />
        </div>

        <Tabs defaultValue={isLeitura ? 'operacional' : 'executivo'} className="space-y-6">
          <TabsList className="flex-wrap" aria-label="Seções do painel">
            {(isGestao || isOperacao) && <TabsTrigger value="executivo" className="gap-2"><Eye className="h-4 w-4" aria-hidden="true" />Visão Executiva</TabsTrigger>}
            <TabsTrigger value="operacional" className="gap-2"><Settings className="h-4 w-4" aria-hidden="true" />Operacional</TabsTrigger>
            {isGestao && <TabsTrigger value="faq" className="gap-2"><HelpCircle className="h-4 w-4" aria-hidden="true" />Gerenciar FAQ</TabsTrigger>}
            {isGestao && <TabsTrigger value="usuarios" className="gap-2"><Users className="h-4 w-4" aria-hidden="true" />Usuários</TabsTrigger>}
            {isGestao && <TabsTrigger value="configuracoes" className="gap-2"><Settings className="h-4 w-4" aria-hidden="true" />Configurações</TabsTrigger>}
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
                  <Input placeholder="Buscar por protocolo, nome ou e-mail..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-64" aria-label="Buscar solicitações" />
                  <Select value={filtroSecretaria} onValueChange={setFiltroSecretaria}>
                    <SelectTrigger className="w-[200px]" aria-label="Filtrar por secretaria"><SelectValue placeholder="Secretaria" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Secretarias</SelectItem>
                      {secretarias.map((s) => (<SelectItem key={s} value={s}>{s.split(' – ')[0]}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger className="w-[150px]" aria-label="Filtrar por status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos Status</SelectItem>
                      <SelectItem value="Aberto">Aberto</SelectItem>
                      <SelectItem value="Em análise">Em análise</SelectItem>
                      <SelectItem value="Respondido">Respondido</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
                    <SelectTrigger className="w-[140px]" aria-label="Filtrar por prioridade"><SelectValue /></SelectTrigger>
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
                      {filtered.map((s) => {
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
                                className="text-[10px]"
                              >
                                {s.prioridade || 'Normal'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={`text-xs font-medium ${SLA_COLORS[slaStatus]}`}>{slaStatus}</span>
                            </TableCell>
                            <TableCell>
                              {isLeitura || (isOperacao && s.responsavel !== currentUser?.nome) ? (
                                <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[s.status]}`}>{s.status}</Badge>
                              ) : (
                                <Select value={s.status} onValueChange={(v) => handleStatusChange(s.id, v as StatusSolicitacao)}>
                                  <SelectTrigger className={`w-[130px] text-xs h-8 border ${STATUS_COLORS[s.status]}`} aria-label={`Status de ${s.protocolo}`}>
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
                              {(isLeitura || isOperacao) ? (
                                <span className="text-xs text-muted-foreground">{s.responsavel || '—'}</span>
                              ) : (
                                <Select value={s.responsavel || ''} onValueChange={(v) => handleResponsavel(s.id, v)}>
                                  <SelectTrigger className="w-[140px] text-xs h-8" aria-label={`Atribuir responsável a ${s.protocolo}`}>
                                    <SelectValue placeholder="Atribuir" />
                                  </SelectTrigger>
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
