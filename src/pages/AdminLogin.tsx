import { useState } from 'react';
import { Building2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authenticateOperador } from '@/lib/storage';
import { Operador } from '@/types/solicitacao';

const AdminLogin = ({ onAuth }: { onAuth: (op: Operador) => void }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = () => {
    const op = authenticateOperador(email.trim(), senha);
    if (op) {
      sessionStorage.setItem('admin-auth', JSON.stringify({ id: op.id, nome: op.nome, nivel: op.nivel }));
      onAuth(op);
    } else {
      setErro('E-mail ou senha incorretos, ou usuário inativo.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="institutional-gradient px-6 py-4 flex items-center gap-3 shadow-lg">
        <Building2 className="h-7 w-7 text-primary-foreground" />
        <h1 className="text-lg font-bold text-primary-foreground">Painel Administrativo – SEPLAG MT</h1>
      </header>
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-card rounded-xl shadow-lg border p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Acesso Restrito</h2>
            <p className="text-sm text-muted-foreground">Use suas credenciais de operador</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@seplag.mt.gov.br"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErro(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Digite a senha"
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setErro(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            {erro && <p className="text-destructive text-sm">{erro}</p>}
          </div>
          <Button className="w-full" onClick={handleLogin} disabled={!email.trim() || !senha}>Entrar</Button>
        </div>
      </main>
    </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;
