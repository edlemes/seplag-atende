import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, ArrowLeft, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TIPOS_ATENDIMENTO, TipoAtendimento } from '@/types/solicitacao';
import { addSolicitacao } from '@/lib/storage';

const LABELS: Record<TipoAtendimento, string> = {
  'Dúvida': 'Descreva sua dúvida',
  'Questionamento': 'Qual o questionamento?',
  'Pergunta': 'Qual sua pergunta?',
  'Sugestão': 'Descreva sua sugestão de melhoria',
  'Urgência': 'Descreva a situação urgente',
};

const SolicitacaoPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [tipo, setTipo] = useState<TipoAtendimento | ''>('');
  const [descricao, setDescricao] = useState('');

  const nome = params.get('nome') || '';
  const email = params.get('email') || '';
  const secretaria = params.get('secretaria') || '';
  const setor = params.get('setor') || '';

  const handleEnviar = () => {
    if (!tipo || !descricao.trim()) return;
    addSolicitacao({ nome, email, secretaria, setor, tipo, descricao: descricao.trim() });
    navigate('/confirmacao');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="institutional-gradient px-6 py-4 flex items-center gap-3 shadow-lg">
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Building2 className="h-7 w-7 text-primary-foreground" />
        <h1 className="text-lg font-bold text-primary-foreground">Nova Solicitação</h1>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-card rounded-xl shadow-lg border p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Tipo de Atendimento</h2>
            <p className="text-muted-foreground text-sm mt-1">Selecione o tipo e descreva sua solicitação</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de atendimento</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoAtendimento)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_ATENDIMENTO.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {tipo === 'Dúvida' && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
                <Clock className="h-4 w-4 flex-shrink-0" />
                Prazo médio de resposta: até 3 dias úteis.
              </div>
            )}

            {tipo === 'Urgência' && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                Essa solicitação será priorizada pela equipe técnica.
              </div>
            )}

            {tipo && (
              <div className="space-y-2">
                <Label>{LABELS[tipo]}</Label>
                <Textarea
                  placeholder="Escreva aqui..."
                  className="min-h-[150px] resize-none"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>
            )}
          </div>

          <Button className="w-full py-6 text-lg" disabled={!tipo || !descricao.trim()} onClick={handleEnviar}>
            Enviar Solicitação
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SolicitacaoPage;
