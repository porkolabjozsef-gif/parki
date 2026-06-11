import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import AppsScreen from './src/screens/AppsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { LanguageProvider, useLanguage } from './src/services/languageContext';
import { initNotifications } from './src/services/notificationService';
import { startMonitoring } from './src/services/monitorService';
import { startBluetoothMonitor, setCarDeviceName } from './src/services/bluetoothService';
import { loadState } from './src/services/storageService';

const Tab = createBottomTabNavigator();

function Navigation() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0D0D0D',
          borderTopColor: '#1A1A1A',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: '#00E5A0',
        tabBarInactiveTintColor: '#444',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('home'), tabBarIcon: () => <Text style={{ fontSize: 20 }}>🅿️</Text> }} />
      <Tab.Screen name="Apps" component={AppsScreen} options={{ tabBarLabel: t('apps'), tabBarIcon: () => <Text style={{ fontSize: 20 }}>📱</Text> }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: t('settings'), tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚙️</Text> }} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    (async () => {
      try {
        await initNotifications();
        await startMonitoring();
        const state = await loadState();
        setCarDeviceName(state.carDeviceName ?? null);
        startBluetoothMonitor();
      } catch (e) {
        console.log('Monitoring init error:', e);
      }
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <StatusBar style="light" />
        <NavigationContainer>
          <Navigation />
        </NavigationContainer>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
