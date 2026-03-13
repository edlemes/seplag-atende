import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, ArrowRight, CheckCircle2, BookOpen, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

import step1Img from '@/assets/siad-step1.jpg';
import step2Img from '@/assets/siad-step2.jpg';
import step3Img from '@/assets/siad-step3.jpg';
import step4Img from '@/assets/siad-step4.jpg';
import step5Img from '@/assets/siad-step5.jpg';
import step6Img from '@/assets/siad-step6.jpg';

const steps = [
  {
    title: 'O que é o SIAD',
    image: step1Img,
    content: [
      'O SIAD é um sistema digital utilizado pelo governo para organizar e acompanhar a avaliação anual de desempenho dos servidores públicos.',
      'Ele ajuda a tornar o processo de avaliação mais transparente, organizado e fácil de acompanhar.',
    ],
  },
  {
    title: 'Por que o SIAD foi criado',
    image: step2Img,
    content: [
      'O sistema foi criado para melhorar a gestão de desempenho e organizar o processo de avaliação dos servidores.',
      'Ele traz mais transparência e moderniza a administração pública, substituindo processos manuais em papel por uma plataforma digital eficiente.',
    ],
  },
  {
    title: 'Como funciona a avaliação',
    image: step3Img,
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

const Aprendizagem = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [faqSearch, setFaqSearch] = useState('');

  const step = steps[current];
  const progress = ((completed.size) / steps.length) * 100;

  const goNext = () => {
    setCompleted((prev) => new Set(prev).add(current));
    if (current < steps.length - 1) setCurrent(current + 1);
  };

  const goPrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const filteredSuggestions = faqSearch.trim()
    ? faqSuggestions.filter((s) => s.toLowerCase().includes(faqSearch.toLowerCase()))
    : faqSuggestions;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="institutional-gradient px-6 py-4 flex items-center gap-3 shadow-lg" role="banner">
        <Building2 className="h-8 w-8 text-primary-foreground" aria-hidden="true" />
        <div>
          <h1 className="text-lg font-bold text-primary-foreground leading-tight">SEPLAG</h1>
          <p className="text-xs text-primary-foreground/80">Mato Grosso</p>
        </div>
      </header>

      <main className="flex-1 px-4 py-10" role="main">
        <div className="max-w-3xl mx-auto">
          {/* Back */}
          <Button
            variant="ghost"
            className="mb-6 gap-2 text-muted-foreground hover:text-foreground rounded-full"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Portal
          </Button>

          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Trilha de Aprendizagem – SIAD</h2>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Progresso de aprendizagem</span>
              <span className="font-semibold text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            {/* Step indicators */}
            <div className="flex justify-between mt-3">
              {steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`flex items-center justify-center w-9 h-9 rounded-full text-xs font-semibold transition-all duration-300 ${
                    i === current
                      ? 'bg-primary text-primary-foreground shadow-md scale-110'
                      : completed.has(i)
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                  aria-label={`Etapa ${i + 1}: ${s.title}`}
                >
                  {completed.has(i) ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Step Card */}
          <Card className="rounded-2xl shadow-lg border-0 overflow-hidden mb-8">
            <img
              src={step.image}
              alt={step.title}
              className="w-full h-56 md:h-72 object-cover"
              loading="lazy"
            />
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
            <Button
              variant="outline"
              className="rounded-full px-6 gap-2"
              onClick={goPrev}
              disabled={current === 0}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            {current < steps.length - 1 ? (
              <Button className="rounded-full px-8 gap-2" onClick={goNext}>
                Avançar
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                className="rounded-full px-8 gap-2"
                onClick={() => {
                  setCompleted((prev) => new Set(prev).add(current));
                }}
              >
                <CheckCircle2 className="h-4 w-4" />
                Concluir Trilha
              </Button>
            )}
          </div>

          {/* Completion badge */}
          {completed.size === steps.length && (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 text-center mb-12">
              <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-bold text-foreground mb-1">Trilha Concluída!</h3>
              <p className="text-muted-foreground">Parabéns! Você concluiu todas as etapas de aprendizagem sobre o SIAD.</p>
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

      <footer className="border-t bg-card px-6 py-4 text-center text-sm text-muted-foreground" role="contentinfo">
        Secretaria de Planejamento e Gestão – Governo do Estado de Mato Grosso
      </footer>
    </div>
  );
};

export default Aprendizagem;
