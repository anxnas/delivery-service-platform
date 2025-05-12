import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Button, Card, Chip, Divider, IconButton, Text, ActivityIndicator, Banner } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { deliveryService } from '../api/deliveryService';
import { DeliveryDetail, TransportModel, PackageType, Service, Status } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { referenceService } from '../api/referenceService';

type DeliveryDetailsRouteProp = RouteProp<RootStackParamList, 'DeliveryDetails'>;

type ReferenceData = {
  transportModels: TransportModel[];
  packageTypes: PackageType[];
  services: Service[];
  statuses: Status[];
};

const DeliveryDetailsScreen: React.FC = () => {
  const route = useRoute<DeliveryDetailsRouteProp>();
  const { id } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const [delivery, setDelivery] = useState<DeliveryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referenceData, setReferenceData] = useState<ReferenceData>({
    transportModels: [],
    packageTypes: [],
    services: [],
    statuses: []
  });
  
  // Загрузка справочников и детальной информации о доставке
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Загружаем справочники
      const [
        transportModelsResponse, 
        packageTypesResponse, 
        servicesResponse, 
        statusesResponse,
        deliveryData
      ] = await Promise.all([
        referenceService.getTransportModels(),
        referenceService.getPackageTypes(),
        referenceService.getServices(),
        referenceService.getStatuses(),
        deliveryService.getDeliveryById(id)
      ]);
      
      setReferenceData({
        transportModels: transportModelsResponse.results,
        packageTypes: packageTypesResponse.results,
        services: servicesResponse.results,
        statuses: statusesResponse.results
      });
      
      setDelivery(deliveryData);
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      setError('Не удалось загрузить информацию о доставке');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [id]);
  
  // Обработчик проведения доставки
  const handleCompleteDelivery = async () => {
    try {
      setLoading(true);
      await deliveryService.completeDelivery(id);
      // Обновляем данные после изменения статуса
      await fetchData();
      Alert.alert('Успех', 'Доставка успешно проведена');
    } catch (err) {
      console.error('Ошибка при проведении доставки:', err);
      Alert.alert('Ошибка', 'Не удалось провести доставку');
    } finally {
      setLoading(false);
    }
  };
  
  // Обработчик удаления доставки
  const handleDeleteDelivery = () => {
    Alert.alert(
      'Удаление доставки',
      'Вы уверены, что хотите удалить эту доставку? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deliveryService.deleteDelivery(id);
              navigation.goBack();
            } catch (err) {
              console.error('Ошибка при удалении доставки:', err);
              Alert.alert('Ошибка', 'Не удалось удалить доставку');
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // Форматирование даты
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, 'dd.MM.yyyy HH:mm', { locale: ru });
  };
  
  // Отображение документа, если он есть
  const openMediaFile = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Ошибка', 'Не удалось открыть файл');
      }
    });
  };
  
  // Получение названия по ID из справочника
  const getModelName = (id: string): string => {
    const model = referenceData.transportModels.find(m => m.id === id);
    return model ? model.name : id;
  };
  
  const getPackageTypeName = (id: string): string => {
    const packageType = referenceData.packageTypes.find(p => p.id === id);
    return packageType ? packageType.name : id;
  };
  
  const getServiceName = (id: string): string => {
    const service = referenceData.services.find(s => s.id === id);
    return service ? service.name : id;
  };
  
  const getStatusName = (id: string): string => {
    const status = referenceData.statuses.find(s => s.id === id);
    return status ? status.name : id;
  };
  
  const getStatusColor = (id: string): string => {
    const status = referenceData.statuses.find(s => s.id === id);
    return status ? status.color : '#CAC4D0';
  };
  
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6750A4" />
      </View>
    );
  }
  
  if (error || !delivery) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Информация о доставке не найдена'}</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
          Вернуться назад
        </Button>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Text variant="titleLarge" style={styles.title}>
              {delivery.transport_number}
            </Text>
            <IconButton
              icon="pencil"
              size={24}
              onPress={() => navigation.navigate('EditDelivery', { id: delivery.id })}
            />
          </View>
          
          <View style={styles.statusRow}>
            {delivery.status && (
              <Chip
                style={[
                  styles.statusChip, 
                  { backgroundColor: `${getStatusColor(delivery.status)}20` }
                ]}
                textStyle={{ color: getStatusColor(delivery.status), fontWeight: 'bold' }}
              >
                {getStatusName(delivery.status)}
              </Chip>
            )}
            
            <Chip
              style={[
                styles.statusChip,
                delivery.technical_condition === 'good' 
                  ? { backgroundColor: 'rgba(0, 150, 0, 0.15)' } 
                  : { backgroundColor: 'rgba(255, 0, 0, 0.15)' }
              ]}
              textStyle={{ 
                color: delivery.technical_condition === 'good' ? '#00c853' : '#ff5252',
                fontWeight: 'bold' 
              }}
            >
              {delivery.technical_condition === 'good' ? 'Исправно' : 'Неисправно'}
            </Chip>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Информация о транспорте</Text>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Модель:</Text>
              <Text variant="bodyMedium" style={styles.value}>{getModelName(delivery.transport_model)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Номер:</Text>
              <Text variant="bodyMedium" style={styles.value}>{delivery.transport_number}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Тех. состояние:</Text>
              <Text variant="bodyMedium" style={styles.value}>
                {delivery.technical_condition === 'good' ? 'Исправно' : 'Неисправно'}
              </Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Информация о доставке</Text>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Отправка:</Text>
              <Text variant="bodyMedium" style={styles.value}>{formatDate(delivery.departure_datetime)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Прибытие:</Text>
              <Text variant="bodyMedium" style={styles.value}>{formatDate(delivery.arrival_datetime)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Дистанция:</Text>
              <Text variant="bodyMedium" style={styles.value}>{delivery.distance} км</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Продолжительность:</Text>
              <Text variant="bodyMedium" style={styles.value}>{delivery.duration} ч</Text>
            </View>
            
            {delivery.departure_address && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>Адрес отправки:</Text>
                <Text variant="bodyMedium" style={styles.value}>{delivery.departure_address}</Text>
              </View>
            )}
            
            {delivery.arrival_address && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>Адрес прибытия:</Text>
                <Text variant="bodyMedium" style={styles.value}>{delivery.arrival_address}</Text>
              </View>
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Дополнительная информация</Text>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Тип упаковки:</Text>
              <Text variant="bodyMedium" style={styles.value}>{getPackageTypeName(delivery.package_type)}</Text>
            </View>
            
            <View style={styles.servicesContainer}>
              <Text variant="bodyMedium" style={styles.label}>Услуги:</Text>
              <View style={styles.chipContainer}>
                {delivery.services.map((serviceId, index) => (
                  <Chip key={index} style={styles.chip}>{getServiceName(serviceId)}</Chip>
                ))}
              </View>
            </View>
            
            {delivery.media_file && (
              <Button
                mode="outlined"
                icon="file-document"
                onPress={() => openMediaFile(delivery.media_file!)}
                style={styles.mediaButton}
              >
                Открыть документ
              </Button>
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              icon="delete"
              onPress={handleDeleteDelivery}
              style={[styles.actionButton, styles.deleteButton]}
              textColor="#B3261E"
            >
              Удалить
            </Button>
            
            <Button
              mode="contained"
              icon="check"
              onPress={handleCompleteDelivery}
              style={styles.actionButton}
            >
              Провести
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
  },
  card: {
    backgroundColor: '#2d2c31',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#E6E1E5',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statusChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  divider: {
    backgroundColor: '#49454F',
    marginVertical: 16,
  },
  infoSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#E6E1E5',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 140,
    color: '#CAC4D0',
  },
  value: {
    flex: 1,
    color: '#E6E1E5',
  },
  servicesContainer: {
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    margin: 4,
    backgroundColor: '#49454F',
  },
  mediaButton: {
    marginTop: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  deleteButton: {
    borderColor: '#B3261E',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1B1F',
    padding: 16,
  },
  errorText: {
    color: '#E6E1E5',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});

export default DeliveryDetailsScreen; 