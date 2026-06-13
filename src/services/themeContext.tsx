import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, Theme } from './theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'system' | 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  mode: 'system',
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem('parki_theme_mode').then(val => {
      if (val === 'dark' || val === 'light' || val === 'system') {
        setModeState(val);
      }
    });
  }, []);

  const setMode = async (m: ThemeMode) => {
    setModeState(m);
    await AsyncStorage.setItem('parki_theme_mode', m);
  };

  const theme = mode === 'system'
    ? (systemScheme === 'light' ? lightTheme : darkTheme)
    : (mode === 'light' ? lightTheme : darkTheme);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
