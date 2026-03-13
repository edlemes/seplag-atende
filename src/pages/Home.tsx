import { useNavigate } from 'react-router-dom';
import { Building2, FileText, BarChart3, HelpCircle, MessageSquare, BookOpen, ArrowRight, Sparkles, GraduationCap, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const TRILHAS = [
  {
    id: 'SIAD',
    title: 'SIAD',
    subtitle: 'Sistema de Avaliação de Desempenho',
    desc: 'Aprenda sobre avaliação de desempenho, fluxo de avaliação e papéis dos participantes.',
    icon: Target,
    modules: 6,
  },
  {
    id: 'SIEP',
    title: 'SIEP',
    subtitle: 'Sistema Estadual de Produtividade',
    desc: 'Registro de metas, monitoramento de indicadores e apuração de produtividade.',
    icon: BarChart3,
    modules: 4,
  },
  {
    id: 'BT',
    title: 'Banco de Talentos',
    subtitle: 'Plataforma de Competências',
    desc: 'Cadastro de competências, histórico profissional e oportunidades internas.',
    icon: Users,
    modules: 4,
  },
];

const Home = () => {
  const navigate = useNavigate();

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

      {/* Hero */}
      <main className="flex-1 px-4" role="main">
        <div className="max-w-4xl mx-auto py-16 space-y-12">
          {/* Hero text */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-medium text-primary mb-4">
              <FileText className="h-4 w-4" aria-hidden="true" />
              Sistema Institucional
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Central de Atendimento
            </h2>
            <p className="text-lg text-primary font-semibold">SEPLAG MT</p>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              Sistema institucional para registro de dúvidas, sugestões e solicitações
              relacionadas aos serviços da SEPLAG e aos sistemas estaduais.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Button
              size="lg"
              className="w-full sm:min-w-[220px] text-base px-10 py-7 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500 ease-out gap-3 font-medium"
              onClick={() => navigate('/cadastro')}
              aria-label="Abrir um novo chamado de atendimento"
            >
              <MessageSquare className="h-5 w-5" aria-hidden="true" />
              Abrir Chamado
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:min-w-[220px] text-base px-10 py-7 rounded-full border-border/60 text-foreground hover:bg-muted/60 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-500 ease-out gap-3 font-medium"
              onClick={() => navigate('/faq')}
              aria-label="Acessar perguntas frequentes"
            >
              <HelpCircle className="h-5 w-5" aria-hidden="true" />
              Acesso ao FAQ
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:min-w-[220px] text-base px-10 py-7 rounded-full border-border/60 text-foreground hover:bg-muted/60 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-500 ease-out gap-3 font-medium"
              onClick={() => navigate('/admin')}
              aria-label="Acessar o painel administrativo"
            >
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
              Painel Administrativo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            {[
              { label: 'Registro', value: 'Rápido' },
              { label: 'Resposta', value: '3 dias' },
              { label: 'Dados', value: 'Seguros' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-2xl font-bold text-primary">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>

          {/* ─── Trilhas de Aprendizagem Section ─── */}
          <section className="space-y-6 pt-4">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
                <GraduationCap className="h-3.5 w-3.5" />
                Trilhas de Aprendizagem
                <span className="inline-flex items-center gap-0.5 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[10px]">
                  <Sparkles className="h-2.5 w-2.5" /> Novo
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground">Capacitação Digital do Servidor</h3>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Aprenda sobre os sistemas estaduais de forma interativa, com quizzes por etapa, pontuação e certificado de conclusão.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {TRILHAS.map((trilha) => {
                const Icon = trilha.icon;
                return (
                  <Card
                    key={trilha.id}
                    className="rounded-3xl border-0 shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer group overflow-hidden"
                    onClick={() => navigate('/aprendizagem')}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="w-12 h-12 rounded-2xl institutional-gradient flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                        <Icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-foreground mb-0.5">{trilha.title}</h4>
                        <p className="text-xs text-primary font-medium mb-2">{trilha.subtitle}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{trilha.desc}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground font-medium">{trilha.modules} módulos</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card px-6 py-4 text-center text-sm text-muted-foreground" role="contentinfo">
        Secretaria de Planejamento e Gestão – Governo do Estado de Mato Grosso
      </footer>
    </div>
  );
};

export default Home;
