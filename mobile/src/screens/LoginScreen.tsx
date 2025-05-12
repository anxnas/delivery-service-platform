import React, { useState } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Text, TextInput, HelperText } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

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
            <Text variant="headlineLarge" style={styles.appName}>
              Служба Доставки
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Управление доставками
            </Text>
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
});

export default LoginScreen; 