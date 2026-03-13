import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, HelpCircle, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { useFaqs } from '@/hooks/use-supabase-data';

const Faq = () => {
  const navigate = useNavigate();
  const { faqs, loading } = useFaqs();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return faqs;
    const q = search.toLowerCase();
    return faqs.filter(
      (f) => f.pergunta.toLowerCase().includes(q) || f.resposta.toLowerCase().includes(q)
    );
  }, [faqs, search]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="institutional-gradient px-6 py-4 flex items-center gap-3 shadow-lg" role="banner">
        <Building2 className="h-8 w-8 text-primary-foreground" aria-hidden="true" />
        <div>
          <h1 className="text-lg font-bold text-primary-foreground leading-tight">SEPLAG</h1>
          <p className="text-xs text-primary-foreground/80">Mato Grosso</p>
        </div>
      </header>

      <main className="flex-1 px-4 py-16" role="main">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            className="mb-8 gap-2 text-muted-foreground hover:text-foreground rounded-full"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Portal
          </Button>

          <div className="flex items-center gap-2 mb-8">
            <HelpCircle className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="text-3xl font-bold text-foreground">Perguntas Frequentes</h2>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Buscar nas perguntas frequentes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 rounded-full bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:bg-card transition-all duration-300 h-12"
              aria-label="Buscar perguntas frequentes"
            />
          </div>

          {/* FAQ list */}
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
            ) : filtered.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-3">
                {filtered.map((faq) => (
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
            ) : search ? (
              <div className="bg-muted/30 rounded-2xl p-10 text-center">
                <p className="text-muted-foreground">Nenhuma pergunta encontrada para "{search}".</p>
              </div>
            ) : (
              <div className="bg-muted/30 rounded-2xl p-10 text-center">
                <p className="text-muted-foreground">Nenhuma pergunta frequente cadastrada ainda.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t bg-card px-6 py-4 text-center text-sm text-muted-foreground" role="contentinfo">
        Secretaria de Planejamento e Gestão – Governo do Estado de Mato Grosso
      </footer>
    </div>
  );
};

export default Faq;
