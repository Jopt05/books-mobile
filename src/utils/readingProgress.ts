import { JournalEntry } from '../types/domain';

export interface ReadingProgress {
  /** Reading percentage clamped to 0-100. */
  percent: number;
  /** Current page when derivable, otherwise null. */
  currentPage: number | null;
  /** Whether any progress could be derived from the entries. */
  hasProgress: boolean;
}

/**
 * Derives a reading-progress summary from the user's journal entries and the
 * book's page count. Entries are expected newest-first (as returned by
 * `useJournal`), so the latest entry is `entries[0]`.
 *
 * When the book is marked as finished (`status === 'READ'`) progress is forced
 * to 100% / last page, since a finished book is complete regardless of what the
 * latest journal entry recorded. Other statuses derive progress from the latest
 * entry's `page` / `percentage` combined with `pageCount` (no backend fields
 * are invented).
 */
export function deriveReadingProgress(
  entries: JournalEntry[],
  pageCount?: number,
  status?: string,
): ReadingProgress {
  // A finished book is 100% complete, even if the last entry stopped earlier.
  if (status === 'READ') {
    return { percent: 100, currentPage: pageCount ?? null, hasProgress: true };
  }

  const latest = entries[0];

  if (!latest) {
    return { percent: 0, currentPage: null, hasProgress: false };
  }

  let percent: number | null = null;
  let currentPage: number | null = null;

  if (latest.percentage != null) {
    percent = latest.percentage;
  } else if (latest.page != null && pageCount) {
    percent = Math.round((latest.page / pageCount) * 100);
  }

  if (latest.page != null) {
    currentPage = latest.page;
  } else if (latest.percentage != null && pageCount) {
    currentPage = Math.round((latest.percentage / 100) * pageCount);
  }

  const hasProgress = percent != null || currentPage != null;
  const clampedPercent = percent == null ? 0 : Math.max(0, Math.min(100, percent));

  return { percent: clampedPercent, currentPage, hasProgress };
}
