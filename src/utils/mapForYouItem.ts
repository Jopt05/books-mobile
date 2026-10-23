import { Book } from '../types/book';
import { ForYouItem, RecommendationReason } from '../api/recommendations';
import { secureUrl } from './secureUrl';

/**
 * A recommended book is the internal `Book` plus the recommendation metadata
 * the engine attaches (why it was picked and how). Components still consume the
 * flat `Book` shape; the extra fields are additive and recommendation-specific.
 */
export interface RecommendedBook extends Book {
  /** Ranking score from the engine (higher = more relevant). */
  score: number;
  /** Why it was picked, as stable keys the UI translates. */
  reasons: RecommendationReason[];
  /** Where the suggestion came from: internal catalog or external discovery. */
  source: 'catalog' | 'discovery';
}

/**
 * Maps a raw `/recommendations/for-you` item to the internal `Book` shape
 * (extended with recommendation metadata). Cover URLs are forced to https so
 * Android's cleartext policy does not block them.
 *
 * Per the api-abstraction rule, this is the single translation point: if the
 * recommendation API shape changes, update this mapper — hooks and components
 * stay untouched.
 */
export function mapForYouItem(raw: ForYouItem): RecommendedBook {
  return {
    id: raw.bookId,
    title: raw.title,
    authors: raw.authors ?? [],
    coverUrl: secureUrl(raw.coverUrl),
    score: raw.score,
    reasons: raw.reasons ?? [],
    source: raw.source,
  };
}
