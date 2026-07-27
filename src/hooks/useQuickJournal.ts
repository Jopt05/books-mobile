import { useState, useEffect, useCallback } from 'react';
import { createJournalEntry, getJournalEntries } from '../api/journal';
import { getReadingProgress, ReadingProgress } from '../api/userBooks';

export type ProgressMode = 'page' | 'percentage';

export function useQuickJournal() {
  const [books, setBooks] = useState<ReadingProgress[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [alreadyLoggedToday, setAlreadyLoggedToday] = useState(false);
  const [checkingToday, setCheckingToday] = useState(true);
  const [selectedBook, setSelectedBook] = useState<ReadingProgress | null>(null);
  const [content, setContent] = useState('');
  const [progressMode, setProgressMode] = useState<ProgressMode>('page');
  const [progressValue, setProgressValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Load currently reading books
  useEffect(() => {
    (async () => {
      try {
        const data = await getReadingProgress();
        setBooks(data);
        if (data.length > 0) setSelectedBook(data[0]);
      } catch { /* ignore */ }
      finally { setBooksLoading(false); }
    })();
  }, []);

  // Check if user already logged today
  useEffect(() => {
    (async () => {
      try {
        const entries = await getJournalEntries(1);
        if (entries.length > 0) {
          const lastDate = new Date(entries[0].createdAt).toDateString();
          const today = new Date().toDateString();
          setAlreadyLoggedToday(lastDate === today);
        }
      } catch { /* ignore */ }
      finally { setCheckingToday(false); }
    })();
  }, []);

  const submit = useCallback(async () => {
    if (!selectedBook) {
      setError('selectBook');
      return;
    }

    const trimmedContent = content.trim();
    const numValue = progressValue ? parseFloat(progressValue) : undefined;

    // Must have content or progress
    if (!trimmedContent && !numValue) {
      setError('emptyContent');
      return;
    }

    // Validate numeric value
    if (progressValue && (isNaN(Number(progressValue)) || Number(progressValue) <= 0)) {
      setError('invalidProgress');
      return;
    }

    // Validate page limit
    if (progressMode === 'page' && numValue && selectedBook.pageCount && numValue > selectedBook.pageCount) {
      setError('pageExceeds');
      return;
    }

    // Validate percentage limit
    if (progressMode === 'percentage' && numValue && numValue > 100) {
      setError('percentageExceeds');
      return;
    }

    // Compute page and percentage
    const pageCount = selectedBook.pageCount;
    let page: number | undefined;
    let percentage: number | undefined;

    if (numValue) {
      if (progressMode === 'page') {
        page = Math.round(numValue);
        if (pageCount) percentage = Math.round((numValue / pageCount) * 100);
      } else {
        percentage = numValue;
        if (pageCount) page = Math.round((numValue / 100) * pageCount);
      }
    }

    setError('');
    setSaving(true);
    try {
      await createJournalEntry({
        userBookId: selectedBook.id,
        content: trimmedContent || undefined,
        page,
        percentage,
      });
      setSubmitted(true);
      setContent('');
      setProgressValue('');
    } catch {
      setError('saveFailed');
    } finally {
      setSaving(false);
    }
  }, [selectedBook, content, progressValue, progressMode]);

  const visible = !booksLoading && !checkingToday && books.length > 0 && !alreadyLoggedToday && !submitted;

  return {
    visible,
    books,
    selectedBook,
    setSelectedBook,
    content,
    setContent,
    progressMode,
    setProgressMode,
    progressValue,
    setProgressValue,
    saving,
    error,
    submit,
  };
}
