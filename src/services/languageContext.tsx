import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLanguage, LANGUAGES, t as translate } from './i18nService';

interface LanguageContextType {
  currentLang: string;
  changeLanguage: (code: string) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLang: 'hu',
  changeLanguage: async () => {},
  t: translate,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLang, setCurrentLang] = useState('hu');

  useEffect(() => {
    AsyncStorage.getItem('language').then(lang => {
      if (lang) setCurrentLang(lang);
    });
  }, []);

  const changeLanguage = async (code: string) => {
    await setLanguage(code);
    setCurrentLang(code);
  };

  return (
    <LanguageContext.Provider value={{ currentLang, changeLanguage, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
