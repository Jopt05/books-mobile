import client from './client';
import { UserBook, BookStatus } from '../types/domain';

export interface CreateUserBookPayload {
  bookId: string;
  title: string;
  author: string;
  coverUrl?: string | null;
  status: BookStatus;
}

export interface ReadingProgress {
  userBookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  bookId: string;
  latestPage: number | null;
  latestPercentage: number | null;
  totalPages: number | null;
}

export interface ReadingStats {
  booksRead: number;
  booksReading: number;
  totalPages: number;
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
