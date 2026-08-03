import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getDiscussionById,
  getReplies,
  createReply,
  deleteReply,
  toggleDiscussionLike,
  toggleReplyLike,
  deleteDiscussion,
} from '../api/discussions';
import type { Discussion, DiscussionReply } from '../api/discussions';

export function useDiscussionDetail(id: string) {
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [replySort, setReplySort] = useState<'recent' | 'popular'>('recent');
  const cursorRef = useRef<string | null>(null);
  const hasMoreRef = useRef(true);

  const fetchDiscussion = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDiscussionById(id);
      setDiscussion(res);
    } catch {
      setError('Could not load discussion');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReplies = useCallback(async () => {
    setLoadingReplies(true);
    try {
      const res = await getReplies(id, { sort: replySort, limit: 20 });
      setReplies(res.data);
      cursorRef.current = res.nextCursor;
      hasMoreRef.current = res.nextCursor !== null;
    } catch {
      // silent
    } finally {
      setLoadingReplies(false);
    }
  }, [id, replySort]);

  useEffect(() => { fetchDiscussion(); }, [fetchDiscussion]);

  useEffect(() => {
    setReplies([]);
    cursorRef.current = null;
    hasMoreRef.current = true;
    fetchReplies();
  }, [fetchReplies]);

  const loadMoreReplies = useCallback(async () => {
    if (!hasMoreRef.current || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await getReplies(id, {
        cursor: cursorRef.current ?? undefined,
        sort: replySort,
        limit: 20,
      });
      setReplies((prev) => [...prev, ...res.data]);
      cursorRef.current = res.nextCursor;
      hasMoreRef.current = res.nextCursor !== null;
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  }, [id, replySort, loadingMore]);

  const addReply = async (data: {
    content: string;
    bookId?: string;
    bookTitle?: string;
    bookCover?: string;
  }) => {
    const res = await createReply(id, data);
    setReplies((prev) => [...prev, { ...res, isLiked: false }]);
    if (discussion) {
      setDiscussion({ ...discussion, _count: { ...discussion._count, replies: discussion._count.replies + 1 } });
    }
    return res;
  };

  const removeReply = async (replyId: string) => {
    await deleteReply(replyId);
    setReplies((prev) => prev.filter((r) => r.id !== replyId));
    if (discussion) {
      setDiscussion({ ...discussion, _count: { ...discussion._count, replies: discussion._count.replies - 1 } });
    }
  };

  const toggleLike = async () => {
    if (!discussion) return;
    const res = await toggleDiscussionLike(id);
    setDiscussion({
      ...discussion,
      isLiked: res.liked,
      _count: { ...discussion._count, likes: discussion._count.likes + (res.liked ? 1 : -1) },
    });
  };

  const likeReply = async (replyId: string) => {
    const res = await toggleReplyLike(replyId);
    setReplies((prev) =>
      prev.map((r) =>
        r.id === replyId
          ? { ...r, isLiked: res.liked, _count: { ...r._count, likes: r._count.likes + (res.liked ? 1 : -1) } }
          : r,
      ),
    );
  };

  const removeDiscussion = async () => {
    await deleteDiscussion(id);
  };

  return {
    discussion,
    replies,
    loading,
    loadingReplies,
    loadingMore,
    error,
    hasMoreReplies: hasMoreRef.current,
    replySort,
    setReplySort,
    loadMoreReplies,
    addReply,
    removeReply,
    toggleLike,
    likeReply,
    removeDiscussion,
  };
}
