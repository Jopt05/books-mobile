import { useState, useEffect, useCallback } from 'react';
import { getReadingStats, ReadingStats } from '../api/userBooks';

interface UseReadingStatsReturn {
  stats: ReadingStats | null;
  loading: boolean;
  error: string;
  refresh: (period?: string, date?: string) => Promise<void>;
}

export function useReadingStats(period?: string, date?: string): UseReadingStatsReturn {
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async (p?: string, d?: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await getReadingStats(p || period, d || date);
      setStats(data);
    } catch {
      setError('No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  }, [period, date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, loading, error, refresh };
}
