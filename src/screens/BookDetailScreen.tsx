import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useBookDetail } from '../hooks/useBookDetail';
import { useShelfButton } from '../hooks/useShelfButton';
import { useReviews } from '../hooks/useReviews';
import { useJournal } from '../hooks/useJournal';
import { ShelfButton } from '../components/ShelfButton';
import { StarRating } from '../components/StarRating';
import { ReviewCard } from '../components/ReviewCard';
import { Loader } from '../components/Loader';
import { BookStatus } from '../types/domain';
import { HomeStackParamList } from '../navigation/MainTabs';

type RouteParams = RouteProp<HomeStackParamList, 'BookDetail'>;

export function BookDetailScreen() {
  const route = useRoute<RouteParams>();
  const { bookId } = route.params;
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { book, userBook, stats, loading, error } = useBookDetail(bookId);
  const shelf = useShelfButton(userBook);
  const { reviews, submitReview, removeReview, submitting, validationError } = useReviews(bookId);
  const journal = useJournal(userBook?.id || '');

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewSpoilers, setReviewSpoilers] = useState(false);

  if (loading) return <Loader />;
  if (error || !book) {
    return (
      <View style={styles.center}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error || t('common.error')}
        </Text>
      </View>
    );
  }

  const handleShelfSelect = async (status: BookStatus) => {
    if (shelf.userBook) {
      await shelf.updateStatus(status);
    } else {
      await shelf.addToShelf(book, status);
    }
  };

  const handleReviewSubmit = async () => {
    await submitReview({
      rating: reviewRating,
      content: reviewContent || undefined,
      hasSpoilers: reviewSpoilers,
    });
    setReviewRating(0);
    setReviewContent('');
    setReviewSpoilers(false);
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Book Header */}
        <View style={styles.header}>
          {book.coverUrl ? (
            <Image source={{ uri: book.coverUrl }} style={styles.cover} />
          ) : (
            <View style={[styles.coverPlaceholder, { backgroundColor: colors.surface }]}>
              <Text style={{ fontSize: 32 }}>📚</Text>
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={[styles.title, { color: colors.text }]}>{book.title}</Text>
            <Text style={[styles.authors, { color: colors.textSecondary }]}>
              {book.authors.join(', ')}
            </Text>
            {stats && stats.totalReviews > 0 && (
              <View style={styles.statsRow}>
                <StarRating rating={Math.round(stats.averageRating || 0)} size={16} />
                <Text style={[styles.statsText, { color: colors.textSecondary }]}>
                  {stats.averageRating?.toFixed(1)} ({stats.totalReviews} {t('reviews.count')})
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Shelf Button */}
        <View style={styles.section}>
          <ShelfButton
            currentStatus={shelf.userBook?.status || null}
            onSelect={handleShelfSelect}
            onRemove={shelf.remove}
            loading={shelf.loading}
          />
        </View>

        {/* Book Details */}
        {book.description && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('book.description')}
            </Text>
            <Text style={[styles.body, { color: colors.text }]}>{book.description}</Text>
          </View>
        )}

        <View style={styles.detailsGrid}>
          {book.pageCount && (
            <Text style={[styles.detail, { color: colors.textSecondary }]}>
              📄 {book.pageCount} {t('book.pages')}
            </Text>
          )}
          {book.publishedDate && (
            <Text style={[styles.detail, { color: colors.textSecondary }]}>
              📅 {book.publishedDate}
            </Text>
          )}
          {book.publisher && (
            <Text style={[styles.detail, { color: colors.textSecondary }]}>
              🏢 {book.publisher}
            </Text>
          )}
          {book.language && (
            <Text style={[styles.detail, { color: colors.textSecondary }]}>
              🌐 {book.language}
            </Text>
          )}
          {book.categories && book.categories.length > 0 && (
            <Text style={[styles.detail, { color: colors.textSecondary }]}>
              🏷️ {book.categories.join(', ')}
            </Text>
          )}
        </View>

        {/* Journal History (if reading) */}
        {shelf.userBook?.status === 'READING' && journal.entries.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('journal.history')}
            </Text>
            {journal.entries.map((entry) => (
              <View key={entry.id} style={[styles.journalEntry, { borderColor: colors.border }]}>
                <Text style={[styles.body, { color: colors.text }]}>
                  {entry.content || `p.${entry.page}`}
                </Text>
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                  {new Date(entry.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('reviews.title')}
          </Text>

          {/* Review Form */}
          <View style={[styles.reviewForm, { borderColor: colors.border }]}>
            <StarRating rating={reviewRating} onRate={setReviewRating} size={24} />
            <TextInput
              style={[styles.reviewInput, { color: colors.text, borderColor: colors.border }]}
              placeholder={t('reviews.content')}
              placeholderTextColor={colors.textSecondary}
              value={reviewContent}
              onChangeText={setReviewContent}
              multiline
            />
            <TouchableOpacity
              style={styles.spoilerToggle}
              onPress={() => setReviewSpoilers(!reviewSpoilers)}
            >
              <Text style={[styles.spoilerText, { color: colors.textSecondary }]}>
                {reviewSpoilers ? '☑' : '☐'} {t('reviews.spoilers')}
              </Text>
            </TouchableOpacity>
            {validationError ? (
              <Text style={[styles.valError, { color: colors.error }]}>{validationError}</Text>
            ) : null}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleReviewSubmit}
              disabled={submitting}
            >
              <Text style={styles.submitText}>{t('reviews.submit')}</Text>
            </TouchableOpacity>
          </View>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('reviews.noReviews')}
            </Text>
          ) : (
            reviews.map((review) => <ReviewCard key={review.id} review={review} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  header: { flexDirection: 'row', marginBottom: 16 },
  cover: { width: 100, height: 150, borderRadius: 6 },
  coverPlaceholder: {
    width: 100,
    height: 150,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  authors: { fontSize: 16, marginBottom: 8 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statsText: { fontSize: 14, marginLeft: 6 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 10 },
  body: { fontSize: 16, lineHeight: 22 },
  detailsGrid: { marginBottom: 16 },
  detail: { fontSize: 14, marginBottom: 4 },
  journalEntry: { borderBottomWidth: 1, paddingVertical: 8 },
  dateText: { fontSize: 14, marginTop: 4 },
  reviewForm: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16 },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    minHeight: 60,
    marginTop: 10,
    textAlignVertical: 'top',
  },
  spoilerToggle: { marginTop: 8 },
  spoilerText: { fontSize: 14 },
  valError: { fontSize: 14, marginTop: 4 },
  submitBtn: { marginTop: 10, padding: 12, borderRadius: 8, alignItems: 'center' },
  submitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 10 },
  errorText: { fontSize: 16 },
});
