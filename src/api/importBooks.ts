import client from './client';
import { ImportResult } from '../types/domain';

export type ImportSource = 'goodreads' | 'hardcover';

export async function importGoodreads(file: FormData): Promise<ImportResult> {
  const { data } = await client.post<ImportResult>('/import/goodreads', file, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });
  return data;
}

export async function importHardcover(file: FormData): Promise<ImportResult> {
  const { data } = await client.post<ImportResult>('/import/hardcover', file, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });
  return data;
}
