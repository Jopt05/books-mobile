import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import es from '../i18n/es.json';
import en from '../i18n/en.json';

type Locale = 'es' | 'en';

const translations: Record<Locale, Record<string, string>> = { es, en };

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'app_locale';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es');

  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale);
    await AsyncStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[locale]?.[key] ?? key;
  }, [locale]);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored === 'es' || stored === 'en') {
        setLocaleState(stored);
      }
    })();
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
