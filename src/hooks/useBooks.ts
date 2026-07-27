import { useState, useEffect, useCallback } from 'react';
import { Book } from '../types/book';
import { searchBooks } from '../api/books';
import { mapBookVolume } from '../utils/mapBook';

interface UseBooksReturn {
  books: Book[];
  loading: boolean;
  error: string;
  query: string;
  search: (query: string) => void;
  refresh: () => void;
}

export function useBooks(initialQuery = 'popular books'): UseBooksReturn {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState(initialQuery);

  const fetchBooks = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await searchBooks(searchQuery);
      const mapped = (response.items || []).map(mapBookVolume);
      setBooks(mapped);
    } catch {
      setError('No se pudo realizar la búsqueda');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks(query);
  }, [query, fetchBooks]);

  const search = useCallback((newQuery: string) => {
    if (newQuery.trim()) setQuery(newQuery.trim());
  }, []);

  const refresh = useCallback(() => {
    fetchBooks(query);
  }, [query, fetchBooks]);

  return { books, loading, error, query, search, refresh };
}
