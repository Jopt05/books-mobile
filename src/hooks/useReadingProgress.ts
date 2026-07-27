import { useState, useEffect, useCallback } from 'react';
import { getReadingProgress, ReadingProgress } from '../api/userBooks';

interface UseReadingProgressReturn {
  progress: ReadingProgress[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useReadingProgress(): UseReadingProgressReturn {
  const [progress, setProgress] = useState<ReadingProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReadingProgress();
      setProgress(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { progress, loading, refresh };
}
