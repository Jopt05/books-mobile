import { useState, useEffect, useCallback } from 'react';
import { JournalEntry } from '../types/domain';
import { createJournalEntry, getJournalEntries } from '../api/journal';
import { getReadingProgress, ReadingProgress } from '../api/userBooks';

export function useQuickJournal() {
  const [books, setBooks] = useState<ReadingProgress[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [alreadyLoggedToday, setAlreadyLoggedToday] = useState(false);
  const [checkingToday, setCheckingToday] = useState(true);
  const [selectedBook, setSelectedBook] = useState<ReadingProgress | null>(null);
  const [content, setContent] = useState('');
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
    if (!content.trim()) {
      setError('emptyContent');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await createJournalEntry({
        userBookId: selectedBook.id,
        content: content.trim(),
      });
      setSubmitted(true);
      setContent('');
    } catch {
      setError('saveFailed');
    } finally {
      setSaving(false);
    }
  }, [selectedBook, content]);

  const visible = !booksLoading && !checkingToday && books.length > 0 && !alreadyLoggedToday && !submitted;

  return {
    visible,
    books,
    selectedBook,
    setSelectedBook,
    content,
    setContent,
    saving,
    error,
    submit,
  };
}
