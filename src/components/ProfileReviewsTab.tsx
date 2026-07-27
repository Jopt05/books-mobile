import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { getUserReviews, UserReview } from '../api/reviews';
import { StarRating } from './StarRating';
import { Loader } from './Loader';

interface ProfileReviewsTabProps {
  username: string;
}

export function ProfileReviewsTab({ username }: ProfileReviewsTabProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation<any>();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [spoilerRevealed, setSpoilerRevealed] = useState<Record<string, boolean>>({});

  const fetchReviews = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await getUserReviews(username, p, 5, true);
      setReviews(res.data);
      setTotalPages(res.meta.totalPages);
      setPage(p);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [username]);

  useEffect(() => { fetchReviews(1); }, [fetchReviews]);

  if (loading) return <Loader />;

  if (reviews.length === 0) {
    return <Text style={[styles.empty, { color: colors.textSecondary }]}>{t('reviews.noReviews')}</Text>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {reviews.map((review) => (
        <View key={review.id} style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.row}>
            {/* Book cover */}
            {review.book?.cover && (
              <TouchableOpacity
                onPress={() => navigation.navigate('BookDetail', { bookId: review.bookId })}
                style={[styles.coverWrap, { backgroundColor: colors.border }]}
              >
                <Image source={{ uri: review.book.cover }} style={styles.coverImg} />
              </TouchableOpacity>
            )}
            <View style={styles.info}>
              {/* Book title */}
              {review.book?.title && (
                <TouchableOpacity onPress={() => navigation.navigate('BookDetail', { bookId: review.bookId })}>
                  <Text style={[styles.bookTitle, { color: colors.text }]}>{review.book.title}</Text>
                </TouchableOpacity>
              )}
              {/* Rating + date */}
              <View style={styles.ratingRow}>
                <StarRating rating={review.rating} size={16} />
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </Text>
              </View>
              {/* Content / Spoiler */}
              {review.content && (
                review.hasSpoilers && !spoilerRevealed[review.id] ? (
                  <TouchableOpacity
                    onPress={() => setSpoilerRevealed((s) => ({ ...s, [review.id]: true }))}
                    style={[styles.spoiler, { backgroundColor: colors.background + 'DD' }]}
                  >
                    <Text style={[styles.spoilerText, { color: colors.primary }]}>{t('reviews.spoilers')}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.reviewContent, { color: colors.text }]} numberOfLines={3}>{review.content}</Text>
                )
              )}
            </View>
          </View>
        </View>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity onPress={() => fetchReviews(page - 1)} disabled={page <= 1} style={{ opacity: page <= 1 ? 0.4 : 1 }}>
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.pageText, { color: colors.textSecondary }]}>{page} / {totalPages}</Text>
          <TouchableOpacity onPress={() => fetchReviews(page + 1)} disabled={page >= totalPages} style={{ opacity: page >= totalPages ? 0.4 : 1 }}>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 },
  card: { borderRadius: 12, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  row: { flexDirection: 'row', gap: 12 },
  coverWrap: { width: 56, height: 80, borderRadius: 6, overflow: 'hidden' },
  coverImg: { width: '100%', height: '100%' },
  info: { flex: 1 },
  bookTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  date: { fontSize: 14 },
  reviewContent: { fontSize: 14, marginTop: 4 },
  spoiler: { padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  spoilerText: { fontSize: 14, fontWeight: '600' },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 12 },
  pageText: { fontSize: 14 },
  empty: { fontSize: 16, textAlign: 'center', paddingVertical: 30 },
});
