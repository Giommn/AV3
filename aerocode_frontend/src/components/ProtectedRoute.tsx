import { Navigate } from 'react-router-dom';
import { useContext, type ReactNode } from 'react';
import { AuthContext } from '../AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }: { children: ReactNode, allowedRoles?: string[] }) => {
  const { user, loading } = useContext(AuthContext);

  // Aguarda o AuthContext terminar de ler o localStorage antes de redirecionar
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-aerospace-dark">
        <div className="text-slate-400 text-sm animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.nivelPermissao)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
