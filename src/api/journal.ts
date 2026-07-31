import client from './client';
import { JournalEntry } from '../types/domain';

export interface CreateJournalPayload {
  userBookId: string;
  content?: string | null;
  page?: number | null;
  percentage?: number | null;
  isPublic?: boolean;
}

export interface PaginatedJournal {
  data: JournalEntry[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function createJournalEntry(payload: CreateJournalPayload): Promise<JournalEntry> {
  const { data } = await client.post<JournalEntry>('/journal', payload);
  return data;
}

export async function getJournalEntries(limit?: number): Promise<JournalEntry[]> {
  const { data } = await client.get<JournalEntry[]>('/journal', {
    params: limit ? { limit } : undefined,
  });
  return data;
}

export async function getJournalByBook(userBookId: string, page?: number, limit?: number): Promise<PaginatedJournal> {
  const { data } = await client.get<PaginatedJournal>(`/journal/book/${userBookId}`, {
    params: { ...(page && { page }), ...(limit && { limit }) },
  });
  return data;
}

export async function getJournalCountByBook(userBookId: string): Promise<{ count: number }> {
  const { data } = await client.get<{ count: number }>(`/journal/book/${userBookId}/count`);
  return data;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  await client.delete(`/journal/${id}`);
}
