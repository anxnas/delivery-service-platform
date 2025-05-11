import api from './api';

// Получение списка доставок с фильтрацией
export const getDeliveries = async (filters = {}) => {
  const params = {};
  
  // Обработка фильтров
  if (filters.start_date) params.start_date = filters.start_date;
  if (filters.end_date) params.end_date = filters.end_date;
  if (filters.services) params.services = filters.services;
  if (filters.cargo_types) params.cargo_types = filters.cargo_types;
  if (filters.status) params.status = filters.status;
  if (filters.transport_model) params.transport_model = filters.transport_model;
  if (filters.min_duration) params.min_duration = filters.min_duration;
  if (filters.max_duration) params.max_duration = filters.max_duration;
  if (filters.search) params.search = filters.search;
  if (filters.ordering) params.ordering = filters.ordering;
  
  // Пагинация
  if (filters.page) params.page = filters.page;
  if (filters.page_size) params.page_size = filters.page_size;
  
  const response = await api.get('/deliveries/', { params });
  return response.data;
};

// Получение аналитики доставок с фильтрами
export const getDeliveryAnalytics = async (filters = {}) => {
  const params = {};
  
  if (filters.start_date) params.start_date = filters.start_date;
  if (filters.end_date) params.end_date = filters.end_date;
  if (filters.services) params.services = filters.services;
  if (filters.cargo_types) params.cargo_types = filters.cargo_types;
  
  const response = await api.get('/analytics/', { params });
  return response.data;
};

// Получение подробной информации о доставке
export const getDelivery = async (id) => {
  const response = await api.get(`/deliveries/${id}/`);
  return response.data;
};

// Создание новой доставки
export const createDelivery = async (deliveryData) => {
  const response = await api.post('/deliveries/', deliveryData);
  return response.data;
};

// Обновление доставки
export const updateDelivery = async (id, deliveryData) => {
  const response = await api.patch(`/deliveries/${id}/`, deliveryData);
  return response.data;
};

// Удаление доставки
export const deleteDelivery = async (id) => {
  const response = await api.delete(`/deliveries/${id}/`);
  return response.data;
};

// Завершение доставки
export const completeDelivery = async (id) => {
  const response = await api.post(`/deliveries/${id}/complete/`);
  return response.data;
}; 