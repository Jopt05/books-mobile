import { useState, useEffect, useCallback } from 'react';
import { JournalEntry } from '../types/domain';
import { getJournalByBook, createJournalEntry, deleteJournalEntry } from '../api/journal';

export type ProgressMode = 'page' | 'percentage';

interface UseJournalReturn {
  entries: JournalEntry[];
  loading: boolean;
  error: string;
  content: string;
  setContent: (v: string) => void;
  progressValue: string;
  setProgressValue: (v: string) => void;
  progressMode: ProgressMode;
  setProgressMode: (m: ProgressMode) => void;
  saving: boolean;
  expanded: boolean;
  toggleExpanded: () => void;
  submit: () => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
}

export function useJournal(userBookId: string, pageCount?: number): UseJournalReturn {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [progressValue, setProgressValue] = useState('');
  const [progressMode, setProgressMode] = useState<ProgressMode>('page');
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(() => setExpanded((v) => !v), []);

  const refresh = useCallback(async () => {
    if (!userBookId) {
      setEntries([]);
      setLoading(false);
      return;
    }
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

  const submit = useCallback(async () => {
    if (!userBookId) return;
    setSaving(true);
    try {
      const numVal = progressValue ? parseInt(progressValue, 10) : undefined;
      let page: number | undefined;
      let percentage: number | undefined;

      if (numVal && !isNaN(numVal)) {
        if (progressMode === 'page') {
          page = numVal;
          if (pageCount) percentage = Math.round((numVal / pageCount) * 100);
        } else {
          percentage = numVal;
          if (pageCount) page = Math.round((numVal / 100) * pageCount);
        }
      }

      const entry = await createJournalEntry({
        userBookId,
        content: content.trim() || undefined,
        page,
        percentage,
      });
      setEntries((prev) => [entry, ...prev]);
      setContent('');
      setProgressValue('');
    } catch {
      setError('No se pudo guardar la entrada');
    } finally {
      setSaving(false);
    }
  }, [userBookId, content, progressValue, progressMode, pageCount]);

  const removeEntry = useCallback(async (id: string) => {
    await deleteJournalEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    entries, loading, error, content, setContent,
    progressValue, setProgressValue, progressMode, setProgressMode,
    saving, expanded, toggleExpanded, submit, removeEntry,
  };
}
