import apiClient from './apiClient';
import { AuthTokens, User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  login: async (username: string, password: string): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>('/api/auth/token/', { username, password });
    
    // Сохраняем токены в AsyncStorage
    await AsyncStorage.setItem('accessToken', response.data.access);
    await AsyncStorage.setItem('refreshToken', response.data.refresh);
    
    return response.data;
  },
  
  refreshToken: async (refresh: string): Promise<{ access: string }> => {
    const response = await apiClient.post<{ access: string }>('/api/auth/token/refresh/', { refresh });
    await AsyncStorage.setItem('accessToken', response.data.access);
    return response.data;
  },
  
  getUserProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/auth/me/');
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    // Удаляем токены из AsyncStorage
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
  },
  
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      return !!accessToken && !!refreshToken;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }
}; 