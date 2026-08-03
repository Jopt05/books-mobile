import { useState, useEffect, useCallback, useRef } from 'react';
import { getDiscussions, createDiscussion, deleteDiscussion, toggleDiscussionLike } from '../api/discussions';
import type { Discussion } from '../api/discussions';

interface UseDiscussionsOptions {
  search?: string;
  tag?: string;
  bookId?: string;
  sort?: 'recent' | 'popular';
}

export function useDiscussions(options: UseDiscussionsOptions = {}) {
  const { search, tag, bookId, sort = 'recent' } = options;
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const cursorRef = useRef<string | null>(null);
  const hasMoreRef = useRef(true);

  const fetchDiscussions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDiscussions({ search, tag, bookId, sort, limit: 20 });
      setDiscussions(res.data);
      cursorRef.current = res.nextCursor;
      hasMoreRef.current = res.nextCursor !== null;
    } catch {
      setError('Could not load discussions');
    } finally {
      setLoading(false);
    }
  }, [search, tag, bookId, sort]);

  useEffect(() => {
    setDiscussions([]);
    cursorRef.current = null;
    hasMoreRef.current = true;
    fetchDiscussions();
  }, [fetchDiscussions]);

  const loadMore = useCallback(async () => {
    if (!hasMoreRef.current || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await getDiscussions({
        search, tag, bookId, sort,
        cursor: cursorRef.current ?? undefined,
        limit: 20,
      });
      setDiscussions((prev) => [...prev, ...res.data]);
      cursorRef.current = res.nextCursor;
      hasMoreRef.current = res.nextCursor !== null;
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  }, [search, tag, bookId, sort, loadingMore]);

  const create = async (data: {
    title: string;
    content?: string;
    bookId?: string;
    bookTitle?: string;
    bookCover?: string;
    tags?: string[];
  }) => {
    const res = await createDiscussion(data);
    setDiscussions((prev) => [res, ...prev]);
    return res;
  };

  const remove = async (id: string) => {
    await deleteDiscussion(id);
    setDiscussions((prev) => prev.filter((d) => d.id !== id));
  };

  const toggleLike = async (id: string) => {
    const res = await toggleDiscussionLike(id);
    setDiscussions((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              isLiked: res.liked,
              _count: { ...d._count, likes: d._count.likes + (res.liked ? 1 : -1) },
            }
          : d,
      ),
    );
  };

  return {
    discussions,
    loading,
    loadingMore,
    error,
    hasMore: hasMoreRef.current,
    loadMore,
    create,
    remove,
    toggleLike,
    refresh: fetchDiscussions,
  };
}
