import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, ArrowLeft, ArrowRight, CheckCircle2, BookOpen, Search,
  Trophy, Star, Award, Download, Zap, Medal, Crown, Lock, Sparkles,
  Users, TrendingUp, Clock, ChevronRight, FileText, Shield, Monitor,
  HelpCircle, Target, Lightbulb, ClipboardCheck, XCircle, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

// ── Types ──
interface TrailModule {
  id: string;
  trilha: string;
  modulo_ordem: number;
  titulo: string;
  subtitulo: string;
  conteudo: string;
  checklist: string[];
  pontos: number;
}

interface QuizQuestion {
  id: string;
  trilha_conteudo_id: string;
  pergunta: string;
  opcoes: string[];
  resposta_correta: number;
}

interface RankingEntry {
  id: string;
  nome: string;
  pontuacao: number;
  nivel: string;
  concluido_em: string | null;
}

// ── Levels & Achievements ──
const LEVELS = [
  { name: 'Iniciante', minPts: 0, icon: '🌱' },
  { name: 'Aprendiz', minPts: 15, icon: '📘' },
  { name: 'Conhecedor', minPts: 45, icon: '🎯' },
  { name: 'Especialista', minPts: 80, icon: '⭐' },
  { name: 'Mentor', minPts: 100, icon: '🏆' },
];

const ACHIEVEMENTS = [
  { id: 'explorer', name: 'Explorador', desc: 'Completou o primeiro módulo', icon: '🧭', requiredSteps: 1 },
  { id: 'halfway', name: 'Meio Caminho', desc: 'Completou 3 módulos', icon: '🛤️', requiredSteps: 3 },
  { id: 'guardian', name: 'Guardião', desc: 'Completou 5 módulos', icon: '🛡️', requiredSteps: 5 },
  { id: 'master', name: 'Mestre', desc: 'Concluiu toda a trilha', icon: '👑', requiredSteps: 6 },
];

function getLevel(pts: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (pts >= LEVELS[i].minPts) return LEVELS[i];
  }
  return LEVELS[0];
}

function getUnlockedAchievements(completedCount: number) {
  return ACHIEVEMENTS.filter((a) => completedCount >= a.requiredSteps);
}

// ── PDF Certificate ──
function generateCertificate(nome: string, pontuacao: number, trilha: string) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  doc.setDrawColor(0, 60, 120);
  doc.setLineWidth(2);
  doc.rect(10, 10, w - 20, h - 20);
  doc.setLineWidth(0.5);
  doc.rect(14, 14, w - 28, h - 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text('GOVERNO DO ESTADO DE MATO GROSSO', w / 2, 30, { align: 'center' });
  doc.text('SECRETARIA DE PLANEJAMENTO E GESTÃO – SEPLAG', w / 2, 37, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
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
    `concluiu com êxito a Trilha de Aprendizagem: ${trilha}`,
    `obtendo a pontuação de ${pontuacao} pontos e o nível "${level.name}".`,
  ];
  bodyLines.forEach((line, i) => doc.text(line, w / 2, 110 + i * 7, { align: 'center' }));

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.setFontSize(11);
  doc.text(`Cuiabá-MT, ${dateStr}`, w / 2, 140, { align: 'center' });

  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.4);
  doc.line(w / 2 - 50, 165, w / 2 + 50, 165);
  doc.setFontSize(10);
  doc.text('Coordenação de Gestão de Pessoas', w / 2, 171, { align: 'center' });

  doc.save(`Certificado_${trilha}_${nome.replace(/\s+/g, '_')}.pdf`);
}

// ── Rank Medal ──
function RankMedal({ position }: { position: number }) {
  if (position === 0) return <Crown className="h-5 w-5 text-amber-500" />;
  if (position === 1) return <Medal className="h-5 w-5 text-muted-foreground" />;
  if (position === 2) return <Medal className="h-5 w-5 text-amber-700" />;
  return <span className="text-sm font-semibold text-muted-foreground">{position + 1}º</span>;
}

