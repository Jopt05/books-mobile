import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { fonts } from '../theme/typography';
import { useLanguage } from '../context/LanguageContext';
import { useBooks } from '../hooks/useBooks';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { SearchBar } from '../components/SearchBar';
import { BookCard } from '../components/BookCard';
import { CurrentlyReading } from '../components/CurrentlyReading';
import { QuickJournalCard } from '../components/QuickJournalCard';
import { StreakBanner } from '../components/StreakBanner';
import { ReadingStats } from '../components/ReadingStats';
import { Loader } from '../components/Loader';
import { AppHeader } from '../components/AppHeader';
import { HomeStackParamList } from '../navigation/MainTabs';

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

export function HomeScreen() {
  const nav = useNavigation<NavProp>();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { books, loading: searchLoading, error: searchError, search, query, refresh: refreshBooks } = useBooks();
  const { progress, refresh: refreshProgress } = useReadingProgress();
  const [streakKey, setStreakKey] = useState(0);
  const [journalKey, setJournalKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshProgress(), refreshBooks()]);
    setStreakKey((k) => k + 1);
    setJournalKey((k) => k + 1);
    setRefreshing(false);
  }, [refreshProgress, refreshBooks]);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        {/* 1. Quick Journal Card (self-contained, like web) */}
        <QuickJournalCard key={journalKey} onEntryCreated={() => setStreakKey((k) => k + 1)} />

        {/* 2. Streak Banner (fetches its own data from /journal/streak) */}
        <StreakBanner key={streakKey} />

        {/* 3. Currently Reading with progress bars */}
        {progress.length > 0 && <CurrentlyReading books={progress} />}

        {/* 4. Reading Stats (self-contained with period toggle) */}
        <ReadingStats />

        {/* 5. Search Section (title + count + search bar) */}
        <View style={styles.searchSection}>
          <View style={styles.searchHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('tabs.home')}</Text>
            <Text style={[styles.booksCount, { color: colors.textSecondary }]}>
              {books.length} {t('search.placeholder').split(' ')[0]}
            </Text>
          </View>
          <SearchBar onSearch={search} />
        </View>

        {/* 6. Search Results */}
        {searchLoading ? (
          <Loader />
        ) : searchError ? (
          <Text style={[styles.message, { color: colors.error }]}>{searchError}</Text>
        ) : books.length === 0 ? (
          <Text style={[styles.message, { color: colors.textSecondary }]}>{t('search.noResults')}</Text>
        ) : (
          <View style={styles.bookGrid}>
            {books.map((book) => (
              <BookCard key={book.id} book={book} onPress={() => nav.navigate('BookDetail', { bookId: book.id })} />
            ))}
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 24, paddingTop: 24 },
  searchSection: { paddingHorizontal: 16, marginBottom: 12 },
  searchHeader: { marginBottom: 8 },
  sectionTitle: { fontSize: 28, fontFamily: fonts.bold },
  booksCount: { fontSize: 14, marginTop: 2 },
  bookGrid: { paddingHorizontal: 16 },
  message: { fontSize: 16, textAlign: 'center', marginTop: 20, paddingHorizontal: 16 }
});
