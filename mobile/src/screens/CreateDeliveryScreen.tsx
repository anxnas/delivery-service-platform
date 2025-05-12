import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Button, Card, Checkbox, Chip, Divider, HelperText, Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { DeliveryCreate, TransportModel, PackageType, Service, Status } from '../types';
import { deliveryService } from '../api/deliveryService';
import { referenceService } from '../api/referenceService';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const CreateDeliveryScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Состояние формы
  const [formData, setFormData] = useState<DeliveryCreate>({
    transport_model: '',
    transport_number: '',
    departure_datetime: new Date().toISOString(),
    arrival_datetime: new Date(Date.now() + 3600000).toISOString(), // +1 час от текущего времени
    distance: 0,
    package_type: '',
    status: '',
    technical_condition: 'good',
    services: [],
  });
  
  // Состояние для отображения выбора даты и времени
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [showArrivalPicker, setShowArrivalPicker] = useState(false);
  // Add new state for time pickers on Android
  const [showDepartureTimePicker, setShowDepartureTimePicker] = useState(false);
  const [showArrivalTimePicker, setShowArrivalTimePicker] = useState(false);
  
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
  
  // Загрузка справочников
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
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
        
        // Установка значений по умолчанию, если есть данные
        if (statusResponse.results.length > 0) {
          const waitingStatus = statusResponse.results.find(s => s.name === 'В ожидании');
          if (waitingStatus) {
            setFormData(prev => ({ ...prev, status: waitingStatus.id }));
          } else {
            setFormData(prev => ({ ...prev, status: statusResponse.results[0].id }));
          }
        }
        
        if (packageResponse.results.length > 0) {
          setFormData(prev => ({ ...prev, package_type: packageResponse.results[0].id }));
        }
        
      } catch (error) {
        console.error('Ошибка при загрузке справочников:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить необходимые данные');
      }
    };
    
    fetchReferenceData();
  }, []);
  
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
      const currentDate = new Date(formData.departure_datetime);
      if (Platform.OS === 'android') {
        // For Android, maintain the time portion when changing date
        selectedDate.setHours(currentDate.getHours());
        selectedDate.setMinutes(currentDate.getMinutes());
      }
      handleChange('departure_datetime', selectedDate.toISOString());
    }
  };
  
  const handleArrivalDateChange = (event: any, selectedDate?: Date) => {
    setShowArrivalPicker(false);
    if (selectedDate) {
      const currentDate = new Date(formData.arrival_datetime);
      if (Platform.OS === 'android') {
        // For Android, maintain the time portion when changing date
        selectedDate.setHours(currentDate.getHours());
        selectedDate.setMinutes(currentDate.getMinutes());
      }
      handleChange('arrival_datetime', selectedDate.toISOString());
    }
  };
  
  // Add new handlers for time selection on Android
  const handleDepartureTimeChange = (event: any, selectedTime?: Date) => {
    setShowDepartureTimePicker(false);
    if (selectedTime) {
      const currentDate = new Date(formData.departure_datetime);
      currentDate.setHours(selectedTime.getHours());
      currentDate.setMinutes(selectedTime.getMinutes());
      handleChange('departure_datetime', currentDate.toISOString());
    }
  };
  
  const handleArrivalTimeChange = (event: any, selectedTime?: Date) => {
    setShowArrivalTimePicker(false);
    if (selectedTime) {
      const currentDate = new Date(formData.arrival_datetime);
      currentDate.setHours(selectedTime.getHours());
      currentDate.setMinutes(selectedTime.getMinutes());
      handleChange('arrival_datetime', currentDate.toISOString());
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
  const formatDisplayDate = (dateString: string): string => {
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
    
    if (new Date(formData.arrival_datetime) <= new Date(formData.departure_datetime)) {
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
  
  // Отправка формы
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все обязательные поля корректно');
      return;
    }
    
    try {
      setLoading(true);
      await deliveryService.createDelivery(formData);
      Alert.alert('Успех', 'Доставка успешно создана', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error: any) {
      console.error('Ошибка при создании доставки:', error);
      if (error.response?.data) {
        // Обработка ошибок валидации от сервера
        const serverErrors = error.response.data;
        const formattedErrors: Record<string, string> = {};
        
        Object.entries(serverErrors).forEach(([key, value]) => {
          formattedErrors[key] = Array.isArray(value) ? value[0].toString() : value.toString();
        });
        
        setErrors(formattedErrors);
      } else {
        Alert.alert('Ошибка', 'Не удалось создать доставку');
      }
    } finally {
      setLoading(false);
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
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>Новая доставка</Text>
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
          
          {/* For iOS - use a single datetime picker */}
          {Platform.OS === 'ios' && (
            <>
              <Button 
                mode="outlined" 
                onPress={() => setShowDeparturePicker(true)}
                style={styles.dateButton}
                icon="clock"
              >
                Отправка: {formatDisplayDate(formData.departure_datetime)}
              </Button>
              {errors.departure_datetime && <HelperText type="error">{errors.departure_datetime}</HelperText>}
              
              {showDeparturePicker && (
                <DateTimePicker
                  key="departure-picker"
                  value={new Date(formData.departure_datetime)}
                  mode="datetime"
                  onChange={handleDepartureDateChange}
                  display="default"
                  is24Hour={true}
                />
              )}
              
              <Button 
                mode="outlined" 
                onPress={() => setShowArrivalPicker(true)}
                style={styles.dateButton}
                icon="clock"
              >
                Прибытие: {formatDisplayDate(formData.arrival_datetime)}
              </Button>
              {errors.arrival_datetime && <HelperText type="error">{errors.arrival_datetime}</HelperText>}
              
              {showArrivalPicker && (
                <DateTimePicker
                  key="arrival-picker"
                  value={new Date(formData.arrival_datetime)}
                  mode="datetime"
                  onChange={handleArrivalDateChange}
                  display="default"
                  is24Hour={true}
                />
              )}
            </>
          )}
          
          {/* For Android - use separate date and time pickers */}
          {Platform.OS === 'android' && (
            <>
              <View style={styles.dateTimeContainer}>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowDeparturePicker(true)}
                  style={[styles.dateButton, styles.datePartButton]}
                  icon="calendar"
                >
                  Дата отправки: {format(new Date(formData.departure_datetime), 'dd.MM.yyyy', { locale: ru })}
                </Button>
                
                <Button 
                  mode="outlined" 
                  onPress={() => setShowDepartureTimePicker(true)}
                  style={[styles.dateButton, styles.datePartButton]}
                  icon="clock"
                >
                  Время: {format(new Date(formData.departure_datetime), 'HH:mm', { locale: ru })}
                </Button>
              </View>
              {errors.departure_datetime && <HelperText type="error">{errors.departure_datetime}</HelperText>}
              
              {showDeparturePicker && (
                <DateTimePicker
                  key="departure-date-picker"
                  value={new Date(formData.departure_datetime)}
                  mode="date"
                  onChange={handleDepartureDateChange}
                  display="default"
                />
              )}
              
              {showDepartureTimePicker && (
                <DateTimePicker
                  key="departure-time-picker"
                  value={new Date(formData.departure_datetime)}
                  mode="time"
                  onChange={handleDepartureTimeChange}
                  display="default"
                  is24Hour={true}
                />
              )}
              
              <View style={styles.dateTimeContainer}>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowArrivalPicker(true)}
                  style={[styles.dateButton, styles.datePartButton]}
                  icon="calendar"
                >
                  Дата прибытия: {format(new Date(formData.arrival_datetime), 'dd.MM.yyyy', { locale: ru })}
                </Button>
                
                <Button 
                  mode="outlined" 
                  onPress={() => setShowArrivalTimePicker(true)}
                  style={[styles.dateButton, styles.datePartButton]}
                  icon="clock"
                >
                  Время: {format(new Date(formData.arrival_datetime), 'HH:mm', { locale: ru })}
                </Button>
              </View>
              {errors.arrival_datetime && <HelperText type="error">{errors.arrival_datetime}</HelperText>}
              
              {showArrivalPicker && (
                <DateTimePicker
                  key="arrival-date-picker"
                  value={new Date(formData.arrival_datetime)}
                  mode="date"
                  onChange={handleArrivalDateChange}
                  display="default"
                />
              )}
              
              {showArrivalTimePicker && (
                <DateTimePicker
                  key="arrival-time-picker"
                  value={new Date(formData.arrival_datetime)}
                  mode="time"
                  onChange={handleArrivalTimeChange}
                  display="default"
                  is24Hour={true}
                />
              )}
            </>
          )}
          
          <TextInput
            label="Дистанция (км)"
            value={formData.distance.toString()}
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
          
          <Button 
            mode="outlined" 
            onPress={handleDocumentPick}
            icon="file-upload"
            style={styles.fileButton}
          >
            {formData.media_file ? 'Документ выбран' : 'Загрузить документ'}
          </Button>
          
          <Divider style={styles.divider} />
          
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.actionButton}
              disabled={loading}
            >
              Отмена
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.actionButton}
              loading={loading}
              disabled={loading}
            >
              Создать
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
    marginVertical: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  datePartButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default CreateDeliveryScreen; 