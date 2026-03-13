import { useNavigate } from 'react-router-dom';
import { Building2, FileText, BarChart3, HelpCircle, MessageSquare, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
      <main className="flex-1 px-4 flex items-center justify-center" role="main">
        <div className="max-w-2xl mx-auto text-center space-y-10 py-16">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-medium text-primary mb-4">
              <FileText className="h-4 w-4" aria-hidden="true" />
              Sistema Institucional
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Central de Atendimento
            </h2>
            <p className="text-lg text-primary font-semibold">SEPLAG MT</p>
          </div>

          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Sistema institucional para registro de dúvidas, sugestões e solicitações
            relacionadas aos serviços da SEPLAG e aos sistemas estaduais.
          </p>

          {/* Trilha SIAD CTA Card */}
          <Card
            className="rounded-3xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group overflow-hidden"
            onClick={() => navigate('/aprendizagem')}
          >
            <CardContent className="p-0">
              <div className="flex items-center gap-5 p-6">
                <div className="shrink-0 w-14 h-14 rounded-2xl institutional-gradient flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                  <BookOpen className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-base font-bold text-foreground">Novo por aqui? Conheça a Trilha SIAD</p>
                    <Badge />
                  </div>
                  <p className="text-sm text-muted-foreground">Aprenda tudo sobre o Sistema de Avaliação de Desempenho em uma trilha interativa e gamificada.</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            </CardContent>
          </Card>

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

          <div className="grid grid-cols-3 gap-8 pt-8 max-w-md mx-auto">
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
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card px-6 py-4 text-center text-sm text-muted-foreground" role="contentinfo">
        Secretaria de Planejamento e Gestão – Governo do Estado de Mato Grosso
      </footer>
    </div>
  );
};

// Small inline badge component
function Badge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
      <Sparkles className="h-3 w-3" /> Novo
    </span>
  );
}

export default Home;
