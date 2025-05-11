import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { setAuthToken, removeAuthToken } from '../services/authToken';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const loginUser = async (username, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/token/', { username, password });
      const { access, refresh } = response.data;
      
      // Сохраняем токены
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Устанавливаем токен для API-запросов
      setAuthToken(access);
      
      // Получаем информацию о пользователе
      await getUserProfile();
      
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при входе');
      return false;
    }
  };
  
  const getUserProfile = async () => {
    try {
      const response = await api.get('/auth/me/');
      setUser(response.data);
      return response.data;
    } catch (err) {
      setError('Ошибка при получении данных профиля');
      throw err;
    }
  };
  
  const logoutUser = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    removeAuthToken();
    setUser(null);
    setIsAuthenticated(false);
  };
  
  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        logoutUser();
        return false;
      }
      
      const response = await api.post('/auth/token/refresh/', { refresh });
      const { access } = response.data;
      
      localStorage.setItem('access_token', access);
      setAuthToken(access);
      return true;
    } catch (err) {
      logoutUser();
      return false;
    }
  };
  
  // Проверка наличия токена при загрузке приложения
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        setAuthToken(token);
        try {
          await getUserProfile();
          setIsAuthenticated(true);
        } catch (err) {
          const refreshed = await refreshToken();
          if (refreshed) {
            try {
              await getUserProfile();
              setIsAuthenticated(true);
            } catch (e) {
              logoutUser();
            }
          } else {
            logoutUser();
          }
        }
      }
      setLoading(false);
    };
    
    initializeAuth();
  }, []);
  
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    loginUser,
    logoutUser,
    refreshToken,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 