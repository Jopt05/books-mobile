import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'search_history';
const MAX_ITEMS = 5;

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setHistory(parsed.slice(0, MAX_ITEMS));
        } catch {
          // ignore
        }
      }
    });
  }, []);

  const persist = useCallback((items: string[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const addToHistory = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_ITEMS);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const removeFromHistory = useCallback((query: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item !== query);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return { history, addToHistory, removeFromHistory, clearHistory };
}
