// Общие типы для API
export type ApiResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

// Типы для авторизации
export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  date_joined: string;
}

// Типы для справочников
export interface TransportModel {
  id: string;
  name: string;
  description: string;
}

export interface PackageType {
  id: string;
  name: string;
  description: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
}

export interface Status {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface CargoType {
  id: string;
  name: string;
  description: string;
}

// Типы для доставок
export interface DeliveryListItem {
  id: string;
  number?: string;
  transport_model_name: string;
  transport_number: string;
  departure_datetime: string;
  arrival_datetime: string;
  distance: number;
  package_type_name: string;
  status_name: string;
  status_color: string;
  technical_condition: 'good' | 'bad';
  duration: number;
  services: string[];
  created_at: string;
  is_completed?: boolean;
  cargo_type?: string;
}

export interface DeliveryDetail {
  id: string;
  transport_model: string;
  transport_number: string;
  departure_datetime: string;
  arrival_datetime: string;
  distance: number;
  departure_address?: string;
  arrival_address?: string;
  media_file?: string;
  package_type: string;
  status: string;
  technical_condition: 'good' | 'bad';
  services: string[];
  duration: number;
  created_at: string;
  updated_at: string;
}

export interface DeliveryCreate {
  transport_model: string;
  transport_number: string;
  departure_datetime: string;
  arrival_datetime: string;
  distance: number;
  departure_address?: string;
  arrival_address?: string;
  media_file?: string | null;
  package_type: string;
  status: string;
  technical_condition: 'good' | 'bad';
  services?: string[];
}

// Типы для фильтрации доставок
export interface DeliveryFilters {
  start_date?: string;
  end_date?: string;
  min_duration?: number;
  max_duration?: number;
  min_distance?: number;
  max_distance?: number;
  transport_model?: string;
  package_type?: string;
  status?: string;
  technical_condition?: 'good' | 'bad';
  services?: string;
  search?: string;
  ordering?: string;
}

// Типы для навигации
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  DeliveryDetails: { id: string };
  CreateDelivery: undefined;
  EditDelivery: { id: string };
};

export type MainTabParamList = {
  Deliveries: undefined;
  More: undefined;
}; 