import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { getSolicitacaoByProtocoloDb, addAvaliacaoDb } from '@/hooks/use-supabase-data';
import { useToast } from '@/hooks/use-toast';
import { Solicitacao } from '@/types/solicitacao';

const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <div className="flex gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="p-1 transition-colors" aria-label={`${n} de 5 estrelas`} aria-pressed={n <= value}>
          <Star className={`h-7 w-7 ${n <= value ? 'fill-chart-3 text-chart-3' : 'text-muted-foreground/30'}`} />
        </button>
      ))}
    </div>
  </div>
);

const AvaliacaoPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const protocolo = params.get('protocolo') || '';
  const { toast } = useToast();

  const [sol, setSol] = useState<Solicitacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [satisfacao, setSatisfacao] = useState(0);
  const [clareza, setClareza] = useState(0);
  const [tempoResposta, setTempoResposta] = useState(0);
  const [resolvido, setResolvido] = useState<string>('');
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getSolicitacaoByProtocoloDb(protocolo);
      setSol(data);
      setLoading(false);
    }
    load();
  }, [protocolo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-lg space-y-4 p-8">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!sol) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">Protocolo não encontrado.</p>
          <Button onClick={() => navigate('/')}>Voltar ao Início</Button>
        </div>
      </div>
    );
  }

  if (sol.avaliacao) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-foreground font-semibold">Avaliação já registrada!</p>
          <p className="text-muted-foreground">Obrigado pelo seu feedback.</p>
          <Button onClick={() => navigate('/')}>Voltar ao Início</Button>
        </div>
      </div>
    );
  }

  const isValid = satisfacao > 0 && clareza > 0 && tempoResposta > 0 && resolvido;

  const handleSubmit = async () => {
    if (!isValid || enviando) return;
    setEnviando(true);
    try {
      await addAvaliacaoDb(sol.id, {
        satisfacao,
        resolvido: resolvido === 'sim',
        clareza,
        tempoResposta,
        comentario: comentario.trim() || undefined,
        data: new Date().toISOString(),
      });
      toast({ title: 'Avaliação enviada!', description: 'Obrigado pelo seu feedback.' });
      navigate('/');
    } catch {
      toast({ title: 'Erro ao enviar avaliação', variant: 'destructive' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="institutional-gradient px-6 py-4 flex items-center gap-3 shadow-lg" role="banner">
        <Building2 className="h-7 w-7 text-primary-foreground" aria-hidden="true" />
        <h1 className="text-lg font-bold text-primary-foreground">Avaliar Atendimento</h1>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12" role="main">
        <div className="w-full max-w-lg bg-card rounded-xl shadow-lg border p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Avalie o Atendimento</h2>
            <p className="text-muted-foreground text-sm mt-1">Protocolo: <span className="font-mono font-semibold">{protocolo}</span></p>
          </div>

          <div className="space-y-5">
            <StarRating value={satisfacao} onChange={setSatisfacao} label="Satisfação geral" />
            <StarRating value={clareza} onChange={setClareza} label="Clareza da resposta" />
            <StarRating value={tempoResposta} onChange={setTempoResposta} label="Tempo de resposta" />

            <div className="space-y-2">
              <Label>Sua demanda foi resolvida?</Label>
              <RadioGroup value={resolvido} onValueChange={setResolvido} className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="sim" id="sim" />
                  <Label htmlFor="sim" className="cursor-pointer">Sim</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="nao" id="nao" />
                  <Label htmlFor="nao" className="cursor-pointer">Não</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comentario">Comentário (opcional)</Label>
              <Textarea
                id="comentario"
                placeholder="Deixe um comentário sobre o atendimento..."
                className="min-h-[100px] resize-none"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
            </div>
          </div>

          <Button className="w-full py-6 text-lg" disabled={!isValid || enviando} onClick={handleSubmit} aria-label="Enviar avaliação do atendimento">
            {enviando ? 'Enviando...' : 'Enviar Avaliação'}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AvaliacaoPage;
