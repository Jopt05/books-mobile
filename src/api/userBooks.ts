import client from './client';
import { UserBook, BookStatus } from '../types/domain';

export interface CreateUserBookPayload {
  bookId: string;
  title: string;
  author: string;
  coverUrl?: string | null;
  pageCount?: number;
  status?: BookStatus;
}

export interface ReadingProgress {
  id: string;
  bookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  pageCount: number | null;
  startedAt: string | null;
  lastProgress: { percentage: number; page: number | null } | null;
}

export interface ReadingStats {
  booksRead: number;
  pagesRead: number;
}

export async function createUserBook(payload: CreateUserBookPayload): Promise<UserBook> {
  const { data } = await client.post<UserBook>('/user-books', payload);
  return data;
}

export async function getUserBookByBookId(bookId: string): Promise<UserBook | null> {
  try {
    const { data } = await client.get<UserBook>(`/user-books/by-book/${bookId}`);
    return data;
  } catch {
    return null;
  }
}

export async function getUserBooks(status?: BookStatus): Promise<UserBook[]> {
  const { data } = await client.get<UserBook[]>('/user-books', {
    params: status ? { status } : undefined,
  });
  return data;
}

export interface PaginatedUserBooks {
  data: UserBook[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function getUserBooksPaginated(status: BookStatus, page: number, limit: number): Promise<PaginatedUserBooks> {
  const { data } = await client.get<PaginatedUserBooks>('/user-books', {
    params: { status, page, limit },
  });
  return data;
}

export async function getReadingProgress(): Promise<ReadingProgress[]> {
  const { data } = await client.get<ReadingProgress[]>('/user-books/reading-progress');
  return data;
}

export async function getReadingStats(period?: string, date?: string): Promise<ReadingStats> {
  const { data } = await client.get<ReadingStats>('/user-books/stats', {
    params: { period, date },
  });
  return data;
}

export async function getPublicUserBooks(username: string, status?: BookStatus): Promise<UserBook[]> {
  const { data } = await client.get<UserBook[]>(`/user-books/public/${username}`, {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function getPublicUserBooksPaginated(username: string, status: BookStatus, page: number, limit: number): Promise<PaginatedUserBooks> {
  const { data } = await client.get<PaginatedUserBooks>(`/user-books/public/${username}`, {
    params: { status, page, limit },
  });
  return data;
}

export async function updateUserBook(id: string, updates: { status: BookStatus }): Promise<UserBook> {
  const { data } = await client.patch<UserBook>(`/user-books/${id}`, updates);
  return data;
}

export async function updateUserBookDates(id: string, dates: { startedAt?: string | null; finishedAt?: string | null }): Promise<UserBook> {
  const { data } = await client.patch<UserBook>(`/user-books/${id}/dates`, dates);
  return data;
}

export async function deleteUserBook(id: string): Promise<void> {
  await client.delete(`/user-books/${id}`);
}
