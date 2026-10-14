import React, { useState, useCallback } from 'react';
import { BookStatus, UserBook } from '../types/domain';
import { Book } from '../types/book';
import { createUserBook, updateUserBook, updateUserBookDates, deleteUserBook, getUserBookByBookId } from '../api/userBooks';

interface UseShelfButtonReturn {
  userBook: UserBook | null;
  loading: boolean;
  setUserBook: (ub: UserBook | null) => void;
  addToShelf: (book: Book, status: BookStatus) => Promise<void>;
  updateStatus: (status: BookStatus) => Promise<void>;
  updateDates: (dates: { startedAt?: string | null; finishedAt?: string | null }) => Promise<void>;
  remove: () => Promise<void>;
}

interface SeedOptions {
  /**
   * When provided, seeds the shelf status from a known value (e.g. the feed,
   * which already returns the user's status per activity) instead of fetching
   * a full UserBook. We build a lightweight placeholder so the button shows the
   * right label immediately; the real UserBook id is resolved lazily the first
   * time a mutation needs it. `null` means "known not on shelf".
   */
  initialStatus?: BookStatus | null;
  /** The bookId the seeded status belongs to — required to resolve the id lazily. */
  bookId?: string;
}

export function useShelfButton(
  initialUserBook: UserBook | null = null,
  seed?: SeedOptions,
): UseShelfButtonReturn {
  const seeded = seed?.initialStatus !== undefined;

  const [userBook, setUserBook] = useState<UserBook | null>(() => {
    if (initialUserBook) return initialUserBook;
    if (seeded && seed?.initialStatus && seed.bookId) {
      return { id: '', bookId: seed.bookId, status: seed.initialStatus } as UserBook;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  // Sync when initialUserBook changes (e.g. after async load). Skip in seeded
  // mode, where there is no initialUserBook to track.
  React.useEffect(() => {
    if (!seeded) setUserBook(initialUserBook);
  }, [initialUserBook, seeded]);

  // Resolves the real UserBook (with its id) before a mutation. In seeded mode
  // the placeholder has an empty id, so we fetch it on demand.
  const ensureUserBook = useCallback(async (): Promise<UserBook | null> => {
    if (userBook && userBook.id) return userBook;
    const bookId = userBook?.bookId ?? seed?.bookId;
    if (!bookId) return null;
    const resolved = await getUserBookByBookId(bookId);
    setUserBook(resolved);
    return resolved;
  }, [userBook, seed?.bookId]);

  const addToShelf = useCallback(async (book: Book, status: BookStatus) => {
    setLoading(true);
    try {
      const created = await createUserBook({
        bookId: book.id,
        title: book.title,
        author: book.authors.join(', '),
        coverUrl: book.coverUrl || null,
        pageCount: book.pageCount,
        status,
      });
      setUserBook(created);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (status: BookStatus) => {
    setLoading(true);
    try {
      const resolved = await ensureUserBook();
      if (!resolved) return;
      const updated = await updateUserBook(resolved.id, { status });
      setUserBook(updated);
    } finally {
      setLoading(false);
    }
  }, [ensureUserBook]);

  const updateDates = useCallback(async (dates: { startedAt?: string | null; finishedAt?: string | null }) => {
    setLoading(true);
    try {
      const resolved = await ensureUserBook();
      if (!resolved) return;
      const updated = await updateUserBookDates(resolved.id, dates);
      setUserBook(updated);
    } finally {
      setLoading(false);
    }
  }, [ensureUserBook]);

  const remove = useCallback(async () => {
    setLoading(true);
    try {
      const resolved = await ensureUserBook();
      if (!resolved) return;
      await deleteUserBook(resolved.id);
      setUserBook(null);
    } finally {
      setLoading(false);
    }
  }, [ensureUserBook]);

  return { userBook, loading, setUserBook, addToShelf, updateStatus, updateDates, remove };
}
