import { useState, useEffect, useCallback } from 'react';
import { getReadingStats, ReadingStats } from '../api/userBooks';

export type StatsPeriod = 'month' | 'year';

interface UseReadingStatsReturn {
  stats: ReadingStats | null;
  period: StatsPeriod;
  setPeriod: (p: StatsPeriod) => void;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useReadingStats(): UseReadingStatsReturn {
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [period, setPeriod] = useState<StatsPeriod>('year');
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const dateParam = period === 'year'
    ? `${now.getFullYear()}`
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReadingStats(period, dateParam);
      setStats(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [period, dateParam]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, period, setPeriod, loading, refresh };
}
