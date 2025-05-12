import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert, TouchableWithoutFeedback } from 'react-native';
import { Avatar, Button, Card, Divider, List, Text, TextInput, Portal, Modal } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const [tapCount, setTapCount] = useState(0);
  const [showApiUrlDialog, setShowApiUrlDialog] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const tapTimer = useRef<NodeJS.Timeout | null>(null);

  // Загружаем текущий URL API при открытии диалога
  const handleOpenDialog = async () => {
    try {
      const currentUrl = await AsyncStorage.getItem('apiBaseUrl');
      setApiUrl(currentUrl || 'http://localhost:8000');
      setShowApiUrlDialog(true);
    } catch (error) {
      console.error('Ошибка при получении URL API:', error);
      setApiUrl('http://localhost:8000');
      setShowApiUrlDialog(true);
    }
  };

  // Сохраняем новый URL API
  const handleSaveApiUrl = async () => {
    try {
      await AsyncStorage.setItem('apiBaseUrl', apiUrl);
      setShowApiUrlDialog(false);
      Alert.alert('Успех', 'URL API успешно обновлен. Перезапустите приложение для применения изменений.');
    } catch (error) {
      console.error('Ошибка при сохранении URL API:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить URL API');
    }
  };

  // Обработчик нажатий на заголовок экрана
  const handleTitlePress = () => {
    setTapCount(prev => {
      const newCount = prev + 1;
      
      // Сбрасываем предыдущий таймер
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
      }
      
      // Устанавливаем новый таймер для сброса счетчика через 2 секунды
      tapTimer.current = setTimeout(() => {
        setTapCount(0);
      }, 2000);
      
      // Если достигли 3 нажатий, открываем диалог
      if (newCount === 3) {
        handleOpenDialog();
        return 0; // Сбрасываем счетчик
      }
      
      return newCount;
    });
  };

  // Форматирование даты
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, 'dd.MM.yyyy', { locale: ru });
  };

  // Получение инициалов пользователя для аватара
  const getInitials = (): string => {
    if (!user) return '';
    
    const firstNameInitial = user.first_name ? user.first_name.charAt(0) : '';
    const lastNameInitial = user.last_name ? user.last_name.charAt(0) : '';
    
    if (firstNameInitial && lastNameInitial) {
      return `${firstNameInitial}${lastNameInitial}`;
    } else if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    
    return '';
  };

  // Обработчик выхода из системы
  const handleLogout = () => {
    Alert.alert(
      'Выход из системы',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Ошибка при выходе из системы:', error);
              Alert.alert('Ошибка', 'Не удалось выйти из системы');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <TouchableWithoutFeedback onPress={handleTitlePress}>
        <View style={styles.profileContainer}>
          <Avatar.Text 
            size={80} 
            label={getInitials()} 
            style={styles.avatar}
          />
          
          <Text variant="headlineSmall" style={styles.nameText}>
            {user?.first_name} {user?.last_name}
          </Text>
          
          <Text variant="titleMedium" style={styles.usernameText}>
            @{user?.username}
          </Text>
        </View>
      </TouchableWithoutFeedback>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Информация о пользователе
          </Text>
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Имя пользователя"
            description={user?.username}
            left={props => <List.Icon {...props} icon="account" />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
          />
          
          <List.Item
            title="Email"
            description={user?.email}
            left={props => <List.Icon {...props} icon="email" />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
          />
          
          <List.Item
            title="Дата регистрации"
            description={user?.date_joined ? formatDate(user?.date_joined) : ''}
            left={props => <List.Icon {...props} icon="calendar" />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
          />
          
          {user?.is_staff && (
            <List.Item
              title="Права доступа"
              description="Администратор"
              left={props => <List.Icon {...props} icon="shield-account" />}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
            />
          )}
        </Card.Content>
      </Card>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={handleLogout}
          icon="logout"
          loading={isLoading}
          disabled={isLoading}
          style={styles.logoutButton}
        >
          Выйти из системы
        </Button>
      </View>

      {/* Диалог для ввода URL API */}
      <Portal>
        <Modal
          visible={showApiUrlDialog}
          onDismiss={() => setShowApiUrlDialog(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text variant="titleMedium" style={styles.modalTitle}>
            URL API сервера
          </Text>
          <TextInput
            label="URL API"
            value={apiUrl}
            onChangeText={setApiUrl}
            style={styles.apiUrlInput}
            autoCapitalize="none"
            keyboardType="url"
          />
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowApiUrlDialog(false)}
              style={styles.modalButton}
            >
              Отмена
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveApiUrl}
              style={styles.modalButton}
            >
              Сохранить
            </Button>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1B1F',
    padding: 16,
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: '#6750A4',
  },
  nameText: {
    color: '#E6E1E5',
    marginBottom: 4,
    textAlign: 'center',
  },
  usernameText: {
    color: '#CAC4D0',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#2d2c31',
    marginVertical: 16,
  },
  sectionTitle: {
    color: '#E6E1E5',
    marginBottom: 8,
  },
  divider: {
    backgroundColor: '#49454F',
    marginBottom: 16,
  },
  listTitle: {
    color: '#CAC4D0',
  },
  listDescription: {
    color: '#E6E1E5',
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 24,
  },
  logoutButton: {
    paddingVertical: 8,
  },
  modalContainer: {
    backgroundColor: '#2d2c31',
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    color: '#E6E1E5',
    marginBottom: 16,
    textAlign: 'center',
  },
  apiUrlInput: {
    backgroundColor: '#1C1B1F',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default ProfileScreen; 