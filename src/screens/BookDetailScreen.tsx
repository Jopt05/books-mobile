import React, { useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, TextInput, TouchableOpacity, StyleSheet, useWindowDimensions, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RenderHtml from 'react-native-render-html';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useBookDetail } from '../hooks/useBookDetail';
import { useShelfButton } from '../hooks/useShelfButton';
import { useReviews } from '../hooks/useReviews';
import { useJournal } from '../hooks/useJournal';
import { ShelfButton } from '../components/ShelfButton';
import { StarRating } from '../components/StarRating';
import { ReviewCard } from '../components/ReviewCard';
import { EditableDate } from '../components/EditableDate';
import { Loader } from '../components/Loader';
import { ConfirmModal } from '../components/ConfirmModal';
import { BookStatus } from '../types/domain';

export function BookDetailScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { book, userBook, stats, loading, error, refresh: refreshBook } = useBookDetail(bookId);
  const shelf = useShelfButton(userBook);
  const { reviews, submitReview, removeReview, submitting, validationError, refresh: refreshReviews } = useReviews(bookId);
  const journal = useJournal(shelf.userBook?.id || '', book?.pageCount ?? undefined);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewSpoilers, setReviewSpoilers] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshBook(), refreshReviews()]);
    setRefreshing(false);
  }, [refreshBook, refreshReviews]);

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

  // Split reviews: own vs others
  const myReview = reviews.find((r) => r.userId === user?.id) || null;
  const otherReviews = reviews.filter((r) => r.userId !== user?.id);

  const currentStatus = shelf.userBook?.status;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          <Text style={[styles.backText, { color: colors.textSecondary }]}>Atrás</Text>
        </TouchableOpacity>

        {/* Cover + Info */}
        <View style={styles.heroSection}>
          <View style={[styles.coverContainer, { backgroundColor: colors.border }]}>
            {book.coverUrl ? (
              <Image source={{ uri: book.coverUrl }} style={styles.cover} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Ionicons name="book-outline" size={36} color={colors.textSecondary} />
              </View>
            )}
          </View>

          <View style={styles.heroInfo}>
            <Text style={[styles.title, { color: colors.text }]}>{book.title}</Text>
            <Text style={[styles.authors, { color: colors.textSecondary }]}>
              {book.authors.join(', ') || 'Autor desconocido'}
            </Text>

            {stats && stats.totalReviews > 0 && (
              <View style={styles.statsRow}>
                <StarRating rating={Math.round(stats.averageRating || 0)} size={16} />
                <Text style={[styles.statsText, { color: colors.text }]}> {stats.averageRating?.toFixed(1)}</Text>
                <Text style={[styles.statsText, { color: colors.textSecondary }]}> · {stats.totalReviews} {t('reviews.count')}</Text>
              </View>
            )}

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

        {/* Your Reading Section */}
        <View style={[styles.readingSection, { backgroundColor: colors.border + '80' }]}>
          <View style={styles.readingSectionHeader}>
            <View style={styles.readingLeft}>
              <Text style={[styles.readingTitle, { color: colors.text }]}>{t('reading.yourReading')}</Text>
              {currentStatus === 'READING' && shelf.userBook?.startedAt && (
                <EditableDate
                  icon="calendar-outline"
                  label={t('reading.startedOn')}
                  value={shelf.userBook.startedAt}
                  onSave={(date) => shelf.updateDates({ startedAt: date })}
                />
              )}
              {currentStatus === 'READ' && (
                <>
                  {shelf.userBook?.startedAt && (
                    <EditableDate
                      icon="calendar-outline"
                      label={t('reading.startedOn')}
                      value={shelf.userBook.startedAt}
                      onSave={(date) => shelf.updateDates({ startedAt: date })}
                    />
                  )}
                  {shelf.userBook?.finishedAt && (
                    <EditableDate
                      icon="checkmark-circle-outline"
                      label={t('reading.finishedOn')}
                      value={shelf.userBook.finishedAt}
                      onSave={(date) => shelf.updateDates({ finishedAt: date })}
                    />
                  )}
                </>
              )}
              {currentStatus === 'DID_NOT_FINISH' && (
                <>
                  {shelf.userBook?.startedAt && (
                    <EditableDate
                      icon="calendar-outline"
                      label={t('reading.startedOn')}
                      value={shelf.userBook.startedAt}
                      onSave={(date) => shelf.updateDates({ startedAt: date })}
                    />
                  )}
                  {shelf.userBook?.finishedAt && (
                    <EditableDate
                      icon="close-circle-outline"
                      label={t('reading.droppedOn')}
                      value={shelf.userBook.finishedAt}
                      onSave={(date) => shelf.updateDates({ finishedAt: date })}
                    />
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

            <ShelfButton
              currentStatus={shelf.userBook?.status || null}
              onSelect={handleShelfSelect}
              onRemove={shelf.remove}
              loading={shelf.loading}
            />
          </View>

          {/* Journal Section */}
          {shelf.userBook && currentStatus !== 'WANT_TO_READ' && (
            <>
              {/* Journal Form */}
              <View style={[styles.journalForm, { borderColor: colors.border }]}>
                <TextInput
                  style={[styles.journalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder={t('journal.content')}
                  placeholderTextColor={colors.textSecondary}
                  value={journal.content}
                  onChangeText={journal.setContent}
                  multiline
                />
                <View style={styles.journalFormRow}>
                  {/* Mode toggle */}
                  <View style={[styles.modeToggle, { borderColor: colors.border }]}>
                    <TouchableOpacity
                      style={[
                        styles.modeBtn,
                        journal.progressMode === 'page' && { backgroundColor: colors.primary },
                      ]}
                      onPress={() => { journal.setProgressMode('page'); journal.setProgressValue(''); }}
                    >
                      <Text style={[styles.modeBtnText, { color: journal.progressMode === 'page' ? '#FFFFFF' : colors.textSecondary }]}>
                        {t('journal.page')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.modeBtn,
                        journal.progressMode === 'percentage' && { backgroundColor: colors.primary },
                      ]}
                      onPress={() => { journal.setProgressMode('percentage'); journal.setProgressValue(''); }}
                    >
                      <Text style={[styles.modeBtnText, { color: journal.progressMode === 'percentage' ? '#FFFFFF' : colors.textSecondary }]}>
                        %
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Progress value input */}
                  <TextInput
                    style={[styles.progressInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                    placeholder={journal.progressMode === 'page' ? t('journal.page') : '%'}
                    placeholderTextColor={colors.textSecondary}
                    value={journal.progressValue}
                    onChangeText={journal.setProgressValue}
                    keyboardType="numeric"
                  />

                  {/* Submit button */}
                  <TouchableOpacity
                    style={[styles.journalSubmitBtn, { backgroundColor: colors.primary, opacity: journal.saving ? 0.5 : 1 }]}
                    onPress={journal.submit}
                    disabled={journal.saving}
                  >
                    <Text style={styles.journalSubmitText}>
                      {journal.saving ? '...' : t('journal.submit')}
                    </Text>
                  </TouchableOpacity>
                </View>
                {journal.error ? (
                  <Text style={[styles.journalError, { color: colors.error }]}>{journal.error}</Text>
                ) : null}
              </View>

              {/* Toggle entries */}
              <TouchableOpacity
                style={styles.journalToggle}
                onPress={journal.toggleExpanded}
              >
                <Ionicons
                  name={journal.expanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.primary}
                />
                <Text style={[styles.journalToggleText, { color: colors.primary }]}>
                  {journal.expanded ? t('journal.hideJournal') : t('journal.history')}{journal.entryCount != null && journal.entryCount > 0 ? ` (${journal.entryCount})` : ''}
                </Text>
              </TouchableOpacity>

              {/* Entries list */}
              {journal.expanded && (
                <View style={styles.journalEntries}>
                  {journal.loading ? (
                    <Text style={[styles.journalLoadingText, { color: colors.textSecondary }]}>{t('common.loading')}</Text>
                  ) : journal.entries.length === 0 ? (
                    <Text style={[styles.journalEmptyText, { color: colors.textSecondary }]}>
                      {t('reviews.noReviews')}
                    </Text>
                  ) : (
                    <>
                      {journal.entries.map((entry) => (
                        <View key={entry.id} style={[styles.journalEntry, { borderColor: colors.border }]}>
                          <View style={styles.journalEntryHeader}>
                            <Text style={[styles.journalDate, { color: colors.textSecondary }]}>
                              {new Date(entry.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric', month: 'short', day: 'numeric'
                              })}
                            </Text>
                            <TouchableOpacity onPress={() => journal.removeEntry(entry.id)} style={styles.journalDeleteBtn}>
                              <Ionicons name="trash-outline" size={14} color={colors.error} />
                            </TouchableOpacity>
                          </View>
                          {entry.content && (
                            <Text style={[styles.journalContent, { color: colors.text }]}>{entry.content}</Text>
                          )}
                          {(entry.page || entry.percentage != null) && (
                            <View style={styles.journalMetaRow}>
                              <Ionicons name="book-outline" size={14} color={colors.textSecondary} />
                              <Text style={[styles.journalMeta, { color: colors.textSecondary }]}>
                                {entry.page ? ` p. ${entry.page}` : ''}
                                {entry.page && entry.percentage != null ? ' · ' : ''}
                                {entry.percentage != null ? `${entry.percentage}%` : ''}
                              </Text>
                            </View>
                          )}
                        </View>
                      ))}
                      {journal.hasMore && (
                        <TouchableOpacity
                          onPress={journal.loadMore}
                          disabled={journal.loadingMore}
                          style={styles.loadMoreBtn}
                        >
                          <Text style={[styles.loadMoreText, { color: colors.primary, opacity: journal.loadingMore ? 0.5 : 1 }]}>
                            {journal.loadingMore ? '...' : t('journal.loadMore')}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
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
            <RenderHtml
              contentWidth={screenWidth - 32}
              source={{ html: book.description }}
              baseStyle={{ color: colors.textSecondary, fontSize: 16, lineHeight: 24 }}
              tagsStyles={{
                p: { marginBottom: 8 },
                b: { color: colors.text },
                i: { fontStyle: 'italic' }
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
      </KeyboardAvoidingView>

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
  title: { fontSize: 22, fontFamily: fonts.bold, marginBottom: 4 },
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
  readingTitle: { fontSize: 16, fontFamily: fonts.bold, marginBottom: 4 },
  dateText: { fontSize: 14, marginTop: 4 },

  // Journal form
  journalForm: { marginTop: 14, borderTopWidth: 1, paddingTop: 12 },
  journalInput: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, minHeight: 60, textAlignVertical: 'top', marginBottom: 8 },
  journalFormRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  modeToggle: { flexDirection: 'row', borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
  modeBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  modeBtnText: { fontSize: 14, fontFamily: fonts.bold },
  progressInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 14, width: 70 },
  journalSubmitBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, marginLeft: 'auto' },
  journalSubmitText: { color: '#FFFFFF', fontSize: 14, fontFamily: fonts.bold },
  journalError: { fontSize: 14, marginTop: 4 },

  // Journal entries toggle & list
  journalToggle: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 14 },
  journalToggleText: { fontSize: 14, fontFamily: fonts.bold },
  journalEntries: { marginTop: 12 },
  journalEntry: { borderBottomWidth: 1, paddingVertical: 10 },
  journalEntryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  journalDate: { fontSize: 14 },
  journalDeleteBtn: { padding: 4 },
  journalContent: { fontSize: 14, marginTop: 4 },
  journalMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  journalMeta: { fontSize: 14 },
  journalLoadingText: { fontSize: 14 },
  journalEmptyText: { fontSize: 14 },
  loadMoreBtn: { paddingVertical: 10, alignItems: 'center' },
  loadMoreText: { fontSize: 14, fontFamily: fonts.bold },

  // Meta
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 20 },
  metaItem: { width: '45%' },
  metaLabel: { fontSize: 14, textTransform: 'uppercase', marginBottom: 2 },
  metaValue: { fontSize: 16, fontFamily: fonts.bold },

  // Description
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontFamily: fonts.bold, marginBottom: 10 },
  description: { fontSize: 16, lineHeight: 24 },

  // Reviews
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
  emptyReviews: { fontSize: 16, textAlign: 'center', marginTop: 10 }
});
