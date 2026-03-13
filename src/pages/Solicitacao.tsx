import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, ArrowLeft, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TIPOS_ATENDIMENTO, TipoAtendimento, CATEGORIAS, CategoriaDemanda, ASSUNTOS, Assunto, IMPACTOS, Impacto } from '@/types/solicitacao';
import { addSolicitacaoDb, useCustomAssuntos } from '@/hooks/use-supabase-data';
import { supabase } from '@/integrations/supabase/client';

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
  const [categoria, setCategoria] = useState<CategoriaDemanda | ''>('');
  const [assunto, setAssunto] = useState<string>('');
  const [impacto, setImpacto] = useState<Impacto | ''>('');
  const { assuntos: customAssuntos } = useCustomAssuntos();
  const allAssuntos = [...ASSUNTOS, ...customAssuntos];
  const nome = params.get('nome') || '';
  const email = params.get('email') || '';
  const secretaria = params.get('secretaria') || '';
  const setor = params.get('setor') || '';

  const isValid = tipo && descricao.trim() && categoria && assunto && impacto;

  const [enviando, setEnviando] = useState(false);

  const handleEnviar = async () => {
    if (!isValid || enviando) return;
    setEnviando(true);
    try {
      const sol = await addSolicitacaoDb({
        nome, email, secretaria, setor,
        tipo: tipo as TipoAtendimento,
        descricao: descricao.trim(),
        categoria: categoria as CategoriaDemanda,
        assunto: assunto as Assunto,
        impacto: impacto as Impacto,
        prioridade: tipo === 'Urgência' ? 'Urgente' : 'Normal',
        canal: 'Web',
      });

      // Send confirmation email via edge function
      try {
        await supabase.functions.invoke('send-confirmation-email', {
          body: {
            to: email,
            nome,
            protocolo: sol.protocolo,
            tipo: sol.tipo,
            categoria: sol.categoria,
            assunto: sol.assunto,
            impacto: sol.impacto,
            descricao: sol.descricao,
            secretaria,
            setor,
            prioridade: sol.prioridade,
            slaLimite: sol.slaLimite,
            data: sol.data,
          },
        });
      } catch (emailErr) {
        console.error('Erro ao enviar e-mail:', emailErr);
      }

      // Sync to Google Sheets
      try {
        await supabase.functions.invoke('sync-google-sheets', {
          body: {
            protocolo: sol.protocolo,
            nome,
            email,
            secretaria,
            setor,
            tipo: sol.tipo,
            categoria: sol.categoria,
            assunto: sol.assunto,
            impacto: sol.impacto,
            prioridade: sol.prioridade,
            descricao: sol.descricao,
            data: sol.data,
            status: sol.status,
            responsavel: '',
            dataEnvio: new Date().toISOString(),
            validacao: '',
          },
        });
      } catch (sheetErr) {
        console.error('Erro ao sincronizar com Google Sheets:', sheetErr);
      }

      navigate(`/confirmacao?protocolo=${sol.protocolo}`);
    } catch (err) {
      console.error('Erro ao salvar solicitação:', err);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="institutional-gradient px-6 py-4 flex items-center gap-3 shadow-lg">
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate(-1)} aria-label="Voltar à página anterior">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Building2 className="h-7 w-7 text-primary-foreground" aria-hidden="true" />
        <h1 className="text-lg font-bold text-primary-foreground">Nova Solicitação</h1>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-card rounded-xl shadow-lg border p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Tipo de Atendimento</h2>
            <p className="text-muted-foreground text-sm mt-1">Preencha os detalhes da sua solicitação</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de atendimento</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoAtendimento)}>
                <SelectTrigger id="tipo" aria-label="Selecione o tipo de atendimento"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>
                  {TIPOS_ATENDIMENTO.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {tipo === 'Dúvida' && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary" role="status">
                <Clock className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                Prazo médio de resposta: até 3 dias úteis.
              </div>
            )}
            {tipo === 'Urgência' && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                Essa solicitação será priorizada pela equipe técnica. SLA: 1 dia útil.
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria da Demanda</Label>
              <Select value={categoria} onValueChange={(v) => setCategoria(v as CategoriaDemanda)}>
                <SelectTrigger id="categoria" aria-label="Selecione a categoria"><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assunto">Assunto</Label>
              <Select value={assunto} onValueChange={(v) => setAssunto(v as Assunto)}>
                <SelectTrigger id="assunto" aria-label="Selecione o assunto"><SelectValue placeholder="Selecione o assunto" /></SelectTrigger>
                <SelectContent>
                  {allAssuntos.map((a) => (<SelectItem key={a} value={a}>{a}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="impacto">Impacto</Label>
              <Select value={impacto} onValueChange={(v) => setImpacto(v as Impacto)}>
                <SelectTrigger id="impacto" aria-label="Selecione o impacto"><SelectValue placeholder="Selecione o impacto" /></SelectTrigger>
                <SelectContent>
                  {IMPACTOS.map((i) => (<SelectItem key={i} value={i}>{i}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {tipo && (
              <div className="space-y-2">
                <Label htmlFor="descricao">{LABELS[tipo as TipoAtendimento]}</Label>
                <Textarea
                  id="descricao"
                  placeholder="Escreva aqui..."
                  className="min-h-[150px] resize-none"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  aria-required="true"
                />
              </div>
            )}
          </div>

          <Button className="w-full py-6 text-lg" disabled={!isValid || enviando} onClick={handleEnviar} aria-label="Enviar solicitação">
            {enviando ? 'Enviando...' : 'Enviar Solicitação'}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SolicitacaoPage;
