import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, ArrowLeft, ArrowRight, CheckCircle2, BookOpen, Search,
  Trophy, Star, Award, Download, Zap, Medal, Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

import step1Img from '@/assets/siad-step1.jpg';
import step2Img from '@/assets/siad-step2.jpg';
import step3Img from '@/assets/siad-step3.jpg';
import step4Img from '@/assets/siad-step4.jpg';
import step5Img from '@/assets/siad-step5.jpg';
import step6Img from '@/assets/siad-step6.jpg';

const POINTS_PER_STEP = [15, 15, 20, 15, 20, 15]; // total = 100

const steps = [
  {
    title: 'O que é o SIAD',
    image: step1Img,
    points: POINTS_PER_STEP[0],
    content: [
      'O SIAD é um sistema digital utilizado pelo governo para organizar e acompanhar a avaliação anual de desempenho dos servidores públicos.',
      'Ele ajuda a tornar o processo de avaliação mais transparente, organizado e fácil de acompanhar.',
    ],
  },
  {
    title: 'Por que o SIAD foi criado',
    image: step2Img,
    points: POINTS_PER_STEP[1],
    content: [
      'O sistema foi criado para melhorar a gestão de desempenho e organizar o processo de avaliação dos servidores.',
      'Ele traz mais transparência e moderniza a administração pública, substituindo processos manuais em papel por uma plataforma digital eficiente.',
    ],
  },
  {
    title: 'Como funciona a avaliação',
    image: step3Img,
    points: POINTS_PER_STEP[2],
    content: [
      'O processo segue 6 fases:',
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
    image: step4Img,
    points: POINTS_PER_STEP[3],
    content: [
      'Servidor Avaliado – o profissional que terá seu desempenho analisado.',
      'Gestor Avaliador – responsável pela avaliação direta.',
      'Comissão de Avaliação – grupo que valida e analisa os resultados.',
      'Área de Gestão de Pessoas – setor que coordena todo o processo dentro do órgão.',
    ],
  },
  {
    title: 'Como acompanhar a avaliação',
    image: step5Img,
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
    title: 'Central de Dúvidas',
    image: step6Img,
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
  concluido_em: string | null;
}

// ── PDF Certificate Generator ──
function generateCertificate(nome: string, pontuacao: number) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Border
  doc.setDrawColor(0, 60, 120);
  doc.setLineWidth(2);
  doc.rect(10, 10, w - 20, h - 20);
  doc.setLineWidth(0.5);
  doc.rect(14, 14, w - 28, h - 28);

  // Header
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('GOVERNO DO ESTADO DE MATO GROSSO', w / 2, 32, { align: 'center' });
  doc.text('SECRETARIA DE PLANEJAMENTO E GESTÃO – SEPLAG', w / 2, 39, { align: 'center' });

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(0, 60, 120);
  doc.text('CERTIFICADO DE CONCLUSÃO', w / 2, 60, { align: 'center' });

  // Divider
  doc.setDrawColor(0, 60, 120);
  doc.setLineWidth(0.8);
  doc.line(w / 2 - 60, 66, w / 2 + 60, 66);

  // Body
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  doc.text('Certificamos que', w / 2, 82, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(0, 60, 120);
  doc.text(nome.toUpperCase(), w / 2, 96, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(50, 50, 50);
  const bodyLines = [
    'concluiu com êxito a Trilha de Aprendizagem sobre o SIAD –',
    'Sistema de Avaliação de Desempenho do Servidor Público,',
    `obtendo a pontuação de ${pontuacao} de 100 pontos.`,
  ];
  bodyLines.forEach((line, i) => {
    doc.text(line, w / 2, 110 + i * 7, { align: 'center' });
  });

  // Date
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.setFontSize(11);
  doc.text(`Cuiabá-MT, ${dateStr}`, w / 2, 148, { align: 'center' });

  // Signature line
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.4);
  doc.line(w / 2 - 50, 170, w / 2 + 50, 170);
  doc.setFontSize(10);
  doc.text('Coordenação de Gestão de Pessoas', w / 2, 176, { align: 'center' });

  doc.save(`Certificado_SIAD_${nome.replace(/\s+/g, '_')}.pdf`);
}

// ── Ranking medal helper ──
function RankMedal({ position }: { position: number }) {
  if (position === 0) return <Crown className="h-5 w-5 text-amber-500" />;
  if (position === 1) return <Medal className="h-5 w-5 text-muted-foreground" />;
  if (position === 2) return <Medal className="h-5 w-5 text-amber-700" />;
  return <span className="text-sm font-semibold text-muted-foreground">{position + 1}º</span>;
}

// ══════════════════════════════════════════════
const Aprendizagem = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [faqSearch, setFaqSearch] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [started, setStarted] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const step = steps[current];
  const totalPoints = useMemo(
    () => Array.from(completed).reduce((sum, i) => sum + POINTS_PER_STEP[i], 0),
    [completed],
  );
  const progress = (completed.size / steps.length) * 100;
  const isComplete = completed.size === steps.length;

  // ── Fetch ranking ──
  const fetchRanking = async () => {
    setRankingLoading(true);
    const { data } = await supabase
      .from('trilha_progresso')
      .select('id, nome, pontuacao, concluido_em')
      .eq('concluido', true)
      .order('pontuacao', { ascending: false })
      .order('concluido_em', { ascending: true })
      .limit(20);
    setRanking((data as RankingEntry[]) || []);
    setRankingLoading(false);
  };

  useEffect(() => {
    fetchRanking();
  }, []);

  // ── Save progress to DB ──
  const saveProgress = async () => {
    if (saved) return;
    const { error } = await supabase.from('trilha_progresso').insert({
      nome: userName,
      email: userEmail,
      etapas_concluidas: Array.from(completed),
      pontuacao: totalPoints,
      concluido: true,
      concluido_em: new Date().toISOString(),
    });
    if (!error) {
      setSaved(true);
      toast.success('Progresso salvo com sucesso!');
      fetchRanking();
    } else {
      toast.error('Erro ao salvar progresso.');
    }
  };

  // ── Step navigation ──
  const goNext = () => {
    if (!completed.has(current)) {
      toast.success(`+${step.points} pontos!`, { icon: <Zap className="h-4 w-4 text-amber-500" /> });
    }
    setCompleted((prev) => new Set(prev).add(current));
    if (current < steps.length - 1) setCurrent(current + 1);
  };

  const goPrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const handleFinish = () => {
    if (!completed.has(current)) {
      toast.success(`+${step.points} pontos!`, { icon: <Zap className="h-4 w-4 text-amber-500" /> });
    }
    setCompleted((prev) => new Set(prev).add(current));
  };

  const filteredSuggestions = faqSearch.trim()
    ? faqSuggestions.filter((s) => s.toLowerCase().includes(faqSearch.toLowerCase()))
    : faqSuggestions;

  // ── Enrollment screen ──
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
        <main className="flex-1 px-4 flex items-center justify-center" role="main">
          <Card className="max-w-md w-full rounded-2xl shadow-xl border-0">
            <CardContent className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <BookOpen className="h-10 w-10 text-primary mx-auto" />
                <h2 className="text-2xl font-bold text-foreground">Trilha de Aprendizagem – SIAD</h2>
                <p className="text-muted-foreground text-sm">
                  Complete 6 etapas, acumule pontos e receba seu certificado de conclusão.
                </p>
              </div>
              <div className="flex items-center justify-center gap-6 text-center">
                <div>
                  <Star className="h-6 w-6 text-amber-500 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">100 pontos</p>
                </div>
                <div>
                  <Award className="h-6 w-6 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Certificado PDF</p>
                </div>
                <div>
                  <Trophy className="h-6 w-6 text-amber-600 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Ranking</p>
                </div>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="Seu nome completo"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="rounded-full h-12 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
                />
                <Input
                  placeholder="Seu e-mail institucional"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="rounded-full h-12 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/30"
                />
              </div>
              <Button
                className="w-full rounded-full h-12 text-base gap-2"
                disabled={!userName.trim() || !userEmail.trim()}
                onClick={() => setStarted(true)}
              >
                <Zap className="h-4 w-4" />
                Iniciar Trilha
              </Button>
              <Button
                variant="ghost"
                className="w-full rounded-full gap-2 text-muted-foreground"
                onClick={() => { setShowRanking(true); fetchRanking(); }}
              >
                <Trophy className="h-4 w-4" />
                Ver Ranking
              </Button>
            </CardContent>
          </Card>
        </main>

        {/* Ranking dialog */}
        <Dialog open={showRanking} onOpenChange={setShowRanking}>
          <DialogContent className="rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" /> Ranking de Conclusão
              </DialogTitle>
            </DialogHeader>
            <RankingList ranking={ranking} loading={rankingLoading} />
          </DialogContent>
        </Dialog>

        <footer className="border-t bg-card px-6 py-4 text-center text-sm text-muted-foreground" role="contentinfo">
          Secretaria de Planejamento e Gestão – Governo do Estado de Mato Grosso
        </footer>
      </div>
    );
  }

  // ── Main trail ──
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="institutional-gradient px-6 py-4 flex items-center gap-3 shadow-lg" role="banner">
        <Building2 className="h-8 w-8 text-primary-foreground" aria-hidden="true" />
        <div>
          <h1 className="text-lg font-bold text-primary-foreground leading-tight">SEPLAG</h1>
          <p className="text-xs text-primary-foreground/80">Mato Grosso</p>
        </div>
      </header>

      <main className="flex-1 px-4 py-10" role="main">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6 gap-2 text-muted-foreground hover:text-foreground rounded-full"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Portal
          </Button>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Trilha SIAD</h2>
            </div>
            {/* Points badge */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => { setShowRanking(true); fetchRanking(); }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Trophy className="h-4 w-4" /> Ranking
              </button>
              <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 px-4 py-2 rounded-full font-semibold text-sm">
                <Star className="h-4 w-4" />
                {totalPoints} pts
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Progresso de aprendizagem</span>
              <span className="font-semibold text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between mt-3">
              {steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`flex flex-col items-center gap-1 transition-all duration-300`}
                  aria-label={`Etapa ${i + 1}: ${s.title}`}
                >
                  <span
                    className={`flex items-center justify-center w-9 h-9 rounded-full text-xs font-semibold transition-all duration-300 ${
                      i === current
                        ? 'bg-primary text-primary-foreground shadow-md scale-110'
                        : completed.has(i)
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {completed.has(i) ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </span>
                  {completed.has(i) && (
                    <span className="text-[10px] font-medium text-amber-600">+{POINTS_PER_STEP[i]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step Card */}
          <Card className="rounded-2xl shadow-lg border-0 overflow-hidden mb-8">
            <div className="relative">
              <img src={step.image} alt={step.title} className="w-full h-56 md:h-72 object-cover" loading="lazy" />
              <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1 text-sm font-semibold text-amber-600">
                <Star className="h-3.5 w-3.5" /> +{step.points} pts
              </div>
            </div>
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-1">
                Etapa {current + 1} de {steps.length}
              </h3>
              <p className="text-primary font-semibold text-lg mb-5">{step.title}</p>
              <div className="space-y-3">
                {step.content.map((line, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed">{line}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mb-12">
            <Button variant="outline" className="rounded-full px-6 gap-2" onClick={goPrev} disabled={current === 0}>
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
            {current < steps.length - 1 ? (
              <Button className="rounded-full px-8 gap-2" onClick={goNext}>
                Avançar <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button className="rounded-full px-8 gap-2" onClick={handleFinish}>
                <CheckCircle2 className="h-4 w-4" /> Concluir Trilha
              </Button>
            )}
          </div>

          {/* Completion */}
          {isComplete && (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 text-center mb-12 space-y-4">
              <Award className="h-14 w-14 text-primary mx-auto" />
              <h3 className="text-2xl font-bold text-foreground">Trilha Concluída!</h3>
              <p className="text-muted-foreground">
                Parabéns, <span className="font-semibold text-foreground">{userName}</span>!
                Você obteve <span className="font-bold text-primary">{totalPoints} pontos</span> de 100.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  className="rounded-full gap-2 px-6"
                  onClick={() => generateCertificate(userName, totalPoints)}
                >
                  <Download className="h-4 w-4" /> Baixar Certificado PDF
                </Button>
                {!saved && (
                  <Button variant="outline" className="rounded-full gap-2 px-6" onClick={saveProgress}>
                    <Trophy className="h-4 w-4" /> Salvar no Ranking
                  </Button>
                )}
                {saved && (
                  <span className="text-sm text-primary font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Salvo no ranking!
                  </span>
                )}
              </div>
            </div>
          )}

          {/* FAQ Search */}
          <div className="border-t pt-10">
            <h3 className="text-xl font-bold text-foreground mb-4">Dúvidas sobre o SIAD</h3>
            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Digite sua dúvida sobre o SIAD ou avaliação de desempenho..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="pl-11 rounded-full bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/30 h-12"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setFaqSearch(s)}
                  className="px-4 py-2 rounded-full bg-muted text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Ranking Dialog */}
      <Dialog open={showRanking} onOpenChange={setShowRanking}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" /> Ranking de Conclusão
            </DialogTitle>
          </DialogHeader>
          <RankingList ranking={ranking} loading={rankingLoading} />
        </DialogContent>
      </Dialog>

      <footer className="border-t bg-card px-6 py-4 text-center text-sm text-muted-foreground" role="contentinfo">
        Secretaria de Planejamento e Gestão – Governo do Estado de Mato Grosso
      </footer>
    </div>
  );
};

// ── Ranking List Component ──
function RankingList({ ranking, loading }: { ranking: RankingEntry[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (ranking.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-6 text-sm">
        Nenhum servidor concluiu a trilha ainda. Seja o primeiro!
      </p>
    );
  }

  return (
    <div className="space-y-2 py-2 max-h-80 overflow-y-auto">
      {ranking.map((entry, i) => (
        <div
          key={entry.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
            i === 0 ? 'bg-amber-500/10' : 'hover:bg-muted/50'
          }`}
        >
          <div className="w-8 flex justify-center">
            <RankMedal position={i} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{entry.nome}</p>
            {entry.concluido_em && (
              <p className="text-[11px] text-muted-foreground">
                {new Date(entry.concluido_em).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-amber-600">
            <Star className="h-3.5 w-3.5" /> {entry.pontuacao}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Aprendizagem;
