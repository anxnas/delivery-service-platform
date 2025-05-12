import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Button, Card, Chip, Divider, IconButton, Text, ActivityIndicator, Banner } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { deliveryService } from '../api/deliveryService';
import { DeliveryDetail } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

type DeliveryDetailsRouteProp = RouteProp<RootStackParamList, 'DeliveryDetails'>;

const DeliveryDetailsScreen: React.FC = () => {
  const route = useRoute<DeliveryDetailsRouteProp>();
  const { id } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const [delivery, setDelivery] = useState<DeliveryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Загрузка детальной информации о доставке
  const fetchDeliveryDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await deliveryService.getDeliveryById(id);
      setDelivery(data);
    } catch (err) {
      console.error('Ошибка при загрузке данных доставки:', err);
      setError('Не удалось загрузить информацию о доставке');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDeliveryDetails();
  }, [id]);
  
  // Обработчик проведения доставки
  const handleCompleteDelivery = async () => {
    try {
      setLoading(true);
      await deliveryService.completeDelivery(id);
      // Обновляем данные после изменения статуса
      await fetchDeliveryDetails();
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
          
          <Chip
            style={[styles.statusChip]}
            textStyle={{ fontWeight: 'bold' }}
          >
            {delivery.technical_condition === 'good' ? 'Исправно' : 'Неисправно'}
          </Chip>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Информация о транспорте</Text>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Модель:</Text>
              <Text variant="bodyMedium" style={styles.value}>{delivery.transport_model}</Text>
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
              <Text variant="bodyMedium" style={styles.value}>{delivery.package_type}</Text>
            </View>
            
            <View style={styles.servicesContainer}>
              <Text variant="bodyMedium" style={styles.label}>Услуги:</Text>
              <View style={styles.chipContainer}>
                {delivery.services.map((service, index) => (
                  <Chip key={index} style={styles.chip}>{service}</Chip>
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
  statusChip: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    backgroundColor: '#49454F',
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