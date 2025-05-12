import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { authService } from '../api/authService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Проверка аутентификации при загрузке приложения
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const isAuth = await authService.isAuthenticated();
        setIsAuthenticated(isAuth);
        
        if (isAuth) {
          const userData = await authService.getUserProfile();
          setUser(userData);
        }
      } catch (error) {
        console.error('Ошибка при проверке статуса аутентификации:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Функция входа в систему
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      await authService.login(username, password);
      const userData = await authService.getUserProfile();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Ошибка при входе в систему:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Функция выхода из системы
  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Хук для использования контекста авторизации
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}; 