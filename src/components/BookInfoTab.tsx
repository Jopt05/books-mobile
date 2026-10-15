import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, useWindowDimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RenderHtml from 'react-native-render-html';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { Book } from '../types/book';
import { BookStats } from '../api/reviews';
import { useReviews } from '../hooks/useReviews';
import { StarRating } from './StarRating';
import { ReviewCard } from './ReviewCard';
import { ConfirmModal } from './ConfirmModal';

interface AuthUser {
  id: string;
}

interface BookInfoTabProps {
  book: Book;
  stats: BookStats | null;
  user: AuthUser | null;
  reviews: ReturnType<typeof useReviews>;
}

export function BookInfoTab({ book, stats, user, reviews }: BookInfoTabProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { width: screenWidth } = useWindowDimensions();

  const { reviews: reviewList, submitReview, removeReview, submitting, validationError } = reviews;

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewSpoilers, setReviewSpoilers] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);

  const myReview = reviewList.find((r) => r.userId === user?.id) || null;
  const otherReviews = reviewList.filter((r) => r.userId !== user?.id);

  const handleReviewSubmit = async () => {
    await submitReview({ rating: reviewRating, content: reviewContent || undefined, hasSpoilers: reviewSpoilers });
    setReviewRating(0);
    setReviewContent('');
    setReviewSpoilers(false);
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Meta grid */}
        <View style={styles.metaGrid}>
          {book.pageCount && (
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>{t('book.pages')}</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{book.pageCount}</Text>
            </View>
          )}
          {book.publishedDate && (
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>{t('book.published')}</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{book.publishedDate}</Text>
            </View>
          )}
          {book.publisher && (
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>{t('book.publisher')}</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{book.publisher}</Text>
            </View>
          )}
          {book.language && (
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>{t('book.language')}</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{book.language.toUpperCase()}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {book.description && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('book.description')}</Text>
            <RenderHtml
              contentWidth={screenWidth - 32}
              source={{ html: book.description }}
              baseStyle={{ color: colors.textSecondary, fontSize: 16, lineHeight: 24 }}
              tagsStyles={{
                p: { marginBottom: 8 },
                b: { color: colors.text },
                i: { fontStyle: 'italic' },
              }}
            />
          </View>
        )}

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('reviews.title')}</Text>

          {/* Stats */}
          {stats && stats.totalReviews > 0 && (
            <View style={[styles.statsRow, { marginBottom: 16 }]}>
              <StarRating rating={Math.round(stats.averageRating || 0)} size={18} />
              <Text style={[styles.statsText, { color: colors.text }]}> {stats.averageRating?.toFixed(1)}</Text>
              <Text style={[styles.statsText, { color: colors.textSecondary }]}> · {stats.totalReviews} {t('reviews.count')}</Text>
            </View>
          )}

          {/* My Review or Review Form */}
          {myReview ? (
            <View style={styles.myReviewSection}>
              <Text style={[styles.myReviewLabel, { color: colors.textSecondary }]}>{t('reviews.write')}</Text>
              <ReviewCard
                review={myReview}
                isOwn={true}
                onDelete={() => setDeleteReviewId(myReview.id)}
              />
            </View>
          ) : (
            <View style={[styles.reviewForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.reviewFormLabel, { color: colors.textSecondary }]}>{t('reviews.write')}</Text>
              <StarRating rating={reviewRating} onRate={setReviewRating} size={28} />
              <TextInput
                style={[styles.reviewInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder={t('reviews.content')}
                placeholderTextColor={colors.textSecondary}
                value={reviewContent}
                onChangeText={setReviewContent}
                multiline
              />
              <TouchableOpacity style={styles.spoilerToggle} onPress={() => setReviewSpoilers(!reviewSpoilers)}>
                <Ionicons name={reviewSpoilers ? 'checkbox' : 'square-outline'} size={18} color={colors.textSecondary} />
                <Text style={[styles.spoilerText, { color: colors.textSecondary }]}> {t('reviews.spoilers')}</Text>
              </TouchableOpacity>
              {validationError ? <Text style={[styles.valError, { color: colors.error }]}>{validationError}</Text> : null}
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: submitting ? 0.5 : 1 }]}
                onPress={handleReviewSubmit}
                disabled={submitting}
              >
                <Text style={styles.submitText}>{t('reviews.submit')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Other Reviews List */}
          {otherReviews.length === 0 && !myReview ? (
            <Text style={[styles.emptyReviews, { color: colors.textSecondary }]}>{t('reviews.noReviews')}</Text>
          ) : (
            otherReviews.map((review) => <ReviewCard key={review.id} review={review} />)
          )}
        </View>
      </ScrollView>

      <ConfirmModal
        visible={!!deleteReviewId}
        title={t('reviews.delete')}
        message={t('common.confirm')}
        onConfirm={() => { if (deleteReviewId) removeReview(deleteReviewId); setDeleteReviewId(null); }}
        onCancel={() => setDeleteReviewId(null)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statsText: { fontSize: 14 },

  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 20 },
  metaItem: { width: '45%' },
  metaLabel: { fontSize: 14, textTransform: 'uppercase', marginBottom: 2 },
  metaValue: { fontSize: 16, fontFamily: fonts.bold },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontFamily: fonts.bold, marginBottom: 10 },

  myReviewSection: { marginBottom: 16 },
  myReviewLabel: { fontSize: 14, marginBottom: 6 },
  reviewForm: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16 },
  reviewFormLabel: { fontSize: 14, marginBottom: 8 },
  reviewInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14, minHeight: 70, marginTop: 10, textAlignVertical: 'top' },
  spoilerToggle: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  spoilerText: { fontSize: 14 },
  valError: { fontSize: 14, marginTop: 6 },
  submitBtn: { alignSelf: 'flex-end', marginTop: 10, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  submitText: { color: '#FFFFFF', fontSize: 14, fontFamily: fonts.bold },
  emptyReviews: { fontSize: 16, textAlign: 'center', marginTop: 10 },
});
