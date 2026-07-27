import { useState, useCallback } from 'react';
import { Activity } from '../types/domain';
import { getPersonalFeed } from '../api/feed';

export function useQuickFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPersonalFeed(null, 2);
      setActivities(response.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  return { activities, loading, refresh };
}
