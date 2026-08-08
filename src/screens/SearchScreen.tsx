import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useSearchBooks } from '../hooks/useSearchBooks';
import { SearchBar } from '../components/SearchBar';
import { BookCard } from '../components/BookCard';
import { Loader } from '../components/Loader';
import { AppHeader } from '../components/AppHeader';
import { fonts } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
  'fiction',
  'science',
  'history',
  'biography',
  'fantasy',
  'romance',
  'mystery',
  'business',
  'self-help',
  'philosophy',
];

export function SearchScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { books, loading, loadingMore, error, searched, hasMore, category, search, loadMore, selectCategory } = useSearchBooks();

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    if (distanceFromBottom < 300 && hasMore && !loadingMore) {
      loadMore();
    }
  }, [hasMore, loadingMore, loadMore]);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        <Text style={[styles.title, { color: colors.text }]}>{t('search.title')}</Text>
        <SearchBar onSearch={(q) => search(q, category)} />

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          <TouchableOpacity
            style={[
              styles.chip,
              { backgroundColor: !category ? colors.primary : colors.border },
            ]}
            onPress={() => selectCategory(undefined)}
          >
            <Text style={[styles.chipText, { color: !category ? '#FFFFFF' : colors.textSecondary }]}>
              {t('search.allCategories')}
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                { backgroundColor: category === cat ? colors.primary : colors.border },
              ]}
              onPress={() => selectCategory(cat)}
            >
              <Text style={[styles.chipText, { color: category === cat ? '#FFFFFF' : colors.textSecondary }]}>
                {t(`search.category.${cat}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {error ? (
          <Text style={[styles.message, { color: colors.error }]}>{error}</Text>
        ) : loading ? (
          <Loader />
        ) : !searched ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('search.empty')}</Text>
          </View>
        ) : books.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('search.noResults')}</Text>
          </View>
        ) : (
          <View style={styles.bookGrid}>
            {books.map((book) => (
              <BookCard key={book.id} book={book} onPress={() => router.push(`/(main)/book/${book.id}`)} />
            ))}

            {loadingMore && (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 24, paddingTop: 24 },
  title: { fontSize: 28, fontFamily: fonts.bold, paddingHorizontal: 16, marginBottom: 12 },
  chipsContainer: { paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 14, fontFamily: fonts.medium },
  bookGrid: { paddingHorizontal: 16 },
  message: { fontSize: 16, textAlign: 'center', marginTop: 20, paddingHorizontal: 16 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 16 },
  loadingMore: { alignItems: 'center', paddingVertical: 16 },
});
