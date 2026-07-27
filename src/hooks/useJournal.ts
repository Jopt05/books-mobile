import { useState, useEffect, useCallback } from 'react';
import { JournalEntry } from '../types/domain';
import { getJournalByBook, deleteJournalEntry } from '../api/journal';

interface UseJournalReturn {
  entries: JournalEntry[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
}

export function useJournal(userBookId: string): UseJournalReturn {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getJournalByBook(userBookId);
      setEntries(data);
    } catch {
      setError('No se pudieron cargar las entradas');
    } finally {
      setLoading(false);
    }
  }, [userBookId]);

  const removeEntry = useCallback(async (id: string) => {
    await deleteJournalEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, loading, error, refresh, removeEntry };
}
