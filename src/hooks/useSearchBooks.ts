import { useState, useCallback, useRef } from 'react';
import { Book } from '../types/book';
import { searchBooks } from '../api/books';
import { mapBookVolume } from '../utils/mapBook';

const PAGE_SIZE = 10;

interface UseSearchBooksReturn {
  books: Book[];
  loading: boolean;
  loadingMore: boolean;
  error: string;
  searched: boolean;
  hasMore: boolean;
  search: (query: string) => void;
  loadMore: () => void;
}

export function useSearchBooks(): UseSearchBooksReturn {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const queryRef = useRef('');
  const startIndexRef = useRef(0);
  const hasMoreRef = useRef(false);
  const totalRef = useRef(0);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;
    queryRef.current = query.trim();
    startIndexRef.current = 0;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const response = await searchBooks(queryRef.current, PAGE_SIZE, 0);
      const items = (response.items || []).map(mapBookVolume);
      totalRef.current = response.totalItems || 0;
      startIndexRef.current = items.length;
      hasMoreRef.current = startIndexRef.current < totalRef.current;
      setBooks(items);
    } catch {
      setError('No se pudo realizar la búsqueda');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMoreRef.current || loadingMore) return;
    setLoadingMore(true);
    try {
      const response = await searchBooks(queryRef.current, PAGE_SIZE, startIndexRef.current);
      const items = (response.items || []).map(mapBookVolume);
      if (items.length === 0) {
        hasMoreRef.current = false;
      } else {
        startIndexRef.current += items.length;
        hasMoreRef.current = startIndexRef.current < totalRef.current;
        setBooks(prev => [...prev, ...items]);
      }
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore]);

  const hasMore = hasMoreRef.current;

  return { books, loading, loadingMore, error, searched, hasMore, search, loadMore };
}
