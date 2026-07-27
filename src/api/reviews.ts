import client from './client';
import { Review } from '../types/domain';

export interface CreateReviewPayload {
  bookId: string;
  rating: number;
  content?: string | null;
  hasSpoilers?: boolean;
}

export interface BookStats {
  averageRating: number | null;
  totalReviews: number;
}

export async function createReview(payload: CreateReviewPayload): Promise<Review> {
  const { data } = await client.post<Review>('/reviews', payload);
  return data;
}

export async function getBookReviews(bookId: string): Promise<Review[]> {
  const { data } = await client.get<Review[]>(`/reviews/book/${bookId}`);
  return data;
}

export async function getBookStats(bookId: string): Promise<BookStats> {
  const { data } = await client.get<BookStats>(`/reviews/book/${bookId}/stats`);
  return data;
}

export async function getUserReviews(
  username: string,
  page: number = 1,
  limit: number = 10,
  includeBook: boolean = true
): Promise<{ data: Review[]; total: number }> {
  const { data } = await client.get(`/reviews/user/${username}`, {
    params: { page, limit, includeBook },
  });
  return data;
}

export async function deleteReview(id: string): Promise<void> {
  await client.delete(`/reviews/${id}`);
}
