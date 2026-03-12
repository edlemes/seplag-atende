import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ORGAOS_POR_CATEGORIA } from '@/types/solicitacao';
import { useCustomOrgaos } from '@/hooks/use-supabase-data';

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
  const [orgaoOpen, setOrgaoOpen] = useState(false);

  const { orgaos: customOrgaos } = useCustomOrgaos();
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

  // Build flat list for combobox
  const allOrgaos = [
    ...ORGAOS_POR_CATEGORIA.flatMap((cat) =>
      cat.orgaos.map((o) => ({ label: o, group: cat.categoria }))
    ),
    ...customOrgaos.map((o) => ({ label: o, group: 'Órgãos Adicionais' })),
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="institutional-gradient px-6 py-4 flex items-center gap-3 shadow-lg" role="banner">
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/')} aria-label="Voltar ao início">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Building2 className="h-7 w-7 text-primary-foreground" aria-hidden="true" />
        <h1 className="text-lg font-bold text-primary-foreground">Central de Atendimento – SEPLAG MT</h1>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12" role="main">
        <div className="w-full max-w-lg bg-card rounded-xl shadow-lg border p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Dados do Servidor</h2>
            <p className="text-muted-foreground text-sm mt-1">Preencha seus dados para continuar</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input id="nome" placeholder="Seu nome completo" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} onBlur={() => handleBlur('nome')} aria-required="true" autoComplete="name" />
              {touched.nome && !form.nome.trim() && <p className="text-xs text-destructive" role="alert">Nome é obrigatório.</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail Institucional</Label>
              <Input id="email" type="email" placeholder="nome@mt.gov.br" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} onBlur={() => handleBlur('email')} aria-required="true" autoComplete="email" />
              {touched.email && !emailValid && <p className="text-xs text-destructive" role="alert">Informe um e-mail válido.</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" placeholder="(65) 99999-9999" value={form.telefone} onChange={(e) => handlePhoneChange(e.target.value)} onBlur={() => handleBlur('telefone')} aria-required="true" autoComplete="tel" />
              {touched.telefone && !phoneValid && <p className="text-xs text-destructive" role="alert">Informe um telefone válido com DDD.</p>}
            </div>

            <div className="space-y-2">
              <Label>Secretaria / Órgão</Label>
              <Popover open={orgaoOpen} onOpenChange={setOrgaoOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={orgaoOpen}
                    aria-label="Selecione o órgão"
                    className="w-full justify-between font-normal text-left h-10"
                  >
                    {form.secretaria ? (
                      <span className="truncate">{form.secretaria}</span>
                    ) : (
                      <span className="text-muted-foreground">Buscar órgão...</span>
                    )}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar secretaria ou órgão..." />
                    <CommandList>
                      <CommandEmpty>Nenhum órgão encontrado.</CommandEmpty>
                      {ORGAOS_POR_CATEGORIA.map((cat) => (
                        <CommandGroup key={cat.categoria} heading={cat.categoria}>
                          {cat.orgaos.map((orgao) => (
                            <CommandItem
                              key={orgao}
                              value={orgao}
                              onSelect={() => {
                                setForm({ ...form, secretaria: orgao });
                                setOrgaoOpen(false);
                              }}
                            >
                              {orgao}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                      {customOrgaos.length > 0 && (
                        <CommandGroup heading="Órgãos Adicionais">
                          {customOrgaos.map((orgao) => (
                            <CommandItem
                              key={orgao}
                              value={orgao}
                              onSelect={() => {
                                setForm({ ...form, secretaria: orgao });
                                setOrgaoOpen(false);
                              }}
                            >
                              {orgao}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="setor">Unidade / Setor</Label>
              <Input id="setor" placeholder="Informe seu setor" value={form.setor} onChange={(e) => setForm({ ...form, setor: e.target.value })} onBlur={() => handleBlur('setor')} aria-required="true" />
              {touched.setor && !form.setor.trim() && <p className="text-xs text-destructive" role="alert">Setor é obrigatório.</p>}
            </div>
          </div>

          <Button className="w-full py-6 text-lg" disabled={!isValid} onClick={handleContinuar} aria-label="Continuar para o formulário de solicitação">
            Continuar
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Cadastro;
