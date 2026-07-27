import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useSearchBooks } from '../hooks/useSearchBooks';
import { SearchBar } from '../components/SearchBar';
import { BookCard } from '../components/BookCard';
import { Loader } from '../components/Loader';
import { AppHeader } from '../components/AppHeader';
import { fonts } from '../theme/typography';
import { SearchStackParamList } from '../navigation/MainTabs';
import { Ionicons } from '@expo/vector-icons';

type NavProp = NativeStackNavigationProp<SearchStackParamList, 'Search'>;

export function SearchScreen() {
  const nav = useNavigation<NavProp>();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { books, loading, error, searched, search } = useSearchBooks();

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader />
      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>{t('search.title')}</Text>
        <SearchBar onSearch={search} />

        {books.length > 0 && !loading && (
          <Text style={[styles.count, { color: colors.textSecondary }]}>
            {books.length} {t('search.resultsFound')}
          </Text>
        )}

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
              <BookCard key={book.id} book={book} onPress={() => nav.navigate('BookDetail', { bookId: book.id })} />
            ))}
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
  count: { fontSize: 14, paddingHorizontal: 16, marginBottom: 8 },
  bookGrid: { paddingHorizontal: 16 },
  message: { fontSize: 16, textAlign: 'center', marginTop: 20, paddingHorizontal: 16 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 16 },
});
