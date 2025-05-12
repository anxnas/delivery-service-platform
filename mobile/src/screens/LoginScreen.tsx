import React, { useState, useRef } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Alert } from 'react-native';
import { Button, Text, TextInput, HelperText, Portal, Modal } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  // Для отслеживания нажатий на заголовок
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
      Alert.alert('Успех', 'URL API успешно обновлен');
    } catch (error) {
      console.error('Ошибка при сохранении URL API:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить URL API');
    }
  };

  // Обработчик нажатий на заголовок
  const handleTitlePress = () => {
    setTapCount(prev => {
      const newCount = prev + 1;
      
      // Сбрасываем предыдущий таймер
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
      }
      
      // Устанавливаем новый таймер для сброса счетчика через 3 секунды
      tapTimer.current = setTimeout(() => {
        setTapCount(0);
      }, 3000);
      
      // Если достигли 5 нажатий, открываем диалог
      if (newCount === 5) {
        handleOpenDialog();
        return 0; // Сбрасываем счетчик
      }
      
      return newCount;
    });
  };

  const handleLogin = async () => {
    // Валидация
    if (!username.trim() || !password.trim()) {
      setError('Логин и пароль обязательны');
      return;
    }

    try {
      setError(null);
      await login(username, password);
    } catch (err: any) {
      // Обработка ошибок авторизации
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Ошибка при входе в систему. Пожалуйста, попробуйте позже.');
      }
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <TouchableWithoutFeedback onPress={handleTitlePress}>
              <View>
                <Text variant="headlineLarge" style={styles.appName}>
                  Служба Доставки
                </Text>
                <Text variant="bodyLarge" style={styles.subtitle}>
                  Управление доставками
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              label="Имя пользователя"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              autoCapitalize="none"
              mode="outlined"
              disabled={isLoading}
            />

            <TextInput
              label="Пароль"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureTextEntry}
              style={styles.input}
              mode="outlined"
              disabled={isLoading}
              right={
                <TextInput.Icon 
                  icon={secureTextEntry ? 'eye' : 'eye-off'} 
                  onPress={() => setSecureTextEntry(!secureTextEntry)} 
                />
              }
            />

            {error && (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              loading={isLoading}
              disabled={isLoading}
            >
              Войти
            </Button>

            <Text style={styles.termsText}>
              Для входа используйте учетные данные, предоставленные администратором системы
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
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
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    color: '#E6E1E5',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#CAC4D0',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#1C1B1F',
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 8,
  },
  termsText: {
    color: '#CAC4D0',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 16,
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

export default LoginScreen; 