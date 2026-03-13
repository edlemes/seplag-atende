import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, ArrowLeft, ArrowRight, CheckCircle2, BookOpen, Search,
  Trophy, Star, Award, Download, Zap, Medal, Crown, Lock, Sparkles,
  Users, TrendingUp, BarChart3, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

import mod1Img from '@/assets/siad-mod1.jpg';
import mod2Img from '@/assets/siad-mod2.jpg';
import mod3Img from '@/assets/siad-mod3.jpg';
import mod4Img from '@/assets/siad-mod4.jpg';
import mod5Img from '@/assets/siad-mod5.jpg';
import mod6Img from '@/assets/siad-mod6.jpg';

// ── Points & Levels ──
const POINTS_PER_STEP = [15, 15, 20, 15, 20, 15];
const LEVELS = [
  { name: 'Iniciante', minPts: 0, icon: '🌱' },
  { name: 'Aprendiz', minPts: 15, icon: '📘' },
  { name: 'Conhecedor', minPts: 45, icon: '🎯' },
  { name: 'Especialista', minPts: 80, icon: '⭐' },
  { name: 'Mentor', minPts: 100, icon: '🏆' },
];

const ACHIEVEMENTS = [
  { id: 'explorer', name: 'Explorador do SIAD', desc: 'Completou o primeiro módulo', icon: '🧭', requiredSteps: 1 },
  { id: 'halfway', name: 'Meio Caminho', desc: 'Completou 3 módulos', icon: '🛤️', requiredSteps: 3 },
  { id: 'specialist', name: 'Especialista em Avaliação', desc: 'Completou o módulo de avaliação', icon: '📊', requiredSteps: 3 },
  { id: 'guardian', name: 'Guardião da Transparência', desc: 'Completou 5 módulos', icon: '🛡️', requiredSteps: 5 },
  { id: 'master', name: 'Mestre da Gestão Pública', desc: 'Concluiu toda a trilha', icon: '👑', requiredSteps: 6 },
];

function getLevel(pts: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (pts >= LEVELS[i].minPts) return LEVELS[i];
  }
  return LEVELS[0];
}

function getNextLevel(pts: number) {
  for (const lv of LEVELS) {
    if (pts < lv.minPts) return lv;
  }
  return null;
}

function getUnlockedAchievements(completedCount: number) {
  return ACHIEVEMENTS.filter((a) => completedCount >= a.requiredSteps);
}

const modules = [
  {
    title: 'Introdução ao SIAD',
    subtitle: 'O que é e qual seu objetivo',
    image: mod1Img,
    points: POINTS_PER_STEP[0],
    content: [
      'O SIAD é um sistema digital utilizado pelo governo para organizar e acompanhar a avaliação anual de desempenho dos servidores públicos.',
      'Ele ajuda a tornar o processo de avaliação mais transparente, organizado e fácil de acompanhar.',
    ],
  },
  {
    title: 'Por que o SIAD foi criado',
    subtitle: 'A evolução da gestão pública',
    image: mod2Img,
    points: POINTS_PER_STEP[1],
    content: [
      'O sistema foi criado para melhorar a gestão de desempenho e organizar o processo de avaliação dos servidores.',
      'Ele traz mais transparência e moderniza a administração pública, substituindo processos manuais em papel por uma plataforma digital eficiente.',
    ],
  },
  {
    title: 'Como funciona a avaliação',
    subtitle: 'O fluxo completo em 6 fases',
    image: mod3Img,
    points: POINTS_PER_STEP[2],
    content: [
      '1. Planejamento – definição de metas e critérios.',
      '2. Acompanhamento – monitoramento contínuo do trabalho.',
      '3. Avaliação do Gestor – o gestor registra a avaliação.',
      '4. Ciência do Servidor – o servidor toma ciência do resultado.',
      '5. Manifestação – possibilidade de contestar ou complementar.',
      '6. Resultado Final – consolidação e registro oficial.',
    ],
  },
  {
    title: 'Quem participa do processo',
    subtitle: 'Os papéis na avaliação',
    image: mod4Img,
    points: POINTS_PER_STEP[3],
    content: [
      'Servidor Avaliado – o profissional que terá seu desempenho analisado.',
      'Gestor Avaliador – responsável pela avaliação direta.',
      'Comissão de Avaliação – grupo que valida e analisa os resultados.',
      'Área de Gestão de Pessoas – setor que coordena todo o processo dentro do órgão.',
    ],
  },
  {
    title: 'Acompanhando sua avaliação',
    subtitle: 'Indicadores e resultados',
    image: mod5Img,
    points: POINTS_PER_STEP[4],
    content: [
      'O servidor pode acessar o sistema a qualquer momento para:',
      '• Visualizar sua avaliação atual e anteriores.',
      '• Acompanhar os resultados e indicadores.',
      '• Registrar manifestações ou observações.',
      '• Consultar prazos e etapas do processo.',
    ],
  },
  {
    title: 'Central de Conhecimento',
    subtitle: 'Dúvidas e suporte',
    image: mod6Img,
    points: POINTS_PER_STEP[5],
    content: [
      'Se tiver dúvidas, o servidor pode pesquisar questões frequentes como:',
      '• Quem realiza minha avaliação?',
      '• Posso discordar da avaliação?',
      '• Como acessar o sistema SIAD?',
      '• Quais os prazos do processo?',
    ],
  },
];

