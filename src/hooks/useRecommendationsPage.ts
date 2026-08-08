import { useState, useCallback, useRef } from 'react';
import {
  getSocialRecommendations,
  getTrendingBooks,
  getFavoriteAuthors,
} from '../api/recommendations';
import type {
  SocialRecommendation,
  TrendingBook,
  FavoriteAuthorGroup,
} from '../api/recommendations';

function usePaginatedList<T>(
  fetcher: (page: number, limit: number) => Promise<{ data: { data: T[]; hasMore: boolean } }>,
  limit: number,
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetcher(pageRef.current, limit);
      setItems((prev) => [...prev, ...res.data.data]);
      setHasMore(res.data.hasMore);
      pageRef.current += 1;
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, fetcher, limit]);

  const refresh = useCallback(async () => {
    pageRef.current = 1;
    setLoading(true);
    try {
      const res = await fetcher(1, limit);
      setItems(res.data.data);
      setHasMore(res.data.hasMore);
      pageRef.current = 2;
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [fetcher, limit]);

  return { items, loading, hasMore, loadMore, refresh };
}

export function useRecommendationsPage() {
  const social = usePaginatedList<SocialRecommendation>(getSocialRecommendations, 10);
  const trending = usePaginatedList<TrendingBook>(getTrendingBooks, 10);
  const authors = usePaginatedList<FavoriteAuthorGroup>(getFavoriteAuthors, 3);

  return { social, trending, authors };
}
