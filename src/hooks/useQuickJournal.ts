import { useState, useCallback } from 'react';
import { JournalEntry } from '../types/domain';
import { createJournalEntry, getJournalEntries } from '../api/journal';

interface UseQuickJournalReturn {
  hasEntryToday: boolean;
  loading: boolean;
  submitting: boolean;
  checkToday: () => Promise<void>;
  submitEntry: (userBookId: string, content?: string, page?: number) => Promise<JournalEntry>;
}

export function useQuickJournal(): UseQuickJournalReturn {
  const [hasEntryToday, setHasEntryToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const checkToday = useCallback(async () => {
    setLoading(true);
    try {
      const entries = await getJournalEntries(1);
      if (entries.length > 0) {
        const latest = new Date(entries[0].createdAt);
        const today = new Date();
        setHasEntryToday(
          latest.getFullYear() === today.getFullYear() &&
          latest.getMonth() === today.getMonth() &&
          latest.getDate() === today.getDate()
        );
      } else {
        setHasEntryToday(false);
      }
    } catch {
      setHasEntryToday(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitEntry = useCallback(async (userBookId: string, content?: string, page?: number): Promise<JournalEntry> => {
    setSubmitting(true);
    try {
      const entry = await createJournalEntry({
        userBookId,
        content: content || null,
        page: page || null,
      });
      setHasEntryToday(true);
      return entry;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { hasEntryToday, loading, submitting, checkToday, submitEntry };
}
