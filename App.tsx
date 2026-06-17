import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import { TouchableOpacity } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import AppsScreen from './src/screens/AppsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { LanguageProvider, useLanguage } from './src/services/languageContext';
import { ThemeProvider, useThemeContext } from './src/services/themeContext';
import { AppProvider } from './src/services/appContext';
import { initNotifications } from './src/services/notificationService';
import { startMonitoring } from './src/services/monitorService';
import { startBluetoothMonitor, setCarDeviceName } from './src/services/bluetoothService';
import { loadState } from './src/services/storageService';

function AppContent() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { theme } = useThemeContext();
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const tabs = [
    { key: 'home', label: () => t('home'), icon: '🅿️' },
    { key: 'apps', label: () => t('apps'), icon: '📱' },
    { key: 'settings', label: () => t('settings'), icon: '⚙️' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={e => setCurrentPage(e.nativeEvent.position)}
      >
        <View key="home" style={{ flex: 1 }}>
          <HomeScreen />
        </View>
        <View key="apps" style={{ flex: 1 }}>
          <AppsScreen />
        </View>
        <View key="settings" style={{ flex: 1 }}>
          <SettingsScreen />
        </View>
      </PagerView>

      {/* Tab bar */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: theme.card,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        paddingBottom: insets.bottom,
        height: 60 + insets.bottom,
      }}>
        {tabs.map((tab, i) => (
          <TouchableOpacity
            key={tab.key}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => pagerRef.current?.setPage(i)}
          >
            <Text style={{ fontSize: 20 }}>{tab.icon}</Text>
            <Text style={{
              fontSize: 11,
              color: currentPage === i ? theme.accent : theme.textFaint,
              fontWeight: currentPage === i ? '700' : '400',
            }}>{tab.label()}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
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
      <ThemeProvider>
        <AppProvider>
        <LanguageProvider>
          <StatusBar style="auto" />
          <AppContent />
        </LanguageProvider>
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
