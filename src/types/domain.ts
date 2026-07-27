export type BookStatus = 'WANT_TO_READ' | 'READING' | 'READ' | 'DID_NOT_FINISH';

export interface UserBook {
  id: string;
  userId: string;
  bookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  status: BookStatus;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  userBookId: string;
  content: string | null;
  page: number | null;
  percentage: number | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userBook?: { title: string; author: string; coverUrl: string | null; bookId: string };
}

export interface Review {
  id: string;
  userId: string;
  bookId: string;
  rating: number;
  content: string | null;
  hasSpoilers: boolean;
  createdAt: string;
  updatedAt: string;
  user: { id: string; username: string; avatar: string | null };
}

export type ActivityType = 'ADDED_TO_SHELF' | 'STARTED_READING' | 'FINISHED_READING' | 'REVIEWED';

export interface Activity {
  id: string;
  userId: string;
  user: { id: string; username: string; avatar: string | null };
  type: ActivityType;
  bookId: string;
  bookTitle: string;
  bookCover: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
}

export interface FeedResponse {
  data: Activity[];
  nextCursor: string | null;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  failed: number;
  details: Array<{ title: string; status: 'imported' | 'skipped' | 'failed'; reason?: string }>;
}
