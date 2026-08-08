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

export interface FavoriteAuthorGroup {
  author: string;
  books: {
    bookId: string;
    title: string;
    authors: string[];
    coverUrl: string | null;
  }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  hasMore: boolean;
}

export const getSocialRecommendations = (page = 1, limit = 10) =>
  client.get<PaginatedResponse<SocialRecommendation>>('/recommendations/social', {
    params: { page, limit },
  });

export const getTrendingBooks = (page = 1, limit = 10) =>
  client.get<PaginatedResponse<TrendingBook>>('/recommendations/trending', {
    params: { page, limit },
  });

export const getFavoriteAuthors = (page = 1, limit = 3) =>
  client.get<PaginatedResponse<FavoriteAuthorGroup>>('/recommendations/favorite-authors', {
    params: { page, limit },
  });
