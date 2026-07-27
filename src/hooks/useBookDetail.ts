import { useState, useEffect, useCallback } from 'react';
import { Book } from '../types/book';
import { UserBook } from '../types/domain';
import { getBookById } from '../api/books';
import { getBookStats, BookStats } from '../api/reviews';
import { getUserBookByBookId } from '../api/userBooks';
import { mapBookVolume } from '../utils/mapBook';

interface UseBookDetailReturn {
  book: Book | null;
  userBook: UserBook | null;
  stats: BookStats | null;
  loading: boolean;
  error: string;
  refreshUserBook: () => Promise<void>;
}

export function useBookDetail(bookId: string): UseBookDetailReturn {
  const [book, setBook] = useState<Book | null>(null);
  const [userBook, setUserBook] = useState<UserBook | null>(null);
  const [stats, setStats] = useState<BookStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [rawBook, bookStats, existingUserBook] = await Promise.all([
        getBookById(bookId),
        getBookStats(bookId).catch(() => null),
        getUserBookByBookId(bookId),
      ]);
      setBook(mapBookVolume(rawBook));
      setStats(bookStats);
      setUserBook(existingUserBook);
    } catch {
      setError('No se pudo cargar el libro');
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  const refreshUserBook = useCallback(async () => {
    const updated = await getUserBookByBookId(bookId);
    setUserBook(updated);
  }, [bookId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { book, userBook, stats, loading, error, refreshUserBook };
}
