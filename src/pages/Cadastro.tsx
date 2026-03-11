import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ORGAOS_POR_CATEGORIA } from '@/types/solicitacao';

const Cadastro = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '',
    email: '',
    secretaria: '',
    setor: '',
  });

  const isValid = form.nome && form.email && form.secretaria && form.setor;

  const handleContinuar = () => {
    if (!isValid) return;
    const params = new URLSearchParams(form);
    navigate(`/solicitacao?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="institutional-gradient px-6 py-4 flex items-center gap-3 shadow-lg">
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Building2 className="h-7 w-7 text-primary-foreground" />
        <h1 className="text-lg font-bold text-primary-foreground">Central de Atendimento – SEPLAG MT</h1>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-card rounded-xl shadow-lg border p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Dados do Servidor</h2>
            <p className="text-muted-foreground text-sm mt-1">Preencha seus dados para continuar</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input id="nome" placeholder="Seu nome completo" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail Institucional</Label>
              <Input id="email" type="email" placeholder="nome@mt.gov.br" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Secretaria / Órgão</Label>
              <Select value={form.secretaria} onValueChange={(v) => setForm({ ...form, secretaria: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o órgão" />
                </SelectTrigger>
                <SelectContent>
                  {ORGAOS_POR_CATEGORIA.map((cat) => (
                    <SelectGroup key={cat.categoria}>
                      <SelectLabel className="font-semibold text-primary">{cat.categoria}</SelectLabel>
                      {cat.orgaos.map((orgao) => (
                        <SelectItem key={orgao} value={orgao}>{orgao}</SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="setor">Unidade / Setor</Label>
              <Input id="setor" placeholder="Informe seu setor" value={form.setor} onChange={(e) => setForm({ ...form, setor: e.target.value })} />
            </div>
          </div>

          <Button className="w-full py-6 text-lg" disabled={!isValid} onClick={handleContinuar}>
            Continuar
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Cadastro;
