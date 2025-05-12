import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Значение по умолчанию, которое будет использоваться, если в AsyncStorage нет сохраненного URL
const DEFAULT_URL = 'http://localhost:8000';

// Создаем экземпляр axios без baseURL, добавим его через перехватчик
const apiClient = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик запросов для добавления токена авторизации и установки baseURL
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Получаем baseURL из AsyncStorage
      const baseUrl = await AsyncStorage.getItem('apiBaseUrl') || DEFAULT_URL;
      config.baseURL = baseUrl;
      
      // Получаем токен из AsyncStorage
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting data from AsyncStorage:', error);
      config.baseURL = DEFAULT_URL; // Используем значение по умолчанию в случае ошибки
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Перехватчик ответов для автоматического обновления токена
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token found');
        }
        
        const baseUrl = await AsyncStorage.getItem('apiBaseUrl') || DEFAULT_URL;
        
        const response = await axios.post(`${baseUrl}/api/auth/token/refresh/`, {
          refresh: refreshToken
        });
        
        const { access } = response.data;
        await AsyncStorage.setItem('accessToken', access);
        
        // Повторяем исходный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // При ошибке обновления токена, очищаем хранилище и перенаправляем на экран входа
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        // Здесь должна быть логика перенаправления на экран входа
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient; 