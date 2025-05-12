import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { DeliveryListItem } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type DeliveryCardProps = {
  delivery: DeliveryListItem;
  onDelete?: (id: string) => void;
  onComplete?: (id: string) => void;
};

const DeliveryCard: React.FC<DeliveryCardProps> = ({ delivery, onDelete, onComplete }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePress = () => {
    navigation.navigate('DeliveryDetails', { id: delivery.id });
  };

  // Преобразуем цвет статуса из API в стиль для фона чипа
  const getStatusBackgroundColor = (statusColor: string) => {
    // Добавляем прозрачность к цвету
    // Если statusColor в формате #RRGGBB, преобразуем к rgba(R, G, B, 0.15)
    if (statusColor && statusColor.startsWith('#') && statusColor.length === 7) {
      const r = parseInt(statusColor.slice(1, 3), 16);
      const g = parseInt(statusColor.slice(3, 5), 16);
      const b = parseInt(statusColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.15)`;
    }
    // Если цвет неизвестен, используем значение по умолчанию
    return 'rgba(255, 180, 0, 0.15)';
  };

  return (
    <Card style={styles.card} onPress={handlePress}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.deliveryNumber}>
              №{delivery.number || delivery.id.substring(0, 4)}
            </Text>
          </View>
          <IconButton
            icon="chevron-right"
            size={24}
            iconColor="#CAC4D0"
            onPress={handlePress}
          />
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <IconButton icon="clock-outline" size={20} style={styles.iconButton} iconColor="#CAC4D0" />
            <Text variant="bodyMedium" style={styles.info}>{delivery.duration || 2} часа</Text>
          </View>
          
          <View style={styles.infoItem}>
            <IconButton icon="map-marker-distance" size={20} style={styles.iconButton} iconColor="#CAC4D0" />
            <Text variant="bodyMedium" style={styles.info}>{delivery.distance || 2} км</Text>
          </View>
          
          <View style={styles.infoItem}>
            <IconButton icon="package-variant" size={20} style={styles.iconButton} iconColor="#CAC4D0" />
            <Text variant="bodyMedium" style={styles.info}>{delivery.cargo_type || delivery.package_type_name || 'Не указан'}</Text>
          </View>
        </View>
        
        <View style={styles.statusRow}>
          {/* Отображаем статус из API */}
          {delivery.status_name && (
            <View 
              style={[
                styles.statusChip, 
                { backgroundColor: getStatusBackgroundColor(delivery.status_color) }
              ]}
            >
              <Text style={[styles.statusText, { color: delivery.status_color || '#ffab00' }]}>
                {delivery.status_name}
              </Text>
            </View>
          )}
          
          {/* Отображаем техническое состояние */}
          <View style={[
            styles.statusChip, 
            delivery.technical_condition === 'bad' ? styles.badCondition : styles.goodCondition
          ]}>
            <Text style={[
              styles.statusText, 
              delivery.technical_condition === 'bad' ? styles.badConditionText : styles.goodConditionText
            ]}>
              {delivery.technical_condition === 'bad' ? 'Неисправно' : 'Исправно'}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1B1F',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2d2c31',
  },
  cardContent: {
    padding: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryNumber: {
    color: '#E6E1E5',
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  iconButton: {
    margin: 0,
    padding: 0,
  },
  info: {
    color: '#CAC4D0',
    fontSize: 12,
  },
  statusRow: {
    flexDirection: 'row',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  completedStatus: {
    backgroundColor: 'rgba(0, 150, 0, 0.15)',
  },
  completedText: {
    color: '#00c853',
  },
  waitingStatus: {
    backgroundColor: 'rgba(255, 180, 0, 0.15)',
  },
  waitingText: {
    color: '#ffab00',
  },
  goodCondition: {
    backgroundColor: 'rgba(0, 150, 0, 0.15)',
  },
  goodConditionText: {
    color: '#00c853',
  },
  badCondition: {
    backgroundColor: 'rgba(255, 0, 0, 0.15)',
  },
  badConditionText: {
    color: '#ff5252',
  },
});

export default DeliveryCard; 