import client from './client';
import { BookVolume, BooksResponse } from '../types/book';

export async function searchBooks(
  query: string,
  maxResults: number = 20,
  startIndex: number = 0
): Promise<BooksResponse> {
  const { data } = await client.get<BooksResponse>('/books/search', {
    params: { q: query, maxResults, startIndex },
  });
  return data;
}

export async function getBookById(id: string): Promise<BookVolume> {
  const { data } = await client.get<BookVolume>(`/books/${id}`);
  return data;
}
