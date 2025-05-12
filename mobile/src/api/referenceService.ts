import apiClient from './apiClient';
import { ApiResponse, TransportModel, PackageType, Service, Status, CargoType } from '../types';

export const referenceService = {
  // Транспортные модели
  getTransportModels: async (): Promise<ApiResponse<TransportModel>> => {
    const response = await apiClient.get<ApiResponse<TransportModel>>('/api/transport-models/');
    return response.data;
  },

  getTransportModelById: async (id: string): Promise<TransportModel> => {
    const response = await apiClient.get<TransportModel>(`/api/transport-models/${id}/`);
    return response.data;
  },

  // Типы упаковки
  getPackageTypes: async (): Promise<ApiResponse<PackageType>> => {
    const response = await apiClient.get<ApiResponse<PackageType>>('/api/package-types/');
    return response.data;
  },

  getPackageTypeById: async (id: string): Promise<PackageType> => {
    const response = await apiClient.get<PackageType>(`/api/package-types/${id}/`);
    return response.data;
  },

  // Услуги
  getServices: async (): Promise<ApiResponse<Service>> => {
    const response = await apiClient.get<ApiResponse<Service>>('/api/services/');
    return response.data;
  },

  getServiceById: async (id: string): Promise<Service> => {
    const response = await apiClient.get<Service>(`/api/services/${id}/`);
    return response.data;
  },

  // Статусы
  getStatuses: async (): Promise<ApiResponse<Status>> => {
    const response = await apiClient.get<ApiResponse<Status>>('/api/statuses/');
    return response.data;
  },

  getStatusById: async (id: string): Promise<Status> => {
    const response = await apiClient.get<Status>(`/api/statuses/${id}/`);
    return response.data;
  },

  // Типы груза
  getCargoTypes: async (): Promise<ApiResponse<CargoType>> => {
    const response = await apiClient.get<ApiResponse<CargoType>>('/api/cargo-types/');
    return response.data;
  },

  getCargoTypeById: async (id: string): Promise<CargoType> => {
    const response = await apiClient.get<CargoType>(`/api/cargo-types/${id}/`);
    return response.data;
  },
}; 