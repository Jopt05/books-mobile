import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
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
import { ConfirmModal } from '../components/ConfirmModal';
import { BookStatus } from '../types/domain';
import { HomeStackParamList } from '../navigation/MainTabs';

type RouteParams = RouteProp<HomeStackParamList, 'BookDetail'>;

export function BookDetailScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const { bookId } = route.params;
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { book, userBook, stats, loading, error } = useBookDetail(bookId);
  const shelf = useShelfButton(userBook);
  const { reviews, submitReview, removeReview, submitting, validationError } = useReviews(bookId);
  const journal = useJournal(shelf.userBook?.id || '');

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewSpoilers, setReviewSpoilers] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);

  if (loading) return <Loader />;
  if (error || !book) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error || t('common.error')}</Text>
      </SafeAreaView>
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
    await submitReview({ rating: reviewRating, content: reviewContent || undefined, hasSpoilers: reviewSpoilers });
    setReviewRating(0);
    setReviewContent('');
    setReviewSpoilers(false);
  };

  const currentStatus = shelf.userBook?.status;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          <Text style={[styles.backText, { color: colors.textSecondary }]}>Atrás</Text>
        </TouchableOpacity>

        {/* Cover + Info */}
        <View style={styles.heroSection}>
          {/* Cover */}
          <View style={[styles.coverContainer, { backgroundColor: colors.border }]}>
            {book.coverUrl ? (
              <Image source={{ uri: book.coverUrl }} style={styles.cover} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Ionicons name="book-outline" size={36} color={colors.textSecondary} />
              </View>
            )}
          </View>

          {/* Info alongside cover */}
          <View style={styles.heroInfo}>
            <Text style={[styles.title, { color: colors.text }]}>{book.title}</Text>
            <Text style={[styles.authors, { color: colors.textSecondary }]}>
              {book.authors.join(', ') || 'Autor desconocido'}
            </Text>

            {/* Rating stats */}
            {stats && stats.totalReviews > 0 && (
              <View style={styles.statsRow}>
                <StarRating rating={Math.round(stats.averageRating || 0)} size={16} />
                <Text style={[styles.statsText, { color: colors.text }]}> {stats.averageRating?.toFixed(1)}</Text>
                <Text style={[styles.statsText, { color: colors.textSecondary }]}> · {stats.totalReviews} {t('reviews.count')}</Text>
              </View>
            )}

            {/* Categories as tags */}
            {book.categories && book.categories.length > 0 && (
              <View style={styles.tagsRow}>
                {book.categories.map((cat) => (
                  <View key={cat} style={[styles.tag, { backgroundColor: colors.border }]}>
                    <Text style={[styles.tagText, { color: colors.textSecondary }]}>{cat}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Your Reading Section (matches web ReadingInfo) */}
        <View style={[styles.readingSection, { backgroundColor: colors.border + '80' }]}>
          <View style={styles.readingSectionHeader}>
            {/* Left side: title + dates */}
            <View style={styles.readingLeft}>
              <Text style={[styles.readingTitle, { color: colors.text }]}>{t('reading.yourReading')}</Text>
              {currentStatus === 'READING' && shelf.userBook?.startedAt && (
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                    {t('reading.startedOn')} {new Date(shelf.userBook.startedAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
              {currentStatus === 'READ' && (
                <>
                  {shelf.userBook?.startedAt && (
                    <View style={styles.dateRow}>
                      <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                      <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                        {t('reading.startedOn')} {new Date(shelf.userBook.startedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  {shelf.userBook?.finishedAt && (
                    <View style={styles.dateRow}>
                      <Ionicons name="checkmark-circle-outline" size={14} color={colors.textSecondary} />
                      <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                        {t('reading.finishedOn')} {new Date(shelf.userBook.finishedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </>
              )}
              {currentStatus === 'DID_NOT_FINISH' && (
                <>
                  {shelf.userBook?.startedAt && (
                    <View style={styles.dateRow}>
                      <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                      <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                        {t('reading.startedOn')} {new Date(shelf.userBook.startedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  {shelf.userBook?.finishedAt && (
                    <View style={styles.dateRow}>
                      <Ionicons name="close-circle-outline" size={14} color={colors.textSecondary} />
                      <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                        {t('reading.droppedOn')} {new Date(shelf.userBook.finishedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </>
              )}
              {currentStatus === 'WANT_TO_READ' && (
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>{t('reading.addedToShelf')}</Text>
              )}
              {!currentStatus && (
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>{t('reading.notInShelf')}</Text>
              )}
            </View>

            {/* Right side: ShelfButton */}
            <ShelfButton
              currentStatus={shelf.userBook?.status || null}
              onSelect={handleShelfSelect}
              onRemove={shelf.remove}
              loading={shelf.loading}
            />
          </View>

          {/* Journal toggle (only when reading or finished) */}
          {shelf.userBook && currentStatus !== 'WANT_TO_READ' && !showJournal && (
            <TouchableOpacity
              style={styles.journalToggle}
              onPress={() => setShowJournal(true)}
            >
              <Ionicons name="pencil-outline" size={16} color={colors.primary} />
              <Text style={[styles.journalToggleText, { color: colors.primary }]}>
                {t('journal.showJournal')}
              </Text>
            </TouchableOpacity>
          )}
          {shelf.userBook && currentStatus !== 'WANT_TO_READ' && showJournal && (
            <>
              <TouchableOpacity
                style={styles.journalToggle}
                onPress={() => setShowJournal(false)}
              >
                <Ionicons name="close-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.journalToggleText, { color: colors.textSecondary }]}>
                  {t('journal.hideJournal')}
                </Text>
              </TouchableOpacity>
              {journal.entries.length > 0 && (
                <View style={styles.journalEntries}>
                  {journal.entries.map((entry) => (
                    <View key={entry.id} style={[styles.journalEntry, { borderColor: colors.border }]}>
                      <View style={styles.journalEntryHeader}>
                        {(entry.page || entry.percentage != null) && (
                          <Text style={[styles.journalMeta, { color: colors.textSecondary }]}>
                            <Ionicons name="book-outline" size={14} color={colors.textSecondary} />
                            {entry.page ? ` p. ${entry.page}` : ''}
                            {entry.page && entry.percentage != null ? ' · ' : ''}
                            {entry.percentage != null ? `${entry.percentage}%` : ''}
                          </Text>
                        )}
                        <Text style={[styles.journalDate, { color: colors.textSecondary }]}>
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      {entry.content && (
                        <Text style={[styles.journalContent, { color: colors.text }]}>{entry.content}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

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
            <Text style={[styles.description, { color: colors.textSecondary }]}>{book.description}</Text>
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

          {/* Review Form */}
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

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <Text style={[styles.emptyReviews, { color: colors.textSecondary }]}>{t('reviews.noReviews')}</Text>
          ) : (
            reviews.map((review) => <ReviewCard key={review.id} review={review} />)
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  errorText: { fontSize: 16, textAlign: 'center', marginTop: 40 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  backText: { fontSize: 14 },

  // Hero
  heroSection: { flexDirection: 'row', marginBottom: 20 },
  coverContainer: { width: 140, height: 210, borderRadius: 12, overflow: 'hidden' },
  cover: { width: '100%', height: '100%' },
  coverPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  heroInfo: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  authors: { fontSize: 16, marginBottom: 8 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statsText: { fontSize: 14 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { fontSize: 14 },

  // Reading section
  readingSection: { borderRadius: 12, padding: 14, marginBottom: 20 },
  readingSectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  readingLeft: { flex: 1 },
  readingTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  dateText: { fontSize: 14 },
  journalToggle: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 14 },
  journalToggleText: { fontSize: 14, fontWeight: '500' },
  journalEntries: { marginTop: 12 },
  journalEntry: { borderBottomWidth: 1, paddingVertical: 10 },
  journalEntryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  journalMeta: { fontSize: 14 },
  journalContent: { fontSize: 14, marginTop: 4 },
  journalDate: { fontSize: 14 },

  // Meta
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 20 },
  metaItem: { width: '45%' },
  metaLabel: { fontSize: 14, textTransform: 'uppercase', marginBottom: 2 },
  metaValue: { fontSize: 16, fontWeight: '600' },

  // Description
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 16, lineHeight: 24 },

  // Reviews
  reviewForm: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16 },
  reviewFormLabel: { fontSize: 14, marginBottom: 8 },
  reviewInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14, minHeight: 70, marginTop: 10, textAlignVertical: 'top' },
  spoilerToggle: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  spoilerText: { fontSize: 14 },
  valError: { fontSize: 14, marginTop: 6 },
  submitBtn: { alignSelf: 'flex-end', marginTop: 10, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  submitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  emptyReviews: { fontSize: 16, textAlign: 'center', marginTop: 10 },
});
