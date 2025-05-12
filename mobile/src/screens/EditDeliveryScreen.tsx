import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Button, Card, Checkbox, Chip, Divider, HelperText, Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { DeliveryCreate, DeliveryDetail, TransportModel, PackageType, Service, Status } from '../types';
import { deliveryService } from '../api/deliveryService';
import { referenceService } from '../api/referenceService';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

type EditDeliveryRouteProp = RouteProp<RootStackParamList, 'EditDelivery'>;

const EditDeliveryScreen: React.FC = () => {
  const route = useRoute<EditDeliveryRouteProp>();
  const { id } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialLoaded, setInitialLoaded] = useState(false);
  
  // Состояние формы
  const [formData, setFormData] = useState<Partial<DeliveryCreate>>({
    technical_condition: 'good',
  });
  
  // Состояние для отображения выбора даты
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [showArrivalPicker, setShowArrivalPicker] = useState(false);
  
  // Состояние для справочников
  const [transportModels, setTransportModels] = useState<TransportModel[]>([]);
  const [packageTypes, setPackageTypes] = useState<PackageType[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  
  // Состояние для выбора справочников
  const [showTransportModels, setShowTransportModels] = useState(false);
  const [showPackageTypes, setShowPackageTypes] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [showStatuses, setShowStatuses] = useState(false);
  
  // Загрузка данных доставки и справочников
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Загрузка данных доставки
        const deliveryData = await deliveryService.getDeliveryById(id);
        
        // Загрузка справочников
        const [transportResponse, packageResponse, serviceResponse, statusResponse] = await Promise.all([
          referenceService.getTransportModels(),
          referenceService.getPackageTypes(),
          referenceService.getServices(),
          referenceService.getStatuses(),
        ]);
        
        setTransportModels(transportResponse.results);
        setPackageTypes(packageResponse.results);
        setServices(serviceResponse.results);
        setStatuses(statusResponse.results);
        
        // Установка начальных значений формы
        setFormData({
          transport_model: deliveryData.transport_model,
          transport_number: deliveryData.transport_number,
          departure_datetime: deliveryData.departure_datetime,
          arrival_datetime: deliveryData.arrival_datetime,
          distance: deliveryData.distance,
          departure_address: deliveryData.departure_address,
          arrival_address: deliveryData.arrival_address,
          package_type: deliveryData.package_type,
          status: deliveryData.status,
          technical_condition: deliveryData.technical_condition,
          services: deliveryData.services,
          media_file: deliveryData.media_file,
        });
        
        setInitialLoaded(true);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        Alert.alert(
          'Ошибка',
          'Не удалось загрузить данные доставки. Попробуйте еще раз.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigation]);
  
  // Обработчик изменения формы
  const handleChange = (name: keyof DeliveryCreate, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };
  
  // Обработчики для выбора даты
  const handleDepartureDateChange = (event: any, selectedDate?: Date) => {
    setShowDeparturePicker(false);
    if (selectedDate) {
      handleChange('departure_datetime', selectedDate.toISOString());
    }
  };
  
  const handleArrivalDateChange = (event: any, selectedDate?: Date) => {
    setShowArrivalPicker(false);
    if (selectedDate) {
      handleChange('arrival_datetime', selectedDate.toISOString());
    }
  };
  
  // Выбор файла документа
  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Любой тип файла
        copyToCacheDirectory: true,
      });
      
      if (result.canceled === false) {
        handleChange('media_file', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Ошибка при выборе документа:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать документ');
    }
  };
  
  // Удаление файла
  const handleRemoveFile = () => {
    handleChange('media_file', null);
  };
  
  // Тогл услуги
  const toggleService = (serviceId: string) => {
    setFormData(prev => {
      const services = [...(prev.services || [])];
      const index = services.indexOf(serviceId);
      
      if (index > -1) {
        services.splice(index, 1);
      } else {
        services.push(serviceId);
      }
      
      return { ...prev, services };
    });
  };
  
  // Форматирование даты для отображения
  const formatDisplayDate = (dateString?: string): string => {
    if (!dateString) return 'Выберите дату';
    const date = new Date(dateString);
    return format(date, 'dd.MM.yyyy HH:mm', { locale: ru });
  };
  
  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.transport_model) {
      newErrors.transport_model = 'Выберите модель транспорта';
    }
    
    if (!formData.transport_number) {
      newErrors.transport_number = 'Введите номер транспорта';
    }
    
    if (!formData.departure_datetime) {
      newErrors.departure_datetime = 'Выберите время отправки';
    }
    
    if (!formData.arrival_datetime) {
      newErrors.arrival_datetime = 'Выберите время прибытия';
    }
    
    if (formData.departure_datetime && formData.arrival_datetime && 
        new Date(formData.arrival_datetime) <= new Date(formData.departure_datetime)) {
      newErrors.arrival_datetime = 'Время прибытия должно быть позже времени отправки';
    }
    
    if (!formData.distance || formData.distance <= 0) {
      newErrors.distance = 'Введите корректное расстояние';
    }
    
    if (!formData.package_type) {
      newErrors.package_type = 'Выберите тип упаковки';
    }
    
    if (!formData.status) {
      newErrors.status = 'Выберите статус';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Сохранение изменений
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все обязательные поля корректно');
      return;
    }
    
    try {
      setSaving(true);
      await deliveryService.updateDelivery(id, formData);
      Alert.alert('Успех', 'Доставка успешно обновлена', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error: any) {
      console.error('Ошибка при обновлении доставки:', error);
      if (error.response?.data) {
        // Обработка ошибок валидации от сервера
        const serverErrors = error.response.data;
        const formattedErrors: Record<string, string> = {};
        
        Object.entries(serverErrors).forEach(([key, value]) => {
          formattedErrors[key] = Array.isArray(value) ? value[0].toString() : value.toString();
        });
        
        setErrors(formattedErrors);
      } else {
        Alert.alert('Ошибка', 'Не удалось обновить доставку');
      }
    } finally {
      setSaving(false);
    }
  };
  
  // Получение названия выбранной модели транспорта
  const getSelectedTransportModelName = (): string => {
    const model = transportModels.find(model => model.id === formData.transport_model);
    return model ? model.name : 'Выберите модель транспорта';
  };
  
  // Получение названия выбранного типа упаковки
  const getSelectedPackageTypeName = (): string => {
    const packageType = packageTypes.find(type => type.id === formData.package_type);
    return packageType ? packageType.name : 'Выберите тип упаковки';
  };
  
  // Получение названия выбранного статуса
  const getSelectedStatusName = (): string => {
    const status = statuses.find(status => status.id === formData.status);
    return status ? status.name : 'Выберите статус';
  };
  
  // Отображение загрузки
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6750A4" />
        <Text style={styles.loadingText}>Загрузка данных...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>Редактирование доставки</Text>
          <Divider style={styles.divider} />
          
          {/* Информация о транспорте */}
          <Text variant="titleMedium" style={styles.sectionTitle}>Информация о транспорте</Text>
          
          <Button 
            mode="outlined" 
            onPress={() => setShowTransportModels(!showTransportModels)}
            style={styles.selectButton}
          >
            {getSelectedTransportModelName()}
          </Button>
          {errors.transport_model && <HelperText type="error">{errors.transport_model}</HelperText>}
          
          {showTransportModels && (
            <View style={styles.selectContainer}>
              {transportModels.map(model => (
                <Chip 
                  key={model.id}
                  selected={formData.transport_model === model.id}
                  onPress={() => {
                    handleChange('transport_model', model.id);
                    setShowTransportModels(false);
                  }}
                  style={styles.selectItem}
                >
                  {model.name}
                </Chip>
              ))}
            </View>
          )}
          
          <TextInput
            label="Номер транспорта"
            value={formData.transport_number}
            onChangeText={text => handleChange('transport_number', text)}
            style={styles.input}
            error={!!errors.transport_number}
          />
          {errors.transport_number && <HelperText type="error">{errors.transport_number}</HelperText>}
          
          <View style={styles.radioContainer}>
            <Text>Техническое состояние:</Text>
            <View style={styles.radioOption}>
              <Checkbox
                status={formData.technical_condition === 'good' ? 'checked' : 'unchecked'}
                onPress={() => handleChange('technical_condition', 'good')}
              />
              <Text style={styles.radioLabel}>Исправно</Text>
            </View>
            <View style={styles.radioOption}>
              <Checkbox
                status={formData.technical_condition === 'bad' ? 'checked' : 'unchecked'}
                onPress={() => handleChange('technical_condition', 'bad')}
              />
              <Text style={styles.radioLabel}>Неисправно</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Информация о доставке */}
          <Text variant="titleMedium" style={styles.sectionTitle}>Информация о доставке</Text>
          
          <Button 
            mode="outlined" 
            onPress={() => setShowDeparturePicker(true)}
            style={styles.dateButton}
            icon="clock"
          >
            Отправка: {formData.departure_datetime ? formatDisplayDate(formData.departure_datetime) : 'Выберите дату'}
          </Button>
          {errors.departure_datetime && <HelperText type="error">{errors.departure_datetime}</HelperText>}
          
          {showDeparturePicker && formData.departure_datetime && (
            <DateTimePicker
              value={new Date(formData.departure_datetime)}
              mode="datetime"
              onChange={handleDepartureDateChange}
            />
          )}
          
          <Button 
            mode="outlined" 
            onPress={() => setShowArrivalPicker(true)}
            style={styles.dateButton}
            icon="clock"
          >
            Прибытие: {formData.arrival_datetime ? formatDisplayDate(formData.arrival_datetime) : 'Выберите дату'}
          </Button>
          {errors.arrival_datetime && <HelperText type="error">{errors.arrival_datetime}</HelperText>}
          
          {showArrivalPicker && formData.arrival_datetime && (
            <DateTimePicker
              value={new Date(formData.arrival_datetime)}
              mode="datetime"
              onChange={handleArrivalDateChange}
            />
          )}
          
          <TextInput
            label="Дистанция (км)"
            value={formData.distance?.toString() || ''}
            onChangeText={text => {
              const value = parseFloat(text);
              handleChange('distance', isNaN(value) ? 0 : value);
            }}
            keyboardType="numeric"
            style={styles.input}
            error={!!errors.distance}
          />
          {errors.distance && <HelperText type="error">{errors.distance}</HelperText>}
          
          <TextInput
            label="Адрес отправки (опционально)"
            value={formData.departure_address || ''}
            onChangeText={text => handleChange('departure_address', text)}
            style={styles.input}
          />
          
          <TextInput
            label="Адрес прибытия (опционально)"
            value={formData.arrival_address || ''}
            onChangeText={text => handleChange('arrival_address', text)}
            style={styles.input}
          />
          
          <Divider style={styles.divider} />
          
          {/* Дополнительная информация */}
          <Text variant="titleMedium" style={styles.sectionTitle}>Дополнительная информация</Text>
          
          <Button 
            mode="outlined" 
            onPress={() => setShowPackageTypes(!showPackageTypes)}
            style={styles.selectButton}
          >
            {getSelectedPackageTypeName()}
          </Button>
          {errors.package_type && <HelperText type="error">{errors.package_type}</HelperText>}
          
          {showPackageTypes && (
            <View style={styles.selectContainer}>
              {packageTypes.map(type => (
                <Chip 
                  key={type.id}
                  selected={formData.package_type === type.id}
                  onPress={() => {
                    handleChange('package_type', type.id);
                    setShowPackageTypes(false);
                  }}
                  style={styles.selectItem}
                >
                  {type.name}
                </Chip>
              ))}
            </View>
          )}
          
          <Button 
            mode="outlined" 
            onPress={() => setShowStatuses(!showStatuses)}
            style={styles.selectButton}
          >
            {getSelectedStatusName()}
          </Button>
          {errors.status && <HelperText type="error">{errors.status}</HelperText>}
          
          {showStatuses && (
            <View style={styles.selectContainer}>
              {statuses.map(status => (
                <Chip 
                  key={status.id}
                  selected={formData.status === status.id}
                  onPress={() => {
                    handleChange('status', status.id);
                    setShowStatuses(false);
                  }}
                  style={styles.selectItem}
                >
                  {status.name}
                </Chip>
              ))}
            </View>
          )}
          
          <Text style={styles.label}>Выберите услуги:</Text>
          <View style={styles.servicesContainer}>
            {services.map(service => (
              <Chip
                key={service.id}
                selected={formData.services?.includes(service.id)}
                onPress={() => toggleService(service.id)}
                style={styles.serviceChip}
              >
                {service.name}
              </Chip>
            ))}
          </View>
          
          {formData.media_file && typeof formData.media_file === 'string' && formData.media_file.startsWith('http') ? (
            <View style={styles.fileContainer}>
              <Text style={styles.label}>Текущий документ:</Text>
              <View style={styles.fileActions}>
                <Button
                  mode="outlined"
                  icon="file-document"
                  onPress={() => formData.media_file && typeof formData.media_file === 'string' ? 
                    Alert.alert('Документ', formData.media_file) : null}
                  style={styles.fileButton}
                >
                  Посмотреть
                </Button>
                <Button
                  mode="outlined"
                  icon="delete"
                  onPress={handleRemoveFile}
                  style={styles.fileButton}
                >
                  Удалить
                </Button>
              </View>
            </View>
          ) : (
            <Button 
              mode="outlined" 
              onPress={handleDocumentPick}
              icon="file-upload"
              style={styles.fileButton}
            >
              {formData.media_file ? 'Документ выбран' : 'Загрузить документ'}
            </Button>
          )}
          
          <Divider style={styles.divider} />
          
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.actionButton}
              disabled={saving}
            >
              Отмена
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.actionButton}
              loading={saving}
              disabled={saving}
            >
              Сохранить
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1B1F',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1B1F',
  },
  loadingText: {
    color: '#E6E1E5',
    marginTop: 16,
  },
  card: {
    backgroundColor: '#2d2c31',
  },
  title: {
    color: '#E6E1E5',
    marginBottom: 8,
  },
  divider: {
    backgroundColor: '#49454F',
    marginVertical: 16,
  },
  sectionTitle: {
    color: '#E6E1E5',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#1C1B1F',
  },
  selectButton: {
    marginBottom: 16,
  },
  dateButton: {
    marginBottom: 16,
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  selectItem: {
    margin: 4,
  },
  radioContainer: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  radioLabel: {
    marginLeft: 8,
  },
  label: {
    marginBottom: 8,
    color: '#CAC4D0',
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  serviceChip: {
    margin: 4,
  },
  fileButton: {
    marginVertical: 8,
  },
  fileContainer: {
    marginVertical: 8,
  },
  fileActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default EditDeliveryScreen; 