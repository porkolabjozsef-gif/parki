import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import AppsScreen from './src/screens/AppsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function Navigation() {
  const insets = useSafeAreaInsets();
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
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Főoldal', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🅿️</Text> }} />
      <Tab.Screen name="Apps" component={AppsScreen} options={{ tabBarLabel: 'Alkalmazások', tabBarIcon: () => <Text style={{ fontSize: 20 }}>📱</Text> }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Beállítások', tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚙️</Text> }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
