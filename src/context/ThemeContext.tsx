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
  background: '#F5F0E8',
  surface: '#FAF6F0',
  text: '#3D2E1E',
  textSecondary: '#8C7B6B',
  primary: '#C17B3A',
  border: '#EDE8E0',
  error: '#EF4444',
  card: '#FFFFFF',
  tabBar: '#FAF6F0',
  tabBarInactive: '#8C7B6B',
};

const darkColors: ThemeColors = {
  background: '#1C1714',
  surface: '#231E1A',
  text: '#E8DFD4',
  textSecondary: '#9C8B7A',
  primary: '#D4915A',
  border: '#3A322B',
  error: '#F87171',
  card: '#2A2420',
  tabBar: '#231E1A',
  tabBarInactive: '#9C8B7A',
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
