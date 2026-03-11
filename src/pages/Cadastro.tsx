import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ORGAOS_POR_CATEGORIA } from '@/types/solicitacao';
import { getCustomOrgaos } from '@/lib/storage';

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return phone.replace(/\D/g, '').length >= 10;
}

const Cadastro = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    secretaria: '',
    setor: '',
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const customOrgaos = getCustomOrgaos();
  const emailValid = isValidEmail(form.email);
  const phoneValid = isValidPhone(form.telefone);
  const isValid = form.nome.trim() && emailValid && phoneValid && form.secretaria && form.setor.trim();

  const handlePhoneChange = (value: string) => {
    setForm({ ...form, telefone: formatPhone(value) });
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleContinuar = () => {
    if (!isValid) return;
    const params = new URLSearchParams({
      nome: form.nome,
      email: form.email,
      telefone: form.telefone,
      secretaria: form.secretaria,
      setor: form.setor,
    });
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
              <Input id="nome" placeholder="Seu nome completo" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} onBlur={() => handleBlur('nome')} />
              {touched.nome && !form.nome.trim() && <p className="text-xs text-destructive">Nome é obrigatório.</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail Institucional</Label>
              <Input id="email" type="email" placeholder="nome@mt.gov.br" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} onBlur={() => handleBlur('email')} />
              {touched.email && !emailValid && <p className="text-xs text-destructive">Informe um e-mail válido.</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" placeholder="(65) 99999-9999" value={form.telefone} onChange={(e) => handlePhoneChange(e.target.value)} onBlur={() => handleBlur('telefone')} />
              {touched.telefone && !phoneValid && <p className="text-xs text-destructive">Informe um telefone válido com DDD.</p>}
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
                  {customOrgaos.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="font-semibold text-primary">Órgãos Adicionais</SelectLabel>
                      {customOrgaos.map((orgao) => (
                        <SelectItem key={orgao} value={orgao}>{orgao}</SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="setor">Unidade / Setor</Label>
              <Input id="setor" placeholder="Informe seu setor" value={form.setor} onChange={(e) => setForm({ ...form, setor: e.target.value })} onBlur={() => handleBlur('setor')} />
              {touched.setor && !form.setor.trim() && <p className="text-xs text-destructive">Setor é obrigatório.</p>}
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
