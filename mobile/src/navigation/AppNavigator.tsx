import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList, MainTabParamList } from '../types';
import { ActivityIndicator, View } from 'react-native';
import { IconButton } from 'react-native-paper';

// Экраны
import LoginScreen from '../screens/LoginScreen';
import DeliveriesScreen from '../screens/DeliveriesScreen';
import DeliveryDetailsScreen from '../screens/DeliveryDetailsScreen';
import CreateDeliveryScreen from '../screens/CreateDeliveryScreen';
import EditDeliveryScreen from '../screens/EditDeliveryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Навигация для авторизованных пользователей - только экран доставок
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6750A4',
        tabBarInactiveTintColor: '#CAC4D0',
        tabBarStyle: { backgroundColor: '#1C1B1F' } // Скрываем таббар полностью
      }}
    >
      <Tab.Screen
        name="Deliveries"
        component={DeliveriesScreen}
        options={{
          tabBarLabel: 'Доставки',
          tabBarIcon: ({ color, size }) => (
            <IconButton icon="truck-delivery" size={size} iconColor={color} />
          )
        }}
      />
      <Tab.Screen
        name="More"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Ещё',
          tabBarIcon: ({ color, size }) => (
            <IconButton icon="menu" size={size} iconColor={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
};

// Основная навигация приложения
const AppNavigator = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1C1B1F' }}>
        <ActivityIndicator size="large" color="#6750A4" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1C1B1F' },
        headerTintColor: '#E6E1E5',
        contentStyle: { backgroundColor: '#1C1B1F' }
      }}
    >
      {!isAuthenticated ? (
        // Неавторизованный стек
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
      ) : (
        // Авторизованный стек
        <>
          <Stack.Screen 
            name="Main" 
            component={MainTabNavigator} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="DeliveryDetails" 
            component={DeliveryDetailsScreen} 
            options={{ title: 'Детали доставки' }}
          />
          <Stack.Screen 
            name="CreateDelivery" 
            component={CreateDeliveryScreen} 
            options={{ title: 'Создание доставки' }}
          />
          <Stack.Screen 
            name="EditDelivery" 
            component={EditDeliveryScreen} 
            options={{ title: 'Редактирование доставки' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator; 