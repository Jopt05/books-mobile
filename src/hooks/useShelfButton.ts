import { useState, useCallback } from 'react';
import { BookStatus, UserBook } from '../types/domain';
import { Book } from '../types/book';
import { createUserBook, updateUserBook, updateUserBookDates, deleteUserBook } from '../api/userBooks';

interface UseShelfButtonReturn {
  userBook: UserBook | null;
  loading: boolean;
  setUserBook: (ub: UserBook | null) => void;
  addToShelf: (book: Book, status: BookStatus) => Promise<void>;
  updateStatus: (status: BookStatus) => Promise<void>;
  updateDates: (dates: { startedAt?: string | null; finishedAt?: string | null }) => Promise<void>;
  remove: () => Promise<void>;
}

export function useShelfButton(initialUserBook: UserBook | null = null): UseShelfButtonReturn {
  const [userBook, setUserBook] = useState<UserBook | null>(initialUserBook);
  const [loading, setLoading] = useState(false);

  const addToShelf = useCallback(async (book: Book, status: BookStatus) => {
    setLoading(true);
    try {
      const created = await createUserBook({
        bookId: book.id,
        title: book.title,
        author: book.authors.join(', '),
        coverUrl: book.coverUrl || null,
        status,
      });
      setUserBook(created);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (status: BookStatus) => {
    if (!userBook) return;
    setLoading(true);
    try {
      const updated = await updateUserBook(userBook.id, { status });
      setUserBook(updated);
    } finally {
      setLoading(false);
    }
  }, [userBook]);

  const updateDates = useCallback(async (dates: { startedAt?: string | null; finishedAt?: string | null }) => {
    if (!userBook) return;
    setLoading(true);
    try {
      const updated = await updateUserBookDates(userBook.id, dates);
      setUserBook(updated);
    } finally {
      setLoading(false);
    }
  }, [userBook]);

  const remove = useCallback(async () => {
    if (!userBook) return;
    setLoading(true);
    try {
      await deleteUserBook(userBook.id);
      setUserBook(null);
    } finally {
      setLoading(false);
    }
  }, [userBook]);

  return { userBook, loading, setUserBook, addToShelf, updateStatus, updateDates, remove };
}
