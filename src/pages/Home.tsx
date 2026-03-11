import { useNavigate } from 'react-router-dom';
import { Building2, FileText, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="institutional-gradient px-6 py-4 flex items-center gap-3 shadow-lg">
        <Building2 className="h-8 w-8 text-primary-foreground" />
        <div>
          <h1 className="text-lg font-bold text-primary-foreground leading-tight">SEPLAG</h1>
          <p className="text-xs text-primary-foreground/80">Mato Grosso</p>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <FileText className="h-4 w-4" />
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="text-lg px-10 py-6 shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-300"
              onClick={() => navigate('/cadastro')}
            >
              Acessar Sistema
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-10 py-6 border-primary/30 text-primary hover:bg-primary/5 active:scale-[0.98] transition-all duration-300"
              onClick={() => navigate('/admin')}
            >
              <BarChart3 className="h-5 w-5 mr-2" aria-hidden="true" />
              Painel Administrativo
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8 max-w-md mx-auto">
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
      <footer className="border-t bg-card px-6 py-4 text-center text-sm text-muted-foreground">
        Secretaria de Planejamento e Gestão – Governo do Estado de Mato Grosso
      </footer>
    </div>
  );
};

export default Home;
