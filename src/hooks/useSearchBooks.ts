import { useState, useCallback } from 'react';
import { Book } from '../types/book';
import { searchBooks } from '../api/books';
import { mapBookVolume } from '../utils/mapBook';

interface UseSearchBooksReturn {
  books: Book[];
  loading: boolean;
  error: string;
  searched: boolean;
  search: (query: string) => void;
}

export function useSearchBooks(): UseSearchBooksReturn {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const response = await searchBooks(query.trim());
      setBooks((response.items || []).map(mapBookVolume));
    } catch {
      setError('No se pudo realizar la búsqueda');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { books, loading, error, searched, search };
}
