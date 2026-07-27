import { useState, useCallback } from 'react';
import { Book } from '../types/book';
import { searchBooks } from '../api/books';
import { mapBookVolume } from '../utils/mapBook';

interface UseBooksReturn {
  books: Book[];
  loading: boolean;
  error: string;
  query: string;
  search: (query: string) => void;
}

export function useBooks(): UseBooksReturn {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const search = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    if (!searchQuery.trim()) {
      setBooks([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await searchBooks(searchQuery.trim());
      const mapped = (response.items || []).map(mapBookVolume);
      setBooks(mapped);
    } catch {
      setError('No se pudo realizar la búsqueda');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { books, loading, error, query, search };
}
