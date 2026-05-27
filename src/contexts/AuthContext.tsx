import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Usuario } from '../types';
import { loginUser, registerUser, logoutUser, getMe, setAccessToken } from '../services/api';

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Limpa sessão local
  const clearSession = useCallback(() => {
    setAccessToken(null);
    localStorage.removeItem('cineweb_refresh_token');
    setUser(null);
  }, []);

  // Restaura sessão ao montar (via refresh token persistido)
  useEffect(() => {
    const restoreSession = async () => {
      const refreshToken = localStorage.getItem('cineweb_refresh_token');
      if (!refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Tenta renovar o access token com o refresh token
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/refresh`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          }
        );

        if (!response.ok) throw new Error('Refresh falhou');

        const data = await response.json();
        setAccessToken(data.accessToken);
        localStorage.setItem('cineweb_refresh_token', data.refreshToken);

        // Busca perfil do usuário com o novo token
        const meResponse = await getMe();
        setUser(meResponse.data as Usuario);
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [clearSession]);

  // Escuta evento de force-logout disparado pelo interceptor da API
  useEffect(() => {
    const handleForceLogout = () => {
      clearSession();
    };
    window.addEventListener('cineweb:force-logout', handleForceLogout);
    return () => window.removeEventListener('cineweb:force-logout', handleForceLogout);
  }, [clearSession]);

  const login = async (email: string, senha: string) => {
    const response = await loginUser(email, senha);
    const { accessToken, refreshToken, user: userData } = response.data;

    setAccessToken(accessToken);
    localStorage.setItem('cineweb_refresh_token', refreshToken);
    setUser(userData);
  };

  const register = async (nome: string, email: string, senha: string) => {
    const response = await registerUser(nome, email, senha);
    const { accessToken, refreshToken, user: userData } = response.data;

    setAccessToken(accessToken);
    localStorage.setItem('cineweb_refresh_token', refreshToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignora erros de logout no servidor (token pode já estar expirado)
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
