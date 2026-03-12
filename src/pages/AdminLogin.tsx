import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authenticateOperador, ensureMasterUser } from '@/lib/storage';
import { Operador } from '@/types/solicitacao';

const AdminLogin = ({ onAuth }: { onAuth: (op: Operador) => void }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [erro, setErro] = useState('');

  // Garante que o usuário mestre exista ao abrir a tela
  useState(() => { ensureMasterUser(); });

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
        <Button
          variant="ghost"
          size="sm"
          className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-300 gap-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">Voltar</span>
        </Button>
        <div className="h-6 w-px bg-primary-foreground/20" />
        <Building2 className="h-6 w-6 text-primary-foreground" />
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
              <div className="relative">
                <Input
                  id="senha"
                  type={showSenha ? 'text' : 'password'}
                  placeholder="Digite a senha"
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); setErro(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {erro && <p className="text-destructive text-sm">{erro}</p>}
          </div>
          <Button className="w-full" onClick={handleLogin} disabled={!email.trim() || !senha}>Entrar</Button>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;
