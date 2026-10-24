import { useState, useEffect, useCallback } from 'react';
import { Review } from '../types/domain';
import { getBookReviews, createReview, deleteReview, CreateReviewPayload } from '../api/reviews';

interface UseReviewsReturn {
  reviews: Review[];
  loading: boolean;
  error: string;
  submitting: boolean;
  refresh: () => Promise<void>;
  submitReview: (payload: Omit<CreateReviewPayload, 'bookId'>) => Promise<boolean>;
  removeReview: (id: string) => Promise<void>;
  clearValidationError: () => void;
  validationError: string;
}

export function useReviews(bookId: string): UseReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getBookReviews(bookId);
      setReviews(data);
    } catch {
      setError('No se pudieron cargar las reseñas');
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  const submitReview = useCallback(async (payload: Omit<CreateReviewPayload, 'bookId'>): Promise<boolean> => {
    setValidationError('');

    // Validate rating 1-5 inclusive, must be integer
    if (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5) {
      setValidationError('La calificación debe ser entre 1 y 5');
      return false;
    }

    setSubmitting(true);
    try {
      // The backend upserts by (userId, bookId), so this handles both creating
      // a new review and editing an existing one. Replace any review by the
      // same user in local state, otherwise prepend the new one.
      const saved = await createReview({ ...payload, bookId });
      setReviews((prev) => {
        const existingIndex = prev.findIndex((r) => r.userId === saved.userId);
        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      return true;
    } catch {
      setError('No se pudo publicar la reseña');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [bookId]);

  const removeReview = useCallback(async (id: string) => {
    await deleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const clearValidationError = useCallback(() => setValidationError(''), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { reviews, loading, error, submitting, refresh, submitReview, removeReview, clearValidationError, validationError };
}
