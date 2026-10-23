import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getUserBooksPaginated, getPublicUserBooksPaginated, PaginatedUserBooks } from '../api/userBooks';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { UserBook, BookStatus } from '../types/domain';

export const YOUR_BOOKS_STATUSES: BookStatus[] = ['READ', 'WANT_TO_READ', 'READING', 'DID_NOT_FINISH'];

/** How a status timeline is ordered/dated. READ & DID_NOT_FINISH key off the
 *  finish date; everything else keys off when the book was added. */
export type SortField = 'finishedAt' | 'createdAt';

const PAGE_LIMIT = 20;

export function sortFieldForStatus(status: BookStatus): SortField {
  return status === 'READ' || status === 'DID_NOT_FINISH' ? 'finishedAt' : 'createdAt';
}

function isYourBooksStatus(value?: string | null): value is BookStatus {
  return !!value && YOUR_BOOKS_STATUSES.includes(value as BookStatus);
}

/** SectionList-ready month/year group. */
export interface TimelineSection {
  /** Stable key, e.g. "2026-09". */
  key: string;
  /** Localized header, e.g. "Septiembre 2026". */
  title: string;
  data: UserBook[];
}

/**
 * Drives the native "Tus libros" timeline screen: active status filter, sort
 * direction, in-memory title search, and the month/year grouping that feeds a
 * SectionList. The backend already orders each status correctly (finishedAt for
 * READ/DNF, startedAt for READING, updatedAt otherwise), so we page through and
 * let the list trigger `loadMore` on scroll.
 */
export function useYourBooks(username: string, initialStatus?: string | null) {
  const { t, locale } = useLanguage();
  const { user } = useAuth();

  const isOwner = user?.username === username;

  const [status, setStatus] = useState<BookStatus>(
    isYourBooksStatus(initialStatus) ? (initialStatus as BookStatus) : 'READ',
  );
  const [books, setBooks] = useState<UserBook[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [query, setQuery] = useState('');

  const sortField = sortFieldForStatus(status);

  // Guards against overlapping fetches when flipping filters mid-request.
  const requestIdRef = useRef(0);

  const labels: Record<BookStatus, string> = useMemo(
    () => ({
      READ: t('yourBooks.filterRead'),
      WANT_TO_READ: t('yourBooks.filterWantToRead'),
      READING: t('yourBooks.filterReading'),
      DID_NOT_FINISH: t('yourBooks.filterDidNotFinish'),
    }),
    [t],
  );

  const fetchPage = useCallback(
    (targetStatus: BookStatus, targetPage: number): Promise<PaginatedUserBooks> =>
      isOwner
        ? getUserBooksPaginated(targetStatus, targetPage, PAGE_LIMIT)
        : getPublicUserBooksPaginated(username, targetStatus, targetPage, PAGE_LIMIT),
    [username, isOwner],
  );

  // Initial load whenever the active status changes.
  useEffect(() => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setBooks([]);

    fetchPage(status, 1)
      .then((res) => {
        if (requestId !== requestIdRef.current) return;
        setBooks(res.data);
        setTotal(res.meta.total);
        setPage(1);
        setHasMore(res.meta.page < res.meta.totalPages);
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        setBooks([]);
        setTotal(0);
        setHasMore(false);
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) return;
        setLoading(false);
      });
  }, [status, fetchPage]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const requestId = requestIdRef.current;
    setLoadingMore(true);

    const nextPage = page + 1;
    fetchPage(status, nextPage)
      .then((res) => {
        if (requestId !== requestIdRef.current) return;
        setBooks((prev) => [...prev, ...res.data]);
        setPage(nextPage);
        setHasMore(res.meta.page < res.meta.totalPages);
      })
      .catch(() => {
        /* keep what we have; scrolling again retries */
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) return;
        setLoadingMore(false);
      });
  }, [status, page, hasMore, loadingMore, fetchPage]);

  const changeStatus = useCallback((next: BookStatus) => {
    setStatus(next);
    // Reset to the sensible default ordering for the new status.
    setSortDir('desc');
    setQuery('');
  }, []);

  const toggleSortDir = useCallback(() => {
    setSortDir((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  }, []);

  // Used both for sorting and for the per-card date metadata.
  const getDate = useCallback(
    (book: UserBook): string | null =>
      sortField === 'finishedAt' ? book.finishedAt ?? book.createdAt : book.createdAt,
    [sortField],
  );

  const sections: TimelineSection[] = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = normalizedQuery
      ? books.filter(
          (b) =>
            b.title.toLowerCase().includes(normalizedQuery) ||
            b.author.toLowerCase().includes(normalizedQuery),
        )
      : books;

    // Backend returns descending order; only re-sort when the user flips it.
    const sorted =
      sortDir === 'desc'
        ? filtered
        : [...filtered].sort((a, b) => {
            const da = getDate(a);
            const db = getDate(b);
            const ta = da ? new Date(da).getTime() : 0;
            const tb = db ? new Date(db).getTime() : 0;
            return ta - tb;
          });

    const map = new Map<string, TimelineSection>();
    for (const book of sorted) {
      const raw = getDate(book);
      const date = raw ? new Date(raw) : null;
      const key = date
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : 'unknown';
      const rawTitle = date
        ? date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
        : t('yourBooks.noDate');
      const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);

      if (!map.has(key)) map.set(key, { key, title, data: [] });
      map.get(key)!.data.push(book);
    }

    return Array.from(map.values());
  }, [books, query, sortDir, getDate, locale, t]);

  // Per-card date metadata, e.g. "Leído el 12 oct 2026".
  const dateLabelFor = useCallback(
    (book: UserBook): string | null => {
      const raw = getDate(book);
      if (!raw) return null;
      const formatted = new Date(raw).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const prefix = sortField === 'finishedAt' ? t('yourBooks.readOn') : t('yourBooks.addedOn');
      return `${prefix} ${formatted}`;
    },
    [getDate, locale, sortField, t],
  );

  const sortHelp =
    sortField === 'finishedAt' ? t('yourBooks.sortedByFinished') : t('yourBooks.sortedByAdded');

  return {
    isOwner,
    status,
    statuses: YOUR_BOOKS_STATUSES,
    labels,
    changeStatus,
    sortField,
    sortDir,
    toggleSortDir,
    sortHelp,
    query,
    setQuery,
    sections,
    total,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    dateLabelFor,
  };
}
