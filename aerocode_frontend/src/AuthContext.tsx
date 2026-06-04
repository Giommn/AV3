import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface FuncionarioToken {
  funcionarioId: number;
  usuario: string;
  nivelPermissao: 'ADMINISTRADOR' | 'ENGENHEIRO' | 'OPERADOR';
}

interface AuthContextData {
  user: FuncionarioToken | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FuncionarioToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('@Aerocode:token');
    if (token) {
      try {
        const decoded = jwtDecode<FuncionarioToken>(token);
        setUser(decoded);
      } catch {
        localStorage.removeItem('@Aerocode:token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('@Aerocode:token', token);
    const decoded = jwtDecode<FuncionarioToken>(token);
    setUser(decoded);
  };

  const logout = () => {
    localStorage.removeItem('@Aerocode:token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
