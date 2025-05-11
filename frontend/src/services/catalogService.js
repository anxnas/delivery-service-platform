import api from './api';

// Получение списка транспортных моделей
export const getTransportModels = async () => {
  const response = await api.get('/transport-models/');
  return response.data;
};

// Получение списка статусов доставок
export const getDeliveryStatuses = async () => {
  const response = await api.get('/statuses/');
  return response.data;
};

// Получение списка типов упаковки
export const getPackageTypes = async () => {
  const response = await api.get('/package-types/');
  return response.data;
};

// Получение списка услуг доставки
export const getDeliveryServices = async () => {
  const response = await api.get('/services/');
  return response.data;
};

// Получение списка типов груза
export const getCargoTypes = async () => {
  const response = await api.get('/cargo-types/');
  return response.data;
}; 