const faqSuggestions = [
  'Quem realiza minha avaliação?',
  'Posso discordar da avaliação?',
  'Como acessar o sistema SIAD?',
  'Quais são os prazos?',
  'O que acontece se eu não for avaliado?',
  'Como funciona a manifestação?',
];

interface RankingEntry {
  id: string;
  nome: string;
  pontuacao: number;
  nivel: string;
  concluido_em: string | null;
}

// ── PDF Certificate ──
function generateCertificate(nome: string, pontuacao: number) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Decorative border
  doc.setDrawColor(0, 60, 120);
  doc.setLineWidth(2);
  doc.rect(10, 10, w - 20, h - 20);
  doc.setLineWidth(0.5);
  doc.rect(14, 14, w - 28, h - 28);

  // Corner accents
  const cornerSize = 15;
  doc.setDrawColor(0, 100, 179);
  doc.setLineWidth(1.5);
  // top-left
  doc.line(14, 14, 14 + cornerSize, 14);
  doc.line(14, 14, 14, 14 + cornerSize);
  // top-right
  doc.line(w - 14, 14, w - 14 - cornerSize, 14);
  doc.line(w - 14, 14, w - 14, 14 + cornerSize);
  // bottom-left
  doc.line(14, h - 14, 14 + cornerSize, h - 14);
  doc.line(14, h - 14, 14, h - 14 - cornerSize);
  // bottom-right
  doc.line(w - 14, h - 14, w - 14 - cornerSize, h - 14);
  doc.line(w - 14, h - 14, w - 14, h - 14 - cornerSize);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text('GOVERNO DO ESTADO DE MATO GROSSO', w / 2, 30, { align: 'center' });
  doc.text('SECRETARIA DE PLANEJAMENTO E GESTÃO – SEPLAG', w / 2, 37, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(0, 60, 120);
  doc.text('CERTIFICADO DE CONCLUSÃO', w / 2, 58, { align: 'center' });

  doc.setDrawColor(0, 100, 179);
  doc.setLineWidth(0.8);
  doc.line(w / 2 - 65, 64, w / 2 + 65, 64);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(60, 60, 60);
  doc.text('Certificamos que', w / 2, 80, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(0, 60, 120);
  doc.text(nome.toUpperCase(), w / 2, 95, { align: 'center' });

  const level = getLevel(pontuacao);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  const bodyLines = [
    'concluiu com êxito a Trilha de Aprendizagem sobre o SIAD –',
    'Sistema de Avaliação de Desempenho do Servidor Público,',
    `obtendo a pontuação de ${pontuacao}/100 pontos e o nível "${level.name}".`,
  ];
  bodyLines.forEach((line, i) => {
    doc.text(line, w / 2, 108 + i * 7, { align: 'center' });
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.setFontSize(11);
  doc.text(`Cuiabá-MT, ${dateStr}`, w / 2, 146, { align: 'center' });

  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.4);
  doc.line(w / 2 - 50, 168, w / 2 + 50, 168);
  doc.setFontSize(10);
  doc.text('Coordenação de Gestão de Pessoas', w / 2, 174, { align: 'center' });

  doc.save(`Certificado_SIAD_${nome.replace(/\s+/g, '_')}.pdf`);
}

// ── Rank Medal ──
function RankMedal({ position }: { position: number }) {
  if (position === 0) return <Crown className="h-5 w-5 text-amber-500" />;
  if (position === 1) return <Medal className="h-5 w-5 text-muted-foreground" />;
  if (position === 2) return <Medal className="h-5 w-5 text-amber-700" />;
  return <span className="text-sm font-semibold text-muted-foreground">{position + 1}º</span>;
}

// ── Ranking List ──
function RankingList({ ranking, loading }: { ranking: RankingEntry[]; loading: boolean }) {
  if (loading) return (
    <div className="space-y-3 py-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 flex-1" /><Skeleton className="h-4 w-12" /></div>
      ))}
    </div>
  );
  if (ranking.length === 0) return <p className="text-center text-muted-foreground py-6 text-sm">Nenhum servidor concluiu a trilha ainda. Seja o primeiro!</p>;
  return (
    <div className="space-y-2 py-2 max-h-80 overflow-y-auto">
      {ranking.map((entry, i) => (
        <div key={entry.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${i === 0 ? 'bg-amber-500/10' : 'hover:bg-muted/50'}`}>
          <div className="w-8 flex justify-center"><RankMedal position={i} /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{entry.nome}</p>
            <p className="text-[11px] text-muted-foreground">{entry.nivel} · {entry.concluido_em ? new Date(entry.concluido_em).toLocaleDateString('pt-BR') : ''}</p>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-amber-600"><Star className="h-3.5 w-3.5" /> {entry.pontuacao}</div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
const Aprendizagem = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [faqSearch, setFaqSearch] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [started, setStarted] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);
  const startTimeRef = useRef(Date.now());

  const totalPoints = useMemo(() => Array.from(completed).reduce((sum, i) => sum + POINTS_PER_STEP[i], 0), [completed]);
  const progress = (completed.size / modules.length) * 100;
  const isComplete = completed.size === modules.length;
  const currentLevel = getLevel(totalPoints);
  const nextLevel = getNextLevel(totalPoints);
  const unlockedAchievements = getUnlockedAchievements(completed.size);

  const fetchRanking = async () => {
    setRankingLoading(true);
    const { data } = await supabase.from('trilha_progresso').select('id, nome, pontuacao, nivel, concluido_em').eq('concluido', true).order('pontuacao', { ascending: false }).order('concluido_em', { ascending: true }).limit(20);
    setRanking((data as RankingEntry[]) || []);
    setRankingLoading(false);
  };

  useEffect(() => { fetchRanking(); }, []);

  const saveProgress = async () => {
    if (saved) return;
    const elapsedMin = Math.round((Date.now() - startTimeRef.current) / 60000);
    const { error } = await supabase.from('trilha_progresso').insert({
      nome: userName,
      email: userEmail,
      etapas_concluidas: Array.from(completed),
      pontuacao: totalPoints,
      nivel: currentLevel.name,
      medalhas: unlockedAchievements.map((a) => a.id),
      tempo_minutos: elapsedMin,
      concluido: true,
      concluido_em: new Date().toISOString(),
    });
    if (!error) { setSaved(true); toast.success('Progresso salvo com sucesso!'); fetchRanking(); }
    else toast.error('Erro ao salvar progresso.');
  };

  const completeStep = (idx: number) => {
    if (completed.has(idx)) return;
    const prev = completed.size;
    const next = new Set(completed);
    next.add(idx);
    setCompleted(next);
    toast.success(`+${POINTS_PER_STEP[idx]} pontos!`, { icon: <Zap className="h-4 w-4 text-amber-500" /> });
    // Check new achievements
    const newCount = next.size;
    const newAch = ACHIEVEMENTS.find((a) => a.requiredSteps === newCount && prev < a.requiredSteps);
    if (newAch) {
      setTimeout(() => { setNewAchievement(newAch.id); toast.success(`🏅 Conquista: ${newAch.name}!`); }, 600);
    }
  };

  const goNext = () => {
    completeStep(current);
    if (current < modules.length - 1) setCurrent(current + 1);
  };

  const goPrev = () => { if (current > 0) setCurrent(current - 1); };

  const filteredSuggestions = faqSearch.trim()
    ? faqSuggestions.filter((s) => s.toLowerCase().includes(faqSearch.toLowerCase()))
    : faqSuggestions;

  // ── Enrollment ──
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="institutional-gradient px-6 py-4 flex items-center gap-3 shadow-lg" role="banner">
          <Building2 className="h-8 w-8 text-primary-foreground" aria-hidden="true" />
          <div>
            <h1 className="text-lg font-bold text-primary-foreground leading-tight">SEPLAG</h1>
            <p className="text-xs text-primary-foreground/80">Mato Grosso</p>
          </div>
        </header>

        <main className="flex-1 px-4 py-12 flex items-center justify-center" role="main">
          <div className="max-w-lg w-full space-y-8">
            {/* Hero card */}
            <Card className="rounded-3xl shadow-2xl border-0 overflow-hidden">
              <div className="institutional-gradient px-8 pt-10 pb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm mb-4">
                  <BookOpen className="h-8 w-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-primary-foreground mb-1">Trilha de Aprendizagem</h2>
                <p className="text-primary-foreground/80 text-sm">Sistema de Avaliação de Desempenho – SIAD</p>
              </div>
              <CardContent className="p-8 space-y-6">
                {/* Level journey preview */}
                <div className="flex items-center justify-between px-2">
                  {LEVELS.map((lv, i) => (
                    <div key={lv.name} className="flex flex-col items-center gap-1">
                      <span className="text-xl">{lv.icon}</span>
                      <span className="text-[9px] text-muted-foreground font-medium">{lv.name}</span>
                      {i < LEVELS.length - 1 && <div className="hidden" />}
                    </div>
                  ))}
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-0 rounded-full bg-gradient-to-r from-primary to-primary/60" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-muted/50 rounded-2xl py-3">
                    <Star className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">100</p>
                    <p className="text-[10px] text-muted-foreground">Pontos</p>
                  </div>
                  <div className="bg-muted/50 rounded-2xl py-3">
                    <Award className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">5</p>
                    <p className="text-[10px] text-muted-foreground">Conquistas</p>
                  </div>
                  <div className="bg-muted/50 rounded-2xl py-3">
                    <Trophy className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">PDF</p>
                    <p className="text-[10px] text-muted-foreground">Certificado</p>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-3">
                  <Input placeholder="Seu nome completo" value={userName} onChange={(e) => setUserName(e.target.value)} className="rounded-xl h-12 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/30" />
                  <Input placeholder="Seu e-mail institucional" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="rounded-xl h-12 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/30" />
                </div>
                <Button className="w-full rounded-xl h-12 text-base gap-2 shadow-lg hover:shadow-xl transition-all" disabled={!userName.trim() || !userEmail.trim()} onClick={() => { setStarted(true); startTimeRef.current = Date.now(); }}>
                  <Sparkles className="h-4 w-4" /> Iniciar Trilha
                </Button>
                <Button variant="ghost" className="w-full rounded-xl gap-2 text-muted-foreground" onClick={() => { setShowRanking(true); fetchRanking(); }}>
                  <Trophy className="h-4 w-4" /> Ver Ranking de Servidores
                </Button>
              </CardContent>
            </Card>

            {/* Module preview grid */}
            <div className="grid grid-cols-3 gap-3">
              {modules.map((m, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden aspect-[4/3] group">
                  <img src={m.image} alt={m.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                    <div>
                      <p className="text-[10px] text-white/70 font-medium">Módulo {i + 1}</p>
                      <p className="text-xs text-white font-semibold leading-tight">{m.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <Dialog open={showRanking} onOpenChange={setShowRanking}>
          <DialogContent className="rounded-2xl max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" /> Ranking</DialogTitle></DialogHeader><RankingList ranking={ranking} loading={rankingLoading} /></DialogContent>
        </Dialog>

        <footer className="border-t bg-card px-6 py-4 text-center text-sm text-muted-foreground" role="contentinfo">
          Secretaria de Planejamento e Gestão – Governo do Estado de Mato Grosso
        </footer>
      </div>
    );
  }

  // ── Main Portal ──
  const mod = modules[current];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="institutional-gradient px-6 py-3 flex items-center gap-3 shadow-lg" role="banner">
        <Building2 className="h-7 w-7 text-primary-foreground" />
        <div className="flex-1">
          <h1 className="text-sm font-bold text-primary-foreground leading-tight">SEPLAG – Trilha SIAD</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowAchievements(true)} className="flex items-center gap-1.5 bg-primary-foreground/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-primary-foreground font-medium hover:bg-primary-foreground/30 transition-colors">
            <Award className="h-3.5 w-3.5" /> {unlockedAchievements.length}/{ACHIEVEMENTS.length}
          </button>
          <button onClick={() => { setShowRanking(true); fetchRanking(); }} className="flex items-center gap-1.5 bg-primary-foreground/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-primary-foreground font-medium hover:bg-primary-foreground/30 transition-colors">
            <Trophy className="h-3.5 w-3.5" /> Ranking
          </button>
          <div className="flex items-center gap-1.5 bg-amber-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-amber-300 font-bold">
            <Star className="h-3.5 w-3.5" /> {totalPoints}
          </div>
        </div>
      </header>

      <main className="flex-1" role="main">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground rounded-full" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" /> Portal
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-xl">{currentLevel.icon}</span>
              <div>
                <p className="text-sm font-bold text-foreground">{currentLevel.name}</p>
                {nextLevel && <p className="text-[10px] text-muted-foreground">Próximo: {nextLevel.name} ({nextLevel.minPts} pts)</p>}
              </div>
            </div>
          </div>

          {/* Journey Map */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span className="font-medium">Progresso da Trilha</span>
              <span className="font-bold text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2.5 mb-4" />

            {/* Module cards row */}
            <div className="grid grid-cols-6 gap-2">
              {modules.map((m, i) => {
                const done = completed.has(i);
                const active = i === current;
                const locked = !done && i > 0 && !completed.has(i - 1) && i !== current;
                return (
                  <button
                    key={i}
                    onClick={() => !locked && setCurrent(i)}
                    disabled={locked}
                    className={`relative rounded-xl overflow-hidden aspect-[3/2] group transition-all duration-300 ${
                      active ? 'ring-2 ring-primary ring-offset-2 shadow-lg scale-[1.02]' : ''
                    } ${locked ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
                  >
                    <img src={m.image} alt={m.title} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 flex items-end p-2 ${done ? 'bg-gradient-to-t from-emerald-900/70 to-transparent' : 'bg-gradient-to-t from-black/60 to-transparent'}`}>
                      <div className="w-full">
                        <div className="flex items-center justify-between">
                          <p className="text-[9px] text-white/80 font-medium">M{i + 1}</p>
                          {done && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                          {locked && <Lock className="h-3 w-3 text-white/60" />}
                        </div>
                        <p className="text-[10px] text-white font-semibold leading-tight truncate">{m.title}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Module Content */}
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            {/* Main content */}
            <Card className="rounded-2xl shadow-lg border-0 overflow-hidden">
              <div className="relative">
                <img src={mod.image} alt={mod.title} className="w-full h-52 md:h-64 object-cover" />
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <Badge className="bg-card/90 backdrop-blur-md text-amber-600 border-0 gap-1">
                    <Star className="h-3 w-3" /> +{mod.points} pts
                  </Badge>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-card to-transparent h-16" />
              </div>
              <CardContent className="p-8 -mt-4 relative">
                <Badge variant="outline" className="mb-3 rounded-full text-[10px]">Módulo {current + 1} de {modules.length}</Badge>
                <h3 className="text-2xl font-bold text-foreground mb-1">{mod.title}</h3>
                <p className="text-primary font-medium text-sm mb-6">{mod.subtitle}</p>
                <div className="space-y-3">
                  {mod.content.map((line, i) => (
                    <p key={i} className="text-muted-foreground leading-relaxed">{line}</p>
                  ))}
                </div>

                {/* Nav */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button variant="outline" className="rounded-full px-6 gap-2" onClick={goPrev} disabled={current === 0}>
                    <ArrowLeft className="h-4 w-4" /> Anterior
                  </Button>
                  {current < modules.length - 1 ? (
                    <Button className="rounded-full px-8 gap-2 shadow-md hover:shadow-lg transition-all" onClick={goNext}>
                      Avançar <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button className="rounded-full px-8 gap-2 shadow-md hover:shadow-lg transition-all" onClick={() => completeStep(current)}>
                      <CheckCircle2 className="h-4 w-4" /> Concluir
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Side panel */}
            <div className="space-y-4">
              {/* Level card */}
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{currentLevel.icon}</span>
                    <div>
                      <p className="font-bold text-foreground">{currentLevel.name}</p>
                      <p className="text-xs text-muted-foreground">{totalPoints}/100 pontos</p>
                    </div>
                  </div>
                  {nextLevel && (
                    <>
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>{currentLevel.name}</span>
                        <span>{nextLevel.name} ({nextLevel.minPts} pts)</span>
                      </div>
                      <Progress value={(totalPoints / nextLevel.minPts) * 100} className="h-2" />
                    </>
                  )}
                  {!nextLevel && <p className="text-xs text-primary font-semibold">Nível máximo atingido!</p>}
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Award className="h-4 w-4 text-primary" /> Conquistas</CardTitle>
                </CardHeader>
                <CardContent className="pb-5">
                  <div className="space-y-2">
                    {ACHIEVEMENTS.map((a) => {
                      const unlocked = unlockedAchievements.includes(a);
                      return (
                        <div key={a.id} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${unlocked ? 'bg-primary/5' : 'opacity-40'} ${newAchievement === a.id ? 'ring-2 ring-amber-400 animate-pulse' : ''}`}>
                          <span className="text-lg">{a.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{a.name}</p>
                            <p className="text-[10px] text-muted-foreground">{a.desc}</p>
                          </div>
                          {unlocked && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                          {!unlocked && <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick stats */}
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-muted/50 rounded-xl py-3">
                      <p className="text-lg font-bold text-foreground">{completed.size}</p>
                      <p className="text-[10px] text-muted-foreground">Módulos</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl py-3">
                      <p className="text-lg font-bold text-foreground">{Math.round((Date.now() - startTimeRef.current) / 60000)}m</p>
                      <p className="text-[10px] text-muted-foreground">Tempo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Completion */}
          {isComplete && (
            <Card className="rounded-2xl border-0 shadow-xl mt-8 overflow-hidden">
              <div className="institutional-gradient p-8 text-center">
                <Award className="h-16 w-16 text-primary-foreground mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-primary-foreground mb-1">Trilha Concluída!</h3>
                <p className="text-primary-foreground/80">
                  Parabéns, <span className="font-semibold">{userName}</span>!
                  Você obteve <span className="font-bold">{totalPoints} pontos</span> e alcançou o nível <span className="font-bold">{currentLevel.name}</span>.
                </p>
              </div>
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button className="rounded-full gap-2 px-6 shadow-md" onClick={() => generateCertificate(userName, totalPoints)}>
                    <Download className="h-4 w-4" /> Baixar Certificado PDF
                  </Button>
                  {!saved ? (
                    <Button variant="outline" className="rounded-full gap-2 px-6" onClick={saveProgress}>
                      <Trophy className="h-4 w-4" /> Salvar no Ranking
                    </Button>
                  ) : (
                    <span className="text-sm text-primary font-medium flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Salvo!</span>
                  )}
                </div>
                {/* Unlocked achievements */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  {unlockedAchievements.map((a) => (
                    <div key={a.id} className="flex flex-col items-center gap-1">
                      <span className="text-2xl">{a.icon}</span>
                      <span className="text-[9px] text-muted-foreground font-medium">{a.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* FAQ Search */}
          <div className="border-t mt-12 pt-10">
            <h3 className="text-xl font-bold text-foreground mb-4">Dúvidas sobre o SIAD</h3>
            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Digite sua dúvida sobre o SIAD ou avaliação de desempenho..." value={faqSearch} onChange={(e) => setFaqSearch(e.target.value)} className="pl-11 rounded-full bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/30 h-12" />
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredSuggestions.map((s) => (
                <button key={s} onClick={() => setFaqSearch(s)} className="px-4 py-2 rounded-full bg-muted text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300">{s}</button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Ranking */}
      <Dialog open={showRanking} onOpenChange={setShowRanking}>
        <DialogContent className="rounded-2xl max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" /> Ranking</DialogTitle></DialogHeader><RankingList ranking={ranking} loading={rankingLoading} /></DialogContent>
      </Dialog>

      {/* Achievements dialog */}
      <Dialog open={showAchievements} onOpenChange={setShowAchievements}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Conquistas</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = unlockedAchievements.includes(a);
              return (
                <div key={a.id} className={`flex items-center gap-3 p-3 rounded-xl ${unlocked ? 'bg-primary/5' : 'opacity-40'}`}>
                  <span className="text-2xl">{a.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                  {unlocked ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <footer className="border-t bg-card px-6 py-4 text-center text-sm text-muted-foreground" role="contentinfo">
        Secretaria de Planejamento e Gestão – Governo do Estado de Mato Grosso
      </footer>
    </div>
  );
};

export default Aprendizagem;
