import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, useWindowDimensions, RefreshControl } from 'react-native';
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
import { ReviewSheet, ReviewSheetHandle } from './ReviewSheet';
import { ConfirmModal } from './ConfirmModal';

interface AuthUser {
  id: string;
}

interface BookInfoTabProps {
  book: Book;
  stats: BookStats | null;
  user: AuthUser | null;
  reviews: ReturnType<typeof useReviews>;
  /** Reloads the book stats and reviews (used for pull-to-refresh). */
  onRefresh?: () => Promise<void>;
}

export function BookInfoTab({ book, stats, user, reviews, onRefresh }: BookInfoTabProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { width: screenWidth } = useWindowDimensions();

  const { reviews: reviewList, submitReview, removeReview, submitting, validationError, clearValidationError } = reviews;

  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const sheetRef = useRef<ReviewSheetHandle>(null);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  const myReview = reviewList.find((r) => r.userId === user?.id) || null;
  const otherReviews = reviewList.filter((r) => r.userId !== user?.id);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }
      >
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

          {/* Write / edit review button, placed directly below the heading */}
          {user && (
            <TouchableOpacity
              style={[styles.writeBtn, { backgroundColor: colors.primary }]}
              onPress={() => sheetRef.current?.present()}
            >
              <Ionicons name={myReview ? 'create-outline' : 'add'} size={18} color="#FFFFFF" />
              <Text style={styles.writeBtnText}>{myReview ? t('reviews.editReview') : t('reviews.write')}</Text>
            </TouchableOpacity>
          )}

          {/* Reviews list: own review first, then the rest */}
          {!myReview && otherReviews.length === 0 ? (
            <Text style={[styles.emptyReviews, { color: colors.textSecondary }]}>{t('reviews.noReviews')}</Text>
          ) : (
            <>
              {myReview && (
                <ReviewCard
                  review={myReview}
                  isOwn
                  onDelete={() => setDeleteReviewId(myReview.id)}
                />
              )}
              {otherReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Write/edit bottom sheet */}
      {user && (
        <ReviewSheet
          ref={sheetRef}
          book={book}
          existingReview={myReview}
          submitting={submitting}
          validationError={validationError}
          onSubmit={submitReview}
          onClearError={clearValidationError}
        />
      )}

      <ConfirmModal
        visible={!!deleteReviewId}
        title={t('reviews.delete')}
        message={t('common.confirm')}
        onConfirm={() => { if (deleteReviewId) removeReview(deleteReviewId); setDeleteReviewId(null); }}
        onCancel={() => setDeleteReviewId(null)}
      />
    </View>
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

  writeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  writeBtnText: { color: '#FFFFFF', fontSize: 14, fontFamily: fonts.bold },

  emptyReviews: { fontSize: 16, textAlign: 'center', marginTop: 10 },
});
