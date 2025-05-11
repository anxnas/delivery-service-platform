import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Сервер вернул код 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Если ошибка не связана с попыткой обновления токена или входа
      if (!error.config.url.includes('token')) {
        try {
          // Импортируем функцию для обновления токена
          const { refreshTokenAndRetry } = await import('./authService');
          // Пробуем обновить токен и повторить запрос
          return refreshTokenAndRetry(error);
        } catch (refreshError) {
          // Если не удалось обновить токен, перенаправляем на страницу входа
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api; 