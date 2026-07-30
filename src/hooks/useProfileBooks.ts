import { useState, useEffect, useCallback } from 'react';
import { getUserBooksPaginated, getPublicUserBooksPaginated } from '../api/userBooks';
import { useLanguage } from '../context/LanguageContext';
import { UserBook, BookStatus } from '../types/domain';

const STATUSES: BookStatus[] = ['READING', 'WANT_TO_READ', 'READ', 'DID_NOT_FINISH'];
const PAGE_LIMIT = 10;

export interface ShelfSection {
  status: BookStatus;
  label: string;
  books: UserBook[];
  total: number;
  page: number;
  hasMore: boolean;
  loadingMore: boolean;
}

export function useProfileBooks(username: string, isOwn: boolean) {
  const { t } = useLanguage();
  const [sections, setSections] = useState<ShelfSection[]>([]);
  const [loading, setLoading] = useState(true);

  const statusLabels: Record<BookStatus, string> = {
    READING: t('shelf.reading'),
    WANT_TO_READ: t('shelf.wantToRead'),
    READ: t('shelf.read'),
    DID_NOT_FINISH: t('shelf.didNotFinish'),
  };

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        STATUSES.map((status) =>
          isOwn
            ? getUserBooksPaginated(status, 1, PAGE_LIMIT)
            : getPublicUserBooksPaginated(username, status, 1, PAGE_LIMIT)
        )
      );
      const grouped: ShelfSection[] = STATUSES
        .map((status, i) => ({
          status,
          label: statusLabels[status],
          books: results[i].data,
          total: results[i].meta.total,
          page: 1,
          hasMore: results[i].meta.page < results[i].meta.totalPages,
          loadingMore: false,
        }))
        .filter((s) => s.total > 0);
      setSections(grouped);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [username, isOwn]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const loadMore = useCallback(async (status: BookStatus) => {
    const section = sections.find(s => s.status === status);
    if (!section || !section.hasMore || section.loadingMore) return;

    setSections(prev => prev.map(s =>
      s.status === status ? { ...s, loadingMore: true } : s
    ));

    try {
      const nextPage = section.page + 1;
      const res = isOwn
        ? await getUserBooksPaginated(status, nextPage, PAGE_LIMIT)
        : await getPublicUserBooksPaginated(username, status, nextPage, PAGE_LIMIT);

      setSections(prev => prev.map(s =>
        s.status === status
          ? {
              ...s,
              books: [...s.books, ...res.data],
              page: nextPage,
              hasMore: res.meta.page < res.meta.totalPages,
              loadingMore: false,
            }
          : s
      ));
    } catch {
      setSections(prev => prev.map(s =>
        s.status === status ? { ...s, loadingMore: false } : s
      ));
    }
  }, [sections, username, isOwn]);

  return { sections, loading, loadMore, refresh: fetchBooks };
}
