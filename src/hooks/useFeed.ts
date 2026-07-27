import { useState, useCallback } from 'react';
import { Activity } from '../types/domain';
import { getPersonalFeed, getGlobalFeed } from '../api/feed';

type FeedType = 'personal' | 'global';

interface UseFeedReturn {
  activities: Activity[];
  loading: boolean;
  loadingMore: boolean;
  error: string;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFeed(type: FeedType): UseFeedReturn {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = type === 'personal' ? getPersonalFeed : getGlobalFeed;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchFeed(null);
      setActivities(response.data);
      setCursor(response.nextCursor);
      setHasMore(response.nextCursor !== null);
    } catch {
      setError('No se pudo cargar el feed');
    } finally {
      setLoading(false);
    }
  }, [fetchFeed]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !cursor) return;
    setLoadingMore(true);
    try {
      const response = await fetchFeed(cursor);
      setActivities((prev) => [...prev, ...response.data]);
      setCursor(response.nextCursor);
      setHasMore(response.nextCursor !== null);
    } catch {
      setError('No se pudieron cargar más actividades');
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, cursor, fetchFeed]);

  return { activities, loading, loadingMore, error, hasMore, loadMore, refresh };
}
