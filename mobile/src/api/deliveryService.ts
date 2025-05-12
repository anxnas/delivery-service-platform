import apiClient from './apiClient';
import { ApiResponse, DeliveryCreate, DeliveryDetail, DeliveryFilters, DeliveryListItem } from '../types';

export const deliveryService = {
  // Получение списка доставок с возможностью фильтрации
  getDeliveries: async (filters?: DeliveryFilters): Promise<ApiResponse<DeliveryListItem>> => {
    const response = await apiClient.get<ApiResponse<DeliveryListItem>>('/api/deliveries/', { params: filters });
    return response.data;
  },
  
  // Получение детальной информации о доставке
  getDeliveryById: async (id: string): Promise<DeliveryDetail> => {
    const response = await apiClient.get<DeliveryDetail>(`/api/deliveries/${id}/`);
    return response.data;
  },
  
  // Создание новой доставки
  createDelivery: async (data: DeliveryCreate): Promise<DeliveryDetail> => {
    // Если есть файл для загрузки, используем FormData
    if (data.media_file) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'media_file' && typeof value === 'string') {
          // Здесь должна быть логика для загрузки файла
          // Пример использования expo-document-picker
          const uriParts = value.split('.');
          const fileType = uriParts[uriParts.length - 1];
          
          formData.append('media_file', {
            uri: value,
            name: `document.${fileType}`,
            type: `application/${fileType}`,
          } as any);
        } else if (key === 'services' && Array.isArray(value)) {
          value.forEach(service => formData.append('services', service));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      const response = await apiClient.post<DeliveryDetail>('/api/deliveries/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      const response = await apiClient.post<DeliveryDetail>('/api/deliveries/', data);
      return response.data;
    }
  },
  
  // Обновление доставки
  updateDelivery: async (id: string, data: Partial<DeliveryCreate>): Promise<DeliveryDetail> => {
    // Аналогично createDelivery, обрабатываем файлы при наличии
    if (data.media_file && typeof data.media_file === 'string' && !data.media_file.startsWith('http')) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'media_file' && typeof value === 'string') {
          const uriParts = value.split('.');
          const fileType = uriParts[uriParts.length - 1];
          
          formData.append('media_file', {
            uri: value,
            name: `document.${fileType}`,
            type: `application/${fileType}`,
          } as any);
        } else if (key === 'services' && Array.isArray(value)) {
          value.forEach(service => formData.append('services', service));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      const response = await apiClient.patch<DeliveryDetail>(`/api/deliveries/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      const response = await apiClient.patch<DeliveryDetail>(`/api/deliveries/${id}/`, data);
      return response.data;
    }
  },
  
  // Удаление доставки
  deleteDelivery: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/deliveries/${id}/`);
  },
  
  // Проведение доставки (установка статуса "Проведено")
  completeDelivery: async (id: string): Promise<DeliveryDetail> => {
    const response = await apiClient.post<DeliveryDetail>(`/api/deliveries/${id}/complete/`);
    return response.data;
  }
}; 