function RankingList({ ranking, loading }: { ranking: RankingEntry[]; loading: boolean }) {
  if (loading) return <div className="space-y-3 py-2">{[1, 2, 3].map((i) => (<div key={i} className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 flex-1" /><Skeleton className="h-4 w-12" /></div>))}</div>;
  if (ranking.length === 0) return <p className="text-center text-muted-foreground py-6 text-sm">Nenhum servidor concluiu a trilha ainda.</p>;
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

// ── Quiz Component ──
function QuizPanel({
  questions,
  moduleTitle,
  onComplete,
  completed: isCompleted,
}: {
  questions: QuizQuestion[];
  moduleTitle: string;
  onComplete: (acertos: number, total: number) => void;
  completed: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [acertos, setAcertos] = useState(0);

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setAcertos(0);
  }, [questions]);

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.resposta_correta) correct++;
    });
    setAcertos(correct);
    setSubmitted(true);
    onComplete(correct, questions.length);
  };

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id] !== undefined);

  if (questions.length === 0) {
    return (
      <Card className="rounded-3xl border-0 shadow-sm h-full">
        <CardContent className="p-6 flex items-center justify-center h-full">
          <p className="text-muted-foreground text-sm text-center">Nenhum quiz disponível para este módulo.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-0 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-foreground">
          <Lightbulb className="h-4 w-4 text-amber-500" /> Quiz — {moduleTitle}
        </CardTitle>
        {submitted && (
          <Badge className={`w-fit rounded-full text-xs ${acertos === questions.length ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
            {acertos}/{questions.length} corretas
          </Badge>
        )}
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent className="space-y-5 pb-6">
          {questions.map((q, qi) => {
            const selected = answers[q.id];
            const isCorrect = submitted && selected === q.resposta_correta;
            const isWrong = submitted && selected !== undefined && selected !== q.resposta_correta;

            return (
              <div key={q.id} className={`space-y-3 p-4 rounded-2xl transition-all duration-300 ${submitted ? (isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/10' : isWrong ? 'bg-red-50 dark:bg-red-900/10' : 'bg-muted/30') : 'bg-muted/30'}`}>
                <p className="text-sm font-semibold text-foreground">
                  <span className="text-primary mr-1">{qi + 1}.</span> {q.pergunta}
                </p>
                <RadioGroup
                  value={selected !== undefined ? String(selected) : undefined}
                  onValueChange={(v) => !submitted && setAnswers({ ...answers, [q.id]: parseInt(v) })}
                  disabled={submitted}
                  className="space-y-2"
                >
                  {q.opcoes.map((opt, oi) => {
                    const isThisCorrect = submitted && oi === q.resposta_correta;
                    const isThisSelected = selected === oi;
                    return (
                      <div
                        key={oi}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
                          submitted
                            ? isThisCorrect
                              ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20'
                              : isThisSelected
                              ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                              : 'border-transparent'
                            : isThisSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent hover:border-border hover:bg-muted/50'
                        }`}
                      >
                        <RadioGroupItem value={String(oi)} id={`${q.id}-${oi}`} />
                        <Label htmlFor={`${q.id}-${oi}`} className="text-sm text-foreground cursor-pointer flex-1">{opt}</Label>
                        {submitted && isThisCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                        {submitted && isThisSelected && !isThisCorrect && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            );
          })}

          {!submitted ? (
            <Button
              className="w-full rounded-full gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
              disabled={!allAnswered || isCompleted}
              onClick={handleSubmit}
            >
              <CheckCircle2 className="h-4 w-4" /> Verificar Respostas
            </Button>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {acertos === questions.length ? '🎉 Perfeito! Todas corretas!' : `Você acertou ${acertos} de ${questions.length}.`}
              </p>
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════
const Aprendizagem = () => {
  const navigate = useNavigate();
  const [activeTrilha, setActiveTrilha] = useState('SIAD');
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [started, setStarted] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState<Record<number, number>>({});
  const startTimeRef = useRef(Date.now());

  // Data from DB
  const [modules, setModules] = useState<TrailModule[]>([]);
  const [quizMap, setQuizMap] = useState<Record<string, QuizQuestion[]>>({});
  const [loading, setLoading] = useState(true);

  // Fetch trail data
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: contentData } = await supabase
        .from('trilhas_conteudo')
        .select('*')
        .eq('trilha', activeTrilha)
        .order('modulo_ordem');

      const mods: TrailModule[] = (contentData || []).map((d: any) => ({
        id: d.id,
        trilha: d.trilha,
        modulo_ordem: d.modulo_ordem,
        titulo: d.titulo,
        subtitulo: d.subtitulo,
        conteudo: d.conteudo,
        checklist: Array.isArray(d.checklist) ? d.checklist : JSON.parse(d.checklist || '[]'),
        pontos: d.pontos,
      }));
      setModules(mods);

      if (mods.length > 0) {
        const ids = mods.map((m) => m.id);
        const { data: quizData } = await supabase
          .from('quiz_perguntas')
          .select('*')
          .in('trilha_conteudo_id', ids);

        const qMap: Record<string, QuizQuestion[]> = {};
        (quizData || []).forEach((q: any) => {
          const parsed: QuizQuestion = {
            id: q.id,
            trilha_conteudo_id: q.trilha_conteudo_id,
            pergunta: q.pergunta,
            opcoes: Array.isArray(q.opcoes) ? q.opcoes : JSON.parse(q.opcoes || '[]'),
            resposta_correta: q.resposta_correta,
          };
          if (!qMap[q.trilha_conteudo_id]) qMap[q.trilha_conteudo_id] = [];
          qMap[q.trilha_conteudo_id].push(parsed);
        });
        setQuizMap(qMap);
      }

      setCurrent(0);
      setCompleted(new Set());
      setSaved(false);
      setLoading(false);
    })();
  }, [activeTrilha]);

  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (transitioning) {
      const t = setTimeout(() => setTransitioning(false), 400);
      return () => clearTimeout(t);
    }
  }, [transitioning]);

  const totalMaxPts = modules.reduce((s, m) => s + m.pontos, 0);
  const totalPoints = useMemo(() => Object.values(earnedPoints).reduce((sum, pts) => sum + pts, 0), [earnedPoints]);
  const progress = modules.length > 0 ? (completed.size / modules.length) * 100 : 0;
  const isComplete = modules.length > 0 && completed.size === modules.length;
  const currentLevel = getLevel(totalPoints);
  const unlockedAchievements = getUnlockedAchievements(completed.size);

  const fetchRanking = async () => {
    setRankingLoading(true);
    const { data } = await supabase.from('trilha_progresso').select('id, nome, pontuacao, nivel, concluido_em').eq('concluido', true).order('pontuacao', { ascending: false }).limit(20);
    setRanking((data as RankingEntry[]) || []);
    setRankingLoading(false);
  };

  useEffect(() => { fetchRanking(); }, []);

  const saveProgress = async () => {
    if (saved) return;
    const elapsedMin = Math.round((Date.now() - startTimeRef.current) / 60000);
    const { error } = await supabase.from('trilha_progresso').insert({
      nome: userName, email: userEmail,
      etapas_concluidas: Array.from(completed),
      pontuacao: totalPoints, nivel: currentLevel.name,
      medalhas: unlockedAchievements.map((a) => a.id),
      tempo_minutos: elapsedMin, concluido: true,
      concluido_em: new Date().toISOString(),
    });
    if (!error) { setSaved(true); toast.success('Progresso salvo!'); fetchRanking(); }
    else toast.error('Erro ao salvar progresso.');
  };


  const completeStep = (idx: number, quizPoints: number) => {
    if (completed.has(idx)) return;
    const next = new Set(completed);
    next.add(idx);
    setCompleted(next);
    setEarnedPoints(prev => ({ ...prev, [idx]: quizPoints }));
    if (quizPoints > 0) {
      toast.success(`+${quizPoints} pontos!`, { icon: <Zap className="h-4 w-4 text-amber-500" /> });
    } else {
      toast.info('Módulo concluído. Nenhum ponto ganho nesta etapa.');
    }
  };

  const handleQuizComplete = (acertos: number, total: number) => {
    const mod = modules[current];
    // Points proportional to correct answers
    const pts = total > 0 ? Math.round((acertos / total) * (mod?.pontos || 0)) : 0;
    completeStep(current, pts);
    if (acertos === total) {
      toast.success('🎉 Perfeito! Todas corretas!');
    } else if (acertos > 0) {
      toast.info(`Você acertou ${acertos} de ${total}. Pode avançar!`);
    } else {
      toast.warning(`Nenhum acerto. Revise o conteúdo na próxima oportunidade.`);
    }
  };

  const goNext = () => {
    if (!completed.has(current)) {
      toast.error('Complete o quiz para avançar.');
      return;
    }
    if (current < modules.length - 1) {
      setTransitioning(true);
      setCurrent(current + 1);
    }
  };

  const goPrev = () => { if (current > 0) { setTransitioning(true); setCurrent(current - 1); } };

  const handleTrilhaChange = (trilha: string) => {
    setActiveTrilha(trilha);
  };

  // ── Enrollment Screen ──
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="institutional-gradient px-6 py-4 flex items-center gap-3 shadow-lg" role="banner">
          <Building2 className="h-8 w-8 text-primary-foreground" />
          <div>
            <h1 className="text-lg font-bold text-primary-foreground leading-tight">SEPLAG</h1>
            <p className="text-xs text-primary-foreground/80">Mato Grosso</p>
          </div>
        </header>

        <main className="flex-1 px-4 py-12 flex items-center justify-center" role="main">
          <div className="max-w-lg w-full space-y-8">
            <Card className="rounded-3xl shadow-2xl border-0 overflow-hidden">
              <div className="institutional-gradient px-8 pt-10 pb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm mb-4">
                  <BookOpen className="h-8 w-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-primary-foreground mb-1">Trilhas de Aprendizagem</h2>
                <p className="text-primary-foreground/80 text-sm">Plataforma de Capacitação do Servidor</p>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-muted/50 rounded-2xl py-3">
                    <Star className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">3</p>
                    <p className="text-[10px] text-muted-foreground">Trilhas</p>
                  </div>
                  <div className="bg-muted/50 rounded-2xl py-3">
                    <Award className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">Quiz</p>
                    <p className="text-[10px] text-muted-foreground">Interativo</p>
                  </div>
                  <div className="bg-muted/50 rounded-2xl py-3">
                    <Trophy className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">PDF</p>
                    <p className="text-[10px] text-muted-foreground">Certificado</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Input placeholder="Seu nome completo" value={userName} onChange={(e) => setUserName(e.target.value)} className="rounded-xl h-12 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/30" />
                  <Input placeholder="Seu e-mail institucional" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="rounded-xl h-12 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/30" />
                </div>
                <Button className="w-full rounded-xl h-12 text-base gap-2 shadow-lg hover:shadow-xl transition-all" disabled={!userName.trim() || !userEmail.trim()} onClick={() => { setStarted(true); startTimeRef.current = Date.now(); }}>
                  <Sparkles className="h-4 w-4" /> Iniciar Trilha
                </Button>
                <Button variant="ghost" className="w-full rounded-xl gap-2 text-muted-foreground" onClick={() => { setShowRanking(true); fetchRanking(); }}>
                  <Trophy className="h-4 w-4" /> Ver Ranking
                </Button>
              </CardContent>
            </Card>
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
      {/* Header */}
      <header className="institutional-gradient px-6 py-3 flex items-center gap-3 shadow-lg" role="banner">
        <Building2 className="h-7 w-7 text-primary-foreground" />
        <div className="flex-1">
          <h1 className="text-sm font-bold text-primary-foreground leading-tight">SEPLAG – Trilhas de Aprendizagem</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowRanking(true); fetchRanking(); }} className="flex items-center gap-1.5 bg-primary-foreground/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-primary-foreground font-medium hover:bg-primary-foreground/25 transition-colors">
            <Trophy className="h-3.5 w-3.5" /> Ranking
          </button>
          <div className="flex items-center gap-1.5 bg-amber-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-amber-300 font-bold">
            <Star className="h-3.5 w-3.5" /> {totalPoints}
          </div>
        </div>
      </header>

      <main className="flex-1" role="main">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Back + Trail Tabs */}
          <div className="flex items-center justify-between mb-5">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground rounded-full" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" /> Voltar ao Início
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-xl">{currentLevel.icon}</span>
              <p className="text-sm font-bold text-foreground">{currentLevel.name}</p>
            </div>
          </div>

          {/* Trail Tabs */}
          <Tabs value={activeTrilha} onValueChange={handleTrilhaChange} className="mb-6">
            <TabsList className="w-full max-w-lg mx-auto grid grid-cols-3 h-11 rounded-full bg-muted p-1">
              <TabsTrigger value="SIAD" className="rounded-full text-xs font-semibold data-[state=active]:shadow-md">SIAD</TabsTrigger>
              <TabsTrigger value="SIEP" className="rounded-full text-xs font-semibold data-[state=active]:shadow-md">SIEP</TabsTrigger>
              <TabsTrigger value="Banco de Talentos" className="rounded-full text-xs font-semibold data-[state=active]:shadow-md">Banco de Talentos</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
          ) : modules.length === 0 ? (
            <Card className="rounded-3xl border-0 shadow-sm"><CardContent className="p-12 text-center"><p className="text-muted-foreground">Nenhum módulo disponível para esta trilha.</p></CardContent></Card>
          ) : (
            <>
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span className="font-medium">Progresso — {activeTrilha}</span>
                  <span className="font-bold text-primary">{Math.round(progress)}% concluído</span>
                </div>
                <Progress value={progress} className="h-2.5 mb-4" />

                {/* Stepper */}
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-5 left-[5%] right-[5%] h-0.5 bg-muted z-0">
                    <div className="h-full bg-primary/60 transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  {modules.map((m, i) => {
                    const done = completed.has(i);
                    const active = i === current;
                    const locked = !done && i > 0 && !completed.has(i - 1) && i !== current;
                    return (
                      <button
                        key={i}
                        onClick={() => !locked && setCurrent(i)}
                        disabled={locked}
                        className={`relative z-10 flex flex-col items-center gap-1.5 group transition-all duration-300 ${locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 text-sm font-bold ${
                          done ? 'bg-primary text-primary-foreground shadow-md' :
                          active ? 'bg-primary/10 text-primary ring-2 ring-primary ring-offset-2 shadow-lg scale-110' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {done ? <CheckCircle2 className="h-5 w-5" /> : locked ? <Lock className="h-4 w-4" /> : i + 1}
                        </div>
                        <span className={`text-[9px] font-medium text-center leading-tight max-w-[70px] ${active ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                          {m.titulo.length > 18 ? m.titulo.substring(0, 16) + '…' : m.titulo}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Split Layout: Content LEFT + Quiz RIGHT */}
              <div className={`grid lg:grid-cols-2 gap-6 transition-all duration-500 ease-out ${transitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                {/* LEFT: Trail Content */}
                <Card className="rounded-3xl shadow-sm border-0 flex flex-col">
                  <CardHeader className="pb-3">
                    <Badge variant="outline" className="w-fit rounded-full text-[10px] font-semibold mb-2">
                      Etapa {current + 1} de {modules.length}
                    </Badge>
                    <CardTitle className="text-xl text-foreground">{mod?.titulo}</CardTitle>
                    <p className="text-sm text-primary font-medium">{mod?.subtitulo}</p>
                  </CardHeader>
                  <ScrollArea className="flex-1">
                    <CardContent className="space-y-5 pb-6">
                      {/* Checklist */}
                      {mod?.checklist && mod.checklist.length > 0 && (
                        <div className="bg-primary/5 rounded-2xl p-5">
                          <p className="text-xs font-bold text-primary mb-3 flex items-center gap-2">
                            <Target className="h-3.5 w-3.5" /> O que você vai aprender
                          </p>
                          <ul className="space-y-2">
                            {mod.checklist.map((item, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Content */}
                      {mod?.conteudo && (
                        <div className="space-y-3">
                          {mod.conteudo.split('\n').filter(Boolean).map((line, i) => (
                            <p key={i} className="text-muted-foreground leading-relaxed">{line}</p>
                          ))}
                        </div>
                      )}

                      {/* Points badge */}
                      <div className="flex items-center gap-2 pt-2">
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 rounded-full gap-1">
                          <Star className="h-3 w-3" /> +{mod?.pontos} pts
                        </Badge>
                        {completed.has(current) && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 rounded-full gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Concluído
                          </Badge>
                        )}
                      </div>

                      {/* Navigation */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <Button variant="outline" className="rounded-full px-6 gap-2" onClick={goPrev} disabled={current === 0}>
                          <ArrowLeft className="h-4 w-4" /> Voltar
                        </Button>
                        {current < modules.length - 1 ? (
                          <Button className="rounded-full px-8 gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all" onClick={goNext} disabled={!completed.has(current)}>
                            Próxima Etapa <ArrowRight className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button className="rounded-full px-8 gap-2 shadow-md" disabled={!isComplete} onClick={() => {}}>
                            <CheckCircle2 className="h-4 w-4" /> Trilha Concluída
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </ScrollArea>
                </Card>

                {/* RIGHT: Quiz */}
                <QuizPanel
                  questions={quizMap[mod?.id] || []}
                  moduleTitle={mod?.titulo || ''}
                  onComplete={handleQuizComplete}
                  completed={completed.has(current)}
                />
              </div>

              {/* Completion Card */}
              {isComplete && (
                <Card className="rounded-3xl border-0 shadow-2xl mt-8 overflow-hidden">
                  <div className="institutional-gradient p-8 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-foreground/20 backdrop-blur-sm mb-4">
                      <Award className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary-foreground mb-2">Trilha {activeTrilha} Concluída!</h3>
                    <p className="text-primary-foreground/80 text-lg">
                      Parabéns, <span className="font-semibold">{userName}</span>!
                      Você obteve <span className="font-bold">{totalPoints} pontos</span> e alcançou o nível <span className="font-bold">{currentLevel.name}</span>.
                    </p>
                  </div>
                  <CardContent className="p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Button className="rounded-full gap-2 px-8 py-6 text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all" onClick={() => generateCertificate(userName, totalPoints, activeTrilha)}>
                        <Download className="h-5 w-5" /> Baixar Certificado PDF
                      </Button>
                      {!saved ? (
                        <Button variant="outline" className="rounded-full gap-2 px-8 py-6 text-base" onClick={saveProgress}>
                          <Trophy className="h-5 w-5" /> Salvar no Ranking
                        </Button>
                      ) : (
                        <span className="text-sm text-primary font-medium flex items-center gap-1"><CheckCircle2 className="h-5 w-5" /> Salvo!</span>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-6">
                      {unlockedAchievements.map((a) => (
                        <div key={a.id} className="flex flex-col items-center gap-1.5">
                          <span className="text-3xl">{a.icon}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{a.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>

      {/* Ranking Dialog */}
      <Dialog open={showRanking} onOpenChange={setShowRanking}>
        <DialogContent className="rounded-2xl max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" /> Ranking</DialogTitle></DialogHeader><RankingList ranking={ranking} loading={rankingLoading} /></DialogContent>
      </Dialog>

      <footer className="border-t bg-card px-6 py-4 text-center text-sm text-muted-foreground" role="contentinfo">
        Secretaria de Planejamento e Gestão – Governo do Estado de Mato Grosso
      </footer>
    </div>
  );
};

export default Aprendizagem;
