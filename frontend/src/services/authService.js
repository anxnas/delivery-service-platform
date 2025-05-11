import api from './api';
import { setAuthToken, refreshTokenAndRetry } from './authToken';

// Экспортируем функцию refreshTokenAndRetry для использования в api.js
export { refreshTokenAndRetry };

// Получение JWT токенов
export const login = async (username, password) => {
  const response = await api.post('/auth/token/', { username, password });
  return response.data;
};

// Получение профиля пользователя
export const getUserProfile = async () => {
  const response = await api.get('/auth/me/');
  return response.data;
};

// Обновление токена
export const refreshToken = async (refreshToken) => {
  const response = await api.post('/auth/token/refresh/', { refresh: refreshToken });
  return response.data;
}; 