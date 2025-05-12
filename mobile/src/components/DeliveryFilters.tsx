import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, Divider, Text, TextInput, TouchableRipple } from 'react-native-paper';
import { DeliveryFilters as FiltersType } from '../types';

type DeliveryFiltersProps = {
  onApplyFilters: (filters: FiltersType) => void;
  onResetFilters: () => void;
  initialFilters?: FiltersType;
};

const DeliveryFilters: React.FC<DeliveryFiltersProps> = ({ 
  onApplyFilters, 
  onResetFilters, 
  initialFilters = {} 
}) => {
  const [filters, setFilters] = useState<FiltersType>(initialFilters);
  const [minDistanceText, setMinDistanceText] = useState(initialFilters.min_distance?.toString() || '');
  const [maxDistanceText, setMaxDistanceText] = useState(initialFilters.max_distance?.toString() || '');
  const [minDurationText, setMinDurationText] = useState(initialFilters.min_duration?.toString() || '');
  const [maxDurationText, setMaxDurationText] = useState(initialFilters.max_duration?.toString() || '');
  const [distanceError, setDistanceError] = useState('');
  
  // Обработчики для изменения фильтров
  const handleFilterChange = (key: keyof FiltersType, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Валидация и установка минимальной дистанции
  const handleMinDistanceChange = (text: string) => {
    setMinDistanceText(text);
    
    if (text === '') {
      const { min_distance, ...rest } = filters;
      setFilters(rest);
      setDistanceError('');
      return;
    }
    
    const numValue = parseFloat(text);
    if (isNaN(numValue)) {
      setDistanceError('Введите корректное числовое значение');
      return;
    }
    
    if (filters.max_distance !== undefined && numValue > filters.max_distance) {
      setDistanceError('Минимальная дистанция не может быть больше максимальной');
      return;
    }
    
    setDistanceError('');
    handleFilterChange('min_distance', numValue);
  };
  
  // Валидация и установка максимальной дистанции
  const handleMaxDistanceChange = (text: string) => {
    setMaxDistanceText(text);
    
    if (text === '') {
      const { max_distance, ...rest } = filters;
      setFilters(rest);
      setDistanceError('');
      return;
    }
    
    const numValue = parseFloat(text);
    if (isNaN(numValue)) {
      setDistanceError('Введите корректное числовое значение');
      return;
    }
    
    if (filters.min_distance !== undefined && numValue < filters.min_distance) {
      setDistanceError('Максимальная дистанция не может быть меньше минимальной');
      return;
    }
    
    setDistanceError('');
    handleFilterChange('max_distance', numValue);
  };

  // Валидация и установка минимальной длительности
  const handleMinDurationChange = (text: string) => {
    setMinDurationText(text);
    
    if (text === '') {
      const { min_duration, ...rest } = filters;
      setFilters(rest);
      return;
    }
    
    const numValue = parseFloat(text);
    if (!isNaN(numValue)) {
      handleFilterChange('min_duration', numValue);
    }
  };
  
  // Валидация и установка максимальной длительности
  const handleMaxDurationChange = (text: string) => {
    setMaxDurationText(text);
    
    if (text === '') {
      const { max_duration, ...rest } = filters;
      setFilters(rest);
      return;
    }
    
    const numValue = parseFloat(text);
    if (!isNaN(numValue)) {
      handleFilterChange('max_duration', numValue);
    }
  };
  
  // Применение фильтров
  const applyFilters = () => {
    // Если есть ошибки в фильтрах, не применяем их
    if (distanceError) {
      return;
    }
    
    // Удалить пустые фильтры
    const cleanedFilters: FiltersType = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanedFilters[key as keyof FiltersType] = value;
      }
    });
    
    onApplyFilters(cleanedFilters);
  };
  
  // Сброс фильтров
  const resetFilters = () => {
    setFilters({});
    setMinDistanceText('');
    setMaxDistanceText('');
    setMinDurationText('');
    setMaxDurationText('');
    setDistanceError('');
    onResetFilters();
  };
  
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>Фильтры</Text>
        <Divider style={styles.divider} />
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.filterSection}>
            <Text variant="labelLarge" style={styles.sectionTitle}>Время в пути</Text>
            
            <View style={styles.row}>
              <TextInput
                label="Мин. время (ч)"
                value={minDurationText}
                onChangeText={handleMinDurationChange}
                style={styles.halfInput}
                keyboardType="numeric"
                mode="outlined"
              />
              
              <TextInput
                label="Макс. время (ч)"
                value={maxDurationText}
                onChangeText={handleMaxDurationChange}
                style={styles.halfInput}
                keyboardType="numeric"
                mode="outlined"
              />
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text variant="labelLarge" style={styles.sectionTitle}>Дистанция</Text>
            
            <View style={styles.row}>
              <TextInput
                label="Мин. дистанция (км)"
                value={minDistanceText}
                onChangeText={handleMinDistanceChange}
                style={styles.halfInput}
                keyboardType="numeric"
                mode="outlined"
                error={!!distanceError}
              />
              
              <TextInput
                label="Макс. дистанция (км)"
                value={maxDistanceText}
                onChangeText={handleMaxDistanceChange}
                style={styles.halfInput}
                keyboardType="numeric"
                mode="outlined"
                error={!!distanceError}
              />
            </View>
            
            {distanceError ? <Text style={styles.errorText}>{distanceError}</Text> : null}
          </View>
          
          <View style={styles.buttonContainer}>
            <Button 
              mode="outlined" 
              onPress={resetFilters} 
              style={styles.button}
            >
              Сбросить
            </Button>
            
            <Button 
              mode="contained" 
              onPress={applyFilters}
              style={styles.button}
              disabled={!!distanceError}
            >
              Применить
            </Button>
          </View>
        </ScrollView>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2d2c31',
    margin: 16,
  },
  title: {
    marginBottom: 8,
    color: '#E6E1E5',
  },
  divider: {
    backgroundColor: '#49454F',
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    color: '#CAC4D0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#1C1B1F',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  errorText: {
    color: '#F2B8B5',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default DeliveryFilters; 