import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useSearchBooks } from '../hooks/useSearchBooks';
import { useSearchUsers } from '../hooks/useSearchUsers';
import { SearchBar } from '../components/SearchBar';
import { BookCard } from '../components/BookCard';
import { UserSearchCard } from '../components/UserSearchCard';
import { Loader } from '../components/Loader';
import { AppHeader } from '../components/AppHeader';
import { fonts } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';

type Tab = 'books' | 'users';

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
  const [activeTab, setActiveTab] = useState<Tab>('books');
  const { books, loading, loadingMore, error, searched, hasMore, category, search, loadMore, selectCategory } = useSearchBooks();
  const { users, loading: usersLoading, error: usersError, searched: userSearched, search: searchUsersAction } = useSearchUsers();

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (activeTab !== 'books') return;
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    if (distanceFromBottom < 300 && hasMore && !loadingMore) {
      loadMore();
    }
  }, [activeTab, hasMore, loadingMore, loadMore]);

  const handleSearch = (query: string) => {
    if (activeTab === 'books') {
      search(query, category);
    } else {
      searchUsersAction(query);
    }
  };

  const placeholder = activeTab === 'books' ? t('search.placeholder') : t('search.usersPlaceholder');
  const isLoading = activeTab === 'books' ? loading : usersLoading;
  const currentError = activeTab === 'books' ? error : usersError;
  const hasSearched = activeTab === 'books' ? searched : userSearched;

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

        {/* Tabs */}
        <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'books' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('books')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'books' ? colors.primary : colors.textSecondary }]}>
              {t('search.tabBooks')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'users' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('users')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'users' ? colors.primary : colors.textSecondary }]}>
              {t('search.tabUsers')}
            </Text>
          </TouchableOpacity>
        </View>

        <SearchBar onSearch={handleSearch} placeholder={placeholder} />

        {/* Category chips (only for books tab) */}
        {activeTab === 'books' && (
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
        )}

        {currentError ? (
          <Text style={[styles.message, { color: colors.error }]}>{currentError}</Text>
        ) : isLoading ? (
          <Loader />
        ) : !hasSearched ? (
          <View style={styles.emptyState}>
            <Ionicons
              name={activeTab === 'books' ? 'search-outline' : 'people-outline'}
              size={48}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {activeTab === 'books' ? t('search.empty') : t('search.usersEmpty')}
            </Text>
          </View>
        ) : activeTab === 'books' ? (
          books.length === 0 ? (
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
          )
        ) : (
          users.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('search.usersNoResults')}</Text>
            </View>
          ) : (
            <View style={styles.usersContainer}>
              {users.map((user) => (
                <UserSearchCard key={user.id} user={user} />
              ))}
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 24, paddingTop: 24 },
  title: { fontSize: 28, fontFamily: fonts.bold, paddingHorizontal: 16, marginBottom: 12 },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  chipsContainer: { paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 14, fontFamily: fonts.regular },
  bookGrid: { paddingHorizontal: 16 },
  usersContainer: { marginTop: 8 },
  message: { fontSize: 16, textAlign: 'center', marginTop: 20, paddingHorizontal: 16 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 16 },
  loadingMore: { alignItems: 'center', paddingVertical: 16 },
});
