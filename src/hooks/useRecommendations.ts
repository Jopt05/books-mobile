import { useState, useCallback } from 'react';
import { getSocialRecommendations, getTrendingBooks } from '../api/recommendations';
import type { SocialRecommendation, TrendingBook } from '../api/recommendations';

export function useRecommendations() {
  const [social, setSocial] = useState<SocialRecommendation[]>([]);
  const [trending, setTrending] = useState<TrendingBook[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [socialRes, trendingRes] = await Promise.all([
        getSocialRecommendations(),
        getTrendingBooks(),
      ]);
      setSocial(socialRes.data);
      setTrending(trendingRes.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  return { social, trending, loading, refresh };
}
