import { useState } from 'react';
import { Building2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ADMIN_PASSWORD = 'seplag2024';

const AdminLogin = ({ onAuth }: { onAuth: () => void }) => {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(false);

  const handleLogin = () => {
    if (senha === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin-auth', '1');
      onAuth();
    } else {
      setErro(true);
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              placeholder="Digite a senha"
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErro(false); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            {erro && <p className="text-destructive text-sm">Senha incorreta.</p>}
          </div>
          <Button className="w-full" onClick={handleLogin}>Entrar</Button>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;
