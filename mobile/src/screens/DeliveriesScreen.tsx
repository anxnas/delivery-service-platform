import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Appbar, FAB, Text, ActivityIndicator, Snackbar, Portal, Modal, Button, IconButton, TextInput } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import DeliveryCard from '../components/DeliveryCard';
import DeliveryFilters from '../components/DeliveryFilters';
import { deliveryService } from '../api/deliveryService';
import { DeliveryFilters as FiltersType, DeliveryListItem } from '../types';

const DeliveriesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [deliveries, setDeliveries] = useState<DeliveryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FiltersType>({});
  const [showFilters, setShowFilters] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Состояние для поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filteredDeliveries, setFilteredDeliveries] = useState<DeliveryListItem[]>([]);
  
  // Фильтры из изображения
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('Все время пути');
  const [selectedDistanceFilter, setSelectedDistanceFilter] = useState('Все дистанции');

  // Загрузка доставок с учетом фильтров
  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const appliedFilters = { ...filters };
      
      const response = await deliveryService.getDeliveries(Object.keys(appliedFilters).length > 0 ? appliedFilters : undefined);
      
      // Преобразуем данные в соответствии с требуемым форматом
      const processedDeliveries = response.results.map((delivery) => ({
        ...delivery,
        number: delivery.id.substring(0, 4), // Используем id для краткого номера
        // Используем существующие поля status_name и status_color из ответа сервера
        // для определения статуса и его отображения
        is_completed: delivery.status_name === 'Проведено', // Используем поле status_name для определения завершенности
        cargo_type: delivery.package_type_name, // Используем тип упаковки как тип груза
      }));
      
      setDeliveries(processedDeliveries);
      setFilteredDeliveries(processedDeliveries);
    } catch (err) {
      console.error('Ошибка при загрузке доставок:', err);
      setError('Не удалось загрузить доставки. Проверьте подключение и попробуйте снова.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  // Загрузка доставок при первом рендере и при изменении фильтров
  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  // Обновление списка при возвращении на экран
  useFocusEffect(
    useCallback(() => {
      fetchDeliveries();
    }, [fetchDeliveries])
  );

  // Обработчик обновления через pull-to-refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDeliveries();
  };

  // Обработчик применения фильтров
  const handleApplyFilters = (newFilters: FiltersType) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setFilters({});
    setShowFilters(false);
  };

  // Обработчик удаления доставки
  const handleDeleteDelivery = (id: string) => {
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
              await deliveryService.deleteDelivery(id);
              // Обновляем список после удаления
              setDeliveries(prev => prev.filter(delivery => delivery.id !== id));
              showSnackbar('Доставка успешно удалена');
            } catch (err) {
              console.error('Ошибка при удалении доставки:', err);
              showSnackbar('Не удалось удалить доставку');
            }
          }
        }
      ]
    );
  };

  // Обработчик проведения доставки
  const handleCompleteDelivery = async (id: string) => {
    try {
      await deliveryService.completeDelivery(id);
      // Обновляем список после изменения
      fetchDeliveries();
      showSnackbar('Доставка успешно проведена');
    } catch (err) {
      console.error('Ошибка при проведении доставки:', err);
      showSnackbar('Не удалось провести доставку');
    }
  };

  // Показ снэкбара с сообщением
  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Функция для поиска доставок
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredDeliveries(deliveries);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const filtered = deliveries.filter(
      delivery => 
        delivery.id.toLowerCase().includes(lowercaseQuery) ||
        (delivery.number && delivery.number.toLowerCase().includes(lowercaseQuery)) ||
        (delivery.cargo_type && delivery.cargo_type.toLowerCase().includes(lowercaseQuery)) ||
        (delivery.destination_address && delivery.destination_address.toLowerCase().includes(lowercaseQuery)) ||
        (delivery.source_address && delivery.source_address.toLowerCase().includes(lowercaseQuery))
    );
    
    setFilteredDeliveries(filtered);
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <View style={styles.header}>
        <Text style={styles.title}>Доставка</Text>
        <View style={styles.headerActions}>
          <IconButton 
            icon="filter-variant" 
            size={24} 
            iconColor="#FFFFFF" 
            onPress={() => setShowFilters(true)} 
          />
          <IconButton 
            icon="magnify" 
            size={24} 
            iconColor="#FFFFFF" 
            onPress={() => setShowSearch(true)}
          />
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6750A4" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : filteredDeliveries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Доставки не найдены</Text>
          <Text style={styles.emptySubtext}>
            Попробуйте изменить параметры поиска или создайте новую доставку
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDeliveries}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <DeliveryCard
              delivery={item}
              onDelete={handleDeleteDelivery}
              onComplete={handleCompleteDelivery}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#6750A4']}
              tintColor="#6750A4"
            />
          }
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateDelivery')}
      />

      <Portal>
        <Modal 
          visible={showFilters} 
          onDismiss={() => setShowFilters(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <DeliveryFilters
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
            initialFilters={filters}
          />
        </Modal>

        {/* Модальное окно поиска */}
        <Modal
          visible={showSearch}
          onDismiss={() => setShowSearch(false)}
          contentContainerStyle={styles.searchModalContainer}
        >
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Поиск по номеру, адресу или типу груза"
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
              mode="outlined"
              style={styles.searchInput}
              right={
                <TextInput.Icon 
                  icon="close" 
                  onPress={() => {
                    setSearchQuery('');
                    handleSearch('');
                  }} 
                />
              }
            />
            <Button 
              mode="contained" 
              onPress={() => setShowSearch(false)}
              style={styles.searchButton}
            >
              Готово
            </Button>
          </View>
        </Modal>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1B1F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterButtonContainer: {
    marginRight: 8,
  },
  filterButton: {
    height: 36,
  },
  filterButtonStyle: {
    borderColor: '#49454F',
    borderRadius: 20,
  },
  filterButtonLabel: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 80, // Для FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: '#E6E1E5',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: '#E6E1E5',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#CAC4D0',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6750A4',
  },
  modalContainer: {
    flex: 1,
    margin: 0,
    backgroundColor: 'transparent',
  },
  snackbar: {
    backgroundColor: '#2d2c31',
  },
  searchModalContainer: {
    backgroundColor: '#2d2c31',
    margin: 16,
    borderRadius: 8,
    padding: 16,
  },
  searchContainer: {
    width: '100%',
  },
  searchInput: {
    backgroundColor: '#1C1B1F',
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: '#6750A4',
  },
});

export default DeliveriesScreen; 