import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n, { setLanguage, LANGUAGES, t as translate } from './i18nService';

interface LanguageContextType {
  currentLang: string;
  changeLanguage: (code: string) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  ready: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLang: 'en',
  changeLanguage: async () => {},
  t: translate,
  ready: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLang, setCurrentLang] = useState('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      let lang = 'en';
      try {
        const saved = await AsyncStorage.getItem('language');
        if (saved && LANGUAGES.find(l => l.code === saved)) {
          lang = saved;
        } else {
          const device = Localization.getLocales()[0]?.languageCode || 'en';
          lang = LANGUAGES.find(l => l.code === device) ? device : 'en';
        }
      } catch (_) {}
      i18n.locale = lang;
      setCurrentLang(lang);
      setReady(true);
    })();
  }, []);

  const changeLanguage = async (code: string) => {
    await setLanguage(code);
    setCurrentLang(code);
  };

  return (
    <LanguageContext.Provider value={{ currentLang, changeLanguage, t: translate, ready }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
