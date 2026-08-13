import { useState, useCallback } from 'react';
import { Activity } from '../types/domain';
import { getPersonalFeed, getGlobalFeed } from '../api/feed';

export function useQuickFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isGlobal, setIsGlobal] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPersonalFeed(null, 2);
      if (response.data.length > 0) {
        setActivities(response.data);
        setIsGlobal(false);
      } else {
        const globalResponse = await getGlobalFeed(null, 2);
        setActivities(globalResponse.data);
        setIsGlobal(true);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  return { activities, loading, isGlobal, refresh };
}
