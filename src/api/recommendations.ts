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

export interface CategoryGroup {
  category: string;
  booksRead: number;
  books: {
    bookId: string;
    title: string;
    authors: string[];
    coverUrl: string | null;
  }[];
}

// Raw item returned by the unified `/recommendations/for-you` endpoint
// (Recommendations V2). Kept as the raw API shape here; the mapper in
// src/utils/mapForYouItem.ts normalizes it to the internal `Book` type.
// A reason comes as a stable key (plus optional count) so the client can
// translate it; the backend never sends display text.
export interface RecommendationReason {
  key:
    | 'socialReadOne'
    | 'socialReadMany'
    | 'socialHighRating'
    | 'favoriteAuthor'
    | 'topCategory'
    | 'trending'
    | 'moreFromAuthor';
  count?: number;
}

export interface ForYouItem {
  bookId: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
  score: number;
  reasons: RecommendationReason[];
  source: 'catalog' | 'discovery';
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  hasMore: boolean;
}

export const getForYou = (page = 1, limit = 20) =>
  client.get<PaginatedResponse<ForYouItem>>('/recommendations/for-you', {
    params: { page, limit },
  });

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

export const getCategoryRecommendations = (page = 1, limit = 3) =>
  client.get<PaginatedResponse<CategoryGroup>>('/recommendations/by-categories', {
    params: { page, limit },
  });
