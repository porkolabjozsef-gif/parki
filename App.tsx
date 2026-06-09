import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import AppsScreen from './src/screens/AppsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { initNotifications } from './src/services/notificationService';

const Tab = createBottomTabNavigator();

export default function App() {
  useEffect(() => {
    initNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#0D0D0D',
              borderTopColor: '#1A1A1A',
              height: 60,
              paddingBottom: 8,
            },
            tabBarActiveTintColor: '#00E5A0',
            tabBarInactiveTintColor: '#444',
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarLabel: 'Főoldal',
              tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🅿️</Text>,
            }}
          />
          <Tab.Screen
            name="Apps"
            component={AppsScreen}
            options={{
              tabBarLabel: 'Alkalmazások',
              tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📱</Text>,
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarLabel: 'Beállítások',
              tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⚙️</Text>,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
