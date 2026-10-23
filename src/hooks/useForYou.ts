import { useState, useCallback, useRef } from 'react';
import { getForYou } from '../api/recommendations';
import { mapForYouItem, RecommendedBook } from '../utils/mapForYouItem';

/**
 * Unified "for you" recommendations feed (Recommendations V2).
 *
 * This hook is the translation boundary: it calls the thin API layer and maps
 * the raw response into the internal `Book` shape (extended with
 * recommendation metadata) before handing it to the screen, which never sees
 * the raw API type. `refresh()` is re-callable so it can drive pull-to-refresh.
 */
export function useForYou(limit = 20) {
  const [items, setItems] = useState<RecommendedBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await getForYou(pageRef.current, limit);
      setItems((prev) => [...prev, ...res.data.data.map(mapForYouItem)]);
      setHasMore(res.data.hasMore);
      pageRef.current += 1;
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, limit]);

  const refresh = useCallback(async () => {
    pageRef.current = 1;
    setLoading(true);
    try {
      const res = await getForYou(1, limit);
      setItems(res.data.data.map(mapForYouItem));
      setHasMore(res.data.hasMore);
      pageRef.current = 2;
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [limit]);

  return { items, loading, hasMore, loadMore, refresh };
}
