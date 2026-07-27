import client from './client';
import { JournalEntry } from '../types/domain';

export interface CreateJournalPayload {
  userBookId: string;
  content?: string | null;
  page?: number | null;
  percentage?: number | null;
  isPublic?: boolean;
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

export async function getJournalByBook(userBookId: string): Promise<JournalEntry[]> {
  const { data } = await client.get<JournalEntry[]>(`/journal/book/${userBookId}`);
  return data;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  await client.delete(`/journal/${id}`);
}
