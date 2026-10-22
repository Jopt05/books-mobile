import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useSearchBooks } from '../hooks/useSearchBooks';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { SearchBar } from './SearchBar';
import { BookCard } from './BookCard';
import { Loader } from './Loader';
import { fonts } from '../theme/typography';

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

/**
 * Books search tab. Self-contained scene for the search SwipeTabs: owns its
 * own search bar, category chips and infinite-scrolling result list so it can
 * live inside a swipeable TabView.
 */
export function BooksSearchTab() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { books, loading, loadingMore, error, searched, hasMore, category, search, loadMore, selectCategory } =
    useSearchBooks();
  const { history, addToHistory, removeFromHistory } = useSearchHistory();

  const handleSearch = (query: string) => {
    addToHistory(query);
    search(query, category);
  };

  const header = (
    <View>
      <SearchBar
        onSearch={handleSearch}
        placeholder={t('search.placeholder')}
        history={history}
        onRemoveHistory={removeFromHistory}
      />

      {/* Category chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
        data={[undefined, ...CATEGORIES]}
        keyExtractor={(item) => item ?? '__all__'}
        renderItem={({ item: cat }) => (
          <TouchableOpacity
            style={[styles.chip, { backgroundColor: category === cat ? colors.primary : colors.border }]}
            onPress={() => selectCategory(cat)}
          >
            <Text style={[styles.chipText, { color: category === cat ? '#FFFFFF' : colors.textSecondary }]}>
              {cat ? t(`search.category.${cat}`) : t('search.allCategories')}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderEmpty = () => {
    if (error) return <Text style={[styles.message, { color: colors.error }]}>{error}</Text>;
    if (loading) return <Loader />;
    if (!searched) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('search.empty')}</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <Ionicons name="book-outline" size={48} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('search.noResults')}</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={books}
      keyExtractor={(book) => book.id}
      renderItem={({ item }) => (
        <BookCard book={item} onPress={() => router.push(`/(main)/book/${item.id}`)} />
      )}
      ListHeaderComponent={header}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={styles.listContent}
      onEndReached={() => {
        if (hasMore && !loadingMore) loadMore();
      }}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null
      }
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 24, paddingTop: 8, paddingHorizontal: 16, flexGrow: 1 },
  chipsContainer: { gap: 8, marginBottom: 16, paddingVertical: 2 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 14, fontFamily: fonts.regular },
  message: { fontSize: 16, textAlign: 'center', marginTop: 20 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 16 },
  loadingMore: { alignItems: 'center', paddingVertical: 16 },
});
