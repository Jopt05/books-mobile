import client from './client';

export interface SocialRecommendation {
  bookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  recommendedBy: { username: string; avatar: string | null }[];
  count: number;
}

export interface TrendingBook {
  bookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  count: number;
}

export const getSocialRecommendations = () =>
  client.get<SocialRecommendation[]>('/recommendations/social');

export const getTrendingBooks = () =>
  client.get<TrendingBook[]>('/recommendations/trending');
