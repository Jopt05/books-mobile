import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  border: string;
  error: string;
  card: string;
  tabBar: string;
  tabBarInactive: string;
}

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#1A1A1A',
  textSecondary: '#666666',
  primary: '#6366F1',
  border: '#E5E5E5',
  error: '#EF4444',
  card: '#FFFFFF',
  tabBar: '#FFFFFF',
  tabBarInactive: '#9CA3AF',
};

const darkColors: ThemeColors = {
  background: '#121212',
  surface: '#1E1E1E',
  text: '#F5F5F5',
  textSecondary: '#A3A3A3',
  primary: '#818CF8',
  border: '#2E2E2E',
  error: '#F87171',
  card: '#1E1E1E',
  tabBar: '#1A1A1A',
  tabBarInactive: '#6B7280',
};

interface ThemeContextValue {
  isDark: boolean;
  colors: ThemeColors;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'app_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  const colors = isDark ? darkColors : lightColors;

  const toggle = useCallback(async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    await AsyncStorage.setItem(STORAGE_KEY, newValue ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored === 'dark') {
        setIsDark(true);
      }
    })();
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
