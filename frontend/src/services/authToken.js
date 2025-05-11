import api from './api';

// Функция для установки токена аутентификации в заголовки API
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Функция для удаления токена аутентификации из заголовков API
export const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

// Функция для обновления токена и повторения запроса
export const refreshTokenAndRetry = async (error) => {
  try {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      throw new Error('Нет refresh токена');
    }

    // Получаем новый access токен
    const response = await api.post('/auth/token/refresh/', { refresh });
    const { access } = response.data;

    // Сохраняем новый токен
    localStorage.setItem('access_token', access);
    setAuthToken(access);

    // Повторяем исходный запрос с новым токеном
    const originalRequest = error.config;
    originalRequest.headers['Authorization'] = `Bearer ${access}`;
    return api(originalRequest);
  } catch (refreshError) {
    // Если не удается обновить токен, очищаем хранилище
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    removeAuthToken();
    throw refreshError;
  }
}; 