import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Building2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Confirmacao = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const protocolo = params.get('protocolo') || '';
  const { toast } = useToast();

  const copyProtocolo = () => {
    navigator.clipboard.writeText(protocolo);
    toast({ title: 'Protocolo copiado!' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="institutional-gradient px-6 py-4 flex items-center gap-3 shadow-lg">
        <Building2 className="h-7 w-7 text-primary-foreground" />
        <h1 className="text-lg font-bold text-primary-foreground">Central de Atendimento – SEPLAG MT</h1>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-card rounded-xl shadow-lg border p-10 text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">Solicitação registrada com sucesso!</h2>
            {protocolo && (
              <div className="flex items-center justify-center gap-2 bg-muted rounded-lg px-4 py-3">
                <span className="text-sm text-muted-foreground">Protocolo:</span>
                <span className="font-mono font-bold text-foreground">{protocolo}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyProtocolo}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <p className="text-muted-foreground leading-relaxed">
              Um e-mail de confirmação foi enviado para o endereço informado.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Nossa equipe responderá dentro do prazo estabelecido.
            </p>
          </div>

          <Button className="px-10 py-5 text-base" onClick={() => navigate('/')}>
            Voltar ao Início
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Confirmacao;
