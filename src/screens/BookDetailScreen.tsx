import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import { StarRating } from '../components/StarRating';
import { ShelfButton } from '../components/ShelfButton';
import { Loader } from '../components/Loader';
import { SwipeTabs, SwipeTab } from '../components/SwipeTabs';
import { BookInfoTab } from '../components/BookInfoTab';
import { JournalTab } from '../components/JournalTab';
import { BookStatus } from '../types/domain';

export function BookDetailScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { book, userBook, stats, loading, error } = useBookDetail(bookId);
  const shelf = useShelfButton(userBook);
  const reviews = useReviews(bookId);
  const journal = useJournal(shelf.userBook?.id || '', book?.pageCount ?? undefined);

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

  // The Journal tab only makes sense once the book is on the shelf and in a
  // readable state (not "Want to read"). Otherwise show Information only.
  const journalable = !!shelf.userBook && shelf.userBook.status !== 'WANT_TO_READ';

  const tabs: SwipeTab[] = [
    { key: 'info', title: t('bookDetail.tabInfo'), component: BookInfoTab, props: { book, stats, user, reviews } },
    ...(journalable
      ? [{ key: 'journal', title: t('bookDetail.tabJournal'), component: JournalTab, props: { book, shelf, journal } } as SwipeTab]
      : []),
  ];

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Fixed top area: back button + hero */}
      <View style={styles.topArea}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          <Text style={[styles.backText, { color: colors.textSecondary }]}>Atrás</Text>
        </TouchableOpacity>

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

        {/* Shelf status selector sits above the tabs so adding/updating a book
            is always one tap away, regardless of the active tab. */}
        {user && (
          <View style={styles.shelfRow}>
            <ShelfButton
              currentStatus={shelf.userBook?.status || null}
              onSelect={handleShelfSelect}
              onRemove={shelf.remove}
              loading={shelf.loading}
            />
          </View>
        )}
      </View>

      {/* Tabs fill remaining space; each scene scrolls independently */}
      <SwipeTabs tabs={tabs} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  errorText: { fontSize: 16, textAlign: 'center', marginTop: 40 },

  topArea: { paddingHorizontal: 16, paddingTop: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  backText: { fontSize: 14 },

  shelfRow: { marginBottom: 16 },

  // Hero
  heroSection: { flexDirection: 'row', marginBottom: 16 },
  coverContainer: { width: 120, height: 180, borderRadius: 12, overflow: 'hidden' },
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
});
