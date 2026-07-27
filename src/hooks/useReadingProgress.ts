import { useState, useEffect, useCallback } from 'react';
import { getReadingProgress, ReadingProgress } from '../api/userBooks';

interface UseReadingProgressReturn {
  progress: ReadingProgress[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

export function useReadingProgress(): UseReadingProgressReturn {
  const [progress, setProgress] = useState<ReadingProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getReadingProgress();
      setProgress(data);
    } catch {
      setError('No se pudo cargar el progreso');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { progress, loading, error, refresh };
}
