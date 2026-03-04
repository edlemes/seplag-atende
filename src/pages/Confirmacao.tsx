import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Confirmacao = () => {
  const navigate = useNavigate();

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
