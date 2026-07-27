import React, { useEffect } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../context/LanguageContext';
import { useBooks } from '../hooks/useBooks';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { useQuickJournal } from '../hooks/useQuickJournal';
import { useReadingStats } from '../hooks/useReadingStats';
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
  const { books, loading: searchLoading, error: searchError, search, query } = useBooks();
  const { progress, refresh: refreshProgress } = useReadingProgress();
  const { hasEntryToday, checkToday, submitEntry, submitting } = useQuickJournal();
  const { stats } = useReadingStats();

  useEffect(() => {
    checkToday();
    refreshProgress();
  }, [checkToday, refreshProgress]);

  const handleJournalSubmit = async (userBookId: string, content: string) => {
    await submitEntry(userBookId, content);
    await checkToday();
  };

  // If user is searching, show search results
  if (query) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
        <AppHeader />
        <SearchBar onSearch={search} />
        {searchLoading ? (
          <Loader />
        ) : searchError ? (
          <Text style={[styles.message, { color: colors.error }]}>{searchError}</Text>
        ) : books.length === 0 ? (
          <Text style={[styles.message, { color: colors.textSecondary }]}>{t('search.noResults')}</Text>
        ) : (
          <FlatList
            data={books}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BookCard book={item} onPress={() => nav.navigate('BookDetail', { bookId: item.id })} />
            )}
            contentContainerStyle={styles.list}
          />
        )}
      </SafeAreaView>
    );
  }

  // Default home view
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <AppHeader />
      <SearchBar onSearch={search} />
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <View>
            <StreakBanner streak={0} />
            {stats && <ReadingStats stats={stats} />}
            {progress.length > 0 && <CurrentlyReading books={progress} />}
            {progress.length > 0 && !hasEntryToday && (
              <QuickJournalCard books={progress} onSubmit={handleJournalSubmit} submitting={submitting} />
            )}
          </View>
        }
        keyExtractor={() => 'header'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingHorizontal: 16 },
  message: { fontSize: 16, textAlign: 'center', marginTop: 20 },
});
