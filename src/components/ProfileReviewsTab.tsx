import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { getUserReviews, UserReview } from '../api/reviews';
import { StarRating } from './StarRating';
import { Loader } from './Loader';
import { secureUrl } from '../utils/secureUrl';

const LIMIT = 5;

interface ProfileReviewsTabProps {
  username: string;
}

export function ProfileReviewsTab({ username }: ProfileReviewsTabProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation<any>();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [spoilerRevealed, setSpoilerRevealed] = useState<Record<string, boolean>>({});
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);

  const fetchInitial = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUserReviews(username, 1, LIMIT, true);
      setReviews(res.data);
      pageRef.current = 1;
      hasMoreRef.current = res.meta.page < res.meta.totalPages;
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [username]);

  const loadMore = useCallback(async () => {
    if (!hasMoreRef.current || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const res = await getUserReviews(username, nextPage, LIMIT, true);
      setReviews((prev) => [...prev, ...res.data]);
      pageRef.current = nextPage;
      hasMoreRef.current = res.meta.page < res.meta.totalPages;
    } catch { /* ignore */ }
    finally { setLoadingMore(false); }
  }, [username, loadingMore]);

  useEffect(() => { fetchInitial(); }, [fetchInitial]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    if (distanceFromBottom < 300 && hasMoreRef.current && !loadingMore) {
      loadMore();
    }
  };

  if (loading) return <Loader />;

  if (reviews.length === 0) {
    return <Text style={[styles.empty, { color: colors.textSecondary }]}>{t('reviews.noReviews')}</Text>;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      onScroll={handleScroll}
      scrollEventThrottle={400}
    >
      {reviews.map((review) => (
        <View key={review.id} style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.row}>
            {review.book?.cover && (
              <TouchableOpacity
                onPress={() => navigation.navigate('BookDetail', { bookId: review.bookId })}
                style={[styles.coverWrap, { backgroundColor: colors.border }]}
              >
                <Image source={{ uri: secureUrl(review.book.cover) }} style={styles.coverImg} />
              </TouchableOpacity>
            )}
            <View style={styles.info}>
              {review.book?.title && (
                <TouchableOpacity onPress={() => navigation.navigate('BookDetail', { bookId: review.bookId })}>
                  <Text style={[styles.bookTitle, { color: colors.text }]}>{review.book.title}</Text>
                </TouchableOpacity>
              )}
              <View style={styles.ratingRow}>
                <StarRating rating={review.rating} size={16} />
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </Text>
              </View>
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

      {loadingMore && (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color={colors.primary} />
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
  bookTitle: { fontSize: 14, fontFamily: fonts.bold, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  date: { fontSize: 14 },
  reviewContent: { fontSize: 14, marginTop: 4 },
  spoiler: { padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  spoilerText: { fontSize: 14, fontFamily: fonts.bold },
  loadingMore: { alignItems: 'center', paddingVertical: 16 },
  empty: { fontSize: 16, textAlign: 'center', paddingVertical: 30 },
});
