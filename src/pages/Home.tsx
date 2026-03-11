import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, FileText, BarChart3, HelpCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getFaqs } from '@/lib/storage';

const Home = () => {
  const navigate = useNavigate();
  const faqs = getFaqs();
  const faqRef = useRef<HTMLDivElement>(null);

  const scrollToFaq = () => {
    faqRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      <main className="flex-1 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8 py-16">
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
              className="text-lg px-10 py-6 shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-300 gap-2"
              onClick={() => navigate('/cadastro')}
            >
              <MessageSquare className="h-5 w-5" />
              Abrir Chamado
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-10 py-6 border-primary/30 text-primary hover:bg-primary/5 active:scale-[0.98] transition-all duration-300 gap-2"
              onClick={scrollToFaq}
            >
              <HelpCircle className="h-5 w-5" />
              Acesso ao FAQ
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-10 py-6 border-primary/30 text-primary hover:bg-primary/5 active:scale-[0.98] transition-all duration-300 gap-2"
              onClick={() => navigate('/admin')}
            >
              <BarChart3 className="h-5 w-5" />
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

        {/* FAQ Section */}
        <div ref={faqRef} className="max-w-2xl mx-auto pb-16">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">Perguntas Frequentes</h3>
          </div>
          <div className="bg-card rounded-xl shadow-md border p-6">
            {faqs.length > 0 ? (
              <Accordion type="single" collapsible>
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">{faq.pergunta}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground whitespace-pre-wrap">
                      {faq.resposta}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhuma pergunta frequente cadastrada ainda. O administrador pode adicionar FAQs pelo painel.</p>
            )}
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
