import { useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, FileText, BarChart3, HelpCircle, MessageSquare, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { useFaqs } from '@/hooks/use-supabase-data';

const Home = () => {
  const navigate = useNavigate();
  const { faqs, loading } = useFaqs();
  const faqRef = useRef<HTMLDivElement>(null);
  const [faqSearch, setFaqSearch] = useState('');

  const filteredFaqs = useMemo(() => {
    if (!faqSearch.trim()) return faqs;
    const q = faqSearch.toLowerCase();
    return faqs.filter(
      (f) => f.pergunta.toLowerCase().includes(q) || f.resposta.toLowerCase().includes(q)
    );
  }, [faqs, faqSearch]);

  const scrollToFaq = () => {
    faqRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
        <div className="max-w-2xl mx-auto text-center space-y-10 py-20">
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

          {/* Apple-style action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Button
              size="lg"
              className="w-full sm:w-auto text-base px-10 py-7 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500 ease-out gap-3 font-medium"
              onClick={() => navigate('/cadastro')}
              aria-label="Abrir um novo chamado de atendimento"
            >
              <MessageSquare className="h-5 w-5" aria-hidden="true" />
              Abrir Chamado
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-base px-10 py-7 rounded-full border-border/60 text-foreground hover:bg-muted/60 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-500 ease-out gap-3 font-medium"
              onClick={scrollToFaq}
              aria-label="Acessar perguntas frequentes"
            >
              <HelpCircle className="h-5 w-5" aria-hidden="true" />
              Acesso ao FAQ
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-base px-10 py-7 rounded-full border-border/60 text-foreground hover:bg-muted/60 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-500 ease-out gap-3 font-medium"
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

        {/* FAQ Section */}
        <div ref={faqRef} className="max-w-2xl mx-auto pb-20" role="region" aria-label="Perguntas frequentes">
          <div className="flex items-center gap-2 mb-8">
            <HelpCircle className="h-6 w-6 text-primary" aria-hidden="true" />
            <h3 className="text-2xl font-bold text-foreground">Perguntas Frequentes</h3>
          </div>

          {/* FAQ Search – Apple-style pill */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Buscar nas perguntas frequentes..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="pl-11 rounded-full bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:bg-card transition-all duration-300 h-12"
              aria-label="Buscar perguntas frequentes"
            />
          </div>

          {/* FAQ cards */}
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-muted/40 rounded-2xl p-6 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredFaqs.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-3">
                {filteredFaqs.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="bg-muted/30 rounded-2xl border-0 px-6 data-[state=open]:bg-card data-[state=open]:shadow-md transition-all duration-300"
                  >
                    <AccordionTrigger className="text-left text-foreground font-medium hover:no-underline py-5">
                      {faq.pergunta}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground whitespace-pre-wrap pb-5">
                      {faq.resposta}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : faqSearch ? (
              <div className="bg-muted/30 rounded-2xl p-10 text-center">
                <p className="text-muted-foreground">Nenhuma pergunta encontrada para "{faqSearch}".</p>
              </div>
            ) : (
              <div className="bg-muted/30 rounded-2xl p-10 text-center">
                <p className="text-muted-foreground">Nenhuma pergunta frequente cadastrada ainda.</p>
              </div>
            )}
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

export default Home;
