import { useState, useEffect, useCallback, useRef } from 'react';
import { JournalEntry } from '../types/domain';
import { getJournalByBook, getJournalCountByBook, createJournalEntry, deleteJournalEntry } from '../api/journal';

export type ProgressMode = 'page' | 'percentage';

const PAGE_LIMIT = 5;

export function useJournal(userBookId: string, pageCount?: number) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [entryCount, setEntryCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [progressValue, setProgressValue] = useState('');
  const [progressMode, setProgressMode] = useState<ProgressMode>('page');
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(false);

  // Fetch count on mount
  useEffect(() => {
    if (!userBookId) return;
    getJournalCountByBook(userBookId)
      .then(res => setEntryCount(res.count))
      .catch(() => {});
  }, [userBookId]);

  const loadEntries = useCallback(async () => {
    if (!userBookId) return;
    setLoading(true);
    setError('');
    try {
      const res = await getJournalByBook(userBookId, 1, PAGE_LIMIT);
      setEntries(res.data);
      pageRef.current = 1;
      hasMoreRef.current = res.meta.page < res.meta.totalPages;
    } catch {
      setError('No se pudieron cargar las entradas');
    } finally {
      setLoading(false);
    }
  }, [userBookId]);

  const loadMore = useCallback(async () => {
    if (!hasMoreRef.current || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const res = await getJournalByBook(userBookId, nextPage, PAGE_LIMIT);
      setEntries(prev => [...prev, ...res.data]);
      pageRef.current = nextPage;
      hasMoreRef.current = res.meta.page < res.meta.totalPages;
    } catch { /* ignore */ }
    finally { setLoadingMore(false); }
  }, [userBookId, loadingMore]);

  const toggleExpanded = useCallback(() => {
    if (!expanded && entries.length === 0) {
      loadEntries();
    }
    setExpanded(v => !v);
  }, [expanded, entries.length, loadEntries]);

  const submit = useCallback(async () => {
    if (!userBookId) return;
    setSaving(true);
    setError('');
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
      setEntries(prev => [entry, ...prev]);
      setEntryCount(prev => (prev ?? 0) + 1);
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
    setEntries(prev => prev.filter(e => e.id !== id));
    setEntryCount(prev => (prev ?? 1) - 1);
  }, []);

  const hasMore = hasMoreRef.current;

  return {
    entries, entryCount, loading, loadingMore, hasMore, error,
    content, setContent, progressValue, setProgressValue,
    progressMode, setProgressMode, saving, expanded,
    toggleExpanded, loadMore, submit, removeEntry,
  };
}
