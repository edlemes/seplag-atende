import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { NivelAcesso, NIVEIS_GESTAO, NIVEIS_OPERACAO, NIVEIS_LEITURA } from '@/types/solicitacao';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedLevels?: NivelAcesso[];
}

function getCurrentUser() {
  const stored = sessionStorage.getItem('admin-auth');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

const ProtectedRoute = ({ children, allowedLevels }: ProtectedRouteProps) => {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  if (allowedLevels && !allowedLevels.includes(user.nivel)) